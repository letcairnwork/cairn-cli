import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

import { detectAgents, getAgentName } from '../agents/detect.js';
import { setupClawdbot, getClawdbotInstructions } from '../agents/clawdbot.js';
import { setupClaudeCode, getClaudeCodeInstructions } from '../agents/claude-code.js';
import { setupCursor, getCursorInstructions } from '../agents/cursor.js';
import { setupGeneric, getGenericInstructions } from '../agents/generic.js';
import { createWorkspace, createWelcomeFile, workspaceExists } from '../setup/workspace.js';

export default async function onboard(options) {
  console.log(chalk.bold.cyan('\n🏔️  Cairn Onboarding\n'));
  
  // Prompt for workspace path (if not provided)
  let workspacePath = options.path;
  if (!workspacePath) {
    const defaultPath = join(homedir(), 'pms');
    const { confirmedPath } = await inquirer.prompt([{
      type: 'input',
      name: 'confirmedPath',
      message: 'Where should Cairn store your project files?',
      default: defaultPath
    }]);
    workspacePath = confirmedPath;
  }
  
  // Check if already set up
  if (workspaceExists(workspacePath) && !options.force) {
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
  
  // Step 1: Detect agents
  let agentType = options.agent;
  
  if (!agentType) {
    const spinner = ora('Detecting AI agents').start();
    const { primary, detected } = detectAgents();
    spinner.stop();
    
    if (detected.length > 1) {
      console.log(chalk.green('✓'), `Detected agents: ${detected.map(getAgentName).join(', ')}`);
      
      const { selected } = await inquirer.prompt([{
        type: 'list',
        name: 'selected',
        message: 'Multiple agents detected. Which one do you want to configure?',
        choices: detected.map(type => ({
          name: getAgentName(type),
          value: type
        }))
      }]);
      
      agentType = selected;
    } else if (detected.length === 1) {
      agentType = primary;
      console.log(chalk.green('✓'), `Detected: ${getAgentName(agentType)}`);
    } else {
      agentType = 'generic';
      console.log(chalk.yellow('ℹ'), 'No specific agent detected - using generic setup');
    }
  }
  
  // Step 2: Create workspace
  console.log();
  createWorkspace(workspacePath);
  createWelcomeFile(workspacePath);
  
  // Step 3: Set up agent
  console.log();
  const setupSpinner = ora(`Configuring ${getAgentName(agentType)}`).start();
  
  try {
    switch (agentType) {
      case 'clawdbot':
        await setupClawdbot(workspacePath);
        setupSpinner.succeed(`${getAgentName(agentType)} configured`);
        console.log(getClawdbotInstructions(workspacePath));
        break;
        
      case 'claude-code':
        await setupClaudeCode(workspacePath);
        setupSpinner.succeed(`${getAgentName(agentType)} configured`);
        console.log(getClaudeCodeInstructions(workspacePath));
        break;
        
      case 'cursor':
        await setupCursor(workspacePath);
        setupSpinner.succeed(`${getAgentName(agentType)} configured`);
        console.log(getCursorInstructions(workspacePath));
        break;
        
      case 'generic':
      default:
        await setupGeneric(workspacePath);
        setupSpinner.stop();
        console.log(getGenericInstructions(workspacePath));
        break;
    }
  } catch (error) {
    setupSpinner.fail('Setup failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
  
  // Success!
  console.log(chalk.bold.green('\n🎉 Onboarding complete!\n'));
  console.log(chalk.dim('Next steps:'));
  console.log(chalk.dim('  1. Test your agent with: "Help me create a quest"'));
  console.log(chalk.dim('  2. Read the docs: cairn --help'));
  console.log(chalk.dim('  3. Create your first project: cairn create quest "My Project"'));
  console.log();
}
