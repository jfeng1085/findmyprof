# GLOBAL SESSION PRIMER
# Paste this at the START of every new Claude Code session, before any task prompt.

---

## WHO YOU ARE AND WHAT YOU ARE BUILDING

You are an AI coding assistant helping build **FindMyProf** — a study-abroad supervisor-finder website for Chinese students seeking postgraduate supervisors overseas.

Before doing ANYTHING else in this session, run this command to read the full project context:

```bash
cat README.md
```

If README.md does not exist yet, this is Session 1 — proceed with the first task prompt below and create it as instructed.

---

## PROJECT SNAPSHOT (quick reference — README.md is the source of truth)

- **Project name:** FindMyProf (找到你理想的海外导师)
- **Tech stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, react-simple-maps
- **Target users:** Chinese students seeking postgraduate supervisors abroad
- **Phase 1 countries:** Australia, Hong Kong, Singapore
- **Phase 1 fields:** Engineering disciplines only
- **Data approach:** Static JSON files (no backend in v1)
- **Deployment:** Vercel (free tier) + GitHub
- **Bookmark storage:** localStorage (no login required in v1)
- **OS / Environment:** Windows + VS Code

---

## YOUR RESPONSIBILITIES IN EVERY SESSION

1. **Read README.md first.** It contains the current project state, completed phases, known issues, and next steps. Treat it as your brain.

2. **After completing any task**, update README.md immediately. Update:
   - The "Current Status" section
   - The "Completed Phases" checklist
   - The "File Structure" if new files were added
   - The "Known Issues / TODO" section
   - The "Last Updated" timestamp at the top

3. **Never assume context** — always derive state from README.md and the actual files in the project. Do not rely on conversation history.

4. **If something is ambiguous**, check the existing code before asking the user. Only ask if the code doesn't answer the question.

5. **Preserve extensibility.** This is v1. Every decision should allow easy addition of: more countries, more fields, real database, user accounts, web scraping. Do not hardcode things that should be configurable.

---

## ARCHITECTURE RULES (never violate these)

- All pages live in `/app` using Next.js App Router
- All reusable UI lives in `/components`
- All static data lives in `/data` as JSON files
- All helper functions live in `/lib`
- Country slugs are always lowercase: `australia`, `hong-kong`, `singapore`
- Field slugs are always lowercase kebab-case: `computer-science`, `civil-engineering`
- Professor IDs are always prefixed with country code: `au-001`, `hk-001`, `sg-001`

---

## README UPDATE PROTOCOL

After EVERY task, run:

```bash
# Verify the file you just created/modified exists and has correct content
ls -la [file you created]

# Then update README.md — use the Edit tool, not cat/echo, to avoid overwriting
```

Update the following sections in README.md:
- `## Last Updated` → today's date
- `## Current Status` → what was just completed
- `## Completed Phases` → tick the relevant checkbox
- `## File Structure` → add any new files with one-line descriptions
- `## Known Issues / TODO` → add anything noticed during the task

---

## SESSION HANDOFF CHECKLIST

Before ending any session, confirm:
- [ ] README.md has been updated
- [ ] All new files are saved and not just in memory
- [ ] No half-finished components left (comment with TODO if incomplete)
- [ ] `npm run build` passes without errors (run if major changes were made)

---

*This primer is maintained by the human owner of this project. If you find it outdated, note the discrepancy in README.md under "Known Issues".*
