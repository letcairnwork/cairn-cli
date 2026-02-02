import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import chalk from 'chalk';
import ora from 'ora';
import jsYaml from 'js-yaml';

import { validateWorkspace, createWelcomeFile, resolveWorkspace } from '../setup/workspace.js';
import { verifyWorkspaceContext } from '../setup/context.js';
import { validateTaskFrontmatter, validateProjectFrontmatter, VALID_STATUSES } from '../schema/task-schema.js';

function parseFrontmatter(content) {
  const lines = content.split('\n');
  
  if (lines[0].trim() !== '---') {
    return null;
  }
  
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    return null;
  }
  
  const frontmatterText = lines.slice(1, endIndex).join('\n');
  try {
    return jsYaml.load(frontmatterText);
  } catch (error) {
    return null;
  }
}

function isUrl(str) {
  if (typeof str !== 'string') {
    return false;
  }
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('obsidian://');
}

function validateFrontmatter(workspacePath) {
  const projectsDir = join(workspacePath, 'projects');
  const results = {
    totalTasks: 0,
    totalProjects: 0,
    tasksWithErrors: [],
    projectsWithErrors: []
  };
  
  if (!existsSync(projectsDir)) {
    return results;
  }
  
  const projects = readdirSync(projectsDir).filter(item => {
    const path = join(projectsDir, item);
    return statSync(path).isDirectory();
  });
  
  for (const project of projects) {
    // Check project charter
    const charterPath = join(projectsDir, project, 'charter.md');
    if (existsSync(charterPath)) {
      results.totalProjects++;
      const content = readFileSync(charterPath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      
      if (frontmatter) {
        const errors = validateProjectFrontmatter(frontmatter);
        if (errors.length > 0) {
          results.projectsWithErrors.push({
            project,
            file: 'charter.md',
            errors
          });
        }
      }
    }
    
    // Check tasks
    const tasksDir = join(projectsDir, project, 'tasks');
    if (!existsSync(tasksDir)) {
      continue;
    }
    
    const taskFiles = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    
    for (const taskFile of taskFiles) {
      const taskPath = join(tasksDir, taskFile);
      const content = readFileSync(taskPath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      
      if (!frontmatter) {
        results.tasksWithErrors.push({
          project,
          file: taskFile,
          errors: ['Unable to parse frontmatter']
        });
        continue;
      }
      
      results.totalTasks++;
      
      const errors = validateTaskFrontmatter(frontmatter);
      if (errors.length > 0) {
        results.tasksWithErrors.push({
          project,
          file: taskFile,
          frontmatter,
          errors
        });
      }
    }
  }
  
  return results;
}

function validateArtifacts(workspacePath) {
  const projectsDir = join(workspacePath, 'projects');
  const results = {
    totalTasks: 0,
    completedTasks: 0,
    completedWithoutArtifacts: [],
    tasksWithArtifacts: [],
    brokenArtifacts: []
  };
  
  if (!existsSync(projectsDir)) {
    return results;
  }
  
  const projects = readdirSync(projectsDir).filter(item => {
    const path = join(projectsDir, item);
    return statSync(path).isDirectory();
  });
  
  for (const project of projects) {
    const tasksDir = join(projectsDir, project, 'tasks');
    if (!existsSync(tasksDir)) {
      continue;
    }
    
    const taskFiles = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    
    for (const taskFile of taskFiles) {
      const taskPath = join(tasksDir, taskFile);
      const content = readFileSync(taskPath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      
      if (!frontmatter) {
        continue;
      }
      
      results.totalTasks++;
      
      const taskName = frontmatter.title || taskFile.replace('.md', '');
      const status = frontmatter.status || 'unknown';
      const artifacts = frontmatter.artifacts || [];
      
      // Check if completed
      const isCompleted = ['completed', 'done', 'finished'].includes(status.toLowerCase());
      
      if (isCompleted) {
        results.completedTasks++;
        
        if (artifacts.length === 0) {
          results.completedWithoutArtifacts.push({
            name: taskName,
            project,
            file: taskFile
          });
        }
      }
      
      // Check artifacts
      if (Array.isArray(artifacts) && artifacts.length > 0) {
        const artifactStatus = {
          task: taskName,
          project,
          file: taskFile,
          artifacts: []
        };
        
        for (const artifact of artifacts) {
          // Skip non-string artifacts
          if (typeof artifact !== 'string') {
            continue;
          }
          
          if (isUrl(artifact)) {
            // URLs are not validated locally
            artifactStatus.artifacts.push({
              path: artifact,
              exists: null,
              type: 'url'
            });
          } else {
            // Check if local file exists (relative to workspace)
            const artifactPath = join(workspacePath, artifact);
            const exists = existsSync(artifactPath);
            artifactStatus.artifacts.push({
              path: artifact,
              exists,
              type: 'local'
            });
            
            if (!exists) {
              results.brokenArtifacts.push({
                task: taskName,
                project,
                artifact
              });
            }
          }
        }
        
        if (artifactStatus.artifacts.length > 0) {
          results.tasksWithArtifacts.push(artifactStatus);
        }
      }
    }
  }
  
  return results;
}

export default async function doctor() {
  console.log(chalk.bold.cyan('\n🦮  Cairn Doctor\n'));
  console.log(chalk.dim('Checking workspace health...\n'));

  const workspacePath = resolveWorkspace() || join(homedir(), 'cairn');
  let issues = [];
  let warnings = [];

  // Check 1: Workspace exists
  const spinner = ora('Checking workspace').start();
  if (!existsSync(workspacePath)) {
    spinner.fail('Workspace not found');
    issues.push({
      problem: `Workspace not found at ${workspacePath}`,
      fix: 'Run: cairn init'
    });
  } else {
    const { valid, missing } = validateWorkspace(workspacePath);
    if (!valid) {
      spinner.warn('Workspace incomplete');
      warnings.push({
        problem: `Missing folders: ${missing.join(', ')}`,
        fix: 'Run: cairn init --path ' + workspacePath
      });
    } else {
      spinner.succeed('Workspace structure valid');
    }
  }

  // Check 2: Context files (AGENTS.md + .cairn/planning.md)
  const contextSpinner = ora('Checking workspace context').start();
  if (existsSync(workspacePath)) {
    const result = verifyWorkspaceContext(workspacePath);
    if (result.success) {
      contextSpinner.succeed(result.message);
    } else {
      contextSpinner.fail(result.message);
      issues.push({
        problem: result.message,
        fix: 'Run: cairn onboard --force --path ' + workspacePath
      });
    }
  } else {
    contextSpinner.skip('Skipped (no workspace)');
  }

  // Check 3: README exists
  const readmeSpinner = ora('Checking README').start();
  const readmePath = join(workspacePath, 'README.md');
  if (existsSync(readmePath)) {
    readmeSpinner.succeed('README exists');
  } else {
    readmeSpinner.warn('README missing');
    warnings.push({
      problem: 'Welcome README not found',
      fix: 'Will be created automatically'
    });
    if (existsSync(workspacePath)) {
      createWelcomeFile(workspacePath);
      console.log(chalk.green('✓'), 'README created');
    }
  }

  // Check 4: Validate frontmatter
  const frontmatterSpinner = ora('Validating task and project frontmatter').start();
  let frontmatterResults = { totalTasks: 0, totalProjects: 0, tasksWithErrors: [], projectsWithErrors: [] };
  
  if (existsSync(workspacePath)) {
    frontmatterResults = validateFrontmatter(workspacePath);
    
    const totalErrors = frontmatterResults.tasksWithErrors.length + frontmatterResults.projectsWithErrors.length;
    
    if (totalErrors > 0) {
      frontmatterSpinner.fail(`Found ${totalErrors} frontmatter error(s)`);
      issues.push({
        problem: `${totalErrors} task(s)/project(s) have invalid frontmatter`,
        fix: 'See details below'
      });
    } else {
      frontmatterSpinner.succeed(`Frontmatter valid (${frontmatterResults.totalTasks} tasks, ${frontmatterResults.totalProjects} projects)`);
    }
  } else {
    frontmatterSpinner.skip('Skipped (no workspace)');
  }

  // Check 5: Validate artifacts
  const artifactSpinner = ora('Checking task artifacts').start();
  let artifactResults = { totalTasks: 0, completedTasks: 0, completedWithoutArtifacts: [], tasksWithArtifacts: [], brokenArtifacts: [] };
  
  if (existsSync(workspacePath)) {
    artifactResults = validateArtifacts(workspacePath);
    
    if (artifactResults.completedWithoutArtifacts.length > 0 || artifactResults.brokenArtifacts.length > 0) {
      artifactSpinner.warn('Artifact issues found');
      
      if (artifactResults.completedWithoutArtifacts.length > 0) {
        warnings.push({
          problem: `${artifactResults.completedWithoutArtifacts.length} completed task(s) have no artifacts listed`,
          fix: 'Use: cairn update <task-slug> --add-artifact <path>'
        });
      }
      
      if (artifactResults.brokenArtifacts.length > 0) {
        warnings.push({
          problem: `${artifactResults.brokenArtifacts.length} broken artifact link(s) found`,
          fix: 'Check paths or remove with: cairn update <task-slug> --remove-artifact <path>'
        });
      }
    } else if (artifactResults.tasksWithArtifacts.length > 0) {
      artifactSpinner.succeed(`Artifacts valid (${artifactResults.tasksWithArtifacts.length} task(s) with artifacts)`);
    } else {
      artifactSpinner.info('No tasks with artifacts yet');
    }
  } else {
    artifactSpinner.skip('Skipped (no workspace)');
  }

  // Summary
  console.log();
  console.log(chalk.bold('Summary:\n'));

  if (issues.length === 0 && warnings.length === 0) {
    console.log(chalk.green('✓'), chalk.bold('Everything looks good!'));
    console.log();
    console.log(chalk.dim('Your Cairn workspace is healthy.'));
    console.log(chalk.dim('Location:'), chalk.cyan(workspacePath));
    
    if (artifactResults.totalTasks > 0) {
      console.log();
      console.log(chalk.dim('Tasks:'), chalk.cyan(artifactResults.totalTasks));
      console.log(chalk.dim('Completed:'), chalk.cyan(artifactResults.completedTasks));
      console.log(chalk.dim('With artifacts:'), chalk.cyan(artifactResults.tasksWithArtifacts.length));
    }
    
    console.log();
    return;
  }

  if (issues.length > 0) {
    console.log(chalk.red.bold(`${issues.length} issue(s) found:\n`));
    for (const issue of issues) {
      console.log(chalk.red('✗'), issue.problem);
      console.log(chalk.dim('  Fix:'), chalk.cyan(issue.fix));
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold(`${warnings.length} warning(s):\n`));
    for (const warning of warnings) {
      console.log(chalk.yellow('⚠'), warning.problem);
      console.log(chalk.dim('  Fix:'), chalk.cyan(warning.fix));
      console.log();
    }
  }

  // Detailed frontmatter report
  if (frontmatterResults.tasksWithErrors.length > 0) {
    console.log(chalk.red.bold('Tasks with frontmatter errors:\n'));
    for (const task of frontmatterResults.tasksWithErrors.slice(0, 10)) {
      console.log(chalk.red('  ✗'), `${task.project}/${task.file.replace('.md', '')}`);
      for (const error of task.errors) {
        console.log(chalk.dim('      -'), error);
        
        // Add helpful suggestions for common errors
        if (error.includes('Invalid status') && task.frontmatter && task.frontmatter.status === 'active') {
          console.log(chalk.dim('        Suggestion: Change "active" to "in_progress"'));
        }
      }
    }
    if (frontmatterResults.tasksWithErrors.length > 10) {
      console.log(chalk.dim(`  ... and ${frontmatterResults.tasksWithErrors.length - 10} more`));
    }
    console.log();
  }
  
  if (frontmatterResults.projectsWithErrors.length > 0) {
    console.log(chalk.red.bold('Projects with frontmatter errors:\n'));
    for (const project of frontmatterResults.projectsWithErrors) {
      console.log(chalk.red('  ✗'), `${project.project}/charter.md`);
      for (const error of project.errors) {
        console.log(chalk.dim('      -'), error);
      }
    }
    console.log();
  }

  // Detailed artifact report
  if (artifactResults.completedWithoutArtifacts.length > 0) {
    console.log(chalk.yellow.bold('Completed tasks without artifacts:\n'));
    for (const task of artifactResults.completedWithoutArtifacts) {
      console.log(chalk.yellow('  ⚠'), `${task.project}/${task.file.replace('.md', '')}`);
    }
    console.log();
  }

  if (artifactResults.brokenArtifacts.length > 0) {
    console.log(chalk.red.bold('Broken artifact links:\n'));
    for (const item of artifactResults.brokenArtifacts) {
      console.log(chalk.red('  ✗'), `${item.project}/${item.task}: ${item.artifact}`);
    }
    console.log();
  }

  // Show sample of tasks with valid artifacts
  if (artifactResults.tasksWithArtifacts.length > 0 && (artifactResults.completedWithoutArtifacts.length > 0 || artifactResults.brokenArtifacts.length > 0)) {
    console.log(chalk.green.bold('Sample tasks with artifacts:\n'));
    const samples = artifactResults.tasksWithArtifacts.slice(0, 3);
    for (const taskInfo of samples) {
      console.log(chalk.green('  ✓'), `${taskInfo.project}/${taskInfo.task} (${taskInfo.artifacts.length} artifact(s))`);
      for (const artifact of taskInfo.artifacts) {
        const status = artifact.type === 'url' ? chalk.dim('(URL, not validated)') :
                      artifact.exists ? chalk.green('(exists ✓)') :
                      chalk.red('(missing ✗)');
        console.log(chalk.dim(`      - ${artifact.path} ${status}`));
      }
    }
    console.log();
  }

  console.log(chalk.dim('Run'), chalk.cyan('cairn --help'), chalk.dim('for more commands.'));
  console.log();
}
