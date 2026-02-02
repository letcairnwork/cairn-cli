# Cairn CLI Onboarding Restructure - Executive Summary

**Date:** 2025-02-02  
**Status:** Ready for Review  
**Full Plan:** See `ONBOARDING_RESTRUCTURE_PLAN.md`

---

## The Problem

Current `cairn onboard` creates incomplete workspace that:
- ❌ **Breaks web app** - Worker paths don't match backend expectations (`workers/engineer.md` vs `workers/engineer/engineer.md`)
- ❌ **Confuses agents** - No AGENTS.md, TOOLS.md, memory/ → agents fail tasks, repeat mistakes
- ❌ **Lands users in empty workspace** - No example project, unclear next steps

**Business impact:** Can't ship to production. CLI onboarding doesn't deliver on promise.

---

## The Solution

Restructure onboarding to create **production-ready workspace** that:
1. ✅ **Works perfectly with web app** (folder structure 1:1 match)
2. ✅ **Gives agents everything they need** (context, skills, examples)

### Key Changes

#### 1. Fix Worker Structure (CRITICAL)
**Before:** `workers/engineer.md` (breaks web app)  
**After:** `workers/engineer/engineer.md` (matches backend)

**Impact:** Workers load in web app, assignments work, no 404 errors.

#### 2. Add Agent Context Files (CRITICAL)
**New files:**
- `AGENTS.md` - Workspace instructions (how to use Cairn CLI, memory protocol, safety rules)
- `TOOLS.md` - User-specific tool configs (SSH hosts, camera names, etc.)
- `USER.md` - Who the human is (for personalization)
- `memory/` folder with `MEMORY.md` + daily logs

**Impact:** Agents know workspace conventions, persist learnings, don't repeat mistakes.

#### 3. Add Example Project (HIGH)
**New:** `projects/getting-started/` with 2 example tasks

**Impact:** Users see immediate value, clear next steps, understand Cairn structure.

#### 4. Add Shared Skills (MEDIUM)
**New:** `skills/` folder with `git-workflow.md`, `markdown-style.md`, `cairn-conventions.md`

**Impact:** Agents load domain knowledge on demand, consistent output.

#### 5. Fix Inbox Subdirs (MEDIUM)
**Add:** `inbox/processed/` and `inbox/proposed-paths/`

**Impact:** Sync service doesn't conflict, archived items stay archived.

---

## New Workspace Structure

```
~/cairn/
├── AGENTS.md                       ⭐ NEW
├── TOOLS.md                        ⭐ NEW
├── USER.md                         ⭐ NEW
├── README.md                       (updated)
├── .cairn/planning.md              (existing)
├── memory/                         ⭐ NEW
│   ├── MEMORY.md
│   └── 2025-02-02.md
├── projects/
│   └── getting-started/            ⭐ NEW (example)
│       ├── charter.md
│       └── tasks/
│           ├── explore-cairn.md
│           └── create-first-project.md
├── inbox/
│   ├── processed/                  ⭐ NEW
│   └── proposed-paths/             ⭐ NEW
├── workers/
│   ├── engineer/                   ⭐ RESTRUCTURED (nested)
│   │   ├── engineer.md
│   │   └── skills/
│   ├── designer/                   ⭐ RESTRUCTURED
│   │   └── designer.md
│   └── [7 more workers...]
├── skills/                         ⭐ NEW
│   ├── git-workflow.md
│   ├── markdown-style.md
│   └── cairn-conventions.md
├── _drafts/
├── _conflicts/
└── _abandoned/
```

---

## Testing Strategy

**7 automated tests covering:**
1. Fresh onboarding (structure validation)
2. CLI compatibility (commands work)
3. Desktop app sync (Convex integration)
4. Agent context loading (files readable)
5. Web app worker view (no 404s)
6. Inbox workflow (processed/ folder)
7. Memory system (persistent storage)

**Success criteria:** All tests pass, web app shows workers, agents complete tasks.

---

## Implementation Plan

### Phase 1: Templates (4 hours)
Create all new template files (AGENTS.md, USER.md, skills, example project)

### Phase 2: Workers (2 hours)
Restructure workers to nested format, update references

### Phase 3: Code (3 hours)
Update `workspace.js` and `onboard.js` to copy new structure

### Phase 4: Testing (3 hours)
Run all 7 tests, verify success criteria

### Total: ~2 working days

---

## Risks

| Risk | Mitigation |
|------|------------|
| Break existing workspaces | Add `cairn migrate` command for upgrades |
| Workers don't load in web app | Test Phase 5 thoroughly, check browser console |
| Sync conflicts | Test Phase 6, verify processed/ folder behavior |

**Overall:** Low risk. Changes are additive + structural fix.

---

## Open Questions

1. **User name prompt:** Prompt during onboard or leave USER.md blank?
   - *Recommendation:* Prompt (better UX), make optional
   
2. **SOUL.md:** Include for all users or only if main agent exists?
   - *Recommendation:* Skip for now, not universally needed

3. **Artifacts folder:** Add `artifacts/` or `output/` directory?
   - *Recommendation:* Skip, use `_drafts/` for now

4. **Migration command:** Add `cairn migrate` for existing users?
   - *Recommendation:* Yes, critical for adoption

---

## Approval Needed

**Gregory, please review:**
1. Does proposed structure make sense?
2. Are agent context files (AGENTS.md, memory/) necessary?
3. Is example project content appropriate?
4. Is 2-day timeline acceptable?

**Once approved:**
- [ ] Create templates
- [ ] Restructure workers
- [ ] Update code
- [ ] Run tests
- [ ] Create PR (you merge)

---

**Full details:** See `ONBOARDING_RESTRUCTURE_PLAN.md` (33KB, comprehensive analysis + implementation guide)
