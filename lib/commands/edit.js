import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug } from '../utils/task-helpers.js';

export default async function edit(taskSlug, options) {
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
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn edit <task-slug>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn edit implement-auth'));
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
  
  // Get editor from environment or use default
  const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
  
  console.log(chalk.dim(`Opening ${task.slug} in ${editor}...`));
  
  // Spawn editor
  const editorProcess = spawn(editor, [task.path], {
    stdio: 'inherit'
  });
  
  editorProcess.on('exit', (code) => {
    if (code === 0) {
      console.log(chalk.green('✓'), 'Task updated');
    } else {
      console.log(chalk.yellow('Editor exited with code'), code);
    }
  });
  
  editorProcess.on('error', (error) => {
    console.error(chalk.red('Error:'), `Failed to open editor: ${error.message}`);
    console.log(chalk.dim('Set EDITOR environment variable to your preferred editor'));
    process.exit(1);
  });
}
