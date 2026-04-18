# FindMyProf — 找到你理想的海外导师

**Last Updated:** 2026-04-18
**Last Session Completed:** Scroll fix, university affiliation filter, name search bar, SEO metadata, OpenAlex hIndex enrichment, deployed to GitHub

A study-abroad supervisor-finder website for Chinese students seeking postgraduate supervisors in Australia, Hong Kong, and Singapore.

---

## Current Status

**Phase 6 complete. Build passes cleanly. Pushed to GitHub (jfeng1085/findmyprof). Ready to deploy to Vercel.**

Country pages live at `/country/[country]` (statically generated for AU/HK/SG). Each page shows:
- A breadcrumb (首页 > Country)
- 13 field selector pills with emoji icons; selected = filled blue, unselected = gray; updates URL with `?field=`
- A name search bar (filters by first/last name instantly, bilingual placeholder, clear button)
- A sticky left filter sidebar on desktop (collapsible on mobile) with: university (affiliation) checkboxes, title checkboxes, gender radio, min h-index slider, sort dropdown, reset button
- A responsive professor grid (1/2/3 columns) with `ProfessorCard`
- An empty state message when filters return 0 results
- All filtering, searching, and sorting is client-side; no page reload needed

Phase 2 was: homepage splash screen (4s, sessionStorage-gated), interactive world map, sticky navbar.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (brand color palette configured)
- **Map:** react-simple-maps
- **Data:** Static JSON files (no backend in v1)
- **Deployment:** Vercel (free tier) + GitHub
- **Bookmark storage:** localStorage (no login required in v1)
- **OS / Environment:** Windows + VS Code

---

## Target Users

Chinese students seeking PhD/research supervisors abroad. UI should support both Chinese and English labels.

---

## Phase 1 Scope

- **Countries:** Australia, Hong Kong, Singapore
- **Fields:** Engineering disciplines only (8 fields defined)

---

## Completed Phases

- [x] Project scaffolded (Next.js 14, TypeScript, Tailwind, react-simple-maps)
- [x] Tailwind brand color palette configured
- [x] `data/fields.json` — 8 engineering fields with EN + ZH labels
- [x] `lib/utils.ts` — `cn()` class helper and `countryFlag()` emoji helper
- [x] Homepage UI
- [x] Country pages (`/country/australia`, `/country/hong-kong`, `/country/singapore`)
- [x] Professor profile pages (`/professor/[id]` with tabs: Recent Projects, Reviews)
- [ ] Search & filter UI
- [x] Map component
- [x] Bookmarks (localStorage)
- [x] Professor data populated (1,304 professors from ARC Discovery 2026, AU only)
- [x] University data populated (9 universities)
- [x] SEO metadata (Next.js Metadata API) on all pages
- [x] Stub pages for `/saved` and `/guide/[country]`
- [x] Build passes cleanly — ready for Vercel deployment

---

## Architecture Rules

- All pages live in `/app` using Next.js App Router
- All reusable UI lives in `/components`
- All static data lives in `/data` as JSON files
- All helper functions live in `/lib`
- Country slugs: `australia`, `hong-kong`, `singapore`
- Field slugs: lowercase kebab-case (e.g., `computer-science`)
- Professor IDs: prefixed with country code (e.g., `au-001`, `hk-001`, `sg-001`)

---

## File Structure

```
app/
  globals.css                        — Global Tailwind styles
  layout.tsx                         — Root layout (Inter font, zh-CN lang, metadata)
  page.tsx                           — Homepage server component: exports metadata, renders HomePageClient
  HomePageClient.tsx                 — Homepage client component: splash overlay, navbar, world map, tagline, footer
  saved/
    page.tsx                         — Saved professors stub page (localStorage-driven, to be built)
  guide/
    [country]/
      page.tsx                       — Application guide stub page (AU/HK/SG, to be built)
  country/
    [country]/
      page.tsx                       — Country listing page (SSG, server component; reads params + searchParams)
      CountryPageClient.tsx          — Client component: 13 field pills, filter state, professor grid
  professor/
    [id]/
      page.tsx                       — Professor profile page (dynamic SSR, server component)
      ProfessorProfileClient.tsx     — Client component: tabs (研究项目 / 学生评价), project cards with funding + duration
components/
  Layout/
    Footer.tsx                       — Bilingual footer
  Map/
    WorldMap.tsx                     — Interactive world map with AU/HK/SG markers
  Professor/
    ProfessorCard.tsx                — Professor card: avatar, title badge, university, tags, h-index, rating, bookmark
    ProfessorFilters.tsx             — Filter sidebar (desktop sticky) / collapsible panel (mobile)
  Navbar.tsx                         — Sticky bilingual navbar with lang toggle
  HomeHero.tsx                       — Bilingual hero tagline + country cards (unused)
  StatsPanel.tsx                     — Stats panel (unused)
  TaglineBar.tsx                     — Bilingual tagline bar between map and footer
data/
  fields.json                        — 13 subjects (id, label EN, label ZH, icon emoji); matches ARC dataset subjects
  professors.json                    — 1,304 professors (all AU) from ARC Discovery 2026; recentProjects with funding + duration
  universities.json                  — 9 universities (AU×4, HK×3, SG×2) with ranking, city, website
  arc_2026_full.json                 — Raw ARC Discovery 2026 data (1,304 records); source of truth for professors.json
lib/
  utils.ts                           — cn() class helper, countryFlag() emoji helper
  LanguageContext.tsx                — LangProvider + useLang() hook; persists lang to localStorage
  types.ts                           — Shared TypeScript interfaces: Professor, University, Field
  bookmarks.ts                       — localStorage bookmark helpers: getBookmarks, toggleBookmark, isBookmarked
  getProfessors.ts                   — filterProfessors() and sortProfessors() pure functions; FilterState + SortBy types
scripts/
  scrape_unimelb_msd.py              — Scrapes UniMelb MSD faculty pages + enriches from Find an Expert API
  scrape_arc_discovery.py            — Downloads ARC Discovery report, enriches via Semantic Scholar, outputs JSON + review CSV
  convert_arc_to_professors.js       — Converts arc_2026_full.json → professors.json (run: node scripts/convert_arc_to_professors.js)
  README_SCRIPTS.md                  — How to install deps and run each script
  output/                            — Generated JSON + CSV (git-ignored; run script to populate)
Memo/
  Instructions.txt                   — Project setup notes
public/
  .gitkeep                           — Empty; static assets to be added
tailwind.config.ts                   — Tailwind config with brand blue color palette
next.config.mjs                      — Next.js config
tsconfig.json                        — TypeScript config
package.json                         — Dependencies (next, react, react-simple-maps, tailwind)
```

---

## Data Schema

### Professor
```json
{
  "id": "au-001",
  "name": "Sarah Chen",
  "nameZh": "陈秀琳",
  "title": "Professor",
  "gender": "female",
  "university": "unimelb",
  "country": "australia",
  "fields": ["civil"],
  "researchAreas": ["Structural Engineering", "..."],
  "hIndex": 35,
  "citations": 5200,
  "bio": "...",
  "email": "...",
  "profileUrl": "...",
  "accepting": true,
  "projects": [
    { "title": "...", "year": 2022, "funder": "ARC", "description": "..." }
  ],
  "reviews": [
    { "year": 2023, "rating": 5, "text": "..." }
  ]
}
```

### University
```json
{
  "id": "unimelb",
  "name": "University of Melbourne",
  "nameZh": "墨尔本大学",
  "country": "australia",
  "city": "Melbourne",
  "website": "https://www.unimelb.edu.au",
  "ranking": 33
}
```

---

## Known Issues / TODO

- ~~[FIXED] Map used geoNaturalEarth1 — looked like a globe. Changed to geoMercator flat projection.~~
- ~~[FIXED] Zoom not working — wrapped map in ZoomableGroup with minZoom=1, maxZoom=8; added +/− buttons and scroll-wheel support.~~
- ~~[FIXED] Only China was clickable (not AU/SG) because matching used numeric ISO IDs which weren't reliable. Now matches by `geography.properties.NAME === "Australia"/"Singapore"`. HK replaced with a `<Marker>` at [114.1694, 22.3193] since it has no GeoJSON shape.~~
- ~~[FIXED] AU/SG shapes too small/unreliable at world scale — replaced all three country shapes with uniform blue circle Markers.~~
- ~~[FIXED] Zoom centres on Africa — ZoomableGroup now tracks panned `center` state (initialised [15, 5]); `onMoveEnd` updates both coordinates and zoom; +/− buttons preserve center.~~
- Map tooltip uses `position: fixed` with clientX/clientY — works correctly in normal scroll but may misalign inside scrollable iframes
- Footer 3-line text may overflow its 56px fixed height on narrow mobile screens (< 360px wide) — monitor and adjust if needed
- `StatsPanel.tsx` and `HomeHero.tsx` are now unused components — can be deleted in a cleanup pass
- ~~[REMOVED] University pins on map — university listings will be shown on each country page instead~~
- ~~[FIXED] `/guide/australia` and `/saved` nav links are stub routes — pages now created~~
- Navbar links to `/country/australia` etc. not yet updated — still points to `/guide/australia`
- ~~[FIXED] Professor profile pages not created — now at `/professor/[id]` with tabs~~
- `HomeHero.tsx` and `StatsPanel.tsx` are unused — can be deleted in a cleanup pass
- `brand-300` is not in tailwind.config.ts (only 50/100/500/600/700/900 defined) — hover border on ProfessorCard uses `brand-500` instead
- Field pills are always shown even if 0 professors in that country have that field — could add a count badge or hide empty fields in a future pass
- ~~[FIXED] fields.json/professors.json field ID mismatch — both now use the 13 ARC-aligned subject IDs~~
- scripts/output/ should be added to .gitignore (scraped data files)
- professors.json currently has all 1,304 professors as `country: "australia"` — HK/SG data not yet imported
- ~~[FIXED] professors.json has no real hIndex data~~ — 880/1,304 professors enriched via OpenAlex
- professors.json citations still all 0 — OpenAlex rate-limited; retry in a future session with slower delay
- 424 professors not found in OpenAlex (names too common or not indexed)
- professor nameZh is blank for all ARC records — Chinese name lookup not yet implemented
- ~~[FIXED] universities.json missing AU universities~~ — 25 AU universities now in universities.json
- ~~[FIXED] Scroll locked on country/professor pages~~ — removed global overflow:hidden from globals.css
- ~~[FIXED] No university filter in sidebar~~ — affiliation checkboxes added to filter panel
- ~~[FIXED] No name search~~ — search bar added above professor grid
- University affiliation correction pending — ARC data assigns all investigators the lead institution; `fix_university.py` is ready but OpenAlex API hit daily rate limit. Run `python scripts/fix_university.py` next session (tomorrow).
- citations still all 0 — retry in a future session after API cooldown

---

## Deployment

**Live URL:** *(paste your Vercel URL here after first deploy)*

### One-time setup

**1. Initialise git** (run in your project folder in VS Code terminal or Git Bash):
```bash
git init
git add .
git commit -m "Initial commit — FindMyProf v1"
```

**2. Create a GitHub repository** (do this manually):
- Go to github.com → sign in → click the **+** button (top right) → **New repository**
- Name: `findmyprof`
- Visibility: Public (required for free Vercel)
- Leave all checkboxes unchecked (no README, no .gitignore)
- Click **Create repository**

**3. Connect local repo to GitHub and push:**
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/findmyprof.git
git branch -M main
git push -u origin main
```
Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

**4. Connect GitHub to Vercel:**
- Go to vercel.com → sign up / log in with your GitHub account
- Click **Add New Project**
- Find and click **Import** next to `findmyprof`
- Framework preset: **Next.js** (auto-detected — leave as is)
- Click **Deploy**
- Wait ~1 minute → your site is live!

### Updating the site in future

Every time you make changes, run:
```bash
git add .
git commit -m "describe your changes here"
git push
```
Vercel automatically detects the push and redeploys within ~1 minute.

---

## Extensibility Notes (v1 decisions)

- Data is static JSON now; schema is designed to migrate to a database (add `id` fields, normalized relations)
- Country and field slugs are configurable via JSON — adding a new country is a data change, not a code change
- No auth in v1; bookmark state uses localStorage keyed by professor ID
