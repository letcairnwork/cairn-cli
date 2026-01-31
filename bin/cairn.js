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
import upgrade from '../lib/commands/upgrade.js';
import start from '../lib/commands/start.js';
import done from '../lib/commands/done.js';
import block from '../lib/commands/block.js';
import view from '../lib/commands/view.js';
import active from '../lib/commands/active.js';
import my from '../lib/commands/my.js';

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

// Update command - update task properties (artifacts, etc.)
program
  .command('update <task-slug>')
  .description('Update task properties (artifacts, etc.)')
  .option('--add-artifact <path>', 'Add an artifact to the task (repeatable)', (value, previous) => {
    return previous ? previous.concat([value]) : [value];
  })
  .option('--remove-artifact <path>', 'Remove an artifact from the task (repeatable)', (value, previous) => {
    return previous ? previous.concat([value]) : [value];
  })
  .option('--project <slug>', 'Project to search for the task')
  .action(update);

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

// Upgrade command - check for and install CLI updates
program
  .command('upgrade')
  .description('Check for and install Cairn CLI updates')
  .action(upgrade);

// Start command - mark task as in_progress
program
  .command('start <task-slug>')
  .description('Start working on a task (sets status to in_progress)')
  .option('--project <slug>', 'Project to search for the task')
  .action(start);

// Done command - mark task as complete (review or done based on autonomy)
program
  .command('done <task-slug>')
  .description('Mark task as complete (review/done based on autonomy level)')
  .option('--project <slug>', 'Project to search for the task')
  .action(done);

// Block command - mark task as blocked with reason
program
  .command('block <task-slug> <message>')
  .description('Mark task as blocked with explanation')
  .option('--project <slug>', 'Project to search for the task')
  .action(block);

// View command - show full task details
program
  .command('view <task-slug>')
  .description('View complete task details')
  .option('--project <slug>', 'Project to search for the task')
  .action(view);

// Active command - show all in_progress tasks
program
  .command('active')
  .description('Show all tasks currently in progress')
  .action(active);

// My command - show all my tasks grouped by status
program
  .command('my')
  .description('Show all tasks assigned to me, grouped by status')
  .action(my);

// Parse and handle errors
program.parseAsync(process.argv).catch((error) => {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
});
