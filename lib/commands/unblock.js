import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug, updateTaskStatus, addLogEntry } from '../utils/task-helpers.js';

export default async function unblock(taskSlug, message, options) {
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
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn unblock <task-slug> [message]'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn unblock implement-auth "Got API credentials"'));
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
    // Update status to in_progress
    updateTaskStatus(task.path, 'in_progress');
    
    // Add log entry if message provided
    if (message) {
      addLogEntry(task.path, `**UNBLOCKED:** ${message}`, 'Unblocked');
    } else {
      addLogEntry(task.path, 'Task unblocked, resuming work', 'Unblocked');
    }
    
    console.log(chalk.green('✓'), `Task unblocked: ${chalk.cyan(taskSlug)}`);
    console.log(chalk.dim(`  Status: in_progress`));
    if (message) {
      console.log(chalk.dim(`  Note: ${message}`));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to unblock task: ${error.message}`);
    process.exit(1);
  }
}
