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
  const workspacePath = join(homedir(), 'pms');
  
  if (!existsSync(workspacePath)) {
    console.error(chalk.red('Error:'), 'Workspace not found. Run:', chalk.cyan('cairn init'));
    process.exit(1);
  }
  
  const slug = slugify(name);
  
  switch (type) {
    case 'quest':
      await createQuest(workspacePath, name, slug, options);
      break;
    case 'path':
      await createPath(workspacePath, name, slug, options);
      break;
    case 'step':
      await createStep(workspacePath, name, slug, options);
      break;
    default:
      console.error(chalk.red('Error:'), `Unknown type: ${type}`);
      console.log(chalk.dim('Valid types: quest, path, step'));
      process.exit(1);
  }
}

async function createQuest(workspacePath, name, slug, options) {
  const questPath = join(workspacePath, 'quests', slug);
  
  if (existsSync(questPath)) {
    console.error(chalk.red('Error:'), `Quest already exists: ${slug}`);
    process.exit(1);
  }
  
  // Create folders
  mkdirSync(questPath, { recursive: true });
  mkdirSync(join(questPath, 'paths'), { recursive: true });
  
  // Create charter.md
  const charterPath = join(questPath, 'charter.md');
  const charter = `---
title: ${name}
description: ${options.description || name}
status: active
priority: 2
created: ${getToday()}
due: ${options.due || getDueDate(30)}
owner: ${options.assignee || 'me'}
autonomy: draft
budget: 100
spent: 0
---

## Why This Matters

${options.objective || '[Describe why this quest is important]'}

## Success Criteria

- [ ] [Define what success looks like]
- [ ] [Add measurable outcomes]
- [ ] [Specify completion criteria]

## Context

[Add relevant background, constraints, or dependencies]

## Work Log

### ${getToday()} - Created
Quest created via Cairn CLI.
`;
  
  writeFileSync(charterPath, charter);
  
  console.log(chalk.green('✓'), `Quest created: ${chalk.cyan(slug)}`);
  console.log(chalk.dim(`  Location: ${questPath}`));
  console.log(chalk.dim(`  Charter: ${charterPath}`));
  console.log();
  console.log(chalk.dim('Next:'), `cairn create path "Path Name" --quest ${slug}`);
}

async function createPath(workspacePath, name, slug, options) {
  const questSlug = options.quest;
  
  if (!questSlug) {
    console.error(chalk.red('Error:'), 'Missing --quest flag');
    console.log(chalk.dim('Example:'), chalk.cyan(`cairn create path "${name}" --quest my-quest`));
    process.exit(1);
  }
  
  const questPath = join(workspacePath, 'quests', questSlug);
  if (!existsSync(questPath)) {
    console.error(chalk.red('Error:'), `Quest not found: ${questSlug}`);
    process.exit(1);
  }
  
  const pathDir = join(questPath, 'paths', slug);
  if (existsSync(pathDir)) {
    console.error(chalk.red('Error:'), `Path already exists: ${slug}`);
    process.exit(1);
  }
  
  // Create folders
  mkdirSync(pathDir, { recursive: true });
  mkdirSync(join(pathDir, 'steps'), { recursive: true });
  
  // Create brief.md
  const briefPath = join(pathDir, 'brief.md');
  const brief = `---
title: ${name}
description: ${options.description || name}
status: active
priority: 2
created: ${getToday()}
due: ${options.due || getDueDate(14)}
autonomy: draft
---

## Overview

${options.objective || '[Describe what this path accomplishes]'}

## Goals

- [ ] [Key objective 1]
- [ ] [Key objective 2]
- [ ] [Key objective 3]

## Context

[Add relevant background or constraints]

## Success Looks Like

[Describe the end state]

## Work Log

### ${getToday()} - Created
Path created via Cairn CLI.
`;
  
  writeFileSync(briefPath, brief);
  
  console.log(chalk.green('✓'), `Path created: ${chalk.cyan(slug)}`);
  console.log(chalk.dim(`  Location: ${pathDir}`));
  console.log(chalk.dim(`  Brief: ${briefPath}`));
  console.log();
  console.log(chalk.dim('Next:'), `cairn create step "Step Name" --quest ${questSlug} --path ${slug}`);
}

async function createStep(workspacePath, name, slug, options) {
  const questSlug = options.quest;
  const pathSlug = options.path;
  
  if (!questSlug || !pathSlug) {
    console.error(chalk.red('Error:'), 'Missing --quest and/or --path flags');
    console.log(chalk.dim('Example:'), chalk.cyan(`cairn create step "${name}" --quest my-quest --path my-path`));
    process.exit(1);
  }
  
  const pathDir = join(workspacePath, 'quests', questSlug, 'paths', pathSlug);
  if (!existsSync(pathDir)) {
    console.error(chalk.red('Error:'), `Path not found: ${questSlug}/${pathSlug}`);
    process.exit(1);
  }
  
  const stepsDir = join(pathDir, 'steps');
  const stepPath = join(stepsDir, `${slug}.md`);
  
  if (existsSync(stepPath)) {
    console.error(chalk.red('Error:'), `Step already exists: ${slug}`);
    process.exit(1);
  }
  
  // Create step file
  const step = `---
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
Step created via Cairn CLI.
`;
  
  writeFileSync(stepPath, step);
  
  console.log(chalk.green('✓'), `Step created: ${chalk.cyan(slug)}`);
  console.log(chalk.dim(`  Location: ${stepPath}`));
}
