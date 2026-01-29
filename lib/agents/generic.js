import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generic agent setup - just provide instructions
 */
export async function setupGeneric({ workspacePath, agentName }) {
  // For generic agents, we can't auto-configure
  // Just provide clear instructions
  console.log(chalk.yellow('ℹ'), 'Generic agent detected - manual setup required');
  return true;
}

/**
 * Get setup instructions for generic agents
 */
export function getGenericInstructions(workspacePath) {
  const skillPath = join(dirname(__dirname), '../skills/agent-skill.template.md');
  
  let output = '\n';
  output += chalk.bold('Manual Setup Required') + '\n\n';
  output += 'Your Cairn workspace: ' + chalk.cyan(workspacePath) + '\n\n';
  output += chalk.bold('To configure your AI agent:') + '\n\n';
  output += '1. Share this with your agent:\n';
  output += '   ' + chalk.dim('─────────────────────────────────────') + '\n';
  output += '   ' + chalk.yellow('I\'m using Cairn for project management.') + '\n';
  output += '   ' + chalk.yellow('My workspace is at: ' + workspacePath) + '\n';
  output += '   ' + chalk.yellow('Please read the agent skill documentation at:') + '\n';
  output += '   ' + chalk.yellow(skillPath) + '\n';
  output += '   ' + chalk.dim('─────────────────────────────────────') + '\n\n';
  output += '2. ' + chalk.bold('Or copy the skill to your agent\'s context:') + '\n';
  output += '   - For AI coding assistants: Add ' + chalk.cyan(skillPath) + ' to your workspace\n';
  output += '   - For chat agents: Share the skill content in your first message\n\n';
  output += '3. ' + chalk.bold('Test it:') + '\n';
  output += '   Ask your agent:\n';
  output += '     ' + chalk.yellow('"Help me create a quest called Launch My App"') + '\n\n';
  output += chalk.bold('Supported agents with auto-setup:') + '\n';
  output += '- Clawdbot (detected via ~/.clawdbot/)\n';
  output += '- Claude Code (workspace-based)\n';
  output += '- Cursor (uses .cursorrules)\n';
  output += '- Windsurf (workspace-based)\n\n';
  output += chalk.dim('If you install one of these agents later, run:') + '\n';
  output += chalk.dim('  cairn onboard --force') + '\n';
  
  return output;
}

/**
 * Verify generic setup (always returns guidance)
 */
export function verifyGeneric() {
  return {
    success: true,
    message: 'Manual setup - verify agent can read workspace'
  };
}
