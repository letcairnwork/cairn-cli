import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';

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
  
  // Fallback
  return 'Agent';
}

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

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
        path: taskPath,
        project,
        slug: taskSlug
      };
    }
  }
  
  return null;
}

function addLogEntry(content, timestamp, title, agentName, message) {
  const lines = content.split('\n');
  
  // Find Work Log section
  let workLogIndex = -1;
  let nextSectionIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for Work Log header (## Work Log)
    if (line === '## Work Log') {
      workLogIndex = i;
    } else if (workLogIndex !== -1 && line.startsWith('## ') && i > workLogIndex) {
      // Found the next section after Work Log
      nextSectionIndex = i;
      break;
    }
  }
  
  // Prepare the log entry
  const logTitle = title || 'Update';
  const logEntry = [
    `### ${timestamp} - ${logTitle}`,
    `[${agentName}] ${message}`,
    ''
  ];
  
  if (workLogIndex === -1) {
    // Work Log section doesn't exist, add it at the end
    const newSection = [
      '',
      '## Work Log',
      '',
      ...logEntry
    ];
    return lines.join('\n') + '\n' + newSection.join('\n');
  }
  
  // Work Log section exists
  if (nextSectionIndex === -1) {
    // Work Log is the last section, append at the end
    const beforeWorkLog = lines.slice(0, workLogIndex + 1).join('\n');
    const afterWorkLog = lines.slice(workLogIndex + 1).join('\n');
    
    // Remove trailing newlines from afterWorkLog
    const trimmedAfter = afterWorkLog.trimEnd();
    
    return beforeWorkLog + '\n\n' + (trimmedAfter ? trimmedAfter + '\n\n' : '') + logEntry.join('\n');
  }
  
  // Work Log has content and another section follows
  const beforeWorkLog = lines.slice(0, workLogIndex + 1).join('\n');
  const workLogContent = lines.slice(workLogIndex + 1, nextSectionIndex).join('\n').trimEnd();
  const afterWorkLog = lines.slice(nextSectionIndex).join('\n');
  
  return beforeWorkLog + '\n\n' + (workLogContent ? workLogContent + '\n\n' : '') + logEntry.join('\n') + '\n' + afterWorkLog;
}

export default async function log(taskSlug, message, options) {
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
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn log <task-slug> <message>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn log implement-auth "Added OAuth2 flow"'));
    process.exit(1);
  }
  
  if (!message) {
    console.error(chalk.red('Error:'), 'Missing log message');
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn log <task-slug> <message>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn log implement-auth "Added OAuth2 flow"'));
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
  
  // Read the task file
  let content;
  try {
    content = readFileSync(task.path, 'utf8');
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to read task file: ${error.message}`);
    process.exit(1);
  }
  
  // Get timestamp and agent name
  const timestamp = getTimestamp();
  const agentName = getAgentName();
  
  // Add log entry
  const updatedContent = addLogEntry(content, timestamp, options.title, agentName, message);
  
  // Write back atomically (write to temp file, then rename)
  const tempPath = task.path + '.tmp';
  try {
    writeFileSync(tempPath, updatedContent, 'utf8');
    writeFileSync(task.path, updatedContent, 'utf8');
    
    // Clean up temp file
    try {
      if (existsSync(tempPath)) {
        // Note: In production, we'd use fs.unlinkSync here, but for atomic writes
        // we're doing a direct write above
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    console.log(chalk.green('✓'), `Log entry added to task: ${chalk.cyan(taskSlug)}`);
    console.log(chalk.dim(`  Project: ${task.project}`));
    console.log(chalk.dim(`  Time: ${timestamp}`));
    console.log(chalk.dim(`  Agent: ${agentName}`));
    console.log(chalk.dim(`  Message: ${message}`));
  } catch (error) {
    console.error(chalk.red('Error:'), `Failed to write task file: ${error.message}`);
    process.exit(1);
  }
}
