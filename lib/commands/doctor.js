import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import chalk from 'chalk';
import ora from 'ora';

import { detectAgents, getAgentName } from '../agents/detect.js';
import { verifyClawdbot } from '../agents/clawdbot.js';
import { verifyClaudeCode } from '../agents/claude-code.js';
import { verifyCursor } from '../agents/cursor.js';
import { validateWorkspace, createWorkspace, createWelcomeFile, resolveWorkspace } from '../setup/workspace.js';

export default async function doctor() {
  console.log(chalk.bold.cyan('\n🏔️  Cairn Doctor\n'));
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
  
  // Check 2: Agent configuration
  const agentSpinner = ora('Checking agent configuration').start();
  const { primary, detected } = detectAgents();
  
  if (detected.length === 0) {
    agentSpinner.info('No specific agent detected');
    warnings.push({
      problem: 'No AI agent auto-detected',
      fix: 'Run: cairn onboard --agent <type>'
    });
  } else {
    agentSpinner.succeed(`Detected: ${detected.map(getAgentName).join(', ')}`);
    
    // Verify each detected agent
    for (const agent of detected) {
      const verifySpinner = ora(`Verifying ${getAgentName(agent)}`).start();
      let result;
      
      switch (agent) {
        case 'clawdbot':
          result = verifyClawdbot();
          break;
        case 'claude-code':
          result = verifyClaudeCode();
          break;
        case 'cursor':
          result = verifyCursor();
          break;
        default:
          result = { success: true, message: 'No verification available' };
      }
      
      if (result.success) {
        verifySpinner.succeed(result.message);
      } else {
        verifySpinner.fail(result.message);
        issues.push({
          problem: `${getAgentName(agent)}: ${result.message}`,
          fix: `Run: cairn onboard --agent ${agent} --force`
        });
      }
    }
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
