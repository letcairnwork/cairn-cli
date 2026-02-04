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
    title: '',
    description: '',
    status: '',
    assignee: '',
    due: '',
    autonomy: 'draft',
    created: ''
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
      
      if (key === 'title') task.title = value;
      else if (key === 'description') task.description = value;
      else if (key === 'status') task.status = value;
      else if (key === 'assignee') task.assignee = value;
      else if (key === 'due') task.due = value;
      else if (key === 'autonomy') task.autonomy = value;
      else if (key === 'created') task.created = value;
    }
  }
  
  return task;
}

export default async function my(options) {
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
  
  const myTasks = {
    in_progress: [],
    next_up: [],
    pending: [],
    blocked: [],
    review: []
  };
  
  for (const project of projects) {
    const tasksDir = join(projectsDir, project, 'tasks');
    
    if (!existsSync(tasksDir)) continue;
    
    const taskFiles = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    
    for (const taskFile of taskFiles) {
      const taskPath = join(tasksDir, taskFile);
      const task = parseTask(taskPath);
      
      // Match my name (case insensitive, handles variations)
      if (task.assignee.toLowerCase() === myName.toLowerCase()) {
        const slug = taskFile.replace('.md', '');
        const taskData = {
          project,
          slug,
          ...task
        };
        
        if (task.status === 'in_progress') {
          myTasks.in_progress.push(taskData);
        } else if (task.status === 'next-up' || task.status === 'next_up') {
          myTasks.next_up.push(taskData);
        } else if (task.status === 'pending') {
          myTasks.pending.push(taskData);
        } else if (task.status === 'blocked') {
          myTasks.blocked.push(taskData);
        } else if (task.status === 'review') {
          myTasks.review.push(taskData);
        }
      }
    }
  }
  
  const totalTasks = myTasks.in_progress.length + myTasks.next_up.length + 
                     myTasks.pending.length + myTasks.blocked.length + myTasks.review.length;
  
  if (totalTasks === 0) {
    console.log(chalk.dim(`No tasks assigned to ${myName}`));
    return;
  }
  
  console.log(chalk.cyan.bold(`\n📋 My Tasks (${myName})\n`));
  
  // Show in_progress first
  if (myTasks.in_progress.length > 0) {
    console.log(chalk.green.bold('🚀 In Progress'));
    for (const task of myTasks.in_progress) {
      console.log(chalk.bold(`  ${task.slug}`));
      console.log(chalk.dim(`    ${task.project}`));
      if (task.description) {
        console.log(`    ${task.description}`);
      }
    }
    console.log();
  }
  
  // Show next-up (ready to work on)
  if (myTasks.next_up.length > 0) {
    console.log(chalk.cyan.bold('⏭️  Next Up'));
    for (const task of myTasks.next_up) {
      console.log(chalk.bold(`  ${task.slug}`));
      console.log(chalk.dim(`    ${task.project}`));
      if (task.description) {
        console.log(`    ${task.description}`);
      }
    }
    console.log();
  }
  
  // Show blocked next (important)
  if (myTasks.blocked.length > 0) {
    console.log(chalk.red.bold('⚠️  Blocked'));
    for (const task of myTasks.blocked) {
      console.log(chalk.bold(`  ${task.slug}`));
      console.log(chalk.dim(`    ${task.project}`));
      if (task.description) {
        console.log(`    ${task.description}`);
      }
    }
    console.log();
  }
  
  // Show review
  if (myTasks.review.length > 0) {
    console.log(chalk.yellow.bold('👀 Review'));
    for (const task of myTasks.review) {
      console.log(chalk.bold(`  ${task.slug}`));
      console.log(chalk.dim(`    ${task.project}`));
      if (task.description) {
        console.log(`    ${task.description}`);
      }
    }
    console.log();
  }
  
  // Show pending last
  if (myTasks.pending.length > 0) {
    console.log(chalk.dim.bold('📥 Pending'));
    for (const task of myTasks.pending) {
      console.log(chalk.dim(`  ${task.slug}`));
      console.log(chalk.dim(`    ${task.project}`));
      if (task.description) {
        console.log(chalk.dim(`    ${task.description}`));
      }
    }
    console.log();
  }
  
  console.log(chalk.dim(`${totalTasks} task${totalTasks === 1 ? '' : 's'} total`));
}
