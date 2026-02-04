import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';

function searchTask(filePath, query) {
  const content = readFileSync(filePath, 'utf8');
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Check if query appears anywhere in the task
  if (!lowerContent.includes(lowerQuery)) {
    return null;
  }
  
  // Parse frontmatter
  const lines = content.split('\n');
  const task = {
    title: '',
    description: '',
    status: ''
  };
  
  let inFrontmatter = false;
  let bodyStart = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === '---') {
      if (!inFrontmatter) {
        bodyStart = i;
      }
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (key === 'title') task.title = value;
      else if (key === 'description') task.description = value;
      else if (key === 'status') task.status = value;
    }
  }
  
  // Find context (line where match appears)
  let context = '';
  for (let i = bodyStart; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(lowerQuery)) {
      context = lines[i].trim();
      break;
    }
  }
  
  return {
    ...task,
    context: context || task.description
  };
}

export default async function search(query, options) {
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
  
  if (!query) {
    console.error(chalk.red('Error:'), 'Missing search query');
    console.log(chalk.dim('Usage:'), chalk.cyan('cairn search <query>'));
    console.log(chalk.dim('Example:'), chalk.cyan('cairn search "authentication"'));
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
  
  const results = [];
  
  for (const project of projects) {
    // Filter by project if specified
    if (options.project && project !== options.project) {
      continue;
    }
    
    const tasksDir = join(projectsDir, project, 'tasks');
    
    if (!existsSync(tasksDir)) continue;
    
    const taskFiles = readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    
    for (const taskFile of taskFiles) {
      const taskPath = join(tasksDir, taskFile);
      const match = searchTask(taskPath, query);
      
      if (match) {
        results.push({
          project,
          slug: taskFile.replace('.md', ''),
          ...match
        });
      }
    }
  }
  
  if (results.length === 0) {
    console.log(chalk.yellow('No tasks found matching:'), chalk.cyan(query));
    return;
  }
  
  console.log(chalk.cyan.bold(`\n🔍 Found ${results.length} task${results.length === 1 ? '' : 's'}\n`));
  
  for (const result of results) {
    const statusColor = result.status === 'completed' ? chalk.dim :
                       result.status === 'in_progress' ? chalk.green :
                       result.status === 'blocked' ? chalk.red :
                       result.status === 'review' ? chalk.yellow :
                       chalk.white;
    
    console.log(statusColor(result.slug));
    console.log(chalk.dim(`  ${result.project} • ${result.status}`));
    if (result.context) {
      console.log(chalk.dim(`  ${result.context.substring(0, 80)}${result.context.length > 80 ? '...' : ''}`));
    }
    console.log();
  }
}
