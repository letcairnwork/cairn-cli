import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import jsYaml from 'js-yaml';
import { resolveWorkspace } from '../setup/workspace.js';

function findTaskBySlug(workspacePath, taskSlug, projectFilter = null) {
  const projectsDir = join(workspacePath, 'projects');
  
  if (!existsSync(projectsDir)) {
    return null;
  }
  
  const projects = readdirSync(projectsDir).filter(item => {
    const path = join(projectsDir, item);
    return statSync(path).isDirectory();
  });
  
  for (const project of projects) {
    // Skip if filtering by project and this doesn't match
    if (projectFilter && project !== projectFilter) {
      continue;
    }
    
    const tasksDir = join(projectsDir, project, 'tasks');
    if (!existsSync(tasksDir)) {
      continue;
    }
    
    const taskFile = `${taskSlug}.md`;
    const taskPath = join(tasksDir, taskFile);
    
    if (existsSync(taskPath)) {
      return {
        path: taskPath,
        project,
        slug: taskSlug
      };
    }
  }
  
  return null;
}

function parseFrontmatter(content) {
  const lines = content.split('\n');
  
  // Check if file starts with frontmatter delimiter
  if (lines[0].trim() !== '---') {
    return { frontmatter: null, body: content, endIndex: -1 };
  }
  
  // Find closing delimiter
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    return { frontmatter: null, body: content, endIndex: -1 };
  }
  
  // Extract and parse frontmatter
  const frontmatterText = lines.slice(1, endIndex).join('\n');
  let frontmatter;
  try {
    frontmatter = jsYaml.load(frontmatterText);
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to parse YAML frontmatter: ${error.message}`);
    return { frontmatter: null, body: content, endIndex: -1 };
  }
  
  // Body is everything after the closing delimiter
  const body = lines.slice(endIndex + 1).join('\n');
  
  return { frontmatter, body, endIndex };
}

function reconstructFile(frontmatter, body) {
  const yamlText = jsYaml.dump(frontmatter, {
    lineWidth: -1,  // Disable line wrapping
    noRefs: true,   // Don't use anchors/aliases
    sortKeys: false // Preserve key order
  });
  
  return `---\n${yamlText}---\n${body}`;
}

function addArtifact(artifacts, newPath) {
  // Ensure artifacts is an array
  if (!Array.isArray(artifacts)) {
    artifacts = [];
  }
  
  // Check for duplicates
  if (artifacts.includes(newPath)) {
    return { updated: false, reason: 'already exists' };
  }
  
  artifacts.push(newPath);
  return { updated: true, artifacts };
}

function removeArtifact(artifacts, pathToRemove) {
  // Ensure artifacts is an array
  if (!Array.isArray(artifacts)) {
    return { updated: false, reason: 'no artifacts to remove' };
  }
  
  const originalLength = artifacts.length;
  const filtered = artifacts.filter(item => item !== pathToRemove);
  
  if (filtered.length === originalLength) {
    return { updated: false, reason: 'not found' };
  }
  
  return { updated: true, artifacts: filtered };
}

export default async function update(taskSlug, options) {
  // Validate that we have artifact operations
  const addArtifacts = options.addArtifact ? 
    (Array.isArray(options.addArtifact) ? options.addArtifact : [options.addArtifact]) : [];
  const removeArtifacts = options.removeArtifact ? 
    (Array.isArray(options.removeArtifact) ? options.removeArtifact : [options.removeArtifact]) : [];
  
  if (addArtifacts.length === 0 && removeArtifacts.length === 0) {
    console.error(chalk.red('Error:'), 'No updates specified');
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn update <task-slug> [options]'));
    console.log(chalk.dim('\nOptions:'));
    console.log(chalk.cyan('  --add-artifact <path>'), '    Add an artifact (repeatable)');
    console.log(chalk.cyan('  --remove-artifact <path>'), ' Remove an artifact (repeatable)');
    console.log(chalk.cyan('  --project <slug>'), '        Search within specific project');
    console.log(chalk.dim('\nExamples:'));
    console.log(chalk.cyan('  cairn update my-task --add-artifact src/api.ts'));
    console.log(chalk.cyan('  cairn update my-task --add-artifact src/api.ts --add-artifact tests/api.test.ts'));
    console.log(chalk.cyan('  cairn update my-task --remove-artifact old-file.ts'));
    process.exit(1);
  }
  
  // Resolve workspace
  let workspacePath = resolveWorkspace();
  
  if (!workspacePath) {
    // Fallback to ~/pms (common default)
    const fallbackPath = join(homedir(), 'pms');
    if (existsSync(join(fallbackPath, 'projects'))) {
      workspacePath = fallbackPath;
    }
  }
  
  if (!workspacePath) {
    console.error(chalk.red('Error:'), 'No workspace found. Run:', chalk.cyan('cairn init'));
    process.exit(1);
  }
  
  // Find the task
  const task = findTaskBySlug(workspacePath, taskSlug, options.project);
  
  if (!task) {
    if (options.project) {
      console.error(chalk.red('Error:'), `Task "${taskSlug}" not found in project "${options.project}"`);
    } else {
      console.error(chalk.red('Error:'), `Task "${taskSlug}" not found in any project`);
      console.log(chalk.dim('Tip:'), 'Use', chalk.cyan('--project <slug>'), 'to search within a specific project');
    }
    process.exit(1);
  }
  
  // Read the task file
  let content;
  try {
    content = readFileSync(task.path, 'utf8');
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to read task file: ${error.message}`);
    process.exit(1);
  }
  
  // Parse frontmatter
  const { frontmatter, body, endIndex } = parseFrontmatter(content);
  
  if (!frontmatter) {
    console.error(chalk.red('Error:'), 'Task file has no valid frontmatter');
    process.exit(1);
  }
  
  // Initialize artifacts array if it doesn't exist
  if (!frontmatter.artifacts) {
    frontmatter.artifacts = [];
  }
  
  let changed = false;
  const changes = [];
  
  // Process additions
  for (const artifactPath of addArtifacts) {
    const result = addArtifact(frontmatter.artifacts, artifactPath);
    if (result.updated) {
      frontmatter.artifacts = result.artifacts;
      changes.push({ action: 'added', path: artifactPath });
      changed = true;
    } else {
      console.log(chalk.yellow('⚠'), `Artifact ${chalk.cyan(artifactPath)} ${result.reason}`);
    }
  }
  
  // Process removals
  for (const artifactPath of removeArtifacts) {
    const result = removeArtifact(frontmatter.artifacts, artifactPath);
    if (result.updated) {
      frontmatter.artifacts = result.artifacts;
      changes.push({ action: 'removed', path: artifactPath });
      changed = true;
    } else {
      console.log(chalk.yellow('⚠'), `Artifact ${chalk.cyan(artifactPath)} ${result.reason}`);
    }
  }
  
  if (!changed) {
    console.log(chalk.yellow('No changes made'));
    process.exit(0);
  }
  
  // Reconstruct file
  const updatedContent = reconstructFile(frontmatter, body);
  
  // Write back
  try {
    writeFileSync(task.path, updatedContent, 'utf8');
    
    console.log(chalk.green('✓'), `Task updated: ${chalk.cyan(taskSlug)}`);
    console.log(chalk.dim(`  Project: ${task.project}`));
    console.log(chalk.dim(`  Changes:`));
    for (const change of changes) {
      const icon = change.action === 'added' ? '+' : '-';
      const color = change.action === 'added' ? chalk.green : chalk.red;
      console.log(color(`    ${icon} ${change.path}`));
    }
    console.log(chalk.dim(`  Total artifacts: ${frontmatter.artifacts.length}`));
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to write task file: ${error.message}`);
    process.exit(1);
  }
}
