import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';
import { getAgentName } from '../utils/task-helpers.js';

function parseTask(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const task = {
    status: '',
    assignee: ''
  };
  
  let inFrontmatter = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (key === 'status') task.status = value;
      else if (key === 'assignee') task.assignee = value;
    }
  }
  
  return task;
}

export default async function status(options) {
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
  
  const myName = getAgentName();
  const projectsDir = join(workspacePath, 'projects');
  
  if (!existsSync(projectsDir)) {
    console.log(chalk.yellow('No projects found'));
    return;
  }
  
  const projects = readdirSync(projectsDir).filter(item => {
    const path = join(projectsDir, item);
    return statSync(path).isDirectory();
  });
  
  const counts = {
    all: { pending: 0, in_progress: 0, blocked: 0, review: 0, done: 0 },
    mine: { pending: 0, in_progress: 0, blocked: 0, review: 0, done: 0 }
  };
  
  for (const project of projects) {
    const tasksDir = join(projectsDir, project, 'tasks');
    
    if (!existsSync(tasksDir)) continue;
    
    const taskFiles = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    
    for (const taskFile of taskFiles) {
      const taskPath = join(tasksDir, taskFile);
      const task = parseTask(taskPath);
      
      // Count all tasks
      if (counts.all[task.status] !== undefined) {
        counts.all[task.status]++;
      }
      
      // Count my tasks
      if (task.assignee.toLowerCase() === myName.toLowerCase()) {
        if (counts.mine[task.status] !== undefined) {
          counts.mine[task.status]++;
        }
      }
    }
  }
  
  console.log(chalk.cyan.bold('\n📊 Workspace Status\n'));
  
  console.log(chalk.bold('All Tasks'));
  console.log(`  ${chalk.dim('Pending:')}      ${counts.all.pending}`);
  console.log(`  ${chalk.green('In Progress:')} ${counts.all.in_progress}`);
  console.log(`  ${chalk.red('Blocked:')}     ${counts.all.blocked}`);
  console.log(`  ${chalk.yellow('Review:')}      ${counts.all.review}`);
  console.log(`  ${chalk.dim('Done:')}        ${counts.all.done}`);
  
  const allTotal = Object.values(counts.all).reduce((sum, val) => sum + val, 0);
  console.log(chalk.dim(`  Total: ${allTotal}`));
  
  console.log();
  
  console.log(chalk.bold(`My Tasks (${myName})`));
  console.log(`  ${chalk.dim('Pending:')}      ${counts.mine.pending}`);
  console.log(`  ${chalk.green('In Progress:')} ${counts.mine.in_progress}`);
  console.log(`  ${chalk.red('Blocked:')}     ${counts.mine.blocked}`);
  console.log(`  ${chalk.yellow('Review:')}      ${counts.mine.review}`);
  console.log(`  ${chalk.dim('Done:')}        ${counts.mine.done}`);
  
  const mineTotal = Object.values(counts.mine).reduce((sum, val) => sum + val, 0);
  console.log(chalk.dim(`  Total: ${mineTotal}\n`));
}
