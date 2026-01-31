import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export function getAgentName() {
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

export function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function findTaskBySlug(workspacePath, taskSlug, projectFilter = null) {
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

export function updateTaskStatus(taskPath, newStatus) {
  const content = readFileSync(taskPath, 'utf8');
  const lines = content.split('\n');
  
  // Find and update status in frontmatter
  let inFrontmatter = false;
  let statusUpdated = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter && lines[i].startsWith('status:')) {
      lines[i] = `status: ${newStatus}`;
      statusUpdated = true;
      break;
    }
  }
  
  if (!statusUpdated) {
    throw new Error('Could not find status field in task frontmatter');
  }
  
  writeFileSync(taskPath, lines.join('\n'), 'utf8');
}

export function addLogEntry(taskPath, message, title = 'Update') {
  const content = readFileSync(taskPath, 'utf8');
  const lines = content.split('\n');
  
  const timestamp = getTimestamp();
  const agentName = getAgentName();
  
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
  const logEntry = [
    `### ${timestamp} - ${title}`,
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
    const updatedContent = lines.join('\n') + '\n' + newSection.join('\n');
    writeFileSync(taskPath, updatedContent, 'utf8');
    return;
  }
  
  // Work Log section exists
  if (nextSectionIndex === -1) {
    // Work Log is the last section, append at the end
    const beforeWorkLog = lines.slice(0, workLogIndex + 1).join('\n');
    const afterWorkLog = lines.slice(workLogIndex + 1).join('\n');
    const trimmedAfter = afterWorkLog.trimEnd();
    
    const updatedContent = beforeWorkLog + '\n\n' + (trimmedAfter ? trimmedAfter + '\n\n' : '') + logEntry.join('\n');
    writeFileSync(taskPath, updatedContent, 'utf8');
    return;
  }
  
  // Work Log has content and another section follows
  const beforeWorkLog = lines.slice(0, workLogIndex + 1).join('\n');
  const workLogContent = lines.slice(workLogIndex + 1, nextSectionIndex).join('\n').trimEnd();
  const afterWorkLog = lines.slice(nextSectionIndex).join('\n');
  
  const updatedContent = beforeWorkLog + '\n\n' + (workLogContent ? workLogContent + '\n\n' : '') + logEntry.join('\n') + '\n' + afterWorkLog;
  writeFileSync(taskPath, updatedContent, 'utf8');
}

export function getTaskAutonomy(taskPath) {
  const content = readFileSync(taskPath, 'utf8');
  const lines = content.split('\n');
  
  let inFrontmatter = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter && lines[i].startsWith('autonomy:')) {
      const value = lines[i].split('autonomy:')[1].trim();
      return value;
    }
  }
  
  return 'draft'; // default
}
