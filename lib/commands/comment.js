/**
 * cairn comment <task-slug> <message>
 * 
 * Add a comment to a task that appears in the Cairn app.
 * Unlike `cairn log` which writes to the task file's Work Log section,
 * this command posts to the Convex task_comments table and shows up
 * as real comments in the app UI.
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { addTaskComment } from '../utils/convex.js';

/**
 * Get the current agent/user name
 */
function getAgentName() {
  // Try $USER first
  if (process.env.USER) {
    return process.env.USER;
  }
  
  // Try git config
  try {
    const gitName = execSync('git config user.name', { encoding: 'utf8' }).trim();
    if (gitName) return gitName;
  } catch (error) {
    // Git not configured or not available
  }
  
  return 'Agent';
}

/**
 * Find task by slug across all projects
 */
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
        fullPath: taskPath,
        // Relative path from workspace root - this is what Convex stores
        relativePath: `projects/${project}/tasks/${taskFile}`,
        project,
        slug: taskSlug
      };
    }
  }
  
  return null;
}

export default async function comment(taskSlug, message, options) {
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
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn comment <task-slug> <message>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn comment implement-auth "Found a bug in OAuth flow"'));
    process.exit(1);
  }
  
  if (!message) {
    console.error(chalk.red('Error:'), 'Missing comment message');
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn comment <task-slug> <message>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn comment implement-auth "Found a bug in OAuth flow"'));
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
  
  // Get author info
  const authorName = getAgentName();
  
  // Determine author type based on common worker names or environment
  // Workers typically have names like "engineer", "scout", "writer", etc.
  const workerNames = ['engineer', 'scout', 'writer', 'researcher', 'designer', 'analyst', 'tester', 'reviewer', 'planner', 'operator'];
  const lowerAuthorName = authorName.toLowerCase();
  const isWorker = workerNames.some(w => lowerAuthorName.includes(w)) || process.env.CAIRN_WORKER_ID;
  const authorType = isWorker ? 'worker' : 'human';
  
  // Use worker ID from env if available, otherwise use the name
  const authorId = process.env.CAIRN_WORKER_ID || authorName;
  
  // Determine comment type from options
  const commentType = options.type || 'progress';
  
  try {
    await addTaskComment({
      taskPath: task.relativePath,
      authorId,
      authorType,
      authorName,
      content: message,
      commentType,
    });
    
    console.log(chalk.green('✓'), `Comment added to task: ${chalk.cyan(taskSlug)}`);
    console.log(chalk.dim(`  Project: ${task.project}`));
    console.log(chalk.dim(`  Author: ${authorName} (${authorType})`));
    console.log(chalk.dim(`  Type: ${commentType}`));
    console.log(chalk.dim(`  "${message.length > 60 ? message.slice(0, 57) + '...' : message}"`));
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to add comment: ${error.message}`);
    
    if (error.message.includes('Not authenticated') || error.message.includes('Unauthorized')) {
      console.log(chalk.dim('Tip:'), 'Make sure cairnsync is running and authenticated');
    }
    
    process.exit(1);
  }
}
