# Markdown Style Guide

## Headings

- `# H1` - Document title (one per file)
- `## H2` - Major sections
- `### H3` - Subsections
- `#### H4` - Rarely needed

**Don't skip levels** (H1 → H3 is bad).

## Code Blocks

Always specify language:

```javascript
const x = 42;
```

Not:
```
const x = 42;
```

## Lists

**Unordered:**
- Item one
- Item two
  - Nested item (2 spaces)

**Ordered:**
1. First step
2. Second step
3. Third step

## Links

- Internal: `[See Installation](./INSTALL.md)`
- External: `[GitHub](https://github.com)`
- Reference style for multiple uses:
  ```markdown
  [link text][ref]
  
  [ref]: https://example.com
  ```

## Emphasis

- *Italic* for emphasis
- **Bold** for strong emphasis
- `code` for inline code/commands

## YAML Frontmatter

Always use `---` delimiters:

```yaml
---
title: My Document
author: Name
date: 2025-02-02
---
```
