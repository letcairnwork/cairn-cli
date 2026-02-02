import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Set up agent-agnostic workspace context.
 * Writes AGENTS.md to workspace root and .cairn/planning.md.
 * Works with any AI agent that can read files.
 */
export async function setupWorkspaceContext(workspacePath) {
  const workspaceRoot = dirname(workspacePath);

  // Read skill template and replace placeholders
  const skillTemplate = join(__dirname, '../../skills/agent-skill.template.md');
  let skillContent = readFileSync(skillTemplate, 'utf-8');
  skillContent = skillContent
    .replace(/\{\{WORKSPACE_PATH\}\}/g, workspacePath)
    .replace(/\{\{WORKSPACE_ROOT\}\}/g, workspaceRoot);

  // Write AGENTS.md to workspace root
  const agentsMdPath = join(workspacePath, 'AGENTS.md');
  writeFileSync(agentsMdPath, skillContent);
  console.log(chalk.green('✓'), 'AGENTS.md written to workspace root');

  // Create .cairn directory
  const cairnDir = join(workspacePath, '.cairn');
  if (!existsSync(cairnDir)) {
    mkdirSync(cairnDir, { recursive: true });
  }

  // Read planning template and replace placeholders
  const planningTemplate = join(__dirname, '../../skills/agent-planning.template.md');
  let planningContent = readFileSync(planningTemplate, 'utf-8');
  planningContent = planningContent
    .replace(/\{\{WORKSPACE_PATH\}\}/g, workspacePath)
    .replace(/\{\{WORKSPACE_ROOT\}\}/g, workspaceRoot);

  // Write .cairn/planning.md
  const planningPath = join(cairnDir, 'planning.md');
  writeFileSync(planningPath, planningContent);
  console.log(chalk.green('✓'), '.cairn/planning.md written');

  return true;
}

/**
 * Verify workspace context files exist.
 */
export function verifyWorkspaceContext(workspacePath) {
  const agentsMd = join(workspacePath, 'AGENTS.md');
  const planningMd = join(workspacePath, '.cairn', 'planning.md');

  const issues = [];

  if (!existsSync(agentsMd)) {
    issues.push('AGENTS.md not found in workspace root');
  }
  if (!existsSync(planningMd)) {
    issues.push('.cairn/planning.md not found');
  }

  if (issues.length > 0) {
    return { success: false, message: issues.join('; ') };
  }
  return { success: true, message: 'Workspace context files verified' };
}
