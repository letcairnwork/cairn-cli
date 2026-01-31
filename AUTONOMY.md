# Autonomy Levels - When to Use Each

Autonomy determines whether a completed task requires review or goes straight to done.

## Default: `execute`

**Tasks default to `autonomy: execute`** which means:
- When you mark it done, it goes to `status: done` (no review needed)
- Appropriate for direct action requests

## When to use `draft`

Override with `--autonomy draft` for:

### 1. **Code Changes**
```bash
cairn create task "Change button color to blue" \
  --autonomy draft \
  --project my-app
```

**Why:** Code always needs PR review before merging to main. Task goes to `review` status after work is done, stays there until PR is approved.

### 2. **Proposals & Strategy**
```bash
cairn create task "Propose social media launch strategy" \
  --autonomy draft \
  --project marketing
```

**Why:** You're asking for options/recommendations that need your decision, not execution.

### 3. **Things that can't be easily undone**
Use draft when you want a review gate before it's "done."

## When to use `execute`

Use default (don't specify autonomy) for:

### 1. **Research & Information**
```bash
cairn create task "Get last 20 NFL Championship winners" \
  --project research
```

**Why:** Simple deliverable, can be edited after if wrong.

### 2. **Direct Actions**
```bash
cairn create task "Make reservation at Husk for 7pm Tuesday" \
  --project personal
```

**Why:** You want it done. If blocked, agent will mark it blocked and explain.

### 3. **Documents & Agendas**
```bash
cairn create task "Create agenda for Monday meeting" \
  --project meetings
```

**Why:** Can be edited after creation if needed.

## Examples by Request Type

| Your Request | Autonomy | Why |
|--------------|----------|-----|
| "Get me a list of X" | execute | Simple deliverable |
| "Create an agenda for Y" | execute | Can edit after |
| "Make a reservation at Z" | execute | Direct action |
| "Change the button color" | **draft** | Code needs PR review |
| "Propose a strategy for X" | **draft** | Needs your decision |
| "Draft a plan for Y" | **draft** | Exploratory work |

## Status Flow

**Execute:**
```
pending → in_progress → done ✅
```

**Draft:**
```
pending → in_progress → review → done ✅
                         ↑
                    (awaiting approval)
```

## Command Line

```bash
# Default (execute)
cairn create task "Task name" --project proj --description "..." --objective "..."

# Override to draft
cairn create task "Task name" --autonomy draft --project proj --description "..." --objective "..."
```

## Agent Guidelines

**As an agent, when creating tasks:**

1. **Direct action request?** → Use default (execute)
   - "Go do X"
   - "Get me Y"
   - "Create Z"

2. **Code changes?** → Use `--autonomy draft`
   - Any code modification
   - Always needs PR review

3. **Strategy/proposal?** → Use `--autonomy draft`
   - Contains "propose", "draft", "strategy"
   - Exploratory work needing decision

4. **When in doubt?** → Default to execute
   - You can always ask for clarification if unsure
   - Better to complete and get feedback than wait

## Why This Matters

**Efficiency:** Most tasks are direct actions. Execute autonomy means they complete immediately without cluttering the review queue.

**Safety:** Code and proposals still have a review gate where they belong.

**Clarity:** The autonomy level matches the intent of the request.
