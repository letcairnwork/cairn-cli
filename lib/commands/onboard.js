import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

import { createWorkspace, createWelcomeFile, workspaceExists } from '../setup/workspace.js';
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

  // Step 1: Create workspace
  console.log();
  createWorkspace(workspacePath);
  createWelcomeFile(workspacePath);

  // Step 2: Write context files (CLAUDE.md + .cairn/planning.md)
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
  console.log(chalk.dim('Context:'), chalk.cyan('CLAUDE.md'), '+', chalk.cyan('.cairn/planning.md'));
  console.log();
  console.log(chalk.dim('Next steps:'));
  console.log(chalk.dim('  1. Open your workspace and tell your agent:'));
  console.log(chalk.dim('     "I use Cairn for project management. Run `cairn --help`'));
  console.log(chalk.dim('      to learn the commands, then help me create my first project."'));
  console.log(chalk.dim('  2. Or try it yourself: cairn create project "My Project"'));
  console.log(chalk.dim('  3. Explore commands: cairn --help'));
  console.log();
}
