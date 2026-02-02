import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug, updateTaskStatus, getTaskAutonomy } from '../utils/task-helpers.js';

export default async function done(taskSlug, options) {
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
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn done <task-slug>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn done implement-auth'));
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
  
  // Get task autonomy level to determine final status
  const autonomy = getTaskAutonomy(task.path);
  const finalStatus = autonomy === 'execute' ? 'completed' : 'review';
  
  try {
    updateTaskStatus(task.path, finalStatus);
    
    console.log(chalk.green('✓'), `Task completed: ${chalk.cyan(taskSlug)}`);
    console.log(chalk.dim(`  Project: ${task.project}`));
    console.log(chalk.dim(`  Status: ${finalStatus}`), chalk.dim(`(autonomy: ${autonomy})`));
    
    if (finalStatus === 'review') {
      console.log(chalk.yellow('  →'), 'Task moved to review - awaiting approval');
    }
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to complete task: ${error.message}`);
    process.exit(1);
  }
}
