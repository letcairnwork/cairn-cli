import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug, updateTaskStatus, addLogEntry } from '../utils/task-helpers.js';

export default async function block(taskSlug, message, options) {
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
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn block <task-slug> <message>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn block implement-auth "Waiting for API credentials"'));
    process.exit(1);
  }
  
  if (!message) {
    console.error(chalk.red('Error:'), 'Missing blocker message');
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn block <task-slug> <message>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn block implement-auth "Waiting for API credentials"'));
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
    // Update status to blocked
    updateTaskStatus(task.path, 'blocked');
    
    // Add log entry explaining the blocker
    addLogEntry(task.path, `**BLOCKED:** ${message}`, 'Blocked');
    
    console.log(chalk.yellow('⚠'), `Task blocked: ${chalk.cyan(taskSlug)}`);
    console.log(chalk.dim(`  Project: ${task.project}`));
    console.log(chalk.dim(`  Blocker: ${message}`));
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to block task: ${error.message}`);
    process.exit(1);
  }
}
