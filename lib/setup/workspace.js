import { existsSync, mkdirSync, writeFileSync, cpSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create agent context files (AGENTS.md, TOOLS.md, USER.md)
 */
export function createAgentContext(path, userName = 'User') {
  const templates = ['AGENTS.md', 'TOOLS.md', 'USER.md'];
  const templateDir = join(__dirname, '..', '..', 'templates', 'workspace');
  
  for (const template of templates) {
    const templatePath = join(templateDir, `${template}.template`);
    const destPath = join(path, template);
    
    if (existsSync(templatePath) && !existsSync(destPath)) {
      let content = readFileSync(templatePath, 'utf-8');
      content = content
        .replace(/\{\{WORKSPACE_PATH\}\}/g, path)
        .replace(/\{\{USER_NAME\}\}/g, userName)
        .replace(/\{\{DATE_TODAY\}\}/g, new Date().toISOString().split('T')[0])
        .replace(/\{\{TIMEZONE\}\}/g, Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      writeFileSync(destPath, content);
    }
  }
  
  console.log(chalk.green('✓'), 'Agent context files created');
}

/**
 * Create initial memory file
 */
export function createMemoryFile(path) {
  const memoryDir = join(path, 'memory');
  const memoryPath = join(memoryDir, 'MEMORY.md');
  const templatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'memory', 'MEMORY.md.template');
  
  if (existsSync(templatePath) && !existsSync(memoryPath)) {
    let content = readFileSync(templatePath, 'utf-8');
    content = content.replace(/\{\{DATE_TODAY\}\}/g, new Date().toISOString().split('T')[0]);
    writeFileSync(memoryPath, content);
  }
  
  // Create first daily log
  const today = new Date().toISOString().split('T')[0];
  const dailyLogPath = join(memoryDir, `${today}.md`);
  if (!existsSync(dailyLogPath)) {
    writeFileSync(dailyLogPath, `# ${today}\n\n## Workspace Initialized\n\nCairn workspace created. Ready to start managing projects.\n`);
  }
  
  console.log(chalk.green('✓'), 'Memory files created');
}

/**
 * Create Cairn workspace structure
 */
export function createWorkspace(path) {
  const spinner = ora('Creating workspace structure').start();
  
  const folders = [
    '',
    'projects',
    'inbox',
    'inbox/processed',
    'inbox/proposed-paths',
    '_drafts',
    '_conflicts',
    '_abandoned',
    'memory',
    'skills',
  ];
  
  for (const folder of folders) {
    const fullPath = join(path, folder);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  }
  
  // Install worker templates
  const workersTemplatePath = join(__dirname, '..', '..', 'templates', 'workers');
  const workersDestPath = join(path, 'workers');
  
  if (existsSync(workersTemplatePath) && !existsSync(workersDestPath)) {
    cpSync(workersTemplatePath, workersDestPath, { recursive: true });
    spinner.text = 'Workspace structure created (including worker templates)';
  }
  
  // Copy shared skills (remove destination from check since folder already created)
  const skillsTemplatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'skills');
  const skillsDestPath = join(path, 'skills');
  if (existsSync(skillsTemplatePath)) {
    cpSync(skillsTemplatePath, skillsDestPath, { recursive: true, force: true });
    spinner.text = 'Workspace structure created (including skills)';
  }
  
  // Copy example project (remove destination from check since folder already created)
  const exampleProjectPath = join(__dirname, '..', '..', 'templates', 'workspace', 'projects', 'getting-started');
  const projectsDestPath = join(path, 'projects', 'getting-started');
  if (existsSync(exampleProjectPath)) {
    cpSync(exampleProjectPath, projectsDestPath, { recursive: true, force: true });
    spinner.text = 'Workspace structure created (including example project)';
  }
  
  spinner.succeed('Workspace structure created');
  return path;
}

/**
 * Create welcome README in workspace
 */
export function createWelcomeFile(path) {
  const readmePath = join(path, 'README.md');
  
  if (existsSync(readmePath)) {
    return; // Don't overwrite existing README
  }
  
  const templatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'README.md.template');
  if (existsSync(templatePath)) {
    let content = readFileSync(templatePath, 'utf-8');
    content = content.replace(/\{\{WORKSPACE_PATH\}\}/g, path);
    writeFileSync(readmePath, content);
  } else {
    // Fallback to basic content if template missing
    const content = `# Welcome to Cairn 🦮\n\nWorkspace: ${path}\n\nRun \`cairn --help\` to see all commands.\n`;
    writeFileSync(readmePath, content);
  }
  
  console.log(chalk.green('✓'), 'Welcome file created');
}

/**
 * Check if workspace exists
 */
export function workspaceExists(path) {
  return existsSync(join(path, 'projects'));
}

/**
 * Find an existing workspace by checking known locations.
 * Returns the first match, or null if none found.
 */
export function resolveWorkspace() {
  const candidates = [
    process.cwd(),
    join(homedir(), 'cairn'),
  ];
  return candidates.find(p => workspaceExists(p)) || null;
}

/**
 * Validate workspace structure
 */
export function validateWorkspace(path) {
  const requiredFolders = ['projects', 'inbox'];
  const missing = [];
  
  for (const folder of requiredFolders) {
    if (!existsSync(join(path, folder))) {
      missing.push(folder);
    }
  }
  
  return { valid: missing.length === 0, missing };
}
