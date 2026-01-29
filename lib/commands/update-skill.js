import chalk from 'chalk';
import ora from 'ora';

import { detectAgents, getAgentName } from '../agents/detect.js';
import { setupClawdbot } from '../agents/clawdbot.js';
import { setupClaudeCode } from '../agents/claude-code.js';
import { setupCursor } from '../agents/cursor.js';
import { resolveWorkspace } from '../setup/workspace.js';

export default async function updateSkill(options) {
  console.log(chalk.bold.cyan('\n🏔️  Updating Agent Skill\n'));

  const workspacePath = resolveWorkspace();

  if (!workspacePath) {
    console.error(chalk.red('Error:'), 'No workspace found. Run:', chalk.cyan('cairn init'));
    process.exit(1);
  }
  
  // Determine which agents to update
  let agentsToUpdate = [];
  
  if (options.agent) {
    agentsToUpdate = [options.agent];
  } else {
    const { detected } = detectAgents();
    if (detected.length === 0) {
      console.log(chalk.yellow('⚠'), 'No agents detected');
      console.log(chalk.dim('Specify agent:'), chalk.cyan('cairn update-skill --agent <type>'));
      return;
    }
    agentsToUpdate = detected;
  }
  
  // Update each agent
  for (const agent of agentsToUpdate) {
    const spinner = ora(`Updating ${getAgentName(agent)}`).start();
    
    try {
      switch (agent) {
        case 'clawdbot':
          await setupClawdbot(workspacePath);
          spinner.succeed(`${getAgentName(agent)} skill updated`);
          break;
          
        case 'claude-code':
          await setupClaudeCode(workspacePath);
          spinner.succeed(`${getAgentName(agent)} skill updated`);
          break;
          
        case 'cursor':
          await setupCursor(workspacePath);
          spinner.succeed(`${getAgentName(agent)} skill updated`);
          break;
          
        default:
          spinner.info(`${getAgentName(agent)} - no auto-update available`);
      }
    } catch (error) {
      spinner.fail(`Failed to update ${getAgentName(agent)}`);
      console.error(chalk.red('Error:'), error.message);
    }
  }
  
  console.log();
  console.log(chalk.green('✓'), 'Agent skills updated');
  console.log(chalk.dim('Your agents now have the latest Cairn workflow documentation.'));
  console.log();
}
