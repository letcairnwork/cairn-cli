# Cairn Workspace: Before vs. After

## Current Structure (BROKEN)

```
~/cairn/
├── projects/                    ✅ OK
├── inbox/                       ⚠️  Missing subdirs
├── _drafts/                     ✅ OK
├── _conflicts/                  ✅ OK
├── _abandoned/                  ✅ OK
├── workers/                     ❌ WRONG STRUCTURE
│   ├── engineer.md              ← Backend expects engineer/engineer.md
│   ├── designer.md              ← Backend expects designer/designer.md
│   └── [7 more flat files...]
├── CLAUDE.md                    ✅ OK
├── .cairn/planning.md           ✅ OK
└── README.md                    ✅ OK

MISSING FILES FOR AGENTS:
❌ No AGENTS.md (workspace instructions)
❌ No TOOLS.md (tool configurations)
❌ No USER.md (who the human is)
❌ No memory/ (persistent agent memory)
❌ No skills/ (shared domain knowledge)
❌ No example project (empty workspace)
```

**Problems:**
- Web app can't find worker souls (404 errors)
- Agents don't know workspace conventions
- Agents can't persist learnings
- Users land in empty workspace with no guidance

---

## Proposed Structure (PRODUCTION-READY)

```
~/cairn/
├── AGENTS.md                              ⭐ NEW: Workspace instructions
├── TOOLS.md                               ⭐ NEW: Tool configs
├── USER.md                                ⭐ NEW: Human identity
├── README.md                              ♻️ Updated: Better welcome message
├── .cairn/
│   └── planning.md                        ♻️ Updated: Add memory/ docs
├── memory/                                ⭐ NEW: Agent persistent memory
│   ├── MEMORY.md                          ⭐ Curated long-term learnings
│   └── 2025-02-02.md                      ⭐ Daily session logs
├── projects/
│   └── getting-started/                   ⭐ NEW: Example project
│       ├── charter.md                     ⭐ "Getting Started with Cairn"
│       └── tasks/
│           ├── explore-cairn.md           ⭐ Tutorial task
│           └── create-first-project.md    ⭐ Tutorial task
├── inbox/
│   ├── processed/                         ⭐ NEW: Archived items
│   └── proposed-paths/                    ⭐ NEW: AI suggestions
├── workers/
│   ├── WORKERS.md                         ✅ Keep: Operational manual
│   ├── engineer/                          ⭐ FIXED: Nested structure
│   │   ├── engineer.md                    ← Backend expects this path
│   │   └── skills/                        ✅ Keep: Engineer skills
│   │       ├── typescript.md
│   │       ├── react.md
│   │       ├── testing.md
│   │       ├── security.md
│   │       ├── accessibility.md
│   │       └── performance.md
│   ├── designer/                          ⭐ FIXED: Nested structure
│   │   └── designer.md                    ← Backend expects this path
│   ├── product-manager/                   ⭐ FIXED: Nested
│   │   └── product-manager.md
│   ├── qa/                                ⭐ FIXED: Nested
│   │   └── qa.md
│   ├── technical-writer/                  ⭐ FIXED: Nested
│   │   └── technical-writer.md
│   ├── marketing/                         ⭐ FIXED: Nested
│   │   └── marketing.md
│   ├── operations/                        ⭐ FIXED: Nested
│   │   └── operations.md
│   ├── user-researcher/                   ⭐ FIXED: Nested
│   │   └── user-researcher.md
│   └── market-researcher/                 ⭐ FIXED: Nested
│       └── market-researcher.md
├── skills/                                ⭐ NEW: Shared skills
│   ├── git-workflow.md                    ⭐ Commit conventions, branching
│   ├── markdown-style.md                  ⭐ Documentation formatting
│   └── cairn-conventions.md               ⭐ Cairn-specific patterns
├── _drafts/                               ✅ Keep
├── _conflicts/                            ✅ Keep
└── _abandoned/                            ✅ Keep
```

**Fixes:**
- ✅ Workers load in web app (correct paths)
- ✅ Agents know workspace conventions (AGENTS.md)
- ✅ Agents persist learnings (memory/)
- ✅ Users see immediate value (example project)
- ✅ Agents load domain knowledge (skills/)
- ✅ Inbox processed items don't reappear (subdirs)

---

## Key File Contents Preview

### AGENTS.md (NEW)
```markdown
# AGENTS.md - Your Workspace

This folder is home. Treat it that way.

## Every Session
1. Read AGENTS.md (this file)
2. Read USER.md (who you're helping)
3. Read memory/YYYY-MM-DD.md (today's context)

## Memory
Write significant events to:
- memory/YYYY-MM-DD.md (daily logs)
- memory/MEMORY.md (curated learnings)

"Mental notes" don't survive restarts. Files do.

## Using Cairn CLI
cairn my              # Your workload
cairn start <task>    # Begin work
cairn done <task>     # Mark complete

[... rest of workspace conventions ...]
```

### USER.md (NEW)
```markdown
# USER.md

**Name:** Gregory
**Role:** Founder
**Timezone:** America/Chicago

## Working Style
[User fills this in]
```

### memory/MEMORY.md (NEW)
```markdown
# Long-Term Memory

## Lessons Learned
[Agent updates this with significant learnings]

## Project Patterns
[Recurring patterns discovered]

## Mistakes to Avoid
[Things that went wrong]
```

### skills/git-workflow.md (NEW)
```markdown
# Git Workflow

## Commit Messages
verb: brief description

Examples:
- fix: Handle null user in profile
- feat: Add dark mode toggle
- docs: Update README with setup

## Branch Naming
feature/description
fix/issue-description
```

### projects/getting-started/tasks/explore-cairn.md (NEW)
```yaml
---
title: Explore Cairn
status: pending
priority: 1
autonomy: execute
assignee: you
---

## Objective
Familiarize yourself with Cairn's structure.

## Steps
1. Run `cairn my` to see this task
2. Run `cairn start explore-cairn`
3. Browse workspace folders
4. Read AGENTS.md
5. Run `cairn done explore-cairn`
```

---

## Web App Compatibility Matrix

| Component | Current | Proposed | Status |
|-----------|---------|----------|--------|
| Worker paths | `workers/engineer.md` | `workers/engineer/engineer.md` | ✅ Fixed |
| Workers load in UI | ❌ 404 errors | ✅ Loads correctly | ✅ Fixed |
| Inbox subdirs | Missing | `processed/`, `proposed-paths/` | ✅ Fixed |
| Project structure | ✅ Correct | ✅ Unchanged | ✅ OK |
| Task structure | ✅ Correct | ✅ Unchanged | ✅ OK |

## Agent Effectiveness Matrix

| Requirement | Current | Proposed | Status |
|-------------|---------|----------|--------|
| Know workspace rules | ❌ No docs | ✅ AGENTS.md | ✅ Fixed |
| Persist learnings | ❌ No memory/ | ✅ memory/ folder | ✅ Fixed |
| User context | ❌ No info | ✅ USER.md | ✅ Fixed |
| Tool configs | ❌ No storage | ✅ TOOLS.md | ✅ Fixed |
| Domain skills | ⚠️  Worker-specific only | ✅ Shared skills/ | ✅ Fixed |
| Example reference | ❌ Empty workspace | ✅ getting-started project | ✅ Fixed |

---

## Migration Path

### For New Users
```bash
cairn onboard --path ~/cairn --name "Your Name"
# ✅ Creates complete production-ready structure
```

### For Existing Users
```bash
cairn migrate
# ✅ Adds missing files (AGENTS.md, memory/, skills/)
# ✅ Restructures workers/ to nested format
# ✅ Creates example project
# ⚠️  Backs up current structure first
```

---

## File Count Comparison

| Category | Current | Proposed | Change |
|----------|---------|----------|--------|
| Root files | 3 | 6 | +3 (AGENTS.md, TOOLS.md, USER.md) |
| Folders | 6 | 8 | +2 (memory/, skills/) |
| Workers | 9 (flat) | 9 (nested) | Restructured |
| Example content | 0 | 1 project | +1 |
| Skills | 6 (engineer only) | 9 (shared + engineer) | +3 |
| **Total new files** | - | **~15** | Production-ready |

---

## Visual: Web App Worker Loading

### Before (BROKEN)
```
Web App Query:
  GET /workers/engineer/engineer.md

Actual File Location:
  ~/cairn/workers/engineer.md  ❌ MISMATCH

Result: 404 Error, worker doesn't load
```

### After (FIXED)
```
Web App Query:
  GET /workers/engineer/engineer.md

Actual File Location:
  ~/cairn/workers/engineer/engineer.md  ✅ MATCH

Result: Worker soul loads correctly
```

---

**See full implementation plan:** `ONBOARDING_RESTRUCTURE_PLAN.md`
