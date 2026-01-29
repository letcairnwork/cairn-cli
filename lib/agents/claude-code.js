import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Set up Cairn for Claude Code
 * Adds agent-skill.md to workspace context
 */
export async function setupClaudeCode(workspacePath) {
  const cwd = process.cwd();
  const contextDir = join(cwd, '.claude-code');
  const skillTemplate = join(__dirname, '../../skills/agent-skill.template.md');
  const skillDest = join(contextDir, 'cairn-skill.md');
  
  // Create context directory
  if (!existsSync(contextDir)) {
    mkdirSync(contextDir, { recursive: true });
  }
  
  // Read template and replace workspace placeholders
  let skillContent = readFileSync(skillTemplate, 'utf-8');
  const workspaceRoot = dirname(workspacePath);
  
  skillContent = skillContent
    .replace(/\{\{WORKSPACE_PATH\}\}/g, workspacePath)
    .replace(/\{\{WORKSPACE_ROOT\}\}/g, workspaceRoot);
  
  // Write skill to workspace
  writeFileSync(skillDest, skillContent);
  console.log(chalk.green('✓'), 'Cairn skill added to Claude Code workspace');
  
  // Create instructions file
  const instructionsPath = join(contextDir, 'cairn-instructions.md');
  const instructions = `# Cairn Project Management

This workspace uses Cairn for project management.

**Workspace:** ${workspacePath}

**Skill documentation:** Read \`cairn-skill.md\` in this directory for the complete workflow.

**Key points:**
- All project files are in markdown format at ${workspacePath}
- Files are the source of truth (no database)
- Follow the quest → path → step hierarchy
- Always update status before asking blocking questions
- Log all work in the Work Log section

Refer to cairn-skill.md for detailed instructions on working with Cairn files.
`;
  
  writeFileSync(instructionsPath, instructions);
  console.log(chalk.green('✓'), 'Cairn instructions added');
  
  return true;
}

/**
 * Get setup instructions for Claude Code
 */
export function getClaudeCodeInstructions(workspacePath) {
  return `
${chalk.bold('Claude Code Setup Complete!')}

Your Cairn workspace: ${chalk.cyan(workspacePath)}
Context added at: ${chalk.cyan('.claude-code/')}

${chalk.bold('Test it:')}
Ask Claude Code:
  ${chalk.yellow('"Read .claude-code/cairn-skill.md and help me create a quest"')}

${chalk.dim('Note: You may need to reload the workspace for changes to take effect.')}
`;
}

/**
 * Verify Claude Code setup
 */
export function verifyClaudeCode() {
  const contextPath = join(process.cwd(), '.claude-code', 'cairn-skill.md');
  
  if (!existsSync(contextPath)) {
    return { success: false, message: 'Cairn skill not found in workspace' };
  }
  
  return { success: true, message: 'Claude Code setup verified' };
}
