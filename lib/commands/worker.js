import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';

function parseFrontmatter(content) {
  const lines = content.split('\n');
  
  if (lines[0].trim() !== '---') {
    return null;
  }
  
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    return null;
  }
  
  const frontmatterText = lines.slice(1, endIndex).join('\n');
  try {
    // Simple YAML parser for frontmatter (avoiding dependency)
    const parsed = {};
    frontmatterText.split('\n').forEach(line => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
        } else {
          // Remove quotes if present
          value = value.replace(/^["']|["']$/g, '');
        }
        parsed[key] = value;
      }
    });
    return parsed;
  } catch (error) {
    return null;
  }
}

function findWorkersFolder() {
  // Check current workspace
  const workspace = resolveWorkspace();
  if (workspace) {
    const workersDir = join(workspace, 'workers');
    if (existsSync(workersDir)) {
      return workersDir;
    }
  }
  
  // Check workspace parent (if workspace is at ~/pms, workers might be at ~/pms/workers)
  if (workspace) {
    const parentWorkersDir = join(dirname(workspace), 'workers');
    if (existsSync(parentWorkersDir)) {
      return parentWorkersDir;
    }
  }
  
  return null;
}

function getWorkers(workersDir) {
  if (!existsSync(workersDir)) {
    return [];
  }
  
  const workers = [];
  const entries = readdirSync(workersDir);
  
  for (const entry of entries) {
    const entryPath = join(workersDir, entry);
    
    // Skip files and non-worker directories
    if (!statSync(entryPath).isDirectory()) {
      continue;
    }
    
    // New structure: workers/engineer/engineer.md
    const workerFile = join(entryPath, `${entry}.md`);
    if (!existsSync(workerFile)) {
      continue;
    }
    
    const content = readFileSync(workerFile, 'utf8');
    const frontmatter = parseFrontmatter(content);
    
    if (!frontmatter) {
      continue;
    }
    
    // Check for skills folder
    const skillsDir = join(entryPath, 'skills');
    const skills = [];
    if (existsSync(skillsDir)) {
      const skillFiles = readdirSync(skillsDir).filter(f => f.endsWith('.md'));
      skills.push(...skillFiles.map(f => f.replace('.md', '')));
    }
    
    workers.push({
      name: entry,
      role: frontmatter.role || entry,
      specialty: Array.isArray(frontmatter.specialty) 
        ? frontmatter.specialty 
        : (frontmatter.specialty ? [frontmatter.specialty] : []),
      path: workerFile,
      skills: skills,
      frontmatter: frontmatter
    });
  }
  
  return workers;
}

function listWorkers() {
  const workersDir = findWorkersFolder();
  
  if (!workersDir) {
    console.log(chalk.yellow('\n⚠  No workers folder found'));
    console.log(chalk.dim('  Workers should be at:'));
    console.log(chalk.dim('    {workspace}/workers/  or'));
    console.log(chalk.dim('    {workspace-parent}/workers/'));
    console.log();
    return;
  }
  
  const workers = getWorkers(workersDir);
  
  if (workers.length === 0) {
    console.log(chalk.yellow('\n⚠  No workers found in:'), workersDir);
    console.log(chalk.dim('  Expected structure: workers/{name}/{name}.md'));
    console.log();
    return;
  }
  
  console.log(chalk.cyan.bold(`\n👥 Available Workers (${workers.length})\n`));
  console.log(chalk.dim(`Location: ${workersDir}\n`));
  
  for (const worker of workers) {
    console.log(chalk.bold(worker.name));
    console.log(chalk.dim(`  Role: ${worker.role}`));
    
    if (worker.specialty.length > 0) {
      console.log(chalk.dim(`  Specialty: ${worker.specialty.join(', ')}`));
    }
    
    if (worker.skills.length > 0) {
      console.log(chalk.dim(`  Skills: ${worker.skills.join(', ')}`));
    }
    
    console.log(chalk.dim(`  Path: ${worker.path}`));
    console.log();
  }
  
  console.log(chalk.dim(`Use 'cairn worker view <name>' to see full soul file`));
  console.log(chalk.dim(`Use 'cairn worker skills <name>' to see skill details`));
  console.log();
}

function viewWorker(workerName) {
  const workersDir = findWorkersFolder();
  
  if (!workersDir) {
    console.error(chalk.red('Error:'), 'No workers folder found');
    process.exit(1);
  }
  
  const workerFile = join(workersDir, workerName, `${workerName}.md`);
  
  if (!existsSync(workerFile)) {
    console.error(chalk.red('Error:'), `Worker '${workerName}' not found`);
    console.log(chalk.dim(`Expected at: ${workerFile}`));
    process.exit(1);
  }
  
  const content = readFileSync(workerFile, 'utf8');
  console.log('\n' + content);
}

function viewWorkerSkills(workerName) {
  const workersDir = findWorkersFolder();
  
  if (!workersDir) {
    console.error(chalk.red('Error:'), 'No workers folder found');
    process.exit(1);
  }
  
  const workerDir = join(workersDir, workerName);
  const skillsDir = join(workerDir, 'skills');
  
  if (!existsSync(workerDir)) {
    console.error(chalk.red('Error:'), `Worker '${workerName}' not found`);
    process.exit(1);
  }
  
  if (!existsSync(skillsDir)) {
    console.log(chalk.yellow(`\n⚠  Worker '${workerName}' has no skills folder`));
    console.log(chalk.dim(`  Expected at: ${skillsDir}`));
    console.log();
    return;
  }
  
  const skillFiles = readdirSync(skillsDir).filter(f => f.endsWith('.md'));
  
  if (skillFiles.length === 0) {
    console.log(chalk.yellow(`\n⚠  No skills found for worker '${workerName}'`));
    console.log();
    return;
  }
  
  console.log(chalk.cyan.bold(`\n📚 Skills for ${workerName} (${skillFiles.length})\n`));
  
  for (const skillFile of skillFiles) {
    const skillName = skillFile.replace('.md', '');
    const skillPath = join(skillsDir, skillFile);
    const content = readFileSync(skillPath, 'utf8');
    
    // Extract first few lines as preview
    const lines = content.split('\n');
    const preview = lines.slice(0, 5).join('\n');
    
    console.log(chalk.bold(skillName));
    console.log(chalk.dim(`  ${skillPath}`));
    console.log(chalk.dim(`  Lines: ${lines.length}`));
    console.log();
  }
  
  console.log(chalk.dim(`Use 'cairn worker skill <name> <skill>' to view full skill content`));
  console.log();
}

function viewWorkerSkill(workerName, skillName) {
  const workersDir = findWorkersFolder();
  
  if (!workersDir) {
    console.error(chalk.red('Error:'), 'No workers folder found');
    process.exit(1);
  }
  
  const skillFile = join(workersDir, workerName, 'skills', `${skillName}.md`);
  
  if (!existsSync(skillFile)) {
    console.error(chalk.red('Error:'), `Skill '${skillName}' not found for worker '${workerName}'`);
    console.log(chalk.dim(`Expected at: ${skillFile}`));
    process.exit(1);
  }
  
  const content = readFileSync(skillFile, 'utf8');
  console.log('\n' + content);
}

export default async function worker(action, args) {
  // args is an array passed by commander as [arg1, arg2, ..., options]
  // Filter out the options object at the end
  const realArgs = Array.isArray(args) ? args.filter(a => typeof a !== 'object' || a === null) : [];
  
  switch (action) {
    case 'list':
    case 'ls':
      listWorkers();
      break;
      
    case 'view':
    case 'show':
      if (realArgs.length < 1) {
        console.error(chalk.red('Error:'), 'Worker name required');
        console.log(chalk.dim('Usage: cairn worker view <name>'));
        process.exit(1);
      }
      viewWorker(realArgs[0]);
      break;
      
    case 'skills':
      if (realArgs.length < 1) {
        console.error(chalk.red('Error:'), 'Worker name required');
        console.log(chalk.dim('Usage: cairn worker skills <name>'));
        process.exit(1);
      }
      viewWorkerSkills(realArgs[0]);
      break;
      
    case 'skill':
      if (realArgs.length < 2) {
        console.error(chalk.red('Error:'), 'Worker name and skill name required');
        console.log(chalk.dim('Usage: cairn worker skill <worker> <skill>'));
        process.exit(1);
      }
      viewWorkerSkill(realArgs[0], realArgs[1]);
      break;
      
    default:
      console.error(chalk.red('Error:'), `Unknown action '${action}'`);
      console.log(chalk.dim('Available actions: list, view, skills, skill'));
      process.exit(1);
  }
}
