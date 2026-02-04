import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import yaml from 'js-yaml';

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  try {
    return yaml.load(match[1]);
  } catch (error) {
    return null;
  }
}

function findAllTasks(workspacePath, projectFilter = null) {
  const tasks = [];
  const projectsDir = join(workspacePath, 'projects');
  
  if (!existsSync(projectsDir)) {
    return tasks;
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
    
    const taskFiles = readdirSync(tasksDir).filter(file => file.endsWith('.md'));
    
    for (const taskFile of taskFiles) {
      const taskPath = join(tasksDir, taskFile);
      try {
        const content = readFileSync(taskPath, 'utf8');
        const frontmatter = parseFrontmatter(content);
        
        if (frontmatter) {
          tasks.push({
            project,
            file: taskFile.replace('.md', ''),
            path: taskPath,
            ...frontmatter
          });
        }
      } catch (error) {
        console.error(chalk.yellow('Warning:'), `Failed to parse ${taskPath}`);
      }
    }
  }
  
  return tasks;
}

function filterTasks(tasks, options) {
  let filtered = [...tasks];
  
  // Filter by status
  if (options.status) {
    const statuses = options.status.split(',').map(s => s.trim());
    filtered = filtered.filter(task => statuses.includes(task.status));
  }
  
  // Filter by assignee
  if (options.assignee) {
    filtered = filtered.filter(task => task.assignee === options.assignee);
  }
  
  // Filter by project
  if (options.project) {
    filtered = filtered.filter(task => task.project === options.project);
  }
  
  // Filter by due date
  if (options.dueBefore) {
    const dueDate = new Date(options.dueBefore);
    filtered = filtered.filter(task => {
      if (!task.due) return false;
      return new Date(task.due) <= dueDate;
    });
  }
  
  // Filter overdue
  if (options.overdue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = filtered.filter(task => {
      if (!task.due) return false;
      const dueDate = new Date(task.due);
      return dueDate < today && task.status !== 'completed';
    });
  }
  
  return filtered;
}

function formatAsTable(tasks) {
  if (tasks.length === 0) {
    console.log(chalk.dim('No tasks found matching criteria.'));
    return;
  }
  
  // Calculate column widths
  const projectWidth = Math.max(7, ...tasks.map(t => t.project.length));
  const titleWidth = Math.max(5, ...tasks.map(t => (t.title || t.file).length));
  const statusWidth = Math.max(6, ...tasks.map(t => (t.status || '').length));
  const assigneeWidth = Math.max(8, ...tasks.map(t => (t.assignee || '').length));
  const dueWidth = 10;
  
  // Header
  console.log(
    chalk.bold('Project'.padEnd(projectWidth)) + '  ' +
    chalk.bold('Title'.padEnd(titleWidth)) + '  ' +
    chalk.bold('Status'.padEnd(statusWidth)) + '  ' +
    chalk.bold('Assignee'.padEnd(assigneeWidth)) + '  ' +
    chalk.bold('Due')
  );
  
  console.log(
    '─'.repeat(projectWidth) + '  ' +
    '─'.repeat(titleWidth) + '  ' +
    '─'.repeat(statusWidth) + '  ' +
    '─'.repeat(assigneeWidth) + '  ' +
    '─'.repeat(dueWidth)
  );
  
  // Rows
  for (const task of tasks) {
    const project = (task.project || '').padEnd(projectWidth);
    const title = (task.title || task.file).padEnd(titleWidth);
    const status = colorizeStatus(task.status || '').padEnd(statusWidth + 10); // +10 for ANSI codes
    const assignee = (task.assignee || '').padEnd(assigneeWidth);
    const due = formatDueDate(task.due, task.status);
    
    console.log(`${project}  ${title}  ${status}  ${assignee}  ${due}`);
  }
  
  console.log();
  console.log(chalk.dim(`${tasks.length} task${tasks.length !== 1 ? 's' : ''} found`));
}

function colorizeStatus(status) {
  switch (status) {
    case 'completed':
      return chalk.green(status);
    case 'in_progress':
      return chalk.blue(status);
    case 'review':
      return chalk.magenta(status);
    case 'blocked':
      return chalk.red(status);
    case 'next_up':
      return chalk.yellow(status);
    case 'pending':
      return chalk.gray(status);
    default:
      return status;
  }
}

function formatDueDate(due, status) {
  if (!due) return chalk.dim('—');
  
  // Handle both string and Date objects
  const dueString = due instanceof Date ? due.toISOString().split('T')[0] : due;
  const dueDate = new Date(dueString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const formatted = dueString; // YYYY-MM-DD format
  
  if (status === 'completed') {
    return chalk.dim(formatted);
  }
  
  if (dueDate < today) {
    return chalk.red(formatted + ' ⚠');
  }
  
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue <= 3) {
    return chalk.yellow(formatted);
  }
  
  return formatted;
}

function formatAsJSON(tasks) {
  console.log(JSON.stringify(tasks, null, 2));
}

export default async function list(entity, options) {
  const workspacePath = join(homedir(), 'pms');
  
  if (!existsSync(workspacePath)) {
    console.error(chalk.red('Error:'), 'Workspace not found. Run:', chalk.cyan('cairn onboard'));
    process.exit(1);
  }
  
  if (entity !== 'tasks') {
    console.error(chalk.red('Error:'), `Unknown entity: ${entity}`);
    console.log(chalk.dim('Valid entities: tasks'));
    process.exit(1);
  }
  
  // Find all tasks
  const allTasks = findAllTasks(workspacePath, options.project);
  
  // Apply filters
  const filtered = filterTasks(allTasks, options);
  
  // Format output
  if (options.format === 'json') {
    formatAsJSON(filtered);
  } else {
    formatAsTable(filtered);
  }
}
