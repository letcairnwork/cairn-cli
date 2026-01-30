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

  // Read planning template and replace placeholders
  const planningTemplate = join(__dirname, '../../skills/agent-planning.template.md');
  let planningContent = readFileSync(planningTemplate, 'utf-8');
  planningContent = planningContent
    .replace(/\{\{WORKSPACE_PATH\}\}/g, workspacePath)
    .replace(/\{\{WORKSPACE_ROOT\}\}/g, workspaceRoot);

  const planningDest = join(contextDir, 'cairn-planning.md');
  writeFileSync(planningDest, planningContent);
  console.log(chalk.green('✓'), 'Cairn planning guide added to Claude Code workspace');
  
  // Create instructions file
  const instructionsPath = join(contextDir, 'cairn-instructions.md');
  const instructions = `# Cairn Project Management

This workspace uses Cairn for project management.

**Workspace:** ${workspacePath}

## Agent Documentation

Read BOTH files in this directory:
- **cairn-skill.md** — Operations: status transitions, autonomy levels, blocker workflow, file format
- **cairn-planning.md** — Planning: how to create projects, break down tasks, write real content, examples

**Key points:**
- All project files are in markdown format at ${workspacePath}
- Files are the source of truth (no database)
- Follow the project → task hierarchy
- Always update status before asking blocking questions
- Log all work in the Work Log section
- When creating projects, fill in ALL sections with real content (never leave placeholder text)

Read both skill files before working with Cairn.
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
  ${chalk.yellow('"Read .claude-code/cairn-skill.md and help me create a project"')}

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
