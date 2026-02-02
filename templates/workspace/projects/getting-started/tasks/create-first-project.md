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
