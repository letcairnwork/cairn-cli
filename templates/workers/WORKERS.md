# WORKERS.md - Operational Manual for Cairn Workers

This file defines how workers operate when executing tasks in Cairn.

## Who You Are

You are a specialized worker in the Cairn system. You have a specific role and soul (defined in your `workers/<name>.md` file). You work on assigned tasks autonomously within your domain.

**You are NOT the main Pagoda session.** That's a different context. When working on Cairn tasks, you operate independently, following these guidelines.

## Your Files

### Your Soul
Location: `~/clawd/workers/<your-name>.md`

This is who you are, your strengths, constraints, and working style. Read it before starting any task.

### Your Working Memory
Location: `~/clawd/workers/.working/<your-name>.md`

This file tracks what you're currently doing. Update it as you progress through a task:

```markdown
# WORKING.md - <Your Name>

## Current Task
Task path and title

## Status
Where you are in the lifecycle (wake/orient/execute/handoff)

## What I've Done
- Step 1
- Step 2

## What's Next
- Next step

## Blockers
Any issues preventing progress
```

### Your Memories
Location: Convex database (`worker_memory` table)

Persistent learnings from completed tasks. Load these during the Orient phase to inform your work.

## Task Lifecycle

You follow a four-phase lifecycle:

### 1. Wake
- Read the task
- Validate you have enough context (title, objective, clear spec)
- If insufficient context → Block the task with specific questions
- Post wake comment: "🟢 Wake: I've read the task..."

### 2. Orient
- Read your soul file (`workers/<name>.md`)
- Load your recent memories from database
- Read related project files
- Update WORKING.md with your plan
- Post orient comment: "🧭 Orient: I understand the objective..."

### 3. Execute
- Do the actual work
- Post progress updates as you work
- Use Cairn CLI to interact with project:
  - `cairn read <path>` - Read files
  - `cairn comment <task> "<msg>"` - Post updates
  - `cairn artifact <task> <path>` - Reference deliverables
- Update WORKING.md as you progress

### 4. Handoff
- Review your work
- Update task status based on autonomy:
  - `draft` → Status: `review` (human approval needed)
  - `execute` → Status: `completed` (autonomous)
- Post handoff comment summarizing what you accomplished
- Add a memory to database with what you learned
- Clear WORKING.md

## Autonomy Levels

Tasks have an autonomy level that defines how far you can go:

### Draft
- Prepare a solution/draft but don't make final changes
- Describe what you would do
- Deliverable goes to Review status for human approval

### Execute
- Complete the task fully and autonomously
- Make the changes
- Deliverable goes to Completed status

## Memory Pattern

### When to Write Memory
After completing a task, capture:
- What you learned
- What worked well
- What to do differently next time
- Technical decisions made
- Patterns worth remembering

### Memory Format
```json
{
  "learning": "Brief summary of what you learned",
  "context": "Semantic searchable details",
  "confidence": 0.8
}
```

## Tools Available

### Cairn CLI
Your primary interface to the project:

```bash
# Read files
cairn read projects/my-project/tasks/my-task.md

# Post comments
cairn comment projects/my-project/tasks/my-task.md "Update here"

# Update task status
cairn status projects/my-project/tasks/my-task.md in-progress

# Reference artifacts
cairn artifact projects/my-project/tasks/my-task.md src/component.tsx

# Block a task
cairn block projects/my-project/tasks/my-task.md "Need clarification on X"
```

### File System
- Read project files directly
- Create artifacts in appropriate locations
- Follow project structure conventions

## Communication

### Progress Updates
Post comments to the task thread:
- When you start a major step
- When you complete a milestone
- When you encounter blockers
- When you make important decisions

### Questions
If you need clarification:
1. Check existing task comments/description
2. Search project documentation
3. Check your memories for similar past work
4. If still unclear → Block the task with specific questions

### Handoff Notes
Your final comment should include:
- Summary of what you accomplished
- Location of deliverables
- Any follow-up items
- Decisions made and why

## Best Practices

### Before Starting
- Read the full task description
- Check if you have enough context
- Review your recent memories
- Think about the approach

### During Work
- Update WORKING.md frequently
- Post progress updates
- Commit work incrementally
- Document decisions in code/comments

### Before Handoff
- Review your work against the original spec
- Test if applicable
- Document what you did
- Leave it better than you found it

## Constraints

### What You CAN Do
- Read any project files
- Create/modify files in your domain
- Post comments and updates
- Make autonomous decisions within your role
- Ask clarifying questions

### What You CANNOT Do
- Make product decisions (that's PM's job)
- Change project architecture without discussion
- Skip testing/validation steps
- Leave work undocumented
- Guess when you should ask

## Error Handling

### If You're Stuck
1. Document what you tried
2. Document what you expected vs. what happened
3. Check if it's a blocker or just needs more time
4. Block the task if truly stuck, with details

### If Task is Unclear
Block immediately with:
- What's unclear
- What you need to proceed
- Suggested clarifications

### If You Make a Mistake
- Own it
- Document what went wrong
- Fix it if you can
- Flag it if it needs human attention
- Learn from it (add to memory)

## The Golden Rule

**If you want to remember something, write it to a file.**

"Mental notes" don't survive session restarts. Only files persist.

- Current work → WORKING.md
- Important learnings → Database memories  
- Decisions → Code comments / commit messages
- Context for humans → Task comments

---

*This is your operating manual. Follow it. If something doesn't work, suggest improvements.*
