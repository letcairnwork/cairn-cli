# Cairn 🏔️

AI-native project management where markdown files are the source of truth.

## Quick Start

```bash
npm install -g cairnquest
cairn onboard
```

That's it! Cairn will detect your AI agent (Clawdbot, Claude Code, Cursor, etc.) and configure everything automatically.

## What is Cairn?

Cairn is a project management system designed for working with AI agents. Instead of databases and web UIs, Cairn uses simple markdown files that both you and your AI agent can read and edit.

**Key features:**
- **Files are the source of truth** - No database, just markdown
- **AI-native** - Designed for AI agents to understand and work with
- **Agent detection** - Auto-configures for Clawdbot, Claude Code, Cursor, Windsurf
- **Simple hierarchy** - Quests → Paths → Steps
- **Status tracking** - pending, in_progress, review, blocked, completed

## Installation

### Global Install (Recommended)

```bash
npm install -g cairnquest
# or
bun install -g cairnquest
```

### Test Locally

```bash
git clone https://github.com/gregoryehill/cairn.git
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
cairn init                # Create ~/cairn
cairn init --path /custom # Custom location
```

### `cairn create`

Create quests, paths, and steps.

```bash
# Create a quest
cairn create quest "Launch My App"

# Create a path
cairn create path "Backend API" --quest launch-my-app

# Create a step
cairn create step "Set up database" \\
  --quest launch-my-app \\
  --path backend-api \\
  --assignee me
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
~/cairn/
  quests/
    launch-my-app/
      charter.md           # Quest overview
      paths/
        backend-api/
          brief.md         # Path details
          steps/
            setup-database.md  # Individual task
  inbox/                   # Incoming ideas
  _drafts/                 # Work in progress
```

### Quest → Path → Step

**Quest** - A project or goal (e.g., "Launch My App")
**Path** - A way to achieve the quest (e.g., "Backend API")
**Step** - An atomic task (e.g., "Set up database")

### Status Workflow

`pending` → `in_progress` → `review` → `completed`

Or if blocked: `in_progress` → `blocked` → `in_progress`

### Working with AI Agents

After onboarding, your agent understands how to:
- Create and update quests/paths/steps
- Follow status workflows
- Log work with timestamps
- Ask for input when blocked

**Example conversation:**
```
You: "Help me plan out my app launch"
Agent: "I'll create a quest structure. What's your app called?"
You: "TaskMaster - a todo app"
Agent: *creates quest with paths for backend, frontend, deployment*
```

## Updates

```bash
npm update -g cairnquest
```

Updates the CLI and agent skills. Your workspace files are never touched.

## Configuration

Cairn uses sensible defaults:
- **Workspace:** `~/cairn`
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

## Examples

See [docs/examples](docs/examples/) for:
- Sample quests
- Real workflows
- Best practices
- Common patterns

## Troubleshooting

### Agent not detected

```bash
cairn doctor              # Check setup
cairn onboard --force     # Re-run onboarding
```

### Workspace issues

```bash
cairn doctor              # Auto-fix common issues
cairn init --path ~/cairn   # Recreate structure
```

### Skill not updating

```bash
cairn update-skill        # Refresh agent skill
```

## Development

```bash
git clone https://github.com/gregoryehill/cairn.git
cd cairn-cli
bun install
bun link                  # Test locally
```

Run tests:
```bash
bun test
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © Gregory Hill

## Links

- **Website:** https://cairn.app
- **Docs:** https://docs.cairn.app
- **GitHub:** https://github.com/gregoryehill/cairn
- **Discord:** https://discord.com/invite/cairn

---

Built with ❤️ for AI-human collaboration
