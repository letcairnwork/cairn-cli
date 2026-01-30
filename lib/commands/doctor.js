import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import chalk from 'chalk';
import ora from 'ora';

import { validateWorkspace, createWelcomeFile, resolveWorkspace } from '../setup/workspace.js';
import { verifyWorkspaceContext } from '../setup/context.js';

export default async function doctor() {
  console.log(chalk.bold.cyan('\n🦮  Cairn Doctor\n'));
  console.log(chalk.dim('Checking workspace health...\n'));

  const workspacePath = resolveWorkspace() || join(homedir(), 'cairn');
  let issues = [];
  let warnings = [];

  // Check 1: Workspace exists
  const spinner = ora('Checking workspace').start();
  if (!existsSync(workspacePath)) {
    spinner.fail('Workspace not found');
    issues.push({
      problem: `Workspace not found at ${workspacePath}`,
      fix: 'Run: cairn init'
    });
  } else {
    const { valid, missing } = validateWorkspace(workspacePath);
    if (!valid) {
      spinner.warn('Workspace incomplete');
      warnings.push({
        problem: `Missing folders: ${missing.join(', ')}`,
        fix: 'Run: cairn init --path ' + workspacePath
      });
    } else {
      spinner.succeed('Workspace structure valid');
    }
  }

  // Check 2: Context files (CLAUDE.md + .cairn/planning.md)
  const contextSpinner = ora('Checking workspace context').start();
  if (existsSync(workspacePath)) {
    const result = verifyWorkspaceContext(workspacePath);
    if (result.success) {
      contextSpinner.succeed(result.message);
    } else {
      contextSpinner.fail(result.message);
      issues.push({
        problem: result.message,
        fix: 'Run: cairn onboard --force --path ' + workspacePath
      });
    }
  } else {
    contextSpinner.skip('Skipped (no workspace)');
  }

  // Check 3: README exists
  const readmeSpinner = ora('Checking README').start();
  const readmePath = join(workspacePath, 'README.md');
  if (existsSync(readmePath)) {
    readmeSpinner.succeed('README exists');
  } else {
    readmeSpinner.warn('README missing');
    warnings.push({
      problem: 'Welcome README not found',
      fix: 'Will be created automatically'
    });
    if (existsSync(workspacePath)) {
      createWelcomeFile(workspacePath);
      console.log(chalk.green('✓'), 'README created');
    }
  }

  // Summary
  console.log();
  console.log(chalk.bold('Summary:\n'));

  if (issues.length === 0 && warnings.length === 0) {
    console.log(chalk.green('✓'), chalk.bold('Everything looks good!'));
    console.log();
    console.log(chalk.dim('Your Cairn workspace is healthy.'));
    console.log(chalk.dim('Location:'), chalk.cyan(workspacePath));
    console.log();
    return;
  }

  if (issues.length > 0) {
    console.log(chalk.red.bold(`${issues.length} issue(s) found:\n`));
    for (const issue of issues) {
      console.log(chalk.red('✗'), issue.problem);
      console.log(chalk.dim('  Fix:'), chalk.cyan(issue.fix));
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold(`${warnings.length} warning(s):\n`));
    for (const warning of warnings) {
      console.log(chalk.yellow('⚠'), warning.problem);
      console.log(chalk.dim('  Fix:'), chalk.cyan(warning.fix));
      console.log();
    }
  }

  console.log(chalk.dim('Run'), chalk.cyan('cairn --help'), chalk.dim('for more commands.'));
  console.log();
}
