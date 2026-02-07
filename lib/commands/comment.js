import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { findTaskBySlug, getAgentName } from '../utils/task-helpers.js';

const CONVEX_URL = 'https://admired-wildebeest-654.convex.cloud';

/**
 * Decode JWT payload without validation (for extracting userId)
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Load auth token from workspace .cairn-token.json
 */
function loadAuthToken(workspacePath) {
  const tokenPath = join(workspacePath, '.cairn-token.json');
  
  if (!existsSync(tokenPath)) {
    return null;
  }
  
  try {
    const raw = readFileSync(tokenPath, 'utf-8');
    const data = JSON.parse(raw);
    
    if (!data.accessToken) {
      return null;
    }
    
    // Check if token is expired
    if (data.expiresAt && Date.now() >= data.expiresAt) {
      return null;
    }
    
    return data.accessToken;
  } catch {
    return null;
  }
}

/**
 * Build task path from project and slug
 */
function buildTaskPath(project, taskSlug) {
  return `projects/${project}/tasks/${taskSlug}.md`;
}

/**
 * Call Convex mutation via HTTP
 */
async function callConvexMutation(functionName, args, token) {
  const url = `${CONVEX_URL}/api/mutation`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      path: functionName,
      args,
      format: 'json',
    }),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Convex API error (${response.status}): ${text}`);
  }
  
  const result = await response.json();
  
  if (result.status === 'error') {
    throw new Error(result.errorMessage || 'Unknown Convex error');
  }
  
  return result.value;
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
  
  // Find the task to get the correct project
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
  
  // Load auth token
  const token = loadAuthToken(workspacePath);
  
  if (!token) {
    console.error(chalk.red('Error:'), 'Not authenticated. Cairn sync must be running and logged in.');
    console.log(chalk.dim('Tip:'), 'Run', chalk.cyan('cairnsync auth login'), 'to authenticate');
    process.exit(1);
  }
  
  // Decode token to get userId
  const payload = decodeJwtPayload(token);
  
  if (!payload || !payload.sub) {
    console.error(chalk.red('Error:'), 'Invalid auth token. Please re-authenticate.');
    console.log(chalk.dim('Tip:'), 'Run', chalk.cyan('cairnsync auth login'), 'to re-authenticate');
    process.exit(1);
  }
  
  const userId = payload.sub;
  
  // Determine author info
  const authorName = options.author || getAgentName();
  const authorType = options.authorType || 'worker';
  const authorId = authorType === 'human' ? userId : authorName.toLowerCase();
  const commentType = options.type || 'progress';
  
  // Build task path as Convex expects it
  const taskPath = buildTaskPath(task.project, taskSlug);
  
  try {
    const result = await callConvexMutation('taskComments:add', {
      taskPath,
      userId,
      authorId,
      authorType,
      authorName,
      content: message,
      commentType,
    }, token);
    
    console.log(chalk.green('✓'), `Comment added to task: ${chalk.cyan(taskSlug)}`);
    console.log(chalk.dim(`  Project: ${task.project}`));
    console.log(chalk.dim(`  Author: ${authorName} (${authorType})`));
    console.log(chalk.dim(`  Type: ${commentType}`));
    console.log(chalk.dim(`  Message: ${message.length > 60 ? message.substring(0, 60) + '...' : message}`));
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to add comment: ${error.message}`);
    process.exit(1);
  }
}
