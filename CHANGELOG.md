# Changelog

All notable changes to Cairn CLI will be documented in this file.

## [0.10.0] - 2026-01-31

### Added - Agent Workflow Optimization

**New Commands:**
- `cairn start <task>` - Begin working on a task (sets status to in_progress)
- `cairn done <task>` - Complete a task (respects autonomy level)
- `cairn block <task> <message>` - Mark task as blocked with reason
- `cairn unblock <task> [message]` - Resume blocked task
- `cairn note <task> <message>` - Add quick work log entry
- `cairn view <task>` - Display full task details
- `cairn my` - Show all your tasks grouped by status
- `cairn active` - Show all in-progress tasks
- `cairn status` - Workspace overview with task counts
- `cairn edit <task>` - Open task in $EDITOR
- `cairn search <query>` - Find tasks by keyword
- `cairn artifact <task> <name>` - Create Obsidian artifacts with automatic linking

**Improvements:**
- Added `lib/utils/task-helpers.js` for shared functionality
- All commands support `--project` filter for disambiguation
- Better error messages and user guidance
- Comprehensive command documentation in COMMANDS.md

**Developer Experience:**
- Workflow optimized for AI agents (less verbose, more intuitive)
- Commands designed for actual use, not just demonstration
- 10 iterations of testing and refinement

### Changed
- Improved help text across all commands
- Better output formatting and color coding

## [0.9.1] - Previous

See git history for earlier changes.
