import { existsSync, mkdirSync, symlinkSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Set up Cairn for Clawdbot
 * Creates symlink to agent-skill.md in Clawdbot's skills directory
 */
export async function setupClawdbot(workspacePath) {
  const clawdbotSkillsDir = join(homedir(), '.clawdbot', 'skills', 'cairn');
  const skillSource = join(__dirname, '../../skills/agent-skill.md');
  const skillDest = join(clawdbotSkillsDir, 'SKILL.md');
  
  // Create skills directory if it doesn't exist
  if (!existsSync(clawdbotSkillsDir)) {
    mkdirSync(clawdbotSkillsDir, { recursive: true });
  }
  
  // Remove existing symlink/file if present
  if (existsSync(skillDest)) {
    // Check if it's a symlink
    try {
      await import('fs').then(fs => fs.promises.unlink(skillDest));
    } catch (err) {
      // Ignore errors
    }
  }
  
  // Create symlink to skill
  try {
    symlinkSync(skillSource, skillDest);
    console.log(chalk.green('✓'), 'Cairn skill added to Clawdbot');
  } catch (err) {
    // If symlink fails, copy the file instead
    const { copyFileSync } = await import('fs');
    copyFileSync(skillSource, skillDest);
    console.log(chalk.green('✓'), 'Cairn skill copied to Clawdbot');
  }
  
  // Create a config file with workspace path
  const configPath = join(clawdbotSkillsDir, 'config.json');
  const config = {
    workspacePath,
    version: '0.1.0',
    installedAt: new Date().toISOString()
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  return true;
}

/**
 * Get setup instructions for Clawdbot
 */
export function getClawdbotInstructions(workspacePath) {
  return `
${chalk.bold('Clawdbot Setup Complete!')}

Your Cairn workspace: ${chalk.cyan(workspacePath)}
Skill installed at: ${chalk.cyan('~/.clawdbot/skills/cairn/')}

${chalk.bold('Test it:')}
In your next Clawdbot session, try:
  ${chalk.yellow('"Help me create a quest called Launch My App"')}

The skill will be automatically available in new sessions.
`;
}

/**
 * Verify Clawdbot setup
 */
export function verifyClawdbot() {
  const clawdbotPath = join(homedir(), '.clawdbot');
  const skillPath = join(clawdbotPath, 'skills', 'cairn', 'SKILL.md');
  
  if (!existsSync(clawdbotPath)) {
    return { success: false, message: 'Clawdbot directory not found' };
  }
  
  if (!existsSync(skillPath)) {
    return { success: false, message: 'Cairn skill not installed' };
  }
  
  return { success: true, message: 'Clawdbot setup verified' };
}
