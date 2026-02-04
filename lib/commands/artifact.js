import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join, basename, relative, dirname } from 'path';
import { exec } from 'child_process';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug } from '../utils/task-helpers.js';
import jsYaml from 'js-yaml';

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

export default async function artifact(taskSlug, artifactName, options) {
  // Try to resolve workspace, fallback to ~/pms for compatibility
  let workspacePath = resolveWorkspace();
  
  if (!workspacePath) {
    // Fallback to ~/pms (common default)
    const fallbackPath = join(homedir(), 'pms');
    if (existsSync(join(fallbackPath, 'projects'))) {
      workspacePath = fallbackPath;
    }
  }
  
  if (!workspacePath) {
    console.error(chalk.red('Error:'), 'No workspace found. Run:', chalk.cyan('cairn onboard'));
    process.exit(1);
  }
  
  if (!taskSlug) {
    console.error(chalk.red('Error:'), 'Missing task slug');
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn artifact <task-slug> <artifact-name>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn artifact implement-auth "API Design"'));
    process.exit(1);
  }
  
  if (!artifactName) {
    console.error(chalk.red('Error:'), 'Missing artifact name');
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn artifact <task-slug> <artifact-name>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn artifact implement-auth "API Design"'));
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
  
  // Construct artifacts directory path: projects/{project}/artifacts/
  const projectDir = join(workspacePath, 'projects', task.project);
  const artifactsDir = join(projectDir, 'artifacts');
  
  // Create artifacts directory if it doesn't exist
  if (!existsSync(artifactsDir)) {
    mkdirSync(artifactsDir, { recursive: true });
    console.log(chalk.green('✓'), 'Created artifacts directory');
  }
  
  // Sanitize artifact name for filename
  const filename = artifactName
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() + '.md';
  
  const artifactPath = join(artifactsDir, filename);
  
  // Create the artifact file if it doesn't exist
  if (!existsSync(artifactPath)) {
    const content = `# ${artifactName}\n\n*Artifact for task: ${taskSlug}*\n\n`;
    writeFileSync(artifactPath, content, 'utf8');
    console.log(chalk.green('✓'), 'Created artifact:', chalk.cyan(filename));
  } else {
    console.log(chalk.yellow('ℹ'), 'Artifact already exists:', chalk.cyan(filename));
  }
  
  // Generate relative path from task to artifact
  // Task is at: projects/{project}/tasks/{task}.md
  // Artifact is at: projects/{project}/artifacts/{filename}
  // Relative path: ../artifacts/{filename}
  const relativePath = `../artifacts/${filename}`;
  
  console.log(chalk.dim('Artifact path:'), artifactPath);
  console.log(chalk.dim('Relative path:'), relativePath);
  
  // Read task file and update frontmatter
  let taskContent;
  try {
    taskContent = readFileSync(task.path, 'utf8');
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to read task file: ${error.message}`);
    process.exit(1);
  }
  
  const { frontmatter, body } = parseFrontmatter(taskContent);
  
  if (!frontmatter) {
    console.error(chalk.red('Error:'), 'Task file has no valid frontmatter');
    process.exit(1);
  }
  
  // Initialize artifacts array if it doesn't exist
  if (!frontmatter.artifacts) {
    frontmatter.artifacts = [];
  }
  
  // Check if artifact already exists in frontmatter
  const existingArtifact = frontmatter.artifacts.find(a => {
    if (typeof a === 'string') {
      return a === relativePath;
    } else if (typeof a === 'object' && a.path) {
      return a.path === relativePath;
    }
    return false;
  });
  
  if (existingArtifact) {
    console.log(chalk.yellow('⚠'), 'Artifact already linked in task frontmatter');
  } else {
    // Add artifact with description if provided
    const artifactEntry = options.description ? 
      { path: relativePath, description: options.description } :
      { path: relativePath, description: artifactName };
    
    frontmatter.artifacts.push(artifactEntry);
    
    // Write updated task file
    const updatedContent = reconstructFile(frontmatter, body);
    try {
      writeFileSync(task.path, updatedContent, 'utf8');
      console.log(chalk.green('✓'), 'Added artifact to task frontmatter');
    } catch (error) {
      console.error(chalk.red('Error:'), `Failed to write task file: ${error.message}`);
      process.exit(1);
    }
  }
  
  // Open in editor if --open flag is set
  if (options.open) {
    const editor = process.env.EDITOR || 'vim';
    exec(`${editor} "${artifactPath}"`, (error) => {
      if (error) {
        console.log(chalk.yellow('Could not auto-open editor. Use:', chalk.cyan(`${editor} ${artifactPath}`)));
      } else {
        console.log(chalk.green('✓'), 'Opened in editor');
      }
    });
  }
  
  console.log(chalk.green('\n✓ Done!'));
  console.log(chalk.dim('  Artifact:'), chalk.cyan(artifactPath));
  console.log(chalk.dim('  Task:'), chalk.cyan(task.path));
}
