# Cairn Project Management

Workspace: `{{WORKSPACE_PATH}}`

Read `.cairn/planning.md` before creating any projects.

## Structure

```
{{WORKSPACE_PATH}}/
  projects/{slug}/charter.md        # Project definition
  projects/{slug}/tasks/{slug}.md   # Individual tasks
  inbox/                            # Unprocessed inputs
  _drafts/                          # Work in progress
```

## Choosing the Right Project

When creating a new task, consider which project it belongs to:

### Meta-Work Rule
**Tasks that improve Cairn itself** → `launch-cairn` project
- CLI features or bug fixes
- Documentation improvements
- Web app UX enhancements
- System architecture changes
- Any work that results in a PR to the Cairn repo

### Operations Rule
**Tasks about the agent's personal workflows** → `{agent-name}-operations` project
- Memory management systems
- Daily routines and automation
- Agent self-improvement
- Personal tools and scripts

### External Deliverables Rule
**Tasks producing external deliverables** → specific project for that work
- Client projects
- Content creation
- Product features
- Research projects

### Examples

| Task | Correct Project | Why |
|------|----------------|-----|
| "Add `cairn log` command" | `launch-cairn` | CLI feature → improves Cairn itself |
| "Fix mobile kanban UX" | `launch-cairn` | Web app improvement → Cairn feature |
| "Set up daily standup routine" | `pagoda-operations` | Personal workflow → agent operations |
| "Write blog post on AI tools" | `content-creation` | External deliverable → specific project |
| "Improve CLAUDE.md documentation" | `launch-cairn` | Cairn documentation → meta-work |

**When in doubt:** If it results in a PR to the Cairn repo, it belongs in `launch-cairn`.

## CLI Commands

Always use the CLI to create entities (never create files manually):

```bash
cairn create project "Name" --description "..." --objective "..." --criteria "..." --context "..." --due YYYY-MM-DD
cairn create task "Name" --project <slug> --description "..." --objective "..." --assignee <name> --due YYYY-MM-DD
cairn doctor        # Check workspace health
cairn update-skill  # Refresh this file
```

Tasks are created with `status: pending` by default. Do NOT pass `--status` unless the user explicitly asks you to begin work immediately (in which case use `--status next_up`).

Always pass `--description`, `--objective`, `--criteria`, and `--context` with real content. Never leave placeholders.

## File Format

**Charter frontmatter:**
```yaml
title, description, status (in_progress|paused|completed), priority (1-3),
created, due, owner, default_autonomy (propose|draft|execute), budget, spent
```

**Task frontmatter:**
```yaml
title, description, assignee, status (pending|next_up|in_progress|review|completed|blocked),
created, due, autonomy (propose|draft|execute), spend, artifacts, blocker
```

**Body sections:** `## Objective`, `## Why This Matters`, `## Success Criteria`, `## Context`, `## Work Log`

## Valid Statuses

Tasks: `inbox`, `pending`, `next_up`, `in_progress`, `review`, `completed`, `blocked`

There is NO `active` status. Never use `active` — use `in_progress` when working, `next_up` for queued work.

- **pending** — Default. Task exists but is not ready to start yet.
- **next_up** — Queued and ready to be picked up.
- **in_progress** — Currently being worked on.
- **review** — Work complete, waiting for human approval.
- **blocked** — Cannot proceed, needs human input.
- **completed** — Done.

## Working on Tasks

Task files are a shared kanban board between you and the human. Status is how you communicate progress. The human sees the board and knows exactly where everything stands. You are accountable for keeping it accurate.

### Picking up a task

When the human asks you to work on a task (e.g. "work on task X", "start the API integration"):

1. **Read the task file** — understand the objective
2. **Read the parent charter** — understand the project context and autonomy level
3. **Set status to `in_progress`** — do this BEFORE you start any work
4. **Log it** — add a Work Log entry: `[name] Starting work on this task`

### While working

As you work, keep the task file updated:
- **Log significant progress** in the Work Log section
- **Add artifacts** to the frontmatter as you create them (code files, docs, configs)

### Finishing a task

When you're done working, your next status depends on **autonomy**:

- **`propose` or `draft` autonomy** → set status to **`review`**. The human decides if it's complete.
- **`execute` autonomy** → set status to **`completed`**. You have full authority.

Always add a completion log entry describing what you did and what the human should look at.

### When you get stuck

If you hit a blocker (need info, access, a decision, clarification):

1. **Set status to `blocked`** and add `blocker: [reason]` to frontmatter — do this FIRST
2. **Log it** — `[name] → human: What you need`
3. **Then ask your question**

Never leave a task as `in_progress` while you're actually waiting on the human. Wrong status = the human thinks you're making progress when you're not.

### Multiple tasks

If the human asks you to work through several tasks in sequence:
- Move each task to `in_progress` as you start it
- Move it to the correct finish status (`review` or `completed`) before starting the next one
- Don't leave multiple tasks as `in_progress` simultaneously unless you're genuinely working on them in parallel

### Task you didn't create

The human may move tasks to `in_progress` or `next_up` from the kanban board and then ask you to pick them up. Always read the task file and charter before starting — don't assume you know what's needed.

## Status Transitions

| From | To | When |
|------|----|------|
| pending | next_up | Task is ready to be worked on |
| next_up | in_progress | You start working |
| in_progress | review | Work done, needs human approval (draft/propose autonomy) |
| in_progress | blocked | You need human input |
| in_progress | completed | Done (execute autonomy ONLY) |
| review | in_progress | Human gives feedback, more work needed |
| review | completed | Human approves |
| blocked | in_progress | Human provides input |

## Autonomy Levels (CRITICAL — always respect these)

Check the task's `autonomy` field (or inherit from parent project's `default_autonomy`). This controls what you may do and what status you set when finished:

| Level | What you do | Final status |
|-------|-------------|-------------|
| **propose** | Log your planned approach. Do NOT do the work. | → `review` |
| **draft** | Do the work and create artifacts. Do NOT take irreversible actions (deploy, publish, send, delete). | → `review` |
| **execute** | Do everything including irreversible actions. | → `completed` |

**You MUST follow autonomy.** If autonomy is `draft`, you cannot set status to `completed` — you MUST set it to `review` and let the human approve. Only `execute` autonomy permits moving directly to `completed`.

## Budget and Spend Tracking

Projects have a `budget` and tasks track `spend` against it. These use **abstract units** representing effort/cost.

### Understanding Spend Units

**Scale:** 1 spend unit = ~$0.10 USD in LLM costs OR ~10 minutes of human-equivalent work

Use this to estimate total project cost before starting and track actual spend as you work.

### What Counts as Spend

✅ **DO count:**
- LLM API costs (use `$cost * 10` to convert to spend units)
- Significant planning or research time
- Code generation, debugging, testing
- Writing documentation or specifications
- Design and architecture work

❌ **DON'T count:**
- Reading existing documentation (that's free research)
- Failed attempts that taught you something (that's learning)
- Quick clarifications or small fixes (< 5 minutes)
- Background processing or waiting time

### When to Update Spend

Update the `spend` field in task frontmatter:
- After completing significant work (don't wait until the end)
- When switching to another task
- Before setting status to `review` or `completed`
- When you realize you've burned more budget than expected

### Budget Alerts

**If task spend > 80% of implied budget** (project budget / # of tasks):
1. Add a work log entry explaining why it's taking longer
2. Consider breaking the task into smaller pieces
3. Ask the human if scope has grown or if more budget is needed

**Example:**
```yaml
# Project charter
budget: 100      # ~$10 USD or ~16 hours of work
spent: 45        # ~$4.50 spent so far across all tasks

# Task
spend: 25        # ~$2.50 spent on this specific task
```

### Estimating Spend

Before starting a task, estimate its spend:
- Simple bug fix: 1-5 units
- New feature (small): 10-20 units
- Complex refactor: 30-50 units
- Large feature: 50-100 units

If actual spend exceeds estimate by >50%, document why in the work log.

## Work Log Format

```markdown
### YYYY-MM-DD - Description
[your-name] What you did

### YYYY-MM-DD - Blocked on {reason}
[your-name] → human: What you need
```

## Identity

Detect your name from environment (`$USER`, git config, or ask). Use it for:
- `assignee:` in task frontmatter
- `[name]` in work log entries

## Operating Principles

1. **Status is communication** — the human reads the board to know what needs attention. Keep it accurate at all times.
2. **Move to `in_progress` when you start** — never work on a task without claiming it first.
3. **Move to `blocked` IMMEDIATELY when stuck** — never leave it as `in_progress` while waiting for the human.
4. **Respect autonomy** — `draft`/`propose` → `review`, only `execute` → `completed`.
5. **Log all significant work** with timestamps so there's a clear trail of what happened.
6. **Never auto-create projects** — propose to human first.
7. **Use CLI for entity creation** — don't hand-craft YAML.
8. **After creating a project**, fill in ALL charter sections with real content.
9. **Budget check** — if spent > 80% of budget, notify human.
