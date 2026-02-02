import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

import { createWorkspace, createWelcomeFile, createAgentContext, createMemoryFile, workspaceExists } from '../setup/workspace.js';
import { setupWorkspaceContext } from '../setup/context.js';

export default async function onboard(options) {
  console.log(chalk.bold.cyan('\n🦮  Cairn Onboarding\n'));

  // Accept --agent for backwards compat but ignore it.
  // Non-interactive when --agent or --path is provided.
  const nonInteractive = !!(options.agent || options.path);

  // Prompt for workspace path (if not provided)
  let workspacePath = options.path;
  if (!workspacePath) {
    if (nonInteractive) {
      workspacePath = process.cwd();
    } else {
      const currentDir = process.cwd();
      const cairnDir = join(homedir(), 'cairn');

      const { location } = await inquirer.prompt([{
        type: 'list',
        name: 'location',
        message: 'Where should Cairn store your project files?',
        choices: [
          { name: `Here (${currentDir})`, value: currentDir },
          { name: `~/cairn`, value: cairnDir },
          { name: 'Somewhere else...', value: '__custom__' }
        ]
      }]);

      if (location === '__custom__') {
        const { customPath } = await inquirer.prompt([{
          type: 'input',
          name: 'customPath',
          message: 'Enter the full path:'
        }]);
        workspacePath = customPath;
      } else {
        workspacePath = location;
      }
    }
  }

  // Check if already set up
  if (workspaceExists(workspacePath) && !options.force) {
    if (nonInteractive) {
      console.log(chalk.dim('Workspace already exists at'), workspacePath);
    } else {
      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: `Workspace already exists at ${workspacePath}. Re-run onboarding?`,
        default: false
      }]);

      if (!proceed) {
        console.log(chalk.yellow('\nOnboarding cancelled.'));
        return;
      }
    }
  }

  // Prompt for user name (optional, improves UX)
  let userName = options.name;
  if (!userName && !nonInteractive) {
    const { name } = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'What\'s your name? (optional, helps personalize agent messages)',
      default: 'User'
    }]);
    userName = name || 'User';
  } else if (!userName) {
    userName = 'User';
  }

  // Step 1: Create workspace
  console.log();
  createWorkspace(workspacePath);
  createWelcomeFile(workspacePath);
  createAgentContext(workspacePath, userName);
  createMemoryFile(workspacePath);

  // Step 2: Write context files (AGENTS.md + .cairn/planning.md)
  console.log();
  const setupSpinner = ora('Writing workspace context').start();

  try {
    await setupWorkspaceContext(workspacePath);
    setupSpinner.succeed('Workspace context configured');
  } catch (error) {
    setupSpinner.fail('Setup failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }

  // Success!
  console.log(chalk.bold.green('\n🎉 Onboarding complete!\n'));
  console.log(chalk.dim('Workspace:'), chalk.cyan(workspacePath));
  console.log(chalk.dim('Agent context:'), chalk.cyan('AGENTS.md, TOOLS.md, USER.md'));
  console.log(chalk.dim('Example project:'), chalk.cyan('projects/getting-started'));
  console.log();
  console.log(chalk.bold('Next steps:\n'));
  console.log(chalk.cyan('  cairn my                       '), chalk.dim('# See example tasks'));
  console.log(chalk.cyan('  cairn start explore-cairn      '), chalk.dim('# Begin the tutorial'));
  console.log(chalk.cyan('  cd'), chalk.cyan(workspacePath), chalk.dim('&& open .'));
  console.log();
  console.log(chalk.bold('Teaching your AI agent:\n'));
  console.log(chalk.dim('  Your agent will automatically read'), chalk.cyan('AGENTS.md'), chalk.dim('for workspace conventions.'));
  console.log(chalk.dim('  Just tell them:'));
  console.log();
  console.log(chalk.green('    "I use Cairn for task management. Read AGENTS.md for instructions,'));
  console.log(chalk.green('     then run \'cairn my\' to see your current workload."'));
  console.log();
}
