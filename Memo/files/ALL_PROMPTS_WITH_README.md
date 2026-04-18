# FindMyProf — Claude Code Prompts (Complete Set)
# Each prompt includes README update instructions.
# Always paste GLOBAL_SESSION_PRIMER.md FIRST, then paste the relevant prompt below.

================================================================================
PROMPT 1 — Project Initialisation
================================================================================

Read the README.md if it exists. If it does not exist, this is Session 1 — proceed.

I want to build a study-abroad supervisor-finder website for Chinese students.
Tech stack: Next.js 14 (App Router), Tailwind CSS, TypeScript.
Target countries for v1: Australia, Hong Kong, Singapore.
Target fields: Engineering disciplines only.

Please do the following in order:

STEP 1 — Scaffold the project:
Run: npx create-next-app@latest findmyprof --typescript --tailwind --app --no-src-dir --import-alias "@/*"
Then cd into findmyprof.

STEP 2 — Install extra dependencies:
npm install react-simple-maps
npm install --save-dev @types/react-simple-maps

STEP 3 — Create this folder structure (create empty placeholder files):
- /app/country/[country]/page.tsx
- /app/professor/[id]/page.tsx
- /app/saved/page.tsx
- /app/guide/[country]/page.tsx
- /components/Map/WorldMap.tsx
- /components/Professor/ProfessorCard.tsx
- /components/Professor/ProfessorFilters.tsx
- /components/UI/BookmarkButton.tsx
- /components/UI/StarRating.tsx
- /components/Layout/Header.tsx
- /components/Layout/Footer.tsx
- /lib/getProfessors.ts
- /lib/bookmarks.ts
- /lib/types.ts
- /data/professors.json  (empty array: [])
- /data/universities.json  (empty array: [])

STEP 4 — Create /data/fields.json with exactly these 8 engineering fields:
[
  { "id": "computer-science", "label": "Computer Science & Engineering", "labelZh": "计算机科学与工程", "icon": "💻" },
  { "id": "electrical-engineering", "label": "Electrical & Electronic Engineering", "labelZh": "电气与电子工程", "icon": "⚡" },
  { "id": "civil-engineering", "label": "Civil & Structural Engineering", "labelZh": "土木与结构工程", "icon": "🏗️" },
  { "id": "mechanical-engineering", "label": "Mechanical Engineering", "labelZh": "机械工程", "icon": "⚙️" },
  { "id": "biomedical-engineering", "label": "Biomedical Engineering", "labelZh": "生物医学工程", "icon": "🧬" },
  { "id": "chemical-engineering", "label": "Chemical Engineering", "labelZh": "化学工程", "icon": "🧪" },
  { "id": "environmental-engineering", "label": "Environmental Engineering", "labelZh": "环境工程", "icon": "🌿" },
  { "id": "data-science", "label": "Data Science & AI", "labelZh": "数据科学与人工智能", "icon": "📊" }
]

STEP 5 — Define TypeScript interfaces in /lib/types.ts covering:
Professor, University, Field, Review, Project (match the schema in README.md exactly).

STEP 6 — Create README.md in the project root.
Copy the template from README_TEMPLATE.md exactly.
Then update these fields:
- "Last Updated": today's date
- "Last Session Completed": "Phase 0 — Project Initialisation"
- "Current Status": "Project scaffolded. All folders and placeholder files created. Dependencies installed. fields.json populated. types.ts created. README initialised."
- Tick the checkbox: [x] Phase 0

STEP 7 — Verify:
Run: npm run dev
Confirm it compiles without errors (the pages will be blank — that is expected).
If there are TypeScript errors, fix them before finishing.

Report: list every file created and confirm npm run dev passes.

================================================================================
PROMPT 2 — Seed Data
================================================================================

Read README.md first. Confirm Phase 0 is complete before proceeding.

Create realistic seed data in /data/professors.json.

Requirements:
- 10 professors total: 4 from Australia, 3 from Hong Kong, 3 from Singapore
- Cover at least 5 different engineering fields from fields.json
- Mix of gender (at least 4 female professors)
- Mix of titles (at least 1 of each: Professor, Associate Professor, Senior Lecturer, Lecturer)
- Each professor must have: 3 recent projects (years 2021–2024), 3 reviews, realistic h-index (8–45), realistic citations (200–8000)
- Australian universities to use: University of Melbourne, University of Sydney, UNSW Sydney, Monash University
- Hong Kong universities to use: HKU, HKUST, CUHK
- Singapore universities to use: NUS, NTU
- All IDs must follow the format: au-001, au-002, hk-001, sg-001 etc.
- Reviews should feel authentic — mix of praise about supervision style, research depth, responsiveness
- Funding bodies to use (realistic): ARC (Australian Research Council), RGC (Hong Kong), NRF (Singapore), industry partners

Also create /data/universities.json with one entry per university above, including:
{ "id": string, "name": string, "country": string, "city": string, "website": string, "ranking": number }

After creating the data files, update README.md:
- "Last Updated": today's date
- "Last Session Completed": "Phase 1 — Seed Data"
- "Current Status": describe how many professors, which universities, which fields are covered
- Tick: [x] Phase 1
- Update the File Structure section to show professors.json and universities.json are now populated

================================================================================
PROMPT 3 — Landing Page (World Map)
================================================================================

Read README.md first. Confirm Phases 0 and 1 are complete before proceeding.

Create the landing page at /app/page.tsx and the WorldMap component at /components/Map/WorldMap.tsx.

WORLDMAP COMPONENT requirements:
- Use react-simple-maps with a Robinson projection
- Show the full world map
- Highlighted countries (clickable): Australia, Hong Kong (shown as part of China but clickable), Singapore
- Non-highlighted countries: muted gray (#D1D5DB)
- Highlighted country default colour: soft blue (#BFDBFE)
- Highlighted country hover colour: medium blue (#3B82F6)
- On hover: show a tooltip with country name (in Chinese) + "X位导师可查看" (X professors available)
- Professor counts should be dynamically read from professors.json
- On click: use Next.js router to navigate to /country/[countrySlug]
- Country slugs: Australia → "australia", China (HK) → "hong-kong", Singapore → "singapore"
- The component must be client-side ("use client") because it uses interactivity

LANDING PAGE (/app/page.tsx) requirements:
- Full-viewport hero section with the WorldMap component centred
- Header: site name "FindMyProf" (large, bold) + tagline "找到你理想的海外导师" (Chinese, subtitle)
- Below the map: 3 country cards showing country name (Chinese + English), flag emoji, and professor count
- Each country card links to /country/[slug]
- Navigation bar at top: "FindMyProf" logo | "申请攻略" link to /guide/australia | "已收藏" link to /saved
- Mobile responsive: map shrinks gracefully, country cards stack vertically

Update README.md after completion:
- "Last Updated": today's date
- "Last Session Completed": "Phase 2 — Landing Page"
- "Current Status": describe what works, any known limitations (e.g. mobile behaviour)
- Tick: [x] Phase 2
- Add WorldMap.tsx and updated page.tsx to the File Structure section
- Add any issues discovered to "Known Issues / TODO"

================================================================================
PROMPT 4 — Professor Listing Page + Filters
================================================================================

Read README.md first. Confirm Phases 0–2 are complete before proceeding.

Create the professor listing page at /app/country/[country]/page.tsx and the filter/card components.

PAGE requirements:
- Read the [country] param from the URL
- Read professors from /data/professors.json filtered by country
- Read field selection from URL query param: ?field=computer-science
- If no field is selected, show all professors for that country
- Page title: "[Country name in Chinese] — 选择研究方向"
- Breadcrumb: 首页 > [Country]

FIELD SELECTOR (at top of page):
- Show all 8 fields from fields.json as pill buttons
- Pill includes the icon and labelZh
- Selected pill: filled blue background, white text
- Unselected pill: light gray, dark text
- Clicking a pill updates the URL query param (?field=...) without page reload
- An "全部" (All) pill at the start clears the field filter

PROFESSOR CARDS (/components/Professor/ProfessorCard.tsx):
- Responsive grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Each card shows: avatar placeholder (initials in a coloured circle), name, title badge, university, department, research area tags (max 3 shown), h-index, star rating + review count, bookmark icon button
- Title badge colours: Professor=purple, Associate Professor=blue, Senior Lecturer=teal, Lecturer=gray
- Clicking the card navigates to /professor/[id]
- Bookmark button calls the bookmarks.ts helper and toggles state with a visual filled/unfilled star icon

FILTER SIDEBAR (/components/Professor/ProfessorFilters.tsx):
- On desktop: sticky left sidebar (240px wide)
- On mobile: collapsible panel with a "筛选" button to open
- Filter options:
  - Title: checkboxes for each title (Professor, Associate Professor, Senior Lecturer, Lecturer)
  - Gender: radio buttons — 全部 / 男 / 女
  - Minimum h-index: range slider 0–60, shows current value
  - Sort by: dropdown — 综合评分 / 引用数 / H指数 / 姓名
- Filters are applied client-side (no page reload)
- "重置筛选" (Reset) button at bottom

HELPERS to create/update:
- /lib/getProfessors.ts: functions filterProfessors(professors, filters) and sortProfessors(professors, sortBy)

Update README.md after completion:
- "Last Updated": today's date
- "Last Session Completed": "Phase 3 — Professor Listing + Filters"
- "Current Status": describe what is working, note any filter edge cases
- Tick: [x] Phase 3
- Update File Structure with all new components
- Add any issues to "Known Issues / TODO"

================================================================================
PROMPT 5 — Professor Detail Page
================================================================================

Read README.md first. Confirm Phases 0–3 are complete before proceeding.

Create the professor detail page at /app/professor/[id]/page.tsx.

PAGE LAYOUT (desktop: two-column, mobile: single column):

LEFT COLUMN (profile card, sticky on desktop):
- Large avatar circle with initials (first letter of first + last name), background colour based on name hash
- Name (large, bold)
- Title badge (same colour scheme as listing page)
- University name + department
- Country flag emoji + country name in Chinese
- Research areas as tags (all of them, not just 3)
- h-index and citations as stat pills: "H指数: 24" | "引用数: 3,420"
- Email button: "发送邮件" (opens mailto:)
- Bookmark toggle button: "收藏" / "已收藏" (filled star)

RIGHT COLUMN (tabbed content):
Use a client-side tab component (/components/Professor/ProfessorTabs.tsx)

TAB 1 — "近期项目" (Recent Projects):
- List all projects from professor.recentProjects
- Each entry: year badge + project title + funding body tag
- Sort by year descending

TAB 2 — "学生评价" (Reviews):
- Overall rating: large star display + average score + total review count
- Rating breakdown: 5 bars showing percentage of each star rating (1–5)
- Individual review cards: reviewer name (anonymous style e.g. "匿名学生 2023"), year, star rating, review text
- If no reviews: show "暂无评价" placeholder

TAB 3 — "申请指南" (Application Tips):
- Static content section with tips specific to this professor's country
- Include: suggested email subject line, what to mention in cold email, typical response time note
- Link to the full /guide/[country] page: "查看完整[国家]申请攻略 →"

BOTTOM SECTION — "相似导师" (Similar Professors):
- Show 3 professor cards (reuse ProfessorCard component) from the same field
- Exclude the current professor
- Section title: "同领域导师推荐"

Update README.md after completion:
- "Last Updated": today's date
- "Last Session Completed": "Phase 4 — Professor Detail Page"
- "Current Status": describe what is working, note any layout issues on mobile
- Tick: [x] Phase 4
- Update File Structure
- Add any issues to "Known Issues / TODO"

================================================================================
PROMPT 6 — Saved Page + Application Guide Pages
================================================================================

Read README.md first. Confirm Phases 0–4 are complete before proceeding.

TASK A — Saved page (/app/saved/page.tsx):

- Read bookmarked professor IDs from localStorage using the helper in /lib/bookmarks.ts
- This page must be a Client Component ("use client") because it reads localStorage
- Look up full professor data from professors.json for each saved ID
- Display saved professors as a grid of ProfessorCard components (reuse existing component)
- Show total count: "已收藏 X 位导师"
- Empty state: friendly message "还没有收藏任何导师" + an illustrated empty state + button "探索导师地图" linking to /

TASK B — Application guide pages (/app/guide/[country]/page.tsx):

Create static content for all 3 countries. Each page should have:

1. Breadcrumb: 首页 > [Country] > 申请攻略
2. Page title: "[Country]研究生申请全攻略"
3. Last updated date (hardcode current date)
4. Sections (use an accordion component — each section expands/collapses):

   SECTION 1 — 学制概览 (System Overview)
   Describe the graduate system: coursework Masters vs research Masters vs PhD, typical duration, difference between supervisor-led and course-based programmes.

   SECTION 2 — 申请时间线 (Timeline)
   Key dates: application opens, deadline, offer letters, semester start. Present as a visual timeline.

   SECTION 3 — 申请材料清单 (Documents Checklist)
   Formatted as a checklist with checkboxes (HTML checkbox inputs, not functional). Include: transcripts, English test scores, CV, research proposal, reference letters, personal statement.

   SECTION 4 — 如何联系导师 (Contacting Professors)
   Step-by-step guide. Include a ready-to-use email template in Chinese that students can copy and personalise.

   SECTION 5 — 奖学金机会 (Scholarships)
   List 3–4 major scholarships with name, value, eligibility, deadline. 
   - Australia: APA, RTP, university-specific
   - Hong Kong: HKPFS, university scholarships
   - Singapore: NUS Research Scholarship, NTU RSS

   SECTION 6 — 签证须知 (Visa Basics)
   Brief overview of student visa process, key requirements, processing time.

5. At the bottom: "返回[Country]导师列表 →" link

Create a reusable /components/UI/Accordion.tsx component for the sections.

Update README.md after completion:
- "Last Updated": today's date
- "Last Session Completed": "Phase 5 — Saved Page + Application Guides"
- "Current Status": describe what is working
- Tick: [x] Phase 5
- Update File Structure with Accordion.tsx and guide pages
- Add any issues to "Known Issues / TODO"

================================================================================
PROMPT 7 — Final Polish + Deployment
================================================================================

Read README.md first. Confirm Phases 0–5 are complete before proceeding.

TASK 1 — Global layout polish (/app/layout.tsx):
- Add a persistent Header component with: logo "FindMyProf", nav links (申请攻略, 已收藏), responsive hamburger menu on mobile
- Add a Footer component with: site name, tagline, "数据最后更新: [month year]", GitHub link placeholder
- Ensure consistent font (use next/font with a clean sans-serif like Inter or Geist)
- Add a global loading skeleton so pages don't flash empty

TASK 2 — SEO and meta tags:
Add proper metadata to each page using Next.js Metadata API:
- / → title: "FindMyProf — 找到你理想的海外导师", description: "帮助中国学生找到澳大利亚、香港和新加坡的工程学科研究生导师"
- /country/[country] → title: "[Country]导师列表 — FindMyProf"
- /professor/[id] → title: "[Professor Name] — FindMyProf", description: first 120 chars of research areas
- /saved → title: "已收藏的导师 — FindMyProf"
- /guide/[country] → title: "[Country]申请攻略 — FindMyProf"

TASK 3 — Build check:
Run: npm run build
Fix all TypeScript errors and build warnings before proceeding.
Report any errors found and the fixes applied.

TASK 4 — Update README.md for final handoff:
- "Last Updated": today's date
- "Last Session Completed": "Phase 6 — Final Polish"
- "Current Status": "Build passes. All 6 phases complete. Ready for deployment."
- Tick: [x] Phase 6
- Fill in the "How to Deploy" live URL section with placeholder "[fill after deploy]"
- Make sure all File Structure entries are accurate
- Review "Known Issues / TODO" and mark any resolved items

TASK 5 — Deployment instructions:
After the build passes, give me exact step-by-step instructions (Windows-specific) to:
1. Initialise a git repository in the project folder
2. Create a new repository on GitHub (provide the exact commands)
3. Push the code to GitHub
4. Connect the GitHub repo to Vercel (describe the UI steps)
5. Trigger the first deployment
6. Find the live URL

Also explain: how to update the site after making changes (the git push → auto-deploy workflow).

================================================================================
END OF PROMPTS
================================================================================

USAGE REMINDER:
1. Open a NEW Claude Code session
2. Paste GLOBAL_SESSION_PRIMER.md content FIRST
3. Then paste the relevant prompt above
4. Claude will read README.md, do the task, then update README.md
5. Repeat for each phase
