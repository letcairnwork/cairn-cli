import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, basename } from 'path';
import { exec } from 'child_process';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug } from '../utils/task-helpers.js';

// Get Obsidian vault path from environment or default
function getObsidianVaultPath() {
  // Check for OBSIDIAN_VAULT env var
  if (process.env.OBSIDIAN_VAULT) {
    return process.env.OBSIDIAN_VAULT;
  }
  
  // Default to ~/Obsidian/pagoda (common setup)
  return join(homedir(), 'Obsidian', 'pagoda');
}

function getObsidianVaultName() {
  // Check for OBSIDIAN_VAULT_NAME env var
  if (process.env.OBSIDIAN_VAULT_NAME) {
    return process.env.OBSIDIAN_VAULT_NAME;
  }
  
  // Default
  return 'pagoda';
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
    console.error(chalk.red('Error:'), 'No workspace found. Run:', chalk.cyan('cairn init'));
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
  
  // Get Obsidian vault path
  const vaultPath = getObsidianVaultPath();
  const vaultName = getObsidianVaultName();
  
  if (!existsSync(vaultPath)) {
    console.error(chalk.red('Error:'), `Obsidian vault not found at: ${vaultPath}`);
    console.log(chalk.dim('Set OBSIDIAN_VAULT environment variable to your vault path'));
    process.exit(1);
  }
  
  // Create Artifacts directory if it doesn't exist
  const artifactsDir = join(vaultPath, 'Artifacts');
  if (!existsSync(artifactsDir)) {
    mkdirSync(artifactsDir, { recursive: true });
  }
  
  // Sanitize artifact name for filename
  const filename = artifactName.replace(/[^a-z0-9-]/gi, ' ').trim().replace(/\s+/g, ' ') + '.md';
  const artifactPath = join(artifactsDir, filename);
  
  // Create the artifact file if it doesn't exist
  if (!existsSync(artifactPath)) {
    const content = `# ${artifactName}\n\n*Artifact for task: ${taskSlug}*\n\n`;
    writeFileSync(artifactPath, content, 'utf8');
    console.log(chalk.green('✓'), 'Created artifact:', chalk.cyan(filename));
  } else {
    console.log(chalk.yellow('ℹ'), 'Artifact already exists:', chalk.cyan(filename));
  }
  
  // Generate obsidian:// URL
  const encodedFilename = encodeURIComponent(`Artifacts/${filename.replace('.md', '')}`);
  const obsidianUrl = `obsidian://open?vault=${vaultName}&file=${encodedFilename}`;
  
  console.log(chalk.dim('Obsidian URL:'), obsidianUrl);
  
  // Add artifact to task using cairn update command
  const updateCommand = `cd ${workspacePath} && cairn update ${taskSlug} --add-artifact "${obsidianUrl}"${options.project ? ` --project ${options.project}` : ''}`;
  
  exec(updateCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(chalk.red('Error:'), 'Failed to add artifact to task');
      console.error(stderr);
      process.exit(1);
    }
    
    console.log(stdout);
    
    // Open in Obsidian if --open flag is set
    if (options.open) {
      exec(`open "${obsidianUrl}"`, (openError) => {
        if (openError) {
          console.log(chalk.yellow('Could not auto-open Obsidian. Use the URL above.'));
        } else {
          console.log(chalk.green('✓'), 'Opened in Obsidian');
        }
      });
    }
  });
}
