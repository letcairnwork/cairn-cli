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
  .description('🏔️  AI-native project management')
  .version(packageJson.version);

// Import commands
import onboard from '../lib/commands/onboard.js';
import init from '../lib/commands/init.js';
import create from '../lib/commands/create.js';
import doctor from '../lib/commands/doctor.js';
import updateSkill from '../lib/commands/update-skill.js';
import update from '../lib/commands/update.js';

// Onboard command - full setup with agent detection
program
  .command('onboard')
  .description('Set up Cairn and configure your AI agent')
  .option('--force', 'Force re-onboarding even if already set up')
  .option('--agent <type>', 'Specify agent type (clawdbot|claude-code|cursor|generic)')
  .option('--path <path>', 'Custom workspace path (default: ~/cairn)')
  .action(onboard);

// Init command - workspace only, no agent setup
program
  .command('init')
  .description('Initialize Cairn workspace (without agent configuration)')
  .option('--path <path>', 'Custom workspace path (default: ~/cairn)')
  .action(init);

// Create command - create quests/paths/steps
program
  .command('create <type> <name>')
  .description('Create a quest, path, or step')
  .option('--path <slug>', 'Parent path (for steps)')
  .option('--quest <slug>', 'Parent quest (for paths/steps)')
  .option('--assignee <name>', 'Assignee name', 'you')
  .option('--status <status>', 'Initial status', 'pending')
  .option('--due <date>', 'Due date (YYYY-MM-DD)')
  .option('--description <text>', 'Short description')
  .option('--objective <text>', 'Detailed objective')
  .action(create);

// Doctor command - check workspace health
program
  .command('doctor')
  .description('Check workspace health and fix issues')
  .action(doctor);

// Update-skill command - refresh agent skill
program
  .command('update-skill')
  .description('Update agent skill documentation')
  .option('--agent <type>', 'Specific agent to update')
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
