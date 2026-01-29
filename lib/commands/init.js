import chalk from 'chalk';

import { createWorkspace, createWelcomeFile, workspaceExists } from '../setup/workspace.js';

export default async function init(options) {
  console.log(chalk.bold.cyan('\n🏔️  Initializing Cairn\n'));
  
  const workspacePath = options.path || process.cwd();
  
  if (workspaceExists(workspacePath)) {
    console.log(chalk.yellow('⚠'), `Workspace already exists at ${workspacePath}`);
    console.log(chalk.dim('Use --path to specify a different location'));
    return;
  }
  
  // Create workspace
  createWorkspace(workspacePath);
  createWelcomeFile(workspacePath);
  
  console.log();
  console.log(chalk.green('✓'), `Workspace created at ${chalk.cyan(workspacePath)}`);
  console.log();
  console.log(chalk.dim('Next steps:'));
  console.log(chalk.dim('  • Create a project: cairn create project "My Project"'));
  console.log(chalk.dim('  • Configure agent: cairn onboard'));
  console.log(chalk.dim('  • Check health: cairn doctor'));
  console.log();
}
