# Artifacts Field CLI Implementation

This document describes the CLI support and validation features for the `artifacts` field in Cairn task files.

## Overview

Implements [Issue #32](https://github.com/gregoryehill/cairn/issues/32) - Add CLI support for managing task artifacts and validation through `cairn doctor`.

**PR**: https://github.com/gregoryehill/cairn-cli/pull/17

## Features

### 1. Task Update Command (`cairn update`)

Update task properties, starting with artifacts management.

#### Usage

```bash
# Add a single artifact
cairn update <task-slug> --add-artifact <path>

# Add multiple artifacts in one command
cairn update <task-slug> --add-artifact <path1> --add-artifact <path2>

# Remove an artifact
cairn update <task-slug> --remove-artifact <path>

# Search within a specific project
cairn update <task-slug> --add-artifact <path> --project <project-slug>
```

#### Examples

```bash
# Add source files
cairn update implement-auth --add-artifact src/auth/oauth.ts

# Add multiple artifacts
cairn update implement-auth \
  --add-artifact src/auth/oauth.ts \
  --add-artifact tests/auth.test.ts \
  --add-artifact docs/auth-setup.md

# Add a URL
cairn update deploy-api --add-artifact https://staging.api.example.com

# Remove an outdated artifact
cairn update implement-auth --remove-artifact old-file.ts
```

#### Features

- **Safe YAML handling**: Parses and reconstructs frontmatter without corrupting file structure
- **Duplicate detection**: Warns if artifact already exists, doesn't add duplicates
- **Multiple operations**: Support for multiple `--add-artifact` and `--remove-artifact` flags in one command
- **Project filtering**: Optional `--project` flag to search within a specific project
- **Clear output**: Shows changes made, final artifact count, and any warnings

### 2. Artifact Validation (`cairn doctor`)

Extended the `cairn doctor` command with comprehensive artifact validation.

#### What It Checks

1. **Completed tasks without artifacts**: Warns if a task marked as "completed", "done", or "finished" has no artifacts listed
2. **Broken artifact links**: Validates that local file paths exist relative to workspace root
3. **Path formats**: Handles local paths, HTTP/HTTPS URLs, and `obsidian://` links appropriately
4. **Statistics**: Shows total tasks, completed tasks, tasks with artifacts

#### Output Example

```
🦮  Cairn Doctor

Checking workspace health...

✔ Workspace structure valid
✔ Workspace context files verified
✔ README exists
⚠ Artifact issues found

Summary:

2 warning(s):

⚠ 40 completed task(s) have no artifacts listed
  Fix: Use: cairn update <task-slug> --add-artifact <path>

⚠ 32 broken artifact link(s) found
  Fix: Check paths or remove with: cairn update <task-slug> --remove-artifact <path>

Completed tasks without artifacts:
  ⚠ project-name/task-slug-1
  ⚠ project-name/task-slug-2
  ...

Broken artifact links:
  ✗ project/task: path/to/missing/file.ts
  ✗ project/task: apps/web/src/deleted.tsx
  ...

Sample tasks with artifacts:
  ✓ project/task (3 artifact(s))
    - src/api.ts (exists ✓)
    - tests/api.test.ts (exists ✓)
    - https://example.com (URL, not validated)
```

#### Validation Rules

- **Local paths**: Checked relative to workspace root, marked as "exists ✓" or "missing ✗"
- **URLs**: Recognized by `http://`, `https://`, or `obsidian://` prefix, marked as "(URL, not validated)"
- **Non-string values**: Gracefully skipped (in case YAML parsing returns unexpected types)

## Implementation Details

### File Structure

```
lib/commands/
  ├── update.js      # Task update command (artifacts management)
  ├── upgrade.js     # CLI self-update (renamed from update.js)
  └── doctor.js      # Extended with artifact validation
```

### Breaking Changes

**Renamed command**: `cairn update` → `cairn upgrade`

The existing `cairn update` command (for CLI self-updates) has been renamed to `cairn upgrade` to free up the more intuitive `update` name for task updates.

**Migration**: Users should now use `cairn upgrade` to update the CLI tool itself.

### YAML Handling

Uses `js-yaml` library for safe frontmatter parsing and serialization:

```javascript
// Parse frontmatter
const frontmatter = jsYaml.load(frontmatterText);

// Serialize back
const yamlText = jsYaml.dump(frontmatter, {
  lineWidth: -1,    // Disable line wrapping
  noRefs: true,     // Don't use anchors/aliases
  sortKeys: false   // Preserve key order
});
```

This ensures the file structure is preserved and dates/values aren't corrupted during updates.

### Error Handling

- Task not found → Clear error message with suggestion to use `--project`
- Invalid frontmatter → Error with explanation
- Duplicate artifact → Warning, no changes made
- Artifact not found (remove) → Warning, no changes made
- No operations specified → Shows usage help

## Testing

Tested on real workspace with 100+ tasks:

- ✅ Adding single artifacts
- ✅ Adding multiple artifacts in one command
- ✅ Removing artifacts
- ✅ Duplicate detection
- ✅ Doctor validation on completed tasks
- ✅ Doctor validation of local paths
- ✅ Doctor recognition of URLs and Obsidian links
- ✅ YAML frontmatter preservation
- ✅ Mixed local/URL artifacts

## Future Enhancements

Potential additions to `cairn update`:

- `--status <status>` - Update task status
- `--assignee <name>` - Change assignee
- `--due <date>` - Update due date
- `--autonomy <level>` - Change autonomy level

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Main documentation for artifacts field
- [Issue #32](https://github.com/gregoryehill/cairn/issues/32) - Original feature request
- [PR #17](https://github.com/gregoryehill/cairn-cli/pull/17) - Implementation PR
