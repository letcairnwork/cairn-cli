import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';

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

export default async function active(options) {
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
  
  const projectsDir = join(workspacePath, 'projects');
  
  if (!existsSync(projectsDir)) {
    console.log(chalk.yellow('No projects found'));
    return;
  }
  
  const projects = readdirSync(projectsDir).filter(item => {
    const path = join(projectsDir, item);
    return statSync(path).isDirectory();
  });
  
  const activeTasks = [];
  
  for (const project of projects) {
    const tasksDir = join(projectsDir, project, 'tasks');
    
    if (!existsSync(tasksDir)) continue;
    
    const taskFiles = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    
    for (const taskFile of taskFiles) {
      const taskPath = join(tasksDir, taskFile);
      const task = parseTask(taskPath);
      
      if (task.status === 'in_progress') {
        activeTasks.push({
          project,
          slug: taskFile.replace('.md', ''),
          ...task
        });
      }
    }
  }
  
  if (activeTasks.length === 0) {
    console.log(chalk.dim('No tasks in progress'));
    return;
  }
  
  console.log(chalk.cyan.bold('\n🚀 Active Tasks\n'));
  
  for (const task of activeTasks) {
    console.log(chalk.bold(task.slug));
    console.log(chalk.dim(`  ${task.project} • ${task.assignee || 'unassigned'}`));
    if (task.description) {
      console.log(`  ${task.description}`);
    }
    if (task.due) {
      const dueDate = new Date(task.due);
      const today = new Date();
      const isOverdue = dueDate < today;
      console.log(chalk.dim(`  Due: ${task.due}`) + (isOverdue ? chalk.red(' ⚠ OVERDUE') : ''));
    }
    console.log();
  }
  
  console.log(chalk.dim(`${activeTasks.length} task${activeTasks.length === 1 ? '' : 's'} in progress`));
}
