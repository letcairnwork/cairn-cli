# Cairn: Project Planning Guide

This document teaches you how to plan and flesh out projects. The companion skill file (`agent-skill.template.md`) covers day-to-day operations. This file covers how to CREATE meaningful work from a simple user request.

## Core Principle

When a user says "Create a project called X", they expect you to act as a project manager. Don't create skeleton files with placeholder text. Think through what the project actually requires, break it into concrete tasks, and fill in real content throughout.

## Project Creation Workflow

When a user asks you to create a project:

### 1. Understand the Scope

Before running any `cairn create` commands, think about:
- What does this project actually involve?
- What are the major phases or workstreams?
- What are the dependencies between pieces of work?
- What does "done" look like?

If the request is ambiguous, ask clarifying questions BEFORE creating anything. Examples:
- "What's the target audience for this website?"
- "Do you need authentication/user accounts?"
- "Any specific tech stack preference?"
- "What's the timeline?"

### 2. Create the Project

```bash
cairn create project "Project Name" \
  --description "One-line summary of what we're building and why" \
  --due YYYY-MM-DD
```

### 3. Flesh Out the Charter

After the CLI creates `charter.md`, edit it to replace ALL placeholder text:

**"Why This Matters"** — Write 2-4 sentences explaining the business or personal motivation. What problem does this solve? Why now?

**"Success Criteria"** — Write 3-6 specific, measurable outcomes. Each should be a checkbox item that can be objectively verified as done or not done. Avoid vague criteria.

Bad:
```markdown
- [ ] Website looks good
- [ ] Everything works
```

Good:
```markdown
- [ ] Homepage loads in under 2 seconds on mobile
- [ ] Contact form submissions deliver to owner's email within 1 minute
- [ ] Site scores 90+ on Lighthouse accessibility audit
- [ ] All pages are responsive from 320px to 1440px viewport width
```

**"Context"** — Add relevant constraints, technical decisions, dependencies on external systems, or anything the agent working on tasks will need to know.

### 4. Break Down into Tasks

Create 3-8 tasks per project. Each task should be:
- **Atomic**: Completable in one work session
- **Specific**: Clear what "done" means without reading other tasks
- **Ordered**: All tasks default to `status: pending`. Only set `--status next_up` if the user asks you to begin work immediately.

Think in phases:
1. **Setup/Foundation** — Environment, tooling, project scaffolding
2. **Core Features** — The main deliverables
3. **Polish/Integration** — Testing, refinement, deployment

```bash
cairn create task "Task Name" \
  --project project-slug \
  --description "What this accomplishes in one sentence" \
  --status pending \
  --due YYYY-MM-DD
```

Then edit each task file to fill in the `## Objective` section with 2-4 sentences describing what needs to happen and any relevant details.

### 5. Review the Full Plan

After creating everything, summarize what you created for the user:
- Project name and description
- Number of tasks and their sequence
- Key decisions you made
- Anything you need input on

---

## Writing Good Content

### Charter: "Why This Matters"

This section answers: Why should someone spend time on this?

Template pattern:
```
[Who] needs [what] because [why]. Currently [current state/problem].
This project will [outcome], enabling [benefit].
```

Example:
```markdown
## Why This Matters

Our current landing page is a static HTML file from 2023 that doesn't reflect
our updated brand or product offerings. Potential customers are bouncing within
3 seconds because the page loads slowly and isn't mobile-friendly.

This project rebuilds the marketing site with modern tooling, responsive design,
and a contact form so we can actually capture leads. The site needs to feel
professional and load fast on any device.
```

### Charter: "Success Criteria"

Each criterion should pass the "someone else could verify this" test. Use numbers, specific behaviors, or concrete deliverables.

Example:
```markdown
## Success Criteria

- [ ] Site is deployed and accessible at the production domain
- [ ] Homepage, About, and Contact pages are complete with real content
- [ ] Contact form validates input and sends submissions to team inbox
- [ ] Page load time is under 2s on 3G mobile (measured by Lighthouse)
- [ ] Design matches approved mockups within reasonable fidelity
- [ ] Site renders correctly on Chrome, Safari, and Firefox (latest versions)
```

### Charter: "Context"

Include anything a task executor needs to know that isn't in the tasks themselves:
- Tech stack decisions and rationale
- External dependencies (APIs, services, accounts needed)
- Design references or brand guidelines
- Constraints (budget, timeline, compliance requirements)
- Links to related resources

Example:
```markdown
## Context

Tech stack: Next.js 14 with App Router, Tailwind CSS, deployed on Vercel.
Chosen because the team already has Vercel infrastructure and Next.js experience.

Design: No formal mockups. Use clean, minimal aesthetic. Brand colors are
#1a1a2e (dark navy) and #e94560 (accent red). Logo SVG is in the shared
Google Drive under /Brand Assets.

External: Contact form will use Resend for transactional email. API key
is in the team's 1Password vault under "Resend Production".

Constraint: Must be live before the March 15 trade show.
```

### Task: "Objective"

Each task's objective should answer: What exactly needs to happen, and what does done look like?

Bad:
```markdown
## Objective

Set up the project.
```

Good:
```markdown
## Objective

Initialize a new Next.js 14 project with TypeScript and Tailwind CSS.
Configure the project structure with app router, set up ESLint and Prettier,
and create the base layout component with the site header and footer.
The dev server should start without errors and the base layout should
render on all routes.
```

---

## Task Sequencing and Dependencies

When breaking down a project, think about what blocks what:

1. **Foundation tasks come first** — These set up the project, install tools, create the base structure. All tasks start as `status: pending` by default.

2. **Core tasks depend on foundation** — These build the actual features. Set to `status: pending` until foundation tasks are done.

3. **Integration/polish tasks come last** — Testing, deployment, final review. These depend on core work being complete.

You don't need to encode dependencies in the files (Cairn doesn't have a dependency field). Instead, use task ordering and the `## Objective` section to note prerequisites:

```markdown
## Objective

Configure Vercel deployment with automatic deploys from the main branch.
Set up preview deployments for pull requests. Requires the Next.js project
to be initialized and pushed to GitHub (see: set-up-nextjs-project task).
```

---

## Scoping Projects by Size

### Small Project (2-4 tasks)
Single-feature work. Example: "Add a blog to the website"
- Set up blog content structure (MDX/markdown)
- Build blog listing page and post template
- Add RSS feed and SEO metadata

### Medium Project (4-7 tasks)
Multi-feature or full build. Example: "Build a marketing website"
- Initialize project and configure tooling
- Build homepage with hero, features, and CTA sections
- Build about page
- Build contact page with form and validation
- Set up deployment pipeline
- Cross-browser testing and performance optimization

### Large Project (7-12 tasks)
Complex system with multiple workstreams. Example: "Build a SaaS dashboard"
- Initialize project with auth framework
- Build authentication flow (signup, login, password reset)
- Design and build dashboard layout and navigation
- Build data visualization components
- Build settings and profile management
- Implement API integration layer
- Build notification system
- Set up CI/CD pipeline
- Write integration tests for critical paths
- Performance audit and optimization
- Pre-launch security review

If a project needs more than 12 tasks, consider splitting it into multiple projects.

---

## Handling Ambiguity

When the user's request is vague, you have two options:

### Option A: Ask First
If the ambiguity would fundamentally change the project scope, ask:
```
Before I create this project, a few questions:
1. Do you need user authentication, or is this a static site?
2. Any specific pages beyond a homepage?
3. Do you have a design or should I plan for a minimal/clean approach?
```

### Option B: Make Reasonable Defaults, State Your Assumptions
If the ambiguity is about implementation details, make sensible choices and document them in the charter's Context section:
```markdown
## Context

Assumptions (let me know if any of these should change):
- Static marketing site, no auth or database needed
- Three pages: Home, About, Contact
- Modern stack: Next.js + Tailwind, deployed on Vercel
- Mobile-first responsive design
- Contact form sends to owner's email via Resend or similar
```

Prefer Option B for experienced users who gave you a brief prompt intentionally. Prefer Option A when the scope is genuinely unclear or the cost of getting it wrong is high.

---

## Complete Example: "Build a Marketing Website"

Here's what a fully fleshed-out project looks like after an agent processes "Create a project for building our marketing website":

### charter.md
```yaml
---
title: Build Marketing Website
description: Design and develop a responsive marketing website with homepage, about, contact, and blog
status: in_progress
priority: 2
created: 2026-01-30
due: 2026-03-01
owner: you
default_autonomy: draft
budget: 100
spent: 0
---
```
```markdown
## Why This Matters

We need a professional web presence to support upcoming product launches and
capture leads from potential customers. The current site is outdated and doesn't
reflect our brand or product capabilities. A modern, fast, mobile-friendly site
is table stakes for credibility.

## Success Criteria

- [ ] Site is deployed and live at production domain
- [ ] Homepage clearly communicates value proposition with hero, features, and CTA
- [ ] About page tells our story with team/company information
- [ ] Contact form captures leads and delivers to team inbox within 1 minute
- [ ] Blog supports markdown-authored posts with proper SEO metadata
- [ ] All pages score 90+ on Lighthouse performance and accessibility
- [ ] Fully responsive from 320px to 1440px viewport width

## Context

Tech stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, deployed on Vercel.

Assumptions:
- Static site with no authentication or database
- Contact form uses a transactional email service (Resend or similar)
- Blog content authored in MDX files within the repo
- Clean, minimal design — no existing mockups or brand guide provided

## Work Log

### 2026-01-30 - Created
[agent] Project created with 6 tasks covering setup through deployment.
```

### tasks/initialize-project.md
```yaml
---
title: Initialize project and tooling
description: Scaffold Next.js project with TypeScript, Tailwind, and dev tooling
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-03
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Create a new Next.js 14 project using the App Router with TypeScript enabled.
Install and configure Tailwind CSS for styling. Set up ESLint and Prettier with
sensible defaults. Create the base layout component with a responsive site
header (logo + nav links) and footer. Initialize a git repo and push to GitHub.
The dev server should start cleanly and the base layout should render on all routes.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

### tasks/build-homepage.md
```yaml
---
title: Build homepage
description: Create responsive homepage with hero section, features grid, and call-to-action
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-08
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Build the homepage with three sections: (1) A hero section with headline,
subheadline, and primary CTA button. (2) A features grid showcasing 3-4 key
value propositions with icons and short descriptions. (3) A bottom CTA section
encouraging visitors to get in touch. All sections should be responsive and
use consistent spacing and typography from the Tailwind config.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

### tasks/build-about-page.md
```yaml
---
title: Build about page
description: Create about page with company story and team information
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-10
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Create an About page with company background, mission statement, and team
section. The team section should support displaying name, role, photo, and
short bio for each team member. Content will be placeholder until the owner
provides real copy, but the layout and components should be production-ready.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

### tasks/build-contact-page.md
```yaml
---
title: Build contact page with form
description: Create contact page with validated form that sends submissions via email
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-13
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Build a contact page with a form collecting name, email, and message. Add
client-side validation (required fields, email format). Implement a server
action or API route to process submissions and send them to the team's
email via Resend (or similar transactional email service). Show success/error
states after submission. Include a rate limiter or honeypot field to reduce spam.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

### tasks/add-blog.md
```yaml
---
title: Add blog with MDX support
description: Set up blog with MDX content, listing page, and individual post pages
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-17
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Add blog functionality using MDX files stored in the repo. Create a blog
listing page showing posts sorted by date with title, excerpt, and publish
date. Create a blog post template page with proper typography, code syntax
highlighting, and SEO metadata (Open Graph tags, meta description). Add at
least one sample post to verify the pipeline works end-to-end. Set up an
RSS feed at /feed.xml.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

### tasks/deploy-and-optimize.md
```yaml
---
title: Deploy and optimize performance
description: Configure Vercel deployment and optimize for Lighthouse scores
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-21
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Connect the GitHub repo to Vercel for automatic deployments on push to main.
Configure preview deployments for pull requests. Run Lighthouse audits on all
pages and optimize until performance and accessibility scores are 90+.
Address any issues: image optimization, font loading, bundle size, semantic
HTML, ARIA labels, color contrast. Verify the site renders correctly on
Chrome, Safari, and Firefox latest versions.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

---

## Complete Example: Small Project — "Add Dark Mode"

### charter.md
```yaml
---
title: Add Dark Mode
description: Implement system-aware dark mode with manual toggle across the site
status: in_progress
priority: 2
created: 2026-01-30
due: 2026-02-10
owner: you
default_autonomy: draft
budget: 50
spent: 0
---
```
```markdown
## Why This Matters

Users have requested dark mode support, and the site currently forces a bright
white theme that's uncomfortable for nighttime browsing. Supporting dark mode
also signals that we care about user preferences and accessibility.

## Success Criteria

- [ ] Site respects system color scheme preference by default
- [ ] Manual toggle persists choice across sessions (localStorage)
- [ ] All pages and components render correctly in both themes
- [ ] No flash of wrong theme on page load
- [ ] Toggle is accessible via keyboard and screen readers

## Context

The site uses Tailwind CSS, which has built-in dark mode support via the
`dark:` variant. Use the `class` strategy (not `media`) so we can support
both system preference and manual override. Store preference in localStorage.
Use `next-themes` or a lightweight custom hook.

## Work Log

### 2026-01-30 - Created
[agent] Project created with 3 tasks.
```

### tasks/implement-theme-system.md
```yaml
---
title: Implement theme system
description: Add dark mode infrastructure with Tailwind class strategy and theme provider
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-04
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Configure Tailwind for class-based dark mode. Create or install a theme
provider component that handles system preference detection, manual toggle
state, and localStorage persistence. Ensure no flash of unstyled/wrong
theme on initial page load (use a blocking script or cookie approach).
Add a theme toggle button component to the site header.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

### tasks/update-all-components.md
```yaml
---
title: Update components for dark mode
description: Add dark variants to all existing components and pages
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-07
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Audit every component and page for dark mode support. Add `dark:` Tailwind
variants for backgrounds, text colors, borders, and shadows. Define a
consistent dark palette (not just inverting colors — choose intentional
dark surfaces and muted accents). Test each page visually in both modes.
Pay special attention to images, code blocks, and form inputs which
often need specific dark mode treatment.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

### tasks/test-and-polish.md
```yaml
---
title: Test and polish dark mode
description: Cross-browser testing, transition animations, and edge case fixes
assignee: you
status: pending
created: 2026-01-30
due: 2026-02-10
autonomy: draft
spend: 0
artifacts: []
---
```
```markdown
## Objective

Test dark mode across Chrome, Safari, and Firefox. Verify the toggle works
with keyboard navigation and screen readers. Add a smooth CSS transition
when switching themes (opacity or color transition, ~200ms). Fix any edge
cases: embedded content, third-party widgets, images with transparency
that look wrong on dark backgrounds. Run Lighthouse accessibility audit
in both modes.

## Work Log

### 2026-01-30 - Created
[agent] Task created via Cairn CLI.
```

---

## Quick Reference: What to Fill In

| Section | What to Write | Never Write |
|---------|--------------|-------------|
| Charter: Why This Matters | Real motivation, problem statement, expected outcome | `[Describe why this project is important]` |
| Charter: Success Criteria | Specific, measurable, verifiable checkboxes | Vague criteria like "works well" or "looks good" |
| Charter: Context | Tech decisions, constraints, external deps, assumptions | Empty section or `[Add relevant background]` |
| Task: Objective | Concrete description of what to build/do and what done looks like | `[Describe what needs to be accomplished]` |
| Work Log | Timestamped entries with agent name | Empty or skipped |

---

## Anti-Patterns

1. **Placeholder projects** — Creating a project with `[Your goals]` still in the charter. Always fill in real content.

2. **Too many tasks** — More than 12 tasks means the project should be split. More than 8 is usually a sign of over-decomposition.

3. **Too few tasks** — A single task for "build the whole thing" defeats the purpose. Minimum 2-3 tasks for any real project.

4. **Vague tasks** — "Work on the frontend" is not a task. "Build the homepage with hero section, features grid, and CTA" is a task.

5. **No sequencing** — All tasks created with random statuses. Create all tasks as `pending` by default. Only use `next_up` when the user explicitly asks you to begin work.

6. **Ignoring the charter** — Jumping straight to tasks without filling in Why, Success Criteria, and Context. The charter is how the human verifies you understood their intent.

7. **Not stating assumptions** — If you made decisions (tech stack, scope, approach), document them in Context so the human can course-correct before you build the wrong thing.
