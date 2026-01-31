import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { resolveWorkspace } from '../setup/workspace.js';
import { VALID_STATUSES, VALID_AUTONOMY_LEVELS, validateTaskFrontmatter } from '../schema/task-schema.js';

function expandNewlines(text) {
  if (!text) return text;
  return text.replace(/\\n/g, '\n');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getDueDate(daysFromNow = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

function getSmartDueDate(priority) {
  // P1 = today (urgent), P2+ = 7 days (less urgent)
  return priority === 1 ? getToday() : getDueDate(7);
}

export default async function create(type, name, options) {
  const workspacePath = resolveWorkspace();

  if (!workspacePath) {
    console.error(chalk.red('Error:'), 'No workspace found. Run:', chalk.cyan('cairn init'));
    process.exit(1);
  }
  
  const slug = slugify(name);
  
  switch (type) {
    case 'project':
      await createProject(workspacePath, name, slug, options);
      break;
    case 'task':
      await createTask(workspacePath, name, slug, options);
      break;
    default:
      console.error(chalk.red('Error:'), `Unknown type: ${type}`);
      console.log(chalk.dim('Valid types: project, task'));
      process.exit(1);
  }
}

async function createProject(workspacePath, name, slug, options) {
  const projectPath = join(workspacePath, 'projects', slug);

  if (existsSync(projectPath)) {
    console.error(chalk.red('Error:'), `Project already exists: ${slug}`);
    process.exit(1);
  }

  // Require meaningful content — don't create empty charters
  const missing = [];
  if (!options.description) missing.push('--description');
  if (!options.objective) missing.push('--objective');
  if (!options.criteria) missing.push('--criteria');
  if (!options.context) missing.push('--context');
  if (missing.length > 0) {
    console.error(chalk.red('Error:'), `Missing required flags: ${missing.join(', ')}`);
    console.log(chalk.dim('Projects need real content for every section. Example:'));
    console.log(chalk.cyan(`  cairn create project "${name}" \\`));
    console.log(chalk.cyan(`    --description "One-line summary" \\`));
    console.log(chalk.cyan(`    --objective "Why this matters and what problem it solves" \\`));
    console.log(chalk.cyan(`    --criteria "Specific measurable outcomes that define done" \\`));
    console.log(chalk.cyan(`    --context "Tech stack, constraints, dependencies, assumptions"`));
    process.exit(1);
  }
  
  // Create folders
  mkdirSync(projectPath, { recursive: true });
  mkdirSync(join(projectPath, 'tasks'), { recursive: true });
  
  // Create charter.md
  const charterPath = join(projectPath, 'charter.md');
  const section = (text) => text ? `\n${expandNewlines(text)}\n` : '\n';
  const charter = `---
title: ${name}
description: ${expandNewlines(options.description) || name}
status: in_progress
priority: 2
created: ${getToday()}
due: ${options.due || getDueDate(30)}
owner: ${options.assignee || 'me'}
default_autonomy: draft
budget: 100
spent: 0
---

## Why This Matters
${section(options.objective)}
## Success Criteria
${section(options.criteria)}
## Context
${section(options.context)}
## Work Log

### ${getToday()} - Created
Project created via Cairn CLI.
`;
  
  writeFileSync(charterPath, charter);
  
  console.log(chalk.green('✓'), `Project created: ${chalk.cyan(slug)}`);
  console.log(chalk.dim(`  Location: ${projectPath}`));
  console.log(chalk.dim(`  Charter: ${charterPath}`));
  console.log();
  console.log(chalk.dim('Next:'), `cairn create task "Task Name" --project ${slug}`);
}

async function createTask(workspacePath, name, slug, options) {
  const projectSlug = options.project;
  
  if (!projectSlug) {
    console.error(chalk.red('Error:'), 'Missing --project flag');
    console.log(chalk.dim('Example:'), chalk.cyan(`cairn create task "${name}" --project my-project`));
    process.exit(1);
  }
  
  const projectPath = join(workspacePath, 'projects', projectSlug);
  if (!existsSync(projectPath)) {
    console.error(chalk.red('Error:'), `Project not found: ${projectSlug}`);
    process.exit(1);
  }
  
  const tasksDir = join(projectPath, 'tasks');
  if (!existsSync(tasksDir)) {
    mkdirSync(tasksDir, { recursive: true });
  }
  
  const taskPath = join(tasksDir, `${slug}.md`);

  if (existsSync(taskPath)) {
    console.error(chalk.red('Error:'), `Task already exists: ${slug}`);
    process.exit(1);
  }

  // Require meaningful content — don't create empty tasks
  const missing = [];
  if (!options.objective) missing.push('--objective');
  if (!options.description) missing.push('--description');
  if (missing.length > 0) {
    console.error(chalk.red('Error:'), `Missing required flags: ${missing.join(', ')}`);
    console.log(chalk.dim('Tasks need real content. Example:'));
    console.log(chalk.cyan(`  cairn create task "${name}" --project ${projectSlug} \\`));
    console.log(chalk.cyan(`    --description "One-line summary" \\`));
    console.log(chalk.cyan(`    --objective "What needs to happen and what done looks like"`));
    process.exit(1);
  }

  // Validate autonomy level if provided
  const autonomy = options.autonomy || 'execute';
  if (!VALID_AUTONOMY_LEVELS.includes(autonomy)) {
    console.error(chalk.red('Error:'), `Invalid autonomy level: ${autonomy}`);
    console.log(chalk.dim('Valid values:'), VALID_AUTONOMY_LEVELS.join(', '));
    process.exit(1);
  }
  
  // Validate status if provided
  const status = options.status || 'pending';
  if (!VALID_STATUSES.includes(status)) {
    console.error(chalk.red('Error:'), `Invalid status: ${status}`);
    console.log(chalk.dim('Valid values:'), VALID_STATUSES.join(', '));
    process.exit(1);
  }

  // Create task file with validated values
  // Keep original name for title (human readable), slug for filename
  const taskSection = (text) => text ? `\n${expandNewlines(text)}\n` : '\n';
  const priority = options.priority !== undefined ? parseInt(options.priority, 10) : 1;
  const taskFrontmatter = {
    title: name,  // Keep human-readable name
    description: expandNewlines(options.description) || name,
    assignee: options.assignee || 'you',
    status: status,
    priority: priority,
    created: getToday(),
    due: options.due || getSmartDueDate(priority),  // P1=today, P2+=7 days
    autonomy: autonomy,
    spend: 0,
    artifacts: []
  };
  
  // Validate frontmatter before creating file
  const errors = validateTaskFrontmatter(taskFrontmatter);
  if (errors.length > 0) {
    console.error(chalk.red('Error:'), 'Task frontmatter validation failed:');
    errors.forEach(err => console.log(chalk.red('  •'), err));
    process.exit(1);
  }
  
  // Quote title if it contains special YAML characters
  const needsQuotes = name.includes(':') || name.includes('"') || name.includes('#');
  const titleValue = needsQuotes ? `"${name.replace(/"/g, '\\"')}"` : name;
  
  const task = `---
title: ${titleValue}
description: ${taskFrontmatter.description}
assignee: ${taskFrontmatter.assignee}
status: ${taskFrontmatter.status}
priority: ${taskFrontmatter.priority}
created: ${taskFrontmatter.created}
due: ${taskFrontmatter.due}
autonomy: ${taskFrontmatter.autonomy}
spend: ${taskFrontmatter.spend}
artifacts: []
---

## Objective
${taskSection(options.objective)}
## Work Log

### ${getToday()} - Created
Task created via Cairn CLI.
`;
  
  writeFileSync(taskPath, task);
  
  console.log(chalk.green('✓'), `Task created: ${chalk.cyan(slug)}`);
  console.log(chalk.dim(`  Location: ${taskPath}`));
}
