#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program
  .name('cairn')
  .description('🦮  AI-native project management')
  .version(packageJson.version);

// Import commands
import onboard from '../lib/commands/onboard.js';
import init from '../lib/commands/init.js';
import create from '../lib/commands/create.js';
import list from '../lib/commands/list.js';
import log from '../lib/commands/log.js';
import doctor from '../lib/commands/doctor.js';
import updateSkill from '../lib/commands/update-skill.js';
import update from '../lib/commands/update.js';

// Onboard command - workspace setup with context files
program
  .command('onboard')
  .description('Set up Cairn workspace and agent context')
  .option('--force', 'Force re-onboarding even if already set up')
  .option('--agent <type>', 'Ignored (kept for backwards compatibility)')
  .option('--path <path>', 'Custom workspace path')
  .action(onboard);

// Init command - workspace only, no agent setup
program
  .command('init')
  .description('Initialize Cairn workspace (without agent configuration)')
  .option('--path <path>', 'Custom workspace path (default: current directory)')
  .action(init);

// Create command - create projects/tasks
program
  .command('create <type> <name>')
  .description('Create a project or task')
  .option('--project <slug>', 'Parent project (required for tasks)')
  .option('--assignee <name>', 'Assignee name', 'you')
  .option('--status <status>', 'Initial status', 'pending')
  .option('--autonomy <level>', 'Autonomy level: propose, draft, or execute (tasks only)', 'draft')
  .option('--due <date>', 'Due date (YYYY-MM-DD)')
  .option('--description <text>', 'Short description')
  .option('--objective <text>', 'Detailed objective')
  .option('--criteria <text>', 'Success criteria (projects only)')
  .option('--context <text>', 'Background context (projects only)')
  .action(create);

// List command - query and filter tasks
program
  .command('list <entity>')
  .description('List tasks with optional filtering')
  .option('--status <statuses>', 'Filter by status (comma-separated: pending,in_progress,blocked)')
  .option('--assignee <name>', 'Filter by assignee')
  .option('--project <slug>', 'Filter by project')
  .option('--due-before <date>', 'Filter by due date (YYYY-MM-DD)')
  .option('--overdue', 'Show only overdue tasks')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(list);

// Log command - add work log entries to tasks
program
  .command('log <task-slug> <message>')
  .description('Add a work log entry to a task')
  .option('--title <text>', 'Custom log entry title (default: "Update")')
  .option('--project <slug>', 'Project to search for the task')
  .action(log);

// Doctor command - check workspace health
program
  .command('doctor')
  .description('Check workspace health and fix issues')
  .action(doctor);

// Update-skill command - refresh workspace context
program
  .command('update-skill')
  .description('Refresh workspace context files (CLAUDE.md + .cairn/planning.md)')
  .action(updateSkill);

// Update command - check for and install updates
program
  .command('update')
  .description('Check for and install Cairn CLI updates')
  .action(update);

// Parse and handle errors
program.parseAsync(process.argv).catch((error) => {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
});
