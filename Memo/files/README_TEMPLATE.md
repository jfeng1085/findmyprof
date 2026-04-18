# FindMyProf — 找到你理想的海外导师

> **NOTE TO AI ASSISTANT:** This README is your memory across sessions. Read it fully before starting any task. Update it after every task. It is the single source of truth for this project's state.

**Last Updated:** [FILL IN DATE AFTER EACH SESSION]
**Last Session Completed:** [FILL IN TASK NAME]

---

## Project Overview

FindMyProf is a web application that helps Chinese students find and evaluate postgraduate supervisors at universities in Australia, Hong Kong, and Singapore. 

Users navigate via an interactive world map, select a country and engineering field, browse filtered professor listings, view detailed profiles with recent projects and peer reviews, and bookmark favourites — all without needing an account.

**Design philosophy:** Start simple, build for extensibility. v1 uses static JSON data. The architecture is intentionally designed to swap in a real database and scraper later with minimal refactoring.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | File-based routing, SSG, easy Vercel deploy |
| Language | TypeScript | Catch bugs early, better AI code suggestions |
| Styling | Tailwind CSS | Rapid UI, consistent design system |
| Map | react-simple-maps | Lightweight SVG world map, clickable countries |
| Data | Static JSON files | No backend needed for v1 |
| Bookmarks | localStorage | No login required for v1 |
| Hosting | Vercel (free) | Zero-config Next.js deployment |
| Code repo | GitHub | Version control + Vercel integration |

---

## Target Scope (v1)

- **Users:** Chinese students seeking overseas postgraduate supervisors
- **Countries:** Australia, Hong Kong, Singapore
- **Fields:** Engineering disciplines (8 sub-fields)
- **Data:** Manually curated seed data (~30 professors to start)
- **Language:** Chinese UI, English professor data
- **Features:** Map navigation, field selection, professor list + filters, professor profiles, bookmarks, static application guides

---

## Completed Phases

- [ ] **Phase 0** — Project scaffolded, dependencies installed, README created
- [ ] **Phase 1** — Seed data created (professors.json, universities.json, fields.json)
- [ ] **Phase 2** — Landing page with interactive world map
- [ ] **Phase 3** — Professor listing page with filters
- [ ] **Phase 4** — Professor detail page with tabs
- [ ] **Phase 5** — Saved/bookmarks page
- [ ] **Phase 6** — Application guide pages (static content)
- [ ] **Phase 7** — Final polish + deployed to Vercel

---

## Current Status

> [AI: Update this section after every task. Be specific. Example: "Phase 2 complete. Landing page renders world map. Australia, HK, SG are clickable. Hover tooltips show professor count. Known issue: map does not centre correctly on mobile."]

**Status:** Not started — waiting for Phase 0.

---

## File Structure

```
findmyprof/
├── README.md                    ← YOU ARE HERE — AI memory file
├── GLOBAL_SESSION_PRIMER.md     ← Paste this at the start of every Claude Code session
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
│
├── app/                         ← Next.js App Router pages
│   ├── layout.tsx               ← Root layout (header, footer)
│   ├── page.tsx                 ← Landing page (world map)
│   ├── country/
│   │   └── [country]/
│   │       └── page.tsx         ← Professor listing + filters
│   ├── professor/
│   │   └── [id]/
│   │       └── page.tsx         ← Professor detail page
│   ├── saved/
│   │   └── page.tsx             ← Bookmarked professors
│   └── guide/
│       └── [country]/
│           └── page.tsx         ← Application guide (static)
│
├── components/                  ← Reusable UI components
│   ├── Map/
│   │   └── WorldMap.tsx         ← react-simple-maps interactive map
│   ├── Professor/
│   │   ├── ProfessorCard.tsx    ← Card shown in listing
│   │   ├── ProfessorFilters.tsx ← Filter sidebar
│   │   └── ProfessorTabs.tsx    ← Tabs on detail page
│   ├── UI/
│   │   ├── BookmarkButton.tsx   ← Reusable bookmark toggle
│   │   ├── StarRating.tsx       ← Star display component
│   │   └── FieldPills.tsx       ← Clickable field selector pills
│   └── Layout/
│       ├── Header.tsx
│       └── Footer.tsx
│
├── data/                        ← Static JSON data files
│   ├── professors.json          ← All professor records
│   ├── universities.json        ← University info per country
│   └── fields.json              ← Engineering field list + slugs
│
├── lib/                         ← Utility functions
│   ├── getProfessors.ts         ← Filter/sort helpers
│   ├── bookmarks.ts             ← localStorage read/write helpers
│   └── types.ts                 ← TypeScript interfaces
│
└── public/                      ← Static assets
    └── flags/                   ← Country flag images (emoji fallback ok)
```

> [AI: Update this tree whenever you add or rename files]

---

## Data Schema

### Professor object (`data/professors.json`)

```typescript
interface Professor {
  id: string;                    // e.g. "au-001"
  name: string;
  gender: "male" | "female";
  title: "Professor" | "Associate Professor" | "Lecturer" | "Senior Lecturer";
  university: string;
  department: string;
  country: "australia" | "hong-kong" | "singapore";
  field: string;                 // matches slug in fields.json
  researchAreas: string[];
  recentProjects: {
    year: number;
    title: string;
    fundingBody: string;
  }[];
  hIndex: number;
  citations: number;
  rating: number;                // 1.0 – 5.0
  reviewCount: number;
  reviews: {
    author: string;
    text: string;
    rating: number;
    year: number;
  }[];
  email: string;
  profileUrl: string;
  photoPlaceholder: true;
}
```

### Field object (`data/fields.json`)

```typescript
interface Field {
  id: string;          // e.g. "computer-science"
  label: string;       // e.g. "Computer Science & Engineering"
  labelZh: string;     // e.g. "计算机科学与工程"
  icon: string;        // emoji e.g. "💻"
}
```

---

## URL Structure

| URL | Page |
|-----|------|
| `/` | Landing page — world map |
| `/country/australia` | Professor list for Australia (all fields) |
| `/country/australia?field=computer-science` | Filtered by field |
| `/professor/au-001` | Professor detail page |
| `/saved` | Bookmarked professors |
| `/guide/australia` | Application guide for Australia |

---

## Key Design Decisions & Rationale

1. **Static JSON over database (v1):** Avoids backend complexity, free hosting, fast iteration. When data grows > 500 professors, migrate to SQLite or Postgres with Prisma.

2. **localStorage for bookmarks:** No login friction for v1. When user accounts are needed, migrate to a `users` table with a `bookmarks` join table, and hydrate from localStorage on first login.

3. **react-simple-maps over Google Maps:** Fully customisable SVG, no API key needed, works offline.

4. **Slug-based routing over IDs:** `/country/australia` is human-readable and SEO-friendly. All slugs are defined in `data/fields.json` and `data/universities.json` — never hardcoded in page files.

5. **Engineering-only for v1:** Reduces data scope. Other faculties can be added by adding entries to `fields.json` — no code changes needed.

---

## Known Issues / TODO

> [AI: Add items here whenever you notice bugs, missing features, or technical debt during a session]

- [ ] *(none yet — project not started)*

---

## How to Add More Professors

1. Open `data/professors.json`
2. Copy an existing professor object
3. Change the `id` to the next number (e.g. `au-009`)
4. Fill in all fields — do not leave any fields empty
5. Save the file — the website will automatically pick up the new data

---

## How to Run Locally

```bash
# Install dependencies (run once)
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## How to Deploy

This project is connected to Vercel. Every push to the `main` branch on GitHub triggers an automatic deployment.

```bash
git add .
git commit -m "describe what you changed"
git push origin main
# → Vercel builds and deploys automatically
```

Live URL: [fill in after first deploy]

---

## Future Roadmap (v2 and beyond)

- [ ] Add more countries: UK, Canada, USA, Germany
- [ ] Add more fields: Business, Medicine, Arts
- [ ] Replace JSON with a real database (Prisma + PostgreSQL)
- [ ] Add web scraper to auto-populate professor data from university websites
- [ ] Add user accounts + cloud-synced bookmarks
- [ ] Add professor self-submission form
- [ ] Add email template generator for contacting professors
- [ ] Add Chinese language toggle for all content
- [ ] Add professor comparison feature (side-by-side)

---

*This file is maintained by both the human owner and AI assistants. AI: always update the "Last Updated" date and "Current Status" section after each session.*
