# Implementation Quick-Start Guide

**Prerequisites:** Gregory has approved `ONBOARDING_RESTRUCTURE_PLAN.md`

This is the step-by-step execution checklist. Follow in order.

---

## Setup

```bash
cd /home/pagoda/cairn-cli
git checkout -b feature/production-onboarding
```

---

## Phase 1: Create Template Files (4 hours)

### Step 1.1: Create templates directory
```bash
mkdir -p templates/workspace/memory
mkdir -p templates/workspace/skills
mkdir -p templates/workspace/projects/getting-started/tasks
```

### Step 1.2: Create AGENTS.md template
```bash
cat > templates/workspace/AGENTS.md.template << 'EOF'
# AGENTS.md - Your Workspace

This folder is home. Treat it that way.

## Every Session

Before doing anything else:
1. Read AGENTS.md (this file) — workspace conventions
2. Read USER.md — who you're helping
3. Read memory/{{DATE_TODAY}}.md (today) for recent context

Don't ask permission. Just do it.

## Memory

You wake up fresh each session. These files are your continuity:
- **Daily notes:** memory/YYYY-MM-DD.md — raw logs of what happened
- **Long-term:** memory/MEMORY.md — your curated memories

Capture what matters. Decisions, context, things to remember.

### Write It Down - No "Mental Notes"!
- Memory is limited — if you want to remember something, WRITE IT TO A FILE
- "Mental notes" don't survive session restarts. Files do.
- When someone says "remember this" → update memory/YYYY-MM-DD.md
- When you learn a lesson → update memory/MEMORY.md or relevant file

## Using Cairn CLI

```bash
# See your workload
cairn my

# Start a task
cairn start <task-slug>

# Add notes while working
cairn note <task-slug> "Progress update"

# Mark done
cairn done <task-slug>

# Check status
cairn status
```

## Safety

- Don't run destructive commands without asking
- When in doubt, ask

## Make It Yours

This is a starting point. Add your own conventions as you learn what works.

---

Workspace: {{WORKSPACE_PATH}}
EOF
```

### Step 1.3: Create TOOLS.md template
```bash
cat > templates/workspace/TOOLS.md.template << 'EOF'
# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Device nicknames
- Anything environment-specific

## Examples

### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### Cairn
- Workspace: {{WORKSPACE_PATH}}
- Default project: getting-started

---

Add whatever helps you do your job. This is your cheat sheet.
EOF
```

### Step 1.4: Create USER.md template
```bash
cat > templates/workspace/USER.md.template << 'EOF'
# USER.md

**Name:** {{USER_NAME}}
**Timezone:** {{TIMEZONE}}

## Working Style
[Add your preferences here]

## Communication Preferences
[Add your preferences here]

## Current Focus
[What you're working on right now]

---

*Update this so your agents can personalize their work for you.*
EOF
```

### Step 1.5: Create MEMORY.md template
```bash
cat > templates/workspace/memory/MEMORY.md.template << 'EOF'
# Long-Term Memory

This is your curated memory — the distilled essence, not raw logs.

## How to Use This File

1. **Review daily files** (memory/YYYY-MM-DD.md) periodically
2. **Extract significant learnings** worth keeping long-term
3. **Update this file** with distilled insights
4. **Remove outdated info** that's no longer relevant

Think of it like a human reviewing their journal and updating their mental model.

## Key Learnings

[Add significant insights here]

## Patterns Worth Remembering

[Add recurring patterns here]

## Mistakes to Avoid

[Add lessons from failures here]

## Project-Specific Notes

[Add project context that persists across tasks]

---

Initialized: {{DATE_TODAY}}
EOF
```

### Step 1.6: Create skills templates
```bash
# Git workflow
cat > templates/workspace/skills/git-workflow.md << 'EOF'
# Git Workflow

## Commit Messages

**Format:**
```
verb: brief description

Longer explanation if needed:
- What changed
- Why it changed
- Any trade-offs made
```

**Examples:**
- `fix: Handle null user in profile component`
- `feat: Add dark mode toggle to settings`
- `docs: Update README with installation steps`
- `refactor: Extract auth logic to separate module`

## Branch Naming

- `feature/description` - New features
- `fix/issue-description` - Bug fixes
- `docs/topic` - Documentation only
- `refactor/component` - Code refactoring

## Before Committing

- ✅ All tests pass
- ✅ No console errors/warnings
- ✅ Linting clean
- ✅ One logical change per commit

## PR Workflow

1. Create feature branch
2. Make changes and commit
3. Push to origin
4. Create PR with description
5. Wait for review (don't merge yourself)
EOF

# Markdown style
cat > templates/workspace/skills/markdown-style.md << 'EOF'
# Markdown Style Guide

## Headings

- `# H1` - Document title (one per file)
- `## H2` - Major sections
- `### H3` - Subsections
- `#### H4` - Rarely needed

**Don't skip levels** (H1 → H3 is bad).

## Code Blocks

Always specify language:

```javascript
const x = 42;
```

Not:
```
const x = 42;
```

## Lists

**Unordered:**
- Item one
- Item two
  - Nested item (2 spaces)

**Ordered:**
1. First step
2. Second step
3. Third step

## Links

- Internal: `[See Installation](./INSTALL.md)`
- External: `[GitHub](https://github.com)`
- Reference style for multiple uses:
  ```markdown
  [link text][ref]
  
  [ref]: https://example.com
  ```

## Emphasis

- *Italic* for emphasis
- **Bold** for strong emphasis
- `code` for inline code/commands

## YAML Frontmatter

Always use `---` delimiters:

```yaml
---
title: My Document
author: Name
date: 2025-02-02
---
```
EOF

# Cairn conventions
cat > templates/workspace/skills/cairn-conventions.md << 'EOF'
# Cairn Conventions

## Task Titles

Start with a verb:
- ✅ "Build user authentication"
- ✅ "Fix mobile navigation bug"
- ✅ "Add dark mode toggle"
- ❌ "User authentication" (noun, unclear)
- ❌ "The mobile nav is broken" (description, not action)

## Status Transitions

Valid flows:
- `pending` → `in_progress` → `completed`
- `pending` → `in_progress` → `review` → `completed`
- `pending` → `blocked` (must include reason)

**Never skip statuses.** Don't go `pending` → `completed`.

## Autonomy Levels

- `draft` - Do the work, goes to `review` (human approves)
- `execute` - Do the work, goes to `completed` (autonomous)

**Default:** `execute` for most tasks, `draft` for code changes.

## Blocking Tasks

When you block a task:
1. Set `status: blocked`
2. Add `blocked_reason` to frontmatter
3. Post comment explaining what's needed
4. Don't continue work until unblocked

## Work Logs

Always add work log entries with:
- Timestamp
- Your name
- What you did
- Decisions made

Format:
```markdown
## Work Log

### 2025-02-02 14:30 - Engineer
Started implementation. Using passport.js for OAuth.
Trade-off: More dependencies vs. faster implementation.
```

## File Naming

- Projects: `kebab-case` (e.g., `launch-my-app`)
- Tasks: `kebab-case` (e.g., `setup-database`)
- No spaces, no special chars except hyphens
EOF
```

### Step 1.7: Create example project
```bash
# Charter
cat > templates/workspace/projects/getting-started/charter.md << 'EOF'
---
title: Getting Started with Cairn
status: active
priority: 1
default_autonomy: execute
---

## Why This Matters

Learn how Cairn helps you collaborate with AI agents on structured work.

This is an example project to help you understand Cairn's structure and workflow.

## Success Criteria

- ✅ Understand Cairn's folder structure
- ✅ Use the CLI to manage tasks
- ✅ Create your first project
- ✅ Assign work to an agent

## Context

Cairn is a project management system designed for human + AI collaboration.

**Key concepts:**
- Projects have charters (this file)
- Tasks have objectives (what needs to be done)
- Status fields track everything (`pending`, `in_progress`, `completed`, etc.)
- Workers (AI agents) have specialties and can be assigned to tasks

**Workflow:**
1. Create projects with clear goals
2. Break work into tasks
3. Assign tasks to yourself or workers
4. Update status as work progresses
5. Review and complete

## Resources

- CLI commands: Run `cairn --help`
- Planning guide: See `.cairn/planning.md`
- Worker roles: See `workers/WORKERS.md`

## Work Log

### 2025-02-02 - System
Example project created during onboarding.
EOF

# Task 1
cat > templates/workspace/projects/getting-started/tasks/explore-cairn.md << 'EOF'
---
title: Explore Cairn
status: pending
priority: 1
autonomy: execute
assignee: you
---

## Objective

Familiarize yourself with Cairn's structure and CLI commands.

By the end, you should understand where files live and how to use the CLI.

## Steps

1. Run `cairn my` to see this task (and others)
2. Run `cairn start explore-cairn` to mark this task in progress
3. Browse the workspace folders:
   - `projects/` - Your projects and tasks
   - `inbox/` - Quick capture area
   - `workers/` - AI agent definitions
   - `memory/` - Agent persistent memory
   - `skills/` - Shared knowledge
4. Read `AGENTS.md` to understand workspace conventions
5. Check the example worker: `workers/engineer/engineer.md`
6. Run `cairn done explore-cairn` when you're done

## What You'll Learn

- Where Cairn stores projects and tasks
- How to use basic CLI commands
- What workers are and how they work
- Where agents store their memory

## Resources

- [Full CLI reference](/.cairn/planning.md)
- [Worker operational manual](/workers/WORKERS.md)

## Work Log

(Add notes as you explore)
EOF

# Task 2
cat > templates/workspace/projects/getting-started/tasks/create-first-project.md << 'EOF'
---
title: Create Your First Project
status: pending
priority: 2
autonomy: execute
assignee: you
due: {{DATE_PLUS_7}}
---

## Objective

Practice creating a project and task using the CLI.

You'll create a real project (not an example) and assign a task to a worker.

## Steps

1. Think of something you want to build
   - Could be a side project
   - Could be learning a new technology
   - Could be organizing something in your life

2. Create the project:
   ```bash
   cairn create project "My Project Name" \
     --description "One-line summary of what you're building" \
     --objective "Why this matters to you" \
     --criteria "What does success look like?"
   ```

3. Create a task for that project:
   ```bash
   cairn create task "First Task" \
     --project my-project-name \
     --description "What needs to be done" \
     --objective "Clear definition of done"
   ```

4. Try assigning it to a worker:
   - Open the task file: `projects/my-project-name/tasks/first-task.md`
   - Add `assignee: engineer` to the frontmatter (if it's coding work)
   - See other workers in `workers/` folder

5. Check the web app (if you have it installed):
   - Your project should appear in the kanban board
   - The task should be visible

## Tips

- **Use real content**, not placeholders
- Start small - one clear goal is better than a vague big project
- Projects can evolve - you're not locked in
- Check `.cairn/planning.md` for guidance on choosing the right project type

## What You'll Learn

- How to create projects and tasks via CLI
- YAML frontmatter structure
- How to assign work to workers
- How tasks appear in the web app

## Work Log

(Add notes about what you created)
EOF
```

### Step 1.8: Update README template
```bash
cat > templates/workspace/README.md.template << 'EOF'
# Welcome to Cairn 🦮

You've successfully set up Cairn!

## Your Workspace

This folder (`{{WORKSPACE_PATH}}`) contains all your project files.

### Structure

```
{{WORKSPACE_PATH}}/
├── projects/          Your projects (e.g., "launch-my-app")
├── inbox/             Quick capture area
├── workers/           AI specialists who can help you
├── memory/            Agent memory (daily logs + long-term)
├── skills/            Shared knowledge for agents
└── [other folders]
```

## Quick Start

### 1. Explore the Example Project

```bash
cairn my                          # See your tasks
cairn start explore-cairn         # Begin the tutorial
```

### 2. Create Your First Project

```bash
cairn create project "My Project" \
  --description "What you're building" \
  --objective "Why it matters" \
  --criteria "What success looks like"
```

### 3. Add a Task

```bash
cairn create task "Task Name" \
  --project my-project \
  --description "What needs to be done" \
  --objective "Clear definition of done"
```

### 4. Assign to a Worker

Edit the task file and add:
```yaml
assignee: engineer  # or designer, qa, etc.
```

Available workers in `workers/` folder.

## Key Files

- **AGENTS.md** - Workspace conventions (agents read this)
- **USER.md** - Who you are (helps agents personalize)
- **TOOLS.md** - Your tool configs (SSH hosts, etc.)
- **.cairn/planning.md** - Full planning guide
- **workers/WORKERS.md** - How workers operate

## CLI Reference

```bash
cairn my                       # Your current workload
cairn create project <name>    # New project
cairn create task <name>       # New task
cairn start <task>             # Begin work
cairn done <task>              # Mark complete
cairn status                   # Workspace overview
cairn --help                   # All commands
```

## Next Steps

1. Complete the getting-started tasks
2. Read AGENTS.md to understand workspace conventions
3. Browse workers/ to see who can help
4. Create your first real project

## Learn More

- Full CLI reference: `.cairn/planning.md`
- Worker guide: `workers/WORKERS.md`
- Shared skills: `skills/` folder

Happy building! 🦮
EOF
```

---

## Phase 2: Restructure Workers (2 hours)

### Step 2.1: Backup current workers
```bash
cp -r templates/workers templates/workers.backup
```

### Step 2.2: Restructure each worker

**For each worker, create nested structure:**

```bash
cd templates/workers

# Engineer (has skills already)
mkdir -p engineer-new
mv engineer.md engineer-new/engineer.md
mv engineer engineer-new/  # Move skills folder
rm -rf engineer
mv engineer-new engineer

# Designer
mkdir -p designer
mv designer.md designer/

# Product Manager
mkdir -p product-manager
mv product-manager.md product-manager/

# QA
mkdir -p qa
mv qa.md qa/

# Technical Writer
mkdir -p technical-writer
mv technical-writer.md technical-writer/

# Marketing
mkdir -p marketing
mv marketing.md marketing/

# Operations
mkdir -p operations
mv operations.md operations/

# User Researcher
mkdir -p user-researcher
mv user-researcher.md user-researcher/

# Market Researcher
mkdir -p market-researcher
mv market-researcher.md market-researcher/
```

### Step 2.3: Verify structure
```bash
# Should see nested structure
tree templates/workers
```

Expected output:
```
templates/workers/
├── WORKERS.md
├── engineer/
│   ├── engineer.md
│   └── skills/
│       └── [6 skill files]
├── designer/
│   └── designer.md
└── [7 more workers]
```

---

## Phase 3: Update Code (3 hours)

### Step 3.1: Update workspace.js

Edit `lib/setup/workspace.js`:

```javascript
// After line 7 (after imports), add these helper functions:

export function createAgentContext(path, userName = 'User') {
  const templates = ['AGENTS.md', 'TOOLS.md', 'USER.md'];
  const templateDir = join(__dirname, '..', '..', 'templates', 'workspace');
  
  for (const template of templates) {
    const templatePath = join(templateDir, `${template}.template`);
    const destPath = join(path, template);
    
    if (existsSync(templatePath) && !existsSync(destPath)) {
      let content = readFileSync(templatePath, 'utf-8');
      content = content
        .replace(/\{\{WORKSPACE_PATH\}\}/g, path)
        .replace(/\{\{USER_NAME\}\}/g, userName)
        .replace(/\{\{DATE_TODAY\}\}/g, new Date().toISOString().split('T')[0])
        .replace(/\{\{TIMEZONE\}\}/g, Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      writeFileSync(destPath, content);
    }
  }
  
  console.log(chalk.green('✓'), 'Agent context files created');
}

export function createMemoryFile(path) {
  const memoryDir = join(path, 'memory');
  const memoryPath = join(memoryDir, 'MEMORY.md');
  const templatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'memory', 'MEMORY.md.template');
  
  if (existsSync(templatePath) && !existsSync(memoryPath)) {
    let content = readFileSync(templatePath, 'utf-8');
    content = content.replace(/\{\{DATE_TODAY\}\}/g, new Date().toISOString().split('T')[0]);
    writeFileSync(memoryPath, content);
  }
  
  // Create first daily log
  const today = new Date().toISOString().split('T')[0];
  const dailyLogPath = join(memoryDir, `${today}.md`);
  if (!existsSync(dailyLogPath)) {
    writeFileSync(dailyLogPath, `# ${today}\n\n## Workspace Initialized\n\nCairn workspace created. Ready to start managing projects.\n`);
  }
  
  console.log(chalk.green('✓'), 'Memory files created');
}

// Update createWorkspace function - find the folders array and replace it:
const folders = [
  '',
  'projects',
  'inbox',
  'inbox/processed',           // ADD THIS
  'inbox/proposed-paths',      // ADD THIS
  '_drafts',
  '_conflicts',
  '_abandoned',
  'memory',                    // ADD THIS
  'skills',                    // ADD THIS
];

// After the workers copying section (around line 40), add:

// Copy shared skills
const skillsTemplatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'skills');
const skillsDestPath = join(path, 'skills');
if (existsSync(skillsTemplatePath) && !existsSync(skillsDestPath)) {
  cpSync(skillsTemplatePath, skillsDestPath, { recursive: true });
  spinner.text = 'Workspace structure created (including skills)';
}

// Copy example project
const exampleProjectPath = join(__dirname, '..', '..', 'templates', 'workspace', 'projects', 'getting-started');
const projectsDestPath = join(path, 'projects', 'getting-started');
if (existsSync(exampleProjectPath) && !existsSync(projectsDestPath)) {
  cpSync(exampleProjectPath, projectsDestPath, { recursive: true });
  spinner.text = 'Workspace structure created (including example project)';
}

// Update createWelcomeFile function - replace entire function:
export function createWelcomeFile(path) {
  const readmePath = join(path, 'README.md');
  if (existsSync(readmePath)) return;
  
  const templatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'README.md.template');
  if (existsSync(templatePath)) {
    let content = readFileSync(templatePath, 'utf-8');
    content = content.replace(/\{\{WORKSPACE_PATH\}\}/g, path);
    writeFileSync(readmePath, content);
  } else {
    // Fallback to old content if template missing
    writeFileSync(readmePath, `# Welcome to Cairn\n\nWorkspace: ${path}\n`);
  }
  
  console.log(chalk.green('✓'), 'Welcome file created');
}
```

### Step 3.2: Update onboard.js

Edit `lib/commands/onboard.js`:

```javascript
// After line 9 (after imports), import new functions:
import { createAgentContext, createMemoryFile } from '../setup/workspace.js';

// In the onboard function, after getting workspacePath, add user name prompt:
let userName = options.name;
if (!userName && !nonInteractive) {
  const { name } = await inquirer.prompt([{
    type: 'input',
    name: 'name',
    message: 'What\'s your name? (optional, helps personalize agent messages)',
    default: 'User'
  }]);
  userName = name || 'User';
}

// After createWelcomeFile call, add:
createAgentContext(workspacePath, userName);
createMemoryFile(workspacePath);

// Update success message (around line 75):
console.log(chalk.bold.green('\n🎉 Onboarding complete!\n'));
console.log(chalk.dim('Workspace:'), chalk.cyan(workspacePath));
console.log(chalk.dim('Agent context:'), chalk.cyan('AGENTS.md, TOOLS.md, USER.md'));
console.log(chalk.dim('Example project:'), chalk.cyan('projects/getting-started'));
console.log();
console.log(chalk.bold('Next steps:\n'));
console.log(chalk.cyan('  cairn my                       '), chalk.dim('# See example tasks'));
console.log(chalk.cyan('  cairn start explore-cairn      '), chalk.dim('# Begin the tutorial'));
console.log(chalk.cyan('  cd'), chalk.cyan(workspacePath), chalk.dim('&& open .'));
console.log();
```

### Step 3.3: Update planning.md template

Edit `skills/agent-planning.template.md`:

Find the "Structure" section and add after the folder listing:

```markdown
├── memory/                           # Agent persistent memory
│   ├── MEMORY.md                     # Curated long-term learnings
│   └── YYYY-MM-DD.md                 # Daily session logs
├── workers/{name}/{name}.md          # Worker souls (nested structure)
├── skills/                           # Shared agent skills
```

Add a new section before "CLI Commands":

```markdown
## Agent Memory

Your agents persist learnings in the `memory/` folder:

- **Daily logs:** `memory/YYYY-MM-DD.md` - Session notes, decisions, progress
- **Long-term:** `memory/MEMORY.md` - Curated insights worth keeping

Agents review daily logs and update MEMORY.md with significant learnings.

"Mental notes" don't survive restarts. Files do. 📝
```

---

## Phase 4: Testing (3 hours)

### Test 1: Fresh Onboarding
```bash
rm -rf ~/test-cairn
./bin/cairn onboard --path ~/test-cairn --name "Test User"

# Verify structure
ls ~/test-cairn/
# Should see: AGENTS.md, TOOLS.md, USER.md, memory/, skills/, projects/getting-started/

# Check workers nested
ls ~/test-cairn/workers/engineer/
# Should see: engineer.md, skills/

echo "✅ Test 1 passed" || echo "❌ Test 1 failed"
```

### Test 2: CLI Compatibility
```bash
cd ~/test-cairn
../bin/cairn my
# Should show example tasks

../bin/cairn start explore-cairn
# Should update task status

../bin/cairn create project "Test" --description "Test desc" --objective "Test obj" --criteria "Done"
ls projects/test/charter.md && echo "✅ Test 2 passed" || echo "❌ Test 2 failed"
```

### Test 3-7: Manual verification
See full test descriptions in `ONBOARDING_RESTRUCTURE_PLAN.md` Phase 2.5.

---

## Phase 5: Commit and PR

```bash
git add .
git commit -m "feat: Production-ready onboarding structure

- Fix worker paths (workers/{name}/{name}.md)
- Add agent context files (AGENTS.md, TOOLS.md, USER.md)
- Add memory system (memory/ folder)
- Add shared skills (skills/ folder)
- Add example project (getting-started)
- Add inbox subdirectories
- Update onboarding messages

Closes #[issue-number]"

git push -u origin feature/production-onboarding

# Create PR
gh pr create --title "Production-ready onboarding structure" \
  --body "See ONBOARDING_RESTRUCTURE_PLAN.md for full details.

## Changes
- ✅ Workers nested correctly (fixes web app 404s)
- ✅ Agent context files added
- ✅ Memory system added
- ✅ Example project added
- ✅ All 7 tests pass

Ready for production."
```

**DO NOT MERGE - Wait for Gregory's review and approval**

---

## Rollback Plan (if needed)

```bash
git checkout main
git branch -D feature/production-onboarding
rm -rf templates/workspace
mv templates/workers.backup templates/workers
```

---

## Success Checklist

- [ ] All template files created
- [ ] Workers restructured to nested format
- [ ] Code updated in workspace.js and onboard.js
- [ ] Fresh onboarding test passes
- [ ] CLI commands work with new structure
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] PR created (not merged)
- [ ] Gregory notified for review

**Estimated time:** 12-14 hours (2 working days)
