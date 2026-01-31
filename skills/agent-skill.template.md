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

### Creating Tasks & Projects

Always use the CLI to create entities (never create files manually):

```bash
# Create a project
cairn create project "Name" --description "..." --objective "..." --criteria "..." --context "..."

# Create a task (defaults: priority=1, due=today for P1, autonomy=execute)
cairn create task "Name" \
  --project <slug> \
  --description "One-line summary" \
  --objective "What needs to be done and what done looks like"

# Override defaults when needed
cairn create task "Name" \
  --project <slug> \
  --description "..." \
  --objective "..." \
  --autonomy draft \  # Use for code changes or proposals
  --priority 2        # Lower priority = due in 7 days instead of today
```

**Important defaults:**
- `priority: 1` (urgent) - due **today**
- `priority: 2+` (less urgent) - due in **7 days**
- `autonomy: execute` - task goes to **done** when completed
- `autonomy: draft` - task goes to **review** when completed (use for code)

Always pass `--description` and `--objective` with real content. Never leave placeholders.

### Working on Tasks

```bash
# See your current workload
cairn my              # Show all your tasks grouped by status

# Start a task (pending → in_progress)
cairn start <task-slug>

# Add quick notes while working
cairn note <task-slug> "Found OAuth library: passport.js"

# Mark task complete (goes to 'done' or 'review' based on autonomy)
cairn done <task-slug>

# Block a task (when stuck)
cairn block <task-slug> "Waiting for API credentials"

# Resume a blocked task
cairn unblock <task-slug> "Got credentials"

# View full task details
cairn view <task-slug>

# Edit task manually if needed
cairn edit <task-slug>    # Opens in $EDITOR
```

### Finding Tasks

```bash
cairn my              # Your tasks
cairn active          # All in-progress tasks (across team)
cairn status          # Workspace overview with counts
cairn search "auth"   # Find tasks by keyword
```

### Other Commands

```bash
cairn doctor        # Check workspace health
cairn update-skill  # Refresh this file
```

## Understanding Autonomy Levels

Autonomy determines whether your completed work goes to `review` or straight to `done`.

**Default: `execute`** (most tasks)
- Direct action requests: research, documents, reservations
- Goes straight to `done` when you finish
- Use for anything that can be edited or undone easily

**Use `draft` for:**
- **Code changes** (always need PR review before merge)
- **Proposals/strategy docs** (human needs to decide)
- Add `--autonomy draft` when creating the task

**Examples:**

```bash
# Execute (default) - direct actions
cairn create task "Get last 20 Super Bowl winners" --project research ...
# → When done, goes to 'done'

# Draft - code or proposals
cairn create task "Change button color to blue" \
  --project my-app \
  --autonomy draft \
  ...
# → When done, goes to 'review'
```

**When done with a task:**
- `cairn done <task>` handles autonomy automatically
- Execute → done
- Draft → review (you'll get feedback before it's final)

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

### When the Human Asks You to Do Something

**Important:** When the human gives you a direct action request, you should **create the task AND do the work immediately**.

**Example requests:**
- "Get me a list of the last 20 NFL champions"
- "Create an agenda for Monday's meeting"
- "Make a reservation at Husk for 7pm Tuesday"
- "Change the button color to blue"

**Your workflow:**

1. **Create the task:**
   ```bash
   cairn create task "Get last 20 NFL champions" \
     --project <relevant-project> \
     --description "Research and list NFL champions" \
     --objective "Provide a complete list..."
   # Use --autonomy draft for code changes
   ```

2. **Start it immediately:**
   ```bash
   cairn start <task-slug>
   ```

3. **Do the work** (research, write code, create document, etc.)

4. **Mark it done:**
   ```bash
   cairn done <task-slug>
   # Goes to 'done' (autonomy: execute) or 'review' (autonomy: draft)
   ```

5. **Deliver the result** to the human

**Don't just create tasks and wait** - if the human asks you to do something, they expect it done unless you're truly blocked.

### Picking up an existing task

When working on a task that already exists:

1. **View the task:**
   ```bash
   cairn view <task-slug>
   ```

2. **Start it:**
   ```bash
   cairn start <task-slug>  # Sets status to in_progress
   ```

3. **Read the objective** - understand what needs to be done

### While working

As you work, use `cairn note` for quick progress updates:

```bash
cairn note <task-slug> "Implemented OAuth flow"
cairn note <task-slug> "Created PR: https://github.com/..."
```

Add artifacts (documents, code, etc.) as you create them:

```bash
cairn update <task-slug> --add-artifact "/path/to/file"
cairn update <task-slug> --add-artifact "https://github.com/repo/pull/123"
```

### Finishing a task

When you're done, use `cairn done`:

```bash
cairn done <task-slug>
```

This automatically sets the correct status based on autonomy:
- **`execute` autonomy** → `done` (you have full authority)
- **`draft` autonomy** → `review` (needs human approval)

The CLI handles this for you - just use `cairn done` when finished.

### When you get stuck

If you hit a blocker (need info, access, a decision, clarification):

1. **Try to unblock yourself first** - search docs, check examples, problem-solve
2. **If truly blocked:**
   ```bash
   cairn block <task-slug> "Waiting for API credentials from client"
   ```
3. **Then tell the human** what you need

Never leave a task as `in_progress` while you're waiting on the human. Use `cairn block` to communicate blockers clearly.

To resume after unblocking:

```bash
cairn unblock <task-slug> "Got credentials, resuming work"
```

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
