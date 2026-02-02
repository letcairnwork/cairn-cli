# Git Workflow

## Commit Messages

**Format:**
```
verb: brief description

Longer explanation if needed:
- What changed
- Why it changed
- Any trade-offs made
```

**Examples:**
- `fix: Handle null user in profile component`
- `feat: Add dark mode toggle to settings`
- `docs: Update README with installation steps`
- `refactor: Extract auth logic to separate module`

## Branch Naming

- `feature/description` - New features
- `fix/issue-description` - Bug fixes
- `docs/topic` - Documentation only
- `refactor/component` - Code refactoring

## Before Committing

- ✅ All tests pass
- ✅ No console errors/warnings
- ✅ Linting clean
- ✅ One logical change per commit

## PR Workflow

1. Create feature branch
2. Make changes and commit
3. Push to origin
4. Create PR with description
5. Wait for review (don't merge yourself)
