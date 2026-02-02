import chalk from 'chalk';
import ora from 'ora';

import { resolveWorkspace } from '../setup/workspace.js';
import { setupWorkspaceContext } from '../setup/context.js';

export default async function updateSkill(options) {
  console.log(chalk.bold.cyan('\n🦮  Updating Workspace Context\n'));

  const workspacePath = resolveWorkspace();

  if (!workspacePath) {
    console.error(chalk.red('Error:'), 'No workspace found. Run:', chalk.cyan('cairn init'));
    process.exit(1);
  }

  const spinner = ora('Refreshing AGENTS.md and .cairn/planning.md').start();

  try {
    await setupWorkspaceContext(workspacePath);
    spinner.succeed('Workspace context updated');
  } catch (error) {
    spinner.fail('Failed to update workspace context');
    console.error(chalk.red('Error:'), error.message);
  }

  console.log();
  console.log(chalk.green('✓'), 'Agent context files refreshed');
  console.log(chalk.dim('Your agents now have the latest Cairn workflow documentation.'));
  console.log();
}
