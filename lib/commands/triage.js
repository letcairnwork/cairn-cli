import { existsSync, readdirSync, readFileSync, unlinkSync } from 'fs';
import { join, basename } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { resolveWorkspace } from '../setup/workspace.js';
import create from './create.js';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract project suggestions from existing projects
 */
function getAvailableProjects(workspacePath) {
  const projectsPath = join(workspacePath, 'projects');
  if (!existsSync(projectsPath)) return [];
  
  return readdirSync(projectsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * Parse inbox item content to suggest task details
 */
function parseInboxItem(content) {
  // Simple heuristic: first line = title, rest = potential description
  const lines = content.trim().split('\n').filter(l => l.trim());
  const title = lines[0] || 'Untitled Task';
  const description = lines.length > 1 ? lines.slice(1).join(' ').substring(0, 100) : title;
  
  return {
    title: title.replace(/^#+\s*/, '').trim(), // Remove markdown headers
    description: description.trim()
  };
}

/**
 * Main triage function - interactive inbox processing
 */
export default async function triage(options = {}) {
  const workspacePath = resolveWorkspace();

  if (!workspacePath) {
    console.error(chalk.red('Error:'), 'No workspace found. Run:', chalk.cyan('cairn init'));
    process.exit(1);
  }

  const inboxPath = join(workspacePath, 'inbox');
  
  if (!existsSync(inboxPath)) {
    console.log(chalk.yellow('⚠'), 'Inbox folder not found');
    console.log(chalk.dim('  Create it at:'), inboxPath);
    return;
  }

  // Get all inbox items
  const inboxFiles = readdirSync(inboxPath)
    .filter(f => f.endsWith('.md'))
    .map(f => join(inboxPath, f));

  if (inboxFiles.length === 0) {
    console.log(chalk.green('✓'), 'Inbox is empty!');
    return;
  }

  console.log(chalk.cyan('\n📥 Inbox Triage\n'));
  console.log(chalk.dim(`Found ${inboxFiles.length} item(s) to process\n`));

  const availableProjects = getAvailableProjects(workspacePath);
  
  if (availableProjects.length === 0) {
    console.log(chalk.yellow('⚠'), 'No projects found. Create one first:');
    console.log(chalk.cyan('  cairn create project "My Project" --description "..." --objective "..." --criteria "..." --context "..."'));
    return;
  }

  let processed = 0;
  let skipped = 0;

  for (const filePath of inboxFiles) {
    const filename = basename(filePath);
    const content = readFileSync(filePath, 'utf-8');
    const parsed = parseInboxItem(content);

    console.log(chalk.bold(`\n${filename}`));
    console.log(chalk.dim('─'.repeat(60)));
    console.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
    console.log(chalk.dim('─'.repeat(60)));

    // Ask what to do with this item
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What should we do with this?',
      choices: [
        { name: 'Create task', value: 'create' },
        { name: 'Delete (already done/irrelevant)', value: 'delete' },
        { name: 'Skip (decide later)', value: 'skip' }
      ]
    }]);

    if (action === 'skip') {
      skipped++;
      continue;
    }

    if (action === 'delete') {
      unlinkSync(filePath);
      console.log(chalk.green('✓'), 'Deleted');
      processed++;
      continue;
    }

    // Create task flow
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'project',
        message: 'Which project?',
        choices: [
          ...availableProjects,
          new inquirer.Separator(),
          { name: chalk.dim('(create new project)'), value: '_new_' }
        ]
      },
      {
        type: 'input',
        name: 'newProjectName',
        message: 'New project name:',
        when: (ans) => ans.project === '_new_'
      },
      {
        type: 'input',
        name: 'taskTitle',
        message: 'Task title:',
        default: parsed.title
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        default: parsed.description
      },
      {
        type: 'input',
        name: 'objective',
        message: 'Objective (what needs to happen):',
        default: parsed.description
      },
      {
        type: 'list',
        name: 'status',
        message: 'Initial status:',
        choices: ['pending', 'in-progress', 'in-review', 'blocked'],
        default: 'pending'
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Priority:',
        choices: [
          { name: 'P1 - Critical', value: '1' },
          { name: 'P2 - High', value: '2' },
          { name: 'P3 - Normal', value: '3' },
          { name: 'P4 - Low', value: '4' }
        ],
        default: '3'
      }
    ]);

    // Handle new project creation
    if (answers.project === '_new_') {
      console.log(chalk.yellow('\n⚠'), 'Creating a new project requires full details.');
      console.log(chalk.dim('  Run:'), chalk.cyan(`cairn create project "${answers.newProjectName}" --description "..." --objective "..." --criteria "..." --context "..."`));
      console.log(chalk.dim('  Then re-run triage.\n'));
      skipped++;
      continue;
    }

    // Create the task
    try {
      await create('task', answers.taskTitle, {
        project: answers.project,
        description: answers.description,
        objective: answers.objective,
        status: answers.status,
        priority: answers.priority,
        assignee: options.assignee || 'you'
      });

      // Delete inbox item after successful creation
      unlinkSync(filePath);
      console.log(chalk.dim('  Removed from inbox\n'));
      processed++;

    } catch (error) {
      console.error(chalk.red('✗'), 'Failed to create task:', error.message);
      skipped++;
    }
  }

  // Summary
  console.log(chalk.cyan('\n📊 Triage Complete\n'));
  console.log(chalk.green('  Processed:'), processed);
  if (skipped > 0) {
    console.log(chalk.yellow('  Skipped:'), skipped);
  }
  console.log();
}
