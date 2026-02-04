import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug } from '../utils/task-helpers.js';

export default async function view(taskSlug, options) {
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
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn view <task-slug>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn view implement-auth'));
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
  
  // Read and display task content
  try {
    const content = readFileSync(task.path, 'utf8');
    console.log(chalk.cyan.bold(`\n${task.slug}`));
    console.log(chalk.dim(`Project: ${task.project}\n`));
    console.log(content);
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to read task: ${error.message}`);
    process.exit(1);
  }
}
