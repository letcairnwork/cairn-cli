# Cairn CLI Onboarding Restructure Plan

**Status:** Ready for Review  
**Date:** 2025-02-02  
**Business Context:** Critical path to production. Business model: pay for web app → download desktop app → install CLI.

---

## Executive Summary

The CLI onboarding must create a workspace that:
1. **Works perfectly with the web app** (folder structure 1:1 match, web first)
2. **Gives agents everything they need** (context, skills, examples) to use Cairn effectively from day 1

**Current state:** CLI creates minimal structure, missing critical agent context files and mismatches web app expectations.  
**Target state:** Production-ready workspace that syncs seamlessly with web app and empowers agents immediately.

---

## Part 1: Current State Analysis

### 1.1 What cairn-cli Currently Creates

**onboard.js** calls `createWorkspace()` and `setupWorkspaceContext()`:

```
~/cairn/
├── projects/                    # ✓ Required by web/backend
├── inbox/                       # ⚠️ Missing subdirs (processed/, proposed-paths/)
├── _drafts/                     # ✓ Required by sync service
├── _conflicts/                  # ✓ Required by sync service
├── _abandoned/                  # ✓ Required by sync service
├── workers/                     # ❌ WRONG STRUCTURE (see 1.3)
│   ├── engineer/engineer.md
│   ├── designer/designer.md
│   └── [7 more workers...]
├── CLAUDE.md                    # ✓ Agent context (good)
├── .cairn/planning.md           # ✓ Planning guide (good)
└── README.md                    # ✓ Welcome file (good)
```

**Missing critical files for agents:**
- ❌ No `AGENTS.md` (agent workspace instructions)
- ❌ No `TOOLS.md` (agent tool notes/config)
- ❌ No `SOUL.md` (if user's main agent, not just workers)
- ❌ No `USER.md` (who the human is)
- ❌ No `memory/` folder (agent persistent memory)
- ❌ No `skills/` folder (loadable domain skills)
- ❌ No example project (user lands in empty workspace)

### 1.2 What Web App Expects

**From `apps/web/src/app/app/[[...path]]/page.tsx`:**
- Routes: `/app?view=kanban|list|activity|inbox|scheduled|workers|files`
- Tasks at: `projects/{project-slug}/tasks/{task-slug}.md`
- Inbox items at: `inbox/YYYY-MM-DD-slug.md` (NOT in subdirs processed/proposed-paths)

**From `apps/web/src/hooks/use-inbox.ts`:**
- Filters OUT `inbox/processed/` and `inbox/proposed-paths/` (legacy from sync service)
- Expects inbox items directly in `inbox/` root

**From `apps/web/src/components/workers-view.tsx`:**
- Loads workers from Convex `workers` table
- Workers have `soulPath` field pointing to document path

**Key insight:** Web app queries Convex `documents` table, NOT local filesystem. Structure matters for sync service compatibility.

### 1.3 What Convex Backend Expects

**From `convex/schema.ts`:**

```typescript
documents: defineTable({
  path: v.string(),    // e.g., "projects/launch-cairn/tasks/my-task.md"
  content: v.string(),
  frontmatter: v.any(),
  userId: v.string(),
  updatedAt: v.number(),
})

workers: defineTable({
  soulPath: v.optional(v.string()),  // e.g., "workers/engineer/engineer.md"
  // ... other fields
})
```

**From `convex/workerAssignments.ts` comments:**
```javascript
// Extract worker name from path: workers/engineer/engineer.md -> engineer
```

**Critical mismatch:** Backend expects `workers/{name}/{name}.md`, but CLI copies flat structure from templates!

### 1.4 What Sync Service Expects

**From `packages/sync-service/src/index.ts` (`ensurePmsStructure`):**

```javascript
const dirs = [
  'projects',
  'inbox',
  'inbox/processed',         // ← CLI doesn't create this
  'inbox/proposed-paths',    // ← CLI doesn't create this
  '_drafts',
  '_conflicts',
  '_abandoned',
];
```

**From worker engine comments:**
```javascript
// Read worker soul from /home/pagoda/pms/workers/{assignee-lowercase}/{assignee-lowercase}.md
// Worker loads AGENTS.md, TOOLS.md, soul file, and task file automatically
```

**Agent context expectations:**
- `AGENTS.md` - workspace instructions
- `TOOLS.md` - tool configurations
- `memory/` - persistent agent memory (daily logs + curated MEMORY.md)
- Worker souls at `workers/{name}/{name}.md`

### 1.5 Gaps & Mismatches

| Issue | Impact | Severity |
|-------|--------|----------|
| Workers structure wrong (`workers/engineer.md` vs `workers/engineer/engineer.md`) | Worker system breaks, web app can't find souls | 🔴 Critical |
| Missing `AGENTS.md`, `TOOLS.md`, `USER.md` | Agents don't know workspace conventions, fail tasks | 🔴 Critical |
| Missing `memory/` folder | Agents can't persist learnings, repeat mistakes | 🟠 High |
| Missing inbox subdirs | Sync service conflicts, processed items reappear | 🟠 High |
| No example project | New users see empty workspace, don't know what to do | 🟡 Medium |
| No `skills/` folder | Agents can't load domain-specific knowledge | 🟡 Medium |
| Missing `SOUL.md` | If user has main agent (like Pagoda), no identity file | 🟡 Medium |
| Workers include skills but wrong location | Engineer has `engineer/skills/*.md` but root has no `skills/` | 🟢 Low |

---

## Part 2: The Plan

### 2.1 Proposed Folder Structure

**Exact structure `cairn onboard` will create:**

```
~/cairn/                                    # Root (default: ~/cairn, configurable)
├── README.md                               # Welcome message (existing, update copy)
├── AGENTS.md                               # ⭐ NEW: Agent workspace instructions
├── TOOLS.md                                # ⭐ NEW: Agent tool notes (camera names, SSH, etc.)
├── USER.md                                 # ⭐ NEW: Who the human is
├── .cairn/                                 # Hidden config directory
│   └── planning.md                         # Existing: Project planning guide
├── memory/                                 # ⭐ NEW: Agent persistent memory
│   ├── 2025-02-02.md                       # Daily memory log (created on first run)
│   └── MEMORY.md                           # Curated long-term memory
├── projects/                               # Task projects
│   └── getting-started/                    # ⭐ NEW: Example project (see 2.2)
│       ├── charter.md                      # Project definition
│       └── tasks/
│           ├── explore-cairn.md            # Example task (status: pending)
│           └── create-first-project.md     # Example task (status: pending)
├── inbox/                                  # Quick capture
│   ├── processed/                          # ⭐ NEW: Archived inbox items
│   └── proposed-paths/                     # ⭐ NEW: AI-suggested structures
├── workers/                                # Specialized AI agents
│   ├── WORKERS.md                          # Worker operational manual (existing, keep)
│   ├── engineer/                           # ⭐ RESTRUCTURED (nested, not flat)
│   │   ├── engineer.md                     # Worker soul (PRIMARY FILE)
│   │   └── skills/                         # Engineer-specific skills
│   │       ├── typescript.md
│   │       ├── react.md
│   │       ├── testing.md
│   │       ├── security.md
│   │       ├── accessibility.md
│   │       └── performance.md
│   ├── designer/
│   │   └── designer.md
│   ├── product-manager/
│   │   └── product-manager.md
│   ├── qa/
│   │   └── qa.md
│   ├── technical-writer/
│   │   └── technical-writer.md
│   ├── marketing/
│   │   └── marketing.md
│   ├── operations/
│   │   └── operations.md
│   ├── user-researcher/
│   │   └── user-researcher.md
│   └── market-researcher/
│       └── market-researcher.md
├── skills/                                 # ⭐ NEW: Shared agent skills (loadable on demand)
│   ├── git-workflow.md                     # Git conventions
│   ├── markdown-style.md                   # Documentation formatting
│   └── cairn-conventions.md               # Cairn-specific patterns
├── _drafts/                                # Work in progress (existing, keep)
├── _conflicts/                             # Sync conflicts (existing, keep)
└── _abandoned/                             # Cancelled work (existing, keep)
```

**Key changes:**
1. ✅ Workers now nested: `workers/{name}/{name}.md` (matches backend expectations)
2. ✅ Agent context files added: `AGENTS.md`, `TOOLS.md`, `USER.md`
3. ✅ Memory system added: `memory/` with daily logs + `MEMORY.md`
4. ✅ Inbox subdirs added: `inbox/processed/`, `inbox/proposed-paths/`
5. ✅ Example project added: `projects/getting-started/`
6. ✅ Shared skills folder: `skills/` (domain-agnostic, reusable)

### 2.2 What Goes in Each Folder

#### 🎯 Core Agent Context

##### `AGENTS.md` (NEW)
**Purpose:** Workspace instructions for any AI agent working in this Cairn workspace.

**Content:**
- Where files live (projects/, inbox/, workers/, memory/)
- How to use Cairn CLI commands
- Memory protocol (write to files, not "mental notes")
- When to update status vs. block tasks
- Heartbeat protocol (if applicable for desktop app)
- Safety rules (no destructive commands without asking)

**Template source:** Inspired by `/home/pagoda/clawd/AGENTS.md` but simplified for Cairn workspace (no Clawdbot-specific stuff).

##### `TOOLS.md` (NEW)
**Purpose:** User-specific tool configurations.

**Content (mostly blank, with examples):**
```markdown
# TOOLS.md - Local Notes

## Examples
### Cameras (if applicable)
- living-room → Main area, 180° wide angle

### SSH (if applicable)
- home-server → 10.0.0.1

### Cairn CLI
Workspace: ~/cairn
Default project: getting-started

---
Add your own notes here.
```

##### `USER.md` (NEW)
**Purpose:** Who the human is (for agent personalization).

**Content (filled during onboard or left for user to complete):**
```markdown
# USER.md

**Name:** [Your Name]
**Role:** [Your Role/Title]
**Timezone:** [Auto-detected or prompt]

## Working Style
- [Add your preferences]

## Communication Preferences
- [Add your preferences]

---
*Update this so your agents can personalize their work for you.*
```

**Onboarding flow:** Prompt for name during `cairn onboard`, leave rest optional.

##### `memory/` (NEW)
**Purpose:** Agent persistent memory.

**Structure:**
- `memory/YYYY-MM-DD.md` - Daily logs (one per day, agent creates as needed)
- `memory/MEMORY.md` - Curated long-term memory (agent reviews and updates)

**Initial content:**
- `memory/MEMORY.md` template with instructions on what to capture
- First daily log created with "Workspace initialized" entry

**Why critical:** Agents need continuity across sessions. This is their "brain."

#### 📦 Projects & Tasks

##### `projects/getting-started/` (NEW EXAMPLE PROJECT)
**Purpose:** Onboarding example so users don't land in empty workspace.

**Files:**

**`projects/getting-started/charter.md`:**
```yaml
---
title: Getting Started with Cairn
status: active
priority: 1
default_autonomy: execute
---

## Why This Matters
Learn how Cairn helps you collaborate with AI agents on structured work.

## Success Criteria
- Understand Cairn's folder structure
- Create your first project
- Complete a task with an agent

## Context
Cairn is a project management system designed for human + AI collaboration. 
Projects have charters. Tasks have objectives. Status fields track everything.

This is an example project to help you get started.
```

**`projects/getting-started/tasks/explore-cairn.md`:**
```yaml
---
title: Explore Cairn
status: pending
priority: 1
autonomy: execute
assignee: you
---

## Objective
Familiarize yourself with Cairn's structure and CLI commands.

## Steps
1. Run `cairn my` to see this task
2. Run `cairn start explore-cairn` to begin
3. Browse the workspace folders (projects/, inbox/, workers/)
4. Read AGENTS.md to understand agent conventions
5. Run `cairn done explore-cairn` when complete

## Resources
- [Cairn CLI Reference](/.cairn/planning.md)
- [Worker Roles](/workers/WORKERS.md)
```

**`projects/getting-started/tasks/create-first-project.md`:**
```yaml
---
title: Create Your First Project
status: pending
priority: 2
autonomy: execute
assignee: you
---

## Objective
Practice creating a project and task using the CLI.

## Steps
1. Think of something you want to build
2. Run: `cairn create project "My Project" --description "..." --objective "..." --criteria "..."`
3. Create a task: `cairn create task "First Task" --project my-project --description "..." --objective "..."`
4. Assign to a worker: Edit the task frontmatter, set `assignee: engineer`
5. Check the web app to see your project appear

## Tips
- Use real content, not placeholders
- Projects belong in different folders based on purpose (see .cairn/planning.md)
```

**Why critical:** Users need immediate value and clear next steps.

##### `inbox/` subdirectories
**Why:** Sync service expects these for processed items. Without them, archived inbox items cause conflicts.

#### 🤖 Workers (RESTRUCTURED)

**Current issue:** CLI copies `templates/workers/*` directly → flat structure (`workers/engineer.md`).  
**Backend expects:** Nested structure (`workers/engineer/engineer.md`).

**Solution:** Restructure templates AND copy logic.

**New templates structure:**
```
templates/workers/
├── WORKERS.md                          # Keep (operational manual)
├── engineer/
│   ├── engineer.md                     # Main soul file
│   └── skills/                         # Nested skills (existing)
│       ├── typescript.md
│       ├── react.md
│       └── [others...]
├── designer/
│   └── designer.md
├── [other workers.../]
└── [8 more workers, each in own folder]
```

**Copy logic change in `workspace.js`:**
```javascript
// OLD (broken):
cpSync(workersTemplatePath, workersDestPath, { recursive: true });

// NEW (correct):
// Templates already have nested structure, just copy recursively
cpSync(workersTemplatePath, workersDestPath, { recursive: true });
// (No change to copy logic, FIX THE TEMPLATE STRUCTURE instead)
```

**Action items:**
1. Restructure `templates/workers/` to nest each worker
2. Update worker soul files if paths reference moved skills
3. Test that web app can load worker souls from new paths

#### 🛠️ Skills (NEW)

**Purpose:** Shared, domain-agnostic skills any agent can load on demand.

**Initial skills to include:**

**`skills/git-workflow.md`:**
- Commit message conventions
- Branch naming
- PR workflow
- When to squash vs. merge

**`skills/markdown-style.md`:**
- Heading hierarchy
- Code block formatting
- Link conventions
- YAML frontmatter rules

**`skills/cairn-conventions.md`:**
- Task title naming (verb first: "Build", "Fix", "Add")
- When to block vs. ask in comments
- Status transition rules
- Autonomy level guidelines

**Why needed:** Agents reference these for consistency. Example: "Load git-workflow skill before making commits."

#### 📋 Hidden Config

##### `.cairn/planning.md` (EXISTING, KEEP)
Current content is good. Minor updates:
- Add section on `memory/` folder usage
- Clarify worker assignment process
- Update examples to reference `workers/{name}/{name}.md` paths

### 2.3 File Content Templates

**All new files need templates in `cairn-cli/templates/` directory:**

```
templates/
├── workspace/                          # NEW directory for workspace files
│   ├── AGENTS.md.template
│   ├── TOOLS.md.template
│   ├── USER.md.template
│   ├── README.md.template              # Updated from current
│   ├── memory/
│   │   └── MEMORY.md.template
│   ├── skills/
│   │   ├── git-workflow.md
│   │   ├── markdown-style.md
│   │   └── cairn-conventions.md
│   └── projects/
│       └── getting-started/            # Example project
│           ├── charter.md
│           └── tasks/
│               ├── explore-cairn.md
│               └── create-first-project.md
├── workers/                            # RESTRUCTURED (see 2.2)
│   ├── WORKERS.md
│   ├── engineer/
│   │   ├── engineer.md
│   │   └── skills/
│   └── [other workers...]
└── [existing templates...]
```

**Template variable replacements:**
- `{{WORKSPACE_PATH}}` → absolute workspace path
- `{{USER_NAME}}` → name from onboard prompt
- `{{DATE_TODAY}}` → YYYY-MM-DD format
- `{{TIMEZONE}}` → auto-detected timezone

### 2.4 Migration Path (How to Update CLI Code)

**Files to modify:**

#### 1. `lib/setup/workspace.js`

**Changes:**
```javascript
export function createWorkspace(path) {
  const spinner = ora('Creating workspace structure').start();
  
  const folders = [
    '',
    'projects',
    'inbox',
    'inbox/processed',           // ADD
    'inbox/proposed-paths',      // ADD
    '_drafts',
    '_conflicts',
    '_abandoned',
    'memory',                    // ADD
    'skills',                    // ADD
  ];
  
  // Create folders
  for (const folder of folders) {
    const fullPath = join(path, folder);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  }
  
  // Copy workers (templates now nested correctly)
  const workersTemplatePath = join(__dirname, '..', '..', 'templates', 'workers');
  const workersDestPath = join(path, 'workers');
  if (existsSync(workersTemplatePath) && !existsSync(workersDestPath)) {
    cpSync(workersTemplatePath, workersDestPath, { recursive: true });
  }
  
  // NEW: Copy skills
  const skillsTemplatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'skills');
  const skillsDestPath = join(path, 'skills');
  if (existsSync(skillsTemplatePath) && !existsSync(skillsDestPath)) {
    cpSync(skillsTemplatePath, skillsDestPath, { recursive: true });
  }
  
  // NEW: Copy example project
  const exampleProjectPath = join(__dirname, '..', '..', 'templates', 'workspace', 'projects', 'getting-started');
  const projectsDestPath = join(path, 'projects', 'getting-started');
  if (existsSync(exampleProjectPath) && !existsSync(projectsDestPath)) {
    cpSync(exampleProjectPath, projectsDestPath, { recursive: true });
  }
  
  spinner.succeed('Workspace structure created');
  return path;
}

export function createWelcomeFile(path) {
  // UPDATE to use new README.md.template with better copy
  const readmePath = join(path, 'README.md');
  if (existsSync(readmePath)) return;
  
  const templatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'README.md.template');
  const content = readFileSync(templatePath, 'utf-8')
    .replace(/\{\{WORKSPACE_PATH\}\}/g, path);
  
  writeFileSync(readmePath, content);
}

// NEW: Create agent context files
export function createAgentContext(path, userName = 'User') {
  const templates = ['AGENTS.md', 'TOOLS.md', 'USER.md'];
  
  for (const template of templates) {
    const templatePath = join(__dirname, '..', '..', 'templates', 'workspace', `${template}.template`);
    const destPath = join(path, template);
    
    if (existsSync(templatePath) && !existsSync(destPath)) {
      const content = readFileSync(templatePath, 'utf-8')
        .replace(/\{\{WORKSPACE_PATH\}\}/g, path)
        .replace(/\{\{USER_NAME\}\}/g, userName)
        .replace(/\{\{DATE_TODAY\}\}/g, new Date().toISOString().split('T')[0])
        .replace(/\{\{TIMEZONE\}\}/g, Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      writeFileSync(destPath, content);
    }
  }
}

// NEW: Create initial memory file
export function createMemoryFile(path) {
  const memoryPath = join(path, 'memory', 'MEMORY.md');
  const templatePath = join(__dirname, '..', '..', 'templates', 'workspace', 'memory', 'MEMORY.md.template');
  
  if (existsSync(templatePath) && !existsSync(memoryPath)) {
    const content = readFileSync(templatePath, 'utf-8')
      .replace(/\{\{DATE_TODAY\}\}/g, new Date().toISOString().split('T')[0]);
    
    writeFileSync(memoryPath, content);
  }
  
  // Create first daily log
  const today = new Date().toISOString().split('T')[0];
  const dailyLogPath = join(path, 'memory', `${today}.md`);
  if (!existsSync(dailyLogPath)) {
    writeFileSync(dailyLogPath, `# ${today}\n\n## Workspace Initialized\n\nCairn workspace created. Ready to start managing projects.\n`);
  }
}
```

#### 2. `lib/commands/onboard.js`

**Changes:**
```javascript
export default async function onboard(options) {
  console.log(chalk.bold.cyan('\n🦮  Cairn Onboarding\n'));

  // Existing path prompt logic...
  
  // NEW: Prompt for user name (optional, improves UX)
  let userName = options.name;
  if (!userName && !nonInteractive) {
    const { name } = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'What\'s your name? (optional, helps personalize agent messages)',
      default: 'User'
    }]);
    userName = name;
  }

  // Existing folder check...
  
  // Step 1: Create workspace
  console.log();
  createWorkspace(workspacePath);
  createWelcomeFile(workspacePath);
  createAgentContext(workspacePath, userName);  // NEW
  createMemoryFile(workspacePath);              // NEW

  // Step 2: Write context files (existing CLAUDE.md + .cairn/planning.md)
  console.log();
  const setupSpinner = ora('Writing workspace context').start();

  try {
    await setupWorkspaceContext(workspacePath);
    setupSpinner.succeed('Workspace context configured');
  } catch (error) {
    setupSpinner.fail('Setup failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }

  // Success message (update to mention new files)
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
}
```

#### 3. Update `templates/workers/` structure

**Action:** Restructure all worker templates to be nested.

**Before:**
```
templates/workers/
├── engineer.md
├── designer.md
└── ...
```

**After:**
```
templates/workers/
├── engineer/
│   └── engineer.md
├── designer/
│   └── designer.md
└── ...
```

**Files to move manually:**
```bash
cd /home/pagoda/cairn-cli/templates/workers
mkdir -p engineer && mv engineer.md engineer/
mkdir -p designer && mv designer.md designer/
# ... repeat for all 9 workers
```

#### 4. Update worker soul files (if needed)

**Check:** Do any workers reference skills with relative paths? Update if so.

**Example fix in `engineer/engineer.md`:**
```markdown
## Skills I Can Reference

When working with specific technologies, I load relevant skills:

- `engineer/skills/typescript.md` ← CORRECT (already relative to worker folder)
- `skills/git-workflow.md` ← NEW (shared skill in workspace root)
```

#### 5. Update `.cairn/planning.md` template

**File:** `skills/agent-planning.template.md`

**Changes:**
- Add section on `memory/` folder usage
- Update worker paths from `workers/engineer.md` → `workers/engineer/engineer.md`
- Add notes about shared `skills/` folder

### 2.5 Testing Strategy

**Goal:** Verify web app compatibility and agent effectiveness.

#### Test 1: Fresh Onboarding
```bash
# Clean slate
rm -rf ~/test-cairn

# Run onboard
cairn onboard --path ~/test-cairn --name "Test User"

# Verify structure
tree ~/test-cairn
# Should match 2.1 exactly

# Check files exist
test -f ~/test-cairn/AGENTS.md && echo "✓ AGENTS.md"
test -f ~/test-cairn/TOOLS.md && echo "✓ TOOLS.md"
test -f ~/test-cairn/USER.md && echo "✓ USER.md"
test -f ~/test-cairn/memory/MEMORY.md && echo "✓ memory/MEMORY.md"
test -d ~/test-cairn/workers/engineer && echo "✓ workers/engineer/"
test -f ~/test-cairn/workers/engineer/engineer.md && echo "✓ workers/engineer/engineer.md"
test -d ~/test-cairn/projects/getting-started && echo "✓ example project"
```

#### Test 2: CLI Compatibility
```bash
cd ~/test-cairn

# List tasks (should show example tasks)
cairn my

# Start example task
cairn start explore-cairn

# Create new project
cairn create project "Test Project" \
  --description "A test project" \
  --objective "Verify CLI works" \
  --criteria "Project created"

# Verify file created
test -f ~/test-cairn/projects/test-project/charter.md && echo "✓ Project created"
```

#### Test 3: Desktop App Sync
```bash
# Start desktop app with test workspace
PMS_LOCAL_PATH=~/test-cairn npm run start:sync-service

# Wait 10 seconds for initial sync
sleep 10

# Check Convex dashboard:
# 1. documents table has workers/* entries
# 2. Worker paths are workers/engineer/engineer.md format
# 3. Example project tasks appear

# Check web app:
# 1. Navigate to /app?view=workers
# 2. Click on "Engineer" worker
# 3. Verify soul file loads
# 4. Check /app?view=kanban shows getting-started project
```

#### Test 4: Agent Context Loading
```bash
# Spawn worker session (simulate assignment)
cd ~/test-cairn

# Worker should auto-load these files:
# - AGENTS.md (workspace conventions)
# - TOOLS.md (empty but present)
# - workers/engineer/engineer.md (soul)
# - projects/getting-started/tasks/explore-cairn.md (task)

# Verify worker can:
# 1. Read AGENTS.md without errors
# 2. Update task status using cairn CLI
# 3. Write to memory/YYYY-MM-DD.md
# 4. Reference skills/git-workflow.md
```

#### Test 5: Web App Worker View
1. Open web app: `http://localhost:3000/app?view=workers`
2. Verify all 9 workers appear
3. Click "Engineer" worker
4. Verify soul file loads and displays correctly
5. Check that worker path shows as `workers/engineer/engineer.md`
6. Verify no 404 errors in browser console

#### Test 6: Inbox Workflow
1. Web app → Inbox view
2. Create quick capture: "Test inbox item"
3. Verify file created at `inbox/YYYY-MM-DD-test-inbox-item.md`
4. Archive item
5. Verify moved to `inbox/processed/`
6. Check that it no longer appears in inbox view

#### Test 7: Memory System
```bash
cd ~/test-cairn

# Simulate agent writing memory
echo "## Task completed\n\nLearned: Cairn uses markdown" >> memory/$(date +%Y-%m-%d).md

# Verify file updated
cat memory/$(date +%Y-%m-%d).md

# Check MEMORY.md is editable
echo "## Key Insight\n\nAlways use cairn CLI" >> memory/MEMORY.md
```

#### Success Criteria
- ✅ All files/folders from 2.1 exist after onboard
- ✅ Workers load in web app without 404 errors
- ✅ Example project appears in kanban view
- ✅ Sync service starts without errors
- ✅ CLI commands work with new structure
- ✅ Agent can read AGENTS.md, TOOLS.md, memory files
- ✅ Inbox items don't conflict with processed/ folder
- ✅ Worker skills load correctly (engineer/skills/*)

---

## Part 3: Implementation Checklist

### Phase 1: Template Creation (Blocking)
- [ ] Create `templates/workspace/` directory
- [ ] Write `templates/workspace/AGENTS.md.template`
- [ ] Write `templates/workspace/TOOLS.md.template`
- [ ] Write `templates/workspace/USER.md.template`
- [ ] Write `templates/workspace/memory/MEMORY.md.template`
- [ ] Update `templates/workspace/README.md.template` (better copy)
- [ ] Create `templates/workspace/skills/git-workflow.md`
- [ ] Create `templates/workspace/skills/markdown-style.md`
- [ ] Create `templates/workspace/skills/cairn-conventions.md`
- [ ] Create `templates/workspace/projects/getting-started/charter.md`
- [ ] Create `templates/workspace/projects/getting-started/tasks/explore-cairn.md`
- [ ] Create `templates/workspace/projects/getting-started/tasks/create-first-project.md`

### Phase 2: Worker Restructure (Blocking)
- [ ] Restructure `templates/workers/` to nest all 9 workers
- [ ] Update engineer/skills/* references if needed
- [ ] Update WORKERS.md if paths changed
- [ ] Test worker template copying manually

### Phase 3: Code Changes (Blocking)
- [ ] Update `lib/setup/workspace.js`:
  - [ ] Add new folders to creation list
  - [ ] Add `createAgentContext()` function
  - [ ] Add `createMemoryFile()` function
  - [ ] Update `createWelcomeFile()` to use template
  - [ ] Add skills copying logic
  - [ ] Add example project copying logic
- [ ] Update `lib/commands/onboard.js`:
  - [ ] Add user name prompt
  - [ ] Call new context/memory functions
  - [ ] Update success message
- [ ] Update `skills/agent-planning.template.md`:
  - [ ] Add memory/ section
  - [ ] Update worker paths
  - [ ] Add shared skills/ references

### Phase 4: Testing (Blocking)
- [ ] Run Test 1: Fresh Onboarding
- [ ] Run Test 2: CLI Compatibility
- [ ] Run Test 3: Desktop App Sync
- [ ] Run Test 4: Agent Context Loading
- [ ] Run Test 5: Web App Worker View
- [ ] Run Test 6: Inbox Workflow
- [ ] Run Test 7: Memory System
- [ ] All success criteria met?

### Phase 5: Documentation (Non-blocking)
- [ ] Update main README.md with new structure
- [ ] Update COMMANDS.md if any changes
- [ ] Add migration guide for existing users (if needed)
- [ ] Update PR_SUMMARY.md or equivalent

### Phase 6: Deployment
- [ ] Bump version to 1.0.0 (production-ready signal)
- [ ] Update CHANGELOG.md
- [ ] Create PR with all changes
- [ ] **DO NOT MERGE** - Gregory reviews and merges
- [ ] Publish to npm after merge

---

## Part 4: Open Questions for Gregory

1. **User name prompt:** Should we prompt during onboard, or leave USER.md for manual editing?
   - **Recommendation:** Prompt (better UX), but make it optional/skippable.

2. **SOUL.md:** Should root workspace have one? Or only if user has a "main agent" (like Pagoda)?
   - **Recommendation:** Skip for now. SOUL.md is for agent identity, not needed for all users.

3. **Artifacts folder:** Should we add `artifacts/` or `output/` for agent-generated files?
   - **Recommendation:** Skip for now. Agents can use `_drafts/` or task-specific folders.

4. **Example project default status:** Should tasks be `pending` or `next_up`?
   - **Recommendation:** `pending` (user explicitly starts when ready).

5. **CLI command updates:** Should `cairn doctor` check for new files (AGENTS.md, memory/, etc.)?
   - **Recommendation:** Yes, add checks to validate production-ready structure.

6. **Migration path for existing users:** Should `cairn onboard --force` add missing files?
   - **Recommendation:** Yes, and add `cairn migrate` command to upgrade existing workspaces.

---

## Part 5: Rationale Summary

### Why This Structure?

**Web App Compatibility (Requirement #1):**
- ✅ Workers at `workers/{name}/{name}.md` → backend queries work
- ✅ Inbox subdirs prevent processed items from reappearing
- ✅ Project/task structure unchanged (web app expects `projects/{slug}/tasks/`)
- ✅ All paths match Convex schema exactly

**Agent Effectiveness (Requirement #2):**
- ✅ AGENTS.md → agents know workspace conventions immediately
- ✅ TOOLS.md → agents store tool configs (SSH, cameras, etc.)
- ✅ memory/ → agents persist learnings (critical for quality)
- ✅ skills/ → agents load domain knowledge on demand
- ✅ Example project → agents have reference implementation
- ✅ USER.md → agents can personalize messages/work style

**Production Readiness:**
- ✅ No manual setup required (onboard does everything)
- ✅ Zero-config sync with desktop app
- ✅ Clear next steps (example tasks guide user)
- ✅ Extensible (users add their own skills/projects)

**Business Model Support:**
- ✅ Pay for web app → web app works immediately (no CLI required yet)
- ✅ Download desktop app → sync service finds workspace, no config
- ✅ Install CLI → workspace already structured, agents already trained

---

## Part 6: Timeline Estimate

**Assuming single developer (me, as Engineer agent):**

| Phase | Time | Blocking? |
|-------|------|-----------|
| Template Creation | 4 hours | Yes |
| Worker Restructure | 2 hours | Yes |
| Code Changes | 3 hours | Yes |
| Testing (all 7 tests) | 3 hours | Yes |
| Documentation | 2 hours | No (can parallelize) |
| **Total** | **14 hours** | **~2 working days** |

**Critical path:** Phases 1-4 (blocking). Phase 5 can happen during review.

---

## Part 7: Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing workspaces | 🔴 High | Add migration path (`cairn migrate` command) |
| Workers don't load in web app | 🔴 High | Test Phase 5 thoroughly, check browser console |
| Sync conflicts from inbox subdirs | 🟠 Medium | Test Phase 6, verify processed/ items stay archived |
| Template variables not replaced | 🟡 Low | Test Phase 1, verify all {{VAR}} replaced |
| Example project confuses users | 🟡 Low | Clear README.md explains it's just an example |

**Overall risk:** Low. Changes are additive (new files) + structural fix (workers nesting). No breaking changes to CLI commands or file formats.

---

## Approval Checklist

**Gregory, please confirm:**
- [ ] Folder structure in 2.1 looks correct
- [ ] Worker nesting fix makes sense
- [ ] Agent context files (AGENTS.md, TOOLS.md, memory/) are needed
- [ ] Example project content is appropriate
- [ ] Testing strategy covers critical paths
- [ ] Timeline (2 days) is acceptable
- [ ] Ready to proceed with implementation

**Once approved, I will:**
1. Create templates (Phase 1)
2. Restructure workers (Phase 2)
3. Update code (Phase 3)
4. Run all tests (Phase 4)
5. Create PR with summary

---

**Document Status:** ✅ Ready for Review  
**Next Action:** Await Gregory's approval before implementation.
