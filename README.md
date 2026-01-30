# Cairn

Project management for AI agents. Markdown files are the source of truth.

## Setup

```bash
npm install -g cairn-work
cairn onboard
```

This creates a workspace and writes two context files your agent reads automatically:

- **`CLAUDE.md`** — Compact reference for day-to-day operations (statuses, CLI commands, autonomy rules)
- **`.cairn/planning.md`** — Full guide for creating projects and tasks with real content

No agent-specific configuration. Any AI agent that can read files is ready to go.

## How it works

You and your AI agent share a folder of markdown files. Projects have charters. Tasks have objectives. Status fields track where everything stands — like a kanban board backed by text files.

```
~/cairn/
  CLAUDE.md                        # Agent context (auto-generated)
  .cairn/planning.md               # Planning guide (auto-generated)
  projects/
    launch-app/
      charter.md                   # Why, success criteria, context
      tasks/
        setup-database.md          # Individual task
        build-api.md
        deploy.md
  inbox/                           # Ideas to triage
```

### The workflow

1. **You create a project** — tell your agent what you want to build. It creates the project and tasks using `cairn create`, fills in real content (not placeholders), and sets everything to `pending`.

2. **You manage the board** — move tasks to `next_up` or `in_progress` when you're ready to start. Or tell your agent "work on the API task" and it picks it up.

3. **The agent keeps status updated** — when it starts a task, it moves to `in_progress`. When it finishes, it moves to `review` (so you can approve) or `completed` (if you gave it full autonomy). If it gets stuck, it moves to `blocked` and tells you what it needs.

4. **You always know where things stand** — statuses are the shared language. The agent is accountable for keeping them accurate.

### Statuses

`pending` · `next_up` · `in_progress` · `review` · `blocked` · `completed`

### Autonomy

Each task has an autonomy level that controls what the agent can do:

| Level | Agent behavior | Finishes as |
|-------|---------------|-------------|
| `propose` | Plans the approach, doesn't do the work | `review` |
| `draft` | Does the work, no irreversible actions | `review` |
| `execute` | Does everything, including deploy/publish/send | `completed` |

Default is `draft` — the agent works but you approve before anything ships.

## Commands

### `cairn onboard`

Set up workspace and write agent context files.

```bash
cairn onboard                  # Interactive setup
cairn onboard --path ./mywork  # Non-interactive, specific path
cairn onboard --force          # Re-run on existing workspace
```

### `cairn create`

Create projects and tasks. Always pass real content — the CLI enforces `--description` and `--objective`.

```bash
cairn create project "Launch App" \
  --description "Ship the MVP by March" \
  --objective "We need to validate the idea with real users" \
  --criteria "App live on production, 10 beta signups" \
  --context "React Native, Supabase backend, deploy to Vercel"

cairn create task "Set up database" \
  --project launch-app \
  --description "Configure Supabase tables and RLS policies" \
  --objective "Database schema matches the data model, RLS prevents cross-tenant access"
```

### `cairn doctor`

Check workspace health — verifies folder structure, `CLAUDE.md`, and `.cairn/planning.md` exist.

```bash
cairn doctor
```

### `cairn update-skill`

Refresh `CLAUDE.md` and `.cairn/planning.md` with the latest templates (e.g. after a CLI update).

```bash
cairn update-skill
```

### `cairn update`

Check for a new CLI version and install it.

```bash
cairn update
```

## File format

All files use YAML frontmatter + markdown sections.

**Charter** (`charter.md`):
```yaml
---
title: Launch App
status: in_progress
priority: 1
default_autonomy: draft
---

## Why This Matters
## Success Criteria
## Context
## Work Log
```

**Task** (`tasks/setup-database.md`):
```yaml
---
title: Set up database
assignee: agent-name
status: pending
autonomy: draft
---

## Objective
## Work Log
```

The agent logs all work in the `## Work Log` section with timestamps and its name.

## Troubleshooting

```bash
cairn doctor              # Diagnose issues
cairn onboard --force     # Regenerate context files
cairn update-skill        # Refresh templates after CLI update
```

## License

MIT
