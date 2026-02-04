import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug, addLogEntry } from '../utils/task-helpers.js';

export default async function note(taskSlug, message, options) {
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
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn note <task-slug> <message>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn note implement-auth "Found useful OAuth library"'));
    process.exit(1);
  }
  
  if (!message) {
    console.error(chalk.red('Error:'), 'Missing note message');
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn note <task-slug> <message>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn note implement-auth "Found useful OAuth library"'));
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
  
  try {
    // Add note to work log
    addLogEntry(task.path, message, 'Note');
    
    console.log(chalk.green('✓'), `Note added to: ${chalk.cyan(taskSlug)}`);
    console.log(chalk.dim(`  "${message}"`));
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to add note: ${error.message}`);
    process.exit(1);
  }
}
