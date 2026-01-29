# Cairn 🏔️

AI-native project management where markdown files are the source of truth.

## Quick Start

```bash
npm install -g cairn
cairn onboard
```

That's it! Cairn will detect your AI agent (Clawdbot, Claude Code, Cursor, etc.) and configure everything automatically.

## What is Cairn?

Cairn is a project management system designed for working with AI agents. Instead of databases and web UIs, Cairn uses simple markdown files that both you and your AI agent can read and edit.

**Key features:**
- **Files are the source of truth** - No database, just markdown
- **AI-native** - Designed for AI agents to understand and work with
- **Agent detection** - Auto-configures for Clawdbot, Claude Code, Cursor, Windsurf
- **Simple hierarchy** - Projects → Tasks
- **Status tracking** - pending, active, review, blocked, completed

## Installation

### Global Install (Recommended)

```bash
npm install -g cairn
# or
bun install -g cairn
```

### Test Locally

```bash
git clone https://github.com/gregoryehill/cairn-cli.git
cd cairn-cli
bun install
bun link
```

## Commands

### `cairn onboard`

Set up Cairn and configure your AI agent automatically.

```bash
cairn onboard                    # Auto-detect agent
cairn onboard --agent clawdbot   # Specific agent
cairn onboard --force            # Re-run onboarding
```

### `cairn init`

Initialize workspace without agent configuration.

```bash
cairn init                # Create ~/pms
cairn init --path /custom # Custom location
```

### `cairn create`

Create projects and tasks.

```bash
# Create a project
cairn create project "Launch My App"

# Create a task
cairn create task "Set up database" \\
  --project launch-my-app
```

### `cairn doctor`

Check workspace health and fix issues.

```bash
cairn doctor
```

### `cairn update-skill`

Update agent skill documentation.

```bash
cairn update-skill              # Update all detected agents
cairn update-skill --agent cursor  # Specific agent
```

### `cairn update`

Check for and install CLI updates.

```bash
cairn update  # Check npm for latest version and prompt to upgrade
```

## Supported Agents

Cairn auto-detects and configures:

- **[Clawdbot](https://clawd.bot)** - Full integration via skills system
- **Claude Code** - Workspace context integration
- **Cursor** - .cursorrules integration
- **Windsurf** - Workspace integration
- **Generic** - Manual setup instructions for any AI agent

## How It Works

### File Structure

```
~/pms/
  projects/
    launch-my-app/
      charter.md           # Project overview
      tasks/
        setup-database.md  # Individual task
        deploy-api.md      # Another task
  inbox/                   # Incoming ideas
  _drafts/                 # Work in progress
```

### Project → Task

**Project** - A goal or initiative (e.g., "Launch My App")
**Task** - An atomic piece of work (e.g., "Set up database")

### Status Workflow

`pending` → `active` → `review` → `completed`

Or if blocked: `active` → `blocked` → `active`

### Working with AI Agents

After onboarding, your agent understands how to:
- Create and update projects/tasks
- Follow status workflows
- Log work with timestamps
- Ask for input when blocked

**Example conversation:**
```
You: "Help me plan out my app launch"
Agent: "I'll create a project structure. What's your app called?"
You: "TaskMaster - a todo app"
Agent: *creates project with tasks for backend, frontend, deployment*
```

## Updates

```bash
cairn update
```

Checks npm for the latest version and prompts to upgrade.

Or update manually:
```bash
npm update -g cairn
```

Updates only affect the CLI and agent skills. Your workspace files are never touched.

## Configuration

Cairn uses sensible defaults:
- **Workspace:** `~/pms`
- **Agent detection:** Automatic
- **Files:** Plain markdown with YAML frontmatter

Override workspace location:
```bash
export CAIRN_WORKSPACE=/custom/path
```

## Philosophy

1. **Context is King** - Keep all context in one place
2. **Files > Databases** - Text files are portable and future-proof
3. **Simple Beats Complete** - Start simple, add complexity when needed
4. **AI-First** - Designed for human-AI collaboration

## Troubleshooting

### Agent not detected

```bash
cairn doctor              # Check setup
cairn onboard --force     # Re-run onboarding
```

### Workspace issues

```bash
cairn doctor              # Auto-fix common issues
cairn init --path ~/pms   # Recreate structure
```

### Skill not updating

```bash
cairn update-skill        # Refresh agent skill
```

## Development

```bash
git clone https://github.com/gregoryehill/cairn-cli.git
cd cairn-cli
bun install
bun link                  # Test locally
```

Run tests:
```bash
bun test
```

## Contributing

Contributions welcome! Open an issue or PR on GitHub.

## License

MIT © Gregory Hill

## Links

- **GitHub:** https://github.com/gregoryehill/cairn-cli
- **npm:** https://www.npmjs.com/package/cairn

---

Built with ❤️ for AI-human collaboration
