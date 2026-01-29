import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Set up Cairn for Cursor
 * Adds to .cursorrules or creates .cursor/ directory with skill
 */
export async function setupCursor(workspacePath) {
  const cwd = process.cwd();
  const cursorRulesPath = join(cwd, '.cursorrules');
  const skillSource = join(__dirname, '../../skills/agent-skill.md');
  
  // Strategy 1: Add to .cursorrules if it exists
  if (existsSync(cursorRulesPath)) {
    const existing = readFileSync(cursorRulesPath, 'utf8');
    const cairnRule = `

# Cairn Project Management

This project uses Cairn for project management.

**Workspace:** ${workspacePath}

When working with project management tasks:
1. All files are in markdown format at ${workspacePath}
2. Follow quest → path → step hierarchy
3. Update status before asking for blocking information
4. Log all work with timestamps

See ~/.cairn/agent-skill.md for complete workflow documentation.
`;
    
    if (!existing.includes('Cairn Project Management')) {
      writeFileSync(cursorRulesPath, existing + cairnRule);
      console.log(chalk.green('✓'), 'Cairn rules added to .cursorrules');
    } else {
      console.log(chalk.yellow('⚠'), '.cursorrules already contains Cairn rules');
    }
  }
  
  // Strategy 2: Create .cursor/ directory with skill
  const cursorDir = join(cwd, '.cursor');
  if (!existsSync(cursorDir)) {
    mkdirSync(cursorDir, { recursive: true });
  }
  
  const skillDest = join(cursorDir, 'cairn-skill.md');
  copyFileSync(skillSource, skillDest);
  console.log(chalk.green('✓'), 'Cairn skill added to .cursor/');
  
  // Create config
  const configPath = join(cursorDir, 'cairn-config.json');
  const config = {
    workspacePath,
    version: '0.1.0',
    installedAt: new Date().toISOString()
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  return true;
}

/**
 * Get setup instructions for Cursor
 */
export function getCursorInstructions(workspacePath) {
  return `
${chalk.bold('Cursor Setup Complete!')}

Your Cairn workspace: ${chalk.cyan(workspacePath)}
Configuration: ${chalk.cyan('.cursor/')} and ${chalk.cyan('.cursorrules')}

${chalk.bold('Test it:')}
Ask Cursor:
  ${chalk.yellow('"Read .cursor/cairn-skill.md and help me create a quest"')}

${chalk.dim('Note: Cursor should automatically pick up .cursorrules on next prompt.')}
`;
}

/**
 * Verify Cursor setup
 */
export function verifyCursor() {
  const cwd = process.cwd();
  const rulesPath = join(cwd, '.cursorrules');
  const skillPath = join(cwd, '.cursor', 'cairn-skill.md');
  
  if (!existsSync(rulesPath) && !existsSync(skillPath)) {
    return { success: false, message: 'Cairn not configured for Cursor' };
  }
  
  return { success: true, message: 'Cursor setup verified' };
}
