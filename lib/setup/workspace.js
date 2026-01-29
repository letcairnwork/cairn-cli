import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Create Cairn workspace structure
 */
export function createWorkspace(path = join(homedir(), 'pms')) {
  const spinner = ora('Creating workspace structure').start();
  
  const folders = [
    '',
    'projects',
    'inbox',
    '_drafts',
    '_conflicts',
    '_abandoned',
  ];
  
  for (const folder of folders) {
    const fullPath = join(path, folder);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
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
  
  const content = `# Welcome to Cairn 🏔️

You've successfully set up Cairn!

## Your Workspace

This folder (\`${path}\`) contains all your project files.

### Structure

- \`projects/\` - Your projects (e.g., "launch-my-app")
- \`inbox/\` - Ideas and incoming tasks to triage
- \`_drafts/\` - Work in progress
- \`_conflicts/\` - Sync conflicts (if using multi-device sync)

## Getting Started

### Create Your First Project

\`\`\`bash
cairn create project "My First Project"
\`\`\`

Or create manually:
- Create folder: \`projects/my-first-project/\`
- Create file: \`charter.md\`
- Add frontmatter (see examples below)

### Work with Your AI Agent

Your AI agent is configured to work with Cairn! Try:

\`\`\`
"Help me create a project called Launch My App"
\`\`\`

## File Format

Cairn uses markdown files with YAML frontmatter:

\`\`\`yaml
---
title: My Project
description: What we're building
status: active
priority: 1
owner: me
---

## Why This Matters

[Your goals]

## Success Criteria

[What does done look like?]
\`\`\`

## Learn More

- **Commands:** \`cairn --help\`
- **Check health:** \`cairn doctor\`
- **Update skill:** \`cairn update-skill\`

Happy building! 🏔️
`;
  
  writeFileSync(readmePath, content);
  console.log(chalk.green('✓'), 'Welcome file created');
}

/**
 * Check if workspace exists
 */
export function workspaceExists(path = join(homedir(), 'pms')) {
  return existsSync(join(path, 'projects'));
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
