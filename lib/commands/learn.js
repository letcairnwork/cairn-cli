import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { resolveWorkspace } from '../setup/workspace.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function learn(options) {
  console.log(chalk.cyan.bold('\n📚 Cairn System Overview\n'));
  
  // 1. Show workspace location
  const workspacePath = resolveWorkspace();
  if (workspacePath) {
    console.log(chalk.green('✓'), 'Workspace:', chalk.cyan(workspacePath));
  } else {
    console.log(chalk.yellow('⚠'), 'No workspace found. Run:', chalk.cyan('cairn init'));
  }
  console.log();
  
  // 2. Project structure
  console.log(chalk.bold('📁 Project Structure'));
  console.log(chalk.dim('  projects/{slug}/charter.md       # Project definition'));
  console.log(chalk.dim('  projects/{slug}/tasks/{slug}.md  # Individual tasks'));
  console.log(chalk.dim('  inbox/                           # Unprocessed items'));
  console.log(chalk.dim('  artifacts/                       # Shared documents'));
  console.log(chalk.dim('  .cairn/                          # System files'));
  console.log();
  
  // 3. Key concepts
  console.log(chalk.bold('🎯 Key Concepts'));
  console.log();
  
  console.log(chalk.cyan('  Statuses:'));
  console.log(chalk.dim('    pending   → not started yet'));
  console.log(chalk.dim('    next-up   → ready to work on'));
  console.log(chalk.dim('    in_progress → actively working'));
  console.log(chalk.dim('    blocked   → waiting for input'));
  console.log(chalk.dim('    review    → awaiting approval'));
  console.log(chalk.dim('    done      → completed'));
  console.log();
  
  console.log(chalk.cyan('  Autonomy Levels:'));
  console.log(chalk.dim('    propose → log approach only, don\'t do work'));
  console.log(chalk.dim('    draft   → do work but need review (code changes)'));
  console.log(chalk.dim('    execute → do everything including irreversible actions'));
  console.log();
  
  console.log(chalk.cyan('  Priority & Due Dates:'));
  console.log(chalk.dim('    P1 (urgent)       → due today'));
  console.log(chalk.dim('    P2+ (less urgent) → due in 7 days'));
  console.log();
  
  // 4. Common workflows
  console.log(chalk.bold('🔄 Common Workflows'));
  console.log();
  
  console.log(chalk.cyan('  Starting work:'));
  console.log(chalk.dim('    cairn my                  # See your tasks'));
  console.log(chalk.dim('    cairn start <task-slug>   # Move to in_progress'));
  console.log();
  
  console.log(chalk.cyan('  While working:'));
  console.log(chalk.dim('    cairn note <task-slug> "message"  # Add quick notes'));
  console.log(chalk.dim('    cairn view <task-slug>            # View full details'));
  console.log();
  
  console.log(chalk.cyan('  Finishing:'));
  console.log(chalk.dim('    cairn done <task-slug>    # Auto moves to done/review'));
  console.log(chalk.dim('    cairn block <task-slug> "reason"  # When stuck'));
  console.log();
  
  console.log(chalk.cyan('  Creating new work:'));
  console.log(chalk.dim('    cairn create task "Name" --project <slug> \\'));
  console.log(chalk.dim('      --description "..." --objective "..."'));
  console.log();
  
  // 5. Available documentation
  if (options.verbose) {
    console.log(chalk.bold('📖 Available Documentation\n'));
    
    // Check for CLI skills
    const cliRoot = join(__dirname, '..', '..');
    const skillsDir = join(cliRoot, 'skills');
    if (existsSync(skillsDir)) {
      console.log(chalk.cyan('  CLI Skills:'));
      const skillFiles = readdirSync(skillsDir).filter(f => f.endsWith('.md'));
      skillFiles.forEach(file => {
        console.log(chalk.dim(`    ${join(skillsDir, file)}`));
      });
      console.log();
    }
    
    // Check for workspace planning docs
    if (workspacePath) {
      const cairnDir = join(workspacePath, '.cairn');
      if (existsSync(cairnDir)) {
        console.log(chalk.cyan('  Workspace Documentation:'));
        const cairnFiles = readdirSync(cairnDir).filter(f => f.endsWith('.md'));
        cairnFiles.forEach(file => {
          console.log(chalk.dim(`    ${join(cairnDir, file)}`));
        });
        console.log();
      }
    }
  } else {
    console.log(chalk.dim('Run with --verbose to see full documentation paths'));
  }
  
  // 6. Quick tips
  console.log(chalk.bold('💡 Quick Tips'));
  console.log();
  console.log(chalk.dim('  • Always use CLI to create entities (never edit YAML manually)'));
  console.log(chalk.dim('  • Set status immediately when your state changes'));
  console.log(chalk.dim('  • Use next-up for queued work, in_progress for active work'));
  console.log(chalk.dim('  • Respect autonomy: draft→review, execute→done'));
  console.log(chalk.dim('  • Check cairn my regularly to see your workload'));
  console.log();
  
  console.log(chalk.dim('For detailed help on any command:'), chalk.cyan('cairn <command> --help'));
  console.log();
}
