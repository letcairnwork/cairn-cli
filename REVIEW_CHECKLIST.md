# Review Checklist for Gregory

**Date:** 2025-02-02  
**Task:** Cairn CLI Onboarding Restructure Plan  
**Status:** ✅ Ready for Your Review

---

## Documents to Review (in order)

### 1. Start Here: Executive Summary
**File:** `ONBOARDING_PLAN_SUMMARY.md` (5KB)  
**Time to read:** 5 minutes

**What it covers:**
- The problem (current onboarding is broken)
- The solution (production-ready structure)
- Key changes (worker paths, agent context, example project)
- Testing strategy
- Timeline estimate

**Action:** Read first to get the big picture.

---

### 2. Visual Comparison
**File:** `FOLDER_STRUCTURE_COMPARISON.md` (8KB)  
**Time to review:** 5 minutes

**What it shows:**
- Side-by-side "before vs. after" folder structures
- Visual diagrams of what's broken and how it's fixed
- File count comparison
- Web app compatibility matrix

**Action:** Review to understand structural changes visually.

---

### 3. Full Implementation Plan
**File:** `ONBOARDING_RESTRUCTURE_PLAN.md` (33KB)  
**Time to read:** 20-30 minutes

**What it covers:**
- Complete current state analysis (what CLI creates now)
- Detailed gap analysis (what's missing/broken)
- Proposed folder structure with justifications
- What goes in each folder and why
- Migration path (how to update code)
- Testing strategy (7 comprehensive tests)
- Implementation checklist
- Open questions for you to decide

**Action:** Review thoroughly when you have time. This is the source of truth.

---

### 4. Quick Implementation Guide
**File:** `IMPLEMENTATION_QUICKSTART.md` (23KB)  
**Time to review:** 10 minutes (reference document, not for approval)

**What it covers:**
- Step-by-step commands to execute the plan
- All template file contents (copy-paste ready)
- Code changes with diffs
- Testing procedures
- Git workflow

**Action:** Don't need to review in detail unless you want to see exact code. This is for me to execute once you approve.

---

## Quick Decision Matrix

### Must Decide Now (Blocking)

| Question | Default Recommendation | Your Decision |
|----------|----------------------|---------------|
| Add AGENTS.md, TOOLS.md, USER.md? | ✅ Yes (critical for agents) | [ ] Approve [ ] Reject [ ] Modify |
| Fix worker paths (nested structure)? | ✅ Yes (web app is broken) | [ ] Approve [ ] Reject [ ] Modify |
| Add memory/ folder? | ✅ Yes (agent effectiveness) | [ ] Approve [ ] Reject [ ] Modify |
| Add example project? | ✅ Yes (better UX) | [ ] Approve [ ] Reject [ ] Modify |
| Add skills/ folder? | ✅ Yes (agent knowledge) | [ ] Approve [ ] Reject [ ] Modify |

### Can Decide Later (Non-blocking)

| Question | Default Recommendation | Notes |
|----------|----------------------|-------|
| Prompt for user name during onboard? | ✅ Yes (optional prompt) | Can skip if prefer manual edit |
| Add SOUL.md to root workspace? | ⏭️ Skip for now | Not needed for all users |
| Add artifacts/ or output/ folder? | ⏭️ Skip for now | Can use _drafts/ |
| Add `cairn migrate` command? | ✅ Yes (for existing users) | Can be separate PR |

---

## Approval Process

### Option 1: Quick Approval (Trust the Plan)
```
"Looks good, proceed with implementation."
```

**I will:**
1. Create all templates (Phase 1)
2. Restructure workers (Phase 2)
3. Update code (Phase 3)
4. Run all tests (Phase 4)
5. Create PR for your final review before merge

**Timeline:** ~2 working days

---

### Option 2: Detailed Review (Discuss Changes)
```
"Let's discuss [specific concerns] before proceeding."
```

**We will:**
1. Address your questions/concerns
2. Revise plan if needed
3. Get your re-approval
4. Then proceed with implementation

**Timeline:** +1-2 days for discussion, then 2 days implementation

---

### Option 3: Iterative Approach (Phase by Phase)
```
"Let's do Phase 1 first and review before continuing."
```

**We will:**
1. Complete Phase 1 (templates only)
2. You review the template contents
3. Get approval for Phases 2-4
4. Finish implementation

**Timeline:** +2-3 days for phased reviews, safer approach

---

## What Happens After Approval

### Immediate Next Steps
1. I create feature branch: `feature/production-onboarding`
2. Execute Phases 1-4 (implementation + testing)
3. Create PR with summary
4. Tag you for final review
5. **You merge** (I don't merge PRs to main)

### What You'll Review in the PR
- All new template files (you can edit before merge if needed)
- Code changes (workspace.js, onboard.js)
- Test results (screenshots/logs)
- Updated documentation

### Post-Merge
- Bump version to 1.0.0 (production-ready signal)
- Publish to npm
- Update main README with new structure
- Announce in Slack/Discord

---

## Open Questions (Need Your Input)

### Question 1: User Name Prompt
**Context:** USER.md template has `{{USER_NAME}}` placeholder.

**Options:**
- A) Prompt during `cairn onboard` (optional/skippable)
- B) Leave blank for manual editing
- C) Auto-detect from git config

**Recommendation:** A (better UX, but optional)

**Your decision:** _____________

---

### Question 2: SOUL.md File
**Context:** Should root workspace have SOUL.md like Clawd main session?

**Options:**
- A) Yes, always create SOUL.md (even if generic)
- B) Only if user has "main agent" (unclear when)
- C) Skip for now, not universally needed

**Recommendation:** C (not needed for task management workspace)

**Your decision:** _____________

---

### Question 3: Example Project Tasks Status
**Context:** Should getting-started tasks be `pending` or `next_up`?

**Options:**
- A) `pending` (user explicitly starts when ready)
- B) `next_up` (hint they should do these first)
- C) Mix (explore-cairn = next_up, create-first-project = pending)

**Recommendation:** A (less pushy, clearer intent)

**Your decision:** _____________

---

### Question 4: CLI Doctor Check
**Context:** Should `cairn doctor` validate new files exist?

**Options:**
- A) Yes, check for AGENTS.md, memory/, skills/
- B) No, only check original structure
- C) Yes, but as warnings (not errors)

**Recommendation:** C (helpful but not strict)

**Your decision:** _____________

---

## Risk Assessment

**Overall Risk Level:** 🟢 Low

**Why low risk:**
- Changes are additive (new files)
- One structural fix (workers nesting)
- No breaking changes to CLI commands
- No changes to file formats
- Backward compatible (existing workspaces still work)

**Biggest risk:** Workers restructure breaks something unexpected  
**Mitigation:** Test Phase 5 (web app worker view) thoroughly

---

## Timeline Summary

**If approved today (Sunday):**
- Monday: Phases 1-2 (templates + workers restructure)
- Tuesday: Phases 3-4 (code + testing)
- Wednesday: PR ready for your review
- Thursday: Address feedback, merge when ready
- Friday: Publish to npm

**Total:** 5 days from approval to production

---

## How to Approve

### In Slack
```
"✅ Approved. Proceed with implementation.

Decisions:
- User name prompt: Yes (optional)
- SOUL.md: Skip for now
- Example tasks status: pending
- Doctor check: Yes, warnings only"
```

### In This File (if you prefer)
Edit this section:
```
APPROVAL STATUS: [ ] Approved [ ] Changes Requested [ ] Rejected

NOTES:
[Your feedback here]

SIGNATURE: Gregory
DATE: _____________
```

---

## Questions?

**Fastest response:** Slack DM  
**Detailed discussion:** Schedule a call  
**Async review:** Comment in this file or upcoming PR

---

**Bottom line:** This restructure is the critical path to production. Current onboarding creates a broken workspace. This plan fixes it and makes agents effective from day 1.

Ready when you are! 🦮
