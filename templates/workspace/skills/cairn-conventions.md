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
