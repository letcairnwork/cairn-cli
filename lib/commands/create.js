import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

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

export default async function create(type, name, options) {
  const workspacePath = join(homedir(), 'cairn');
  
  if (!existsSync(workspacePath)) {
    console.error(chalk.red('Error:'), 'Workspace not found. Run:', chalk.cyan('cairn init'));
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
  
  // Create folders
  mkdirSync(projectPath, { recursive: true });
  mkdirSync(join(projectPath, 'tasks'), { recursive: true });
  
  // Create charter.md
  const charterPath = join(projectPath, 'charter.md');
  const charter = `---
title: ${name}
description: ${options.description || name}
status: active
priority: 2
created: ${getToday()}
due: ${options.due || getDueDate(30)}
owner: ${options.assignee || 'me'}
default_autonomy: draft
budget: 100
spent: 0
---

## Why This Matters

${options.objective || '[Describe why this project is important]'}

## Success Criteria

- [ ] [Define what success looks like]
- [ ] [Add measurable outcomes]
- [ ] [Specify completion criteria]

## Context

[Add relevant background, constraints, or dependencies]

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
  
  // Create task file
  const task = `---
title: ${name}
description: ${options.description || name}
assignee: ${options.assignee || 'you'}
status: ${options.status || 'pending'}
created: ${getToday()}
due: ${options.due || getDueDate(7)}
autonomy: draft
spend: 0
artifacts: []
---

## Objective

${options.objective || '[Describe what needs to be accomplished]'}

## Work Log

### ${getToday()} - Created
Task created via Cairn CLI.
`;
  
  writeFileSync(taskPath, task);
  
  console.log(chalk.green('✓'), `Task created: ${chalk.cyan(slug)}`);
  console.log(chalk.dim(`  Location: ${taskPath}`));
}
