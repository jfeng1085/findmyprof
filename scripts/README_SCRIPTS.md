# FindMyProf — Data Scripts

This directory contains Python scripts for scraping and building professor data.
Run scripts from inside the `/scripts` folder.

---

## Prerequisites

Python 3.10+ required.  Install dependencies once:

```bash
pip install requests beautifulsoup4
```

---

## scrape_unimelb_msd.py

Scrapes the UniMelb Melbourne School of Design (MSD) faculty pages, filters by
academic title, then enriches each person's record using the Find an Expert API.

### What it does

| Step | Action |
|------|--------|
| A | Fetches 6 MSD people pages (Architecture, Construction Management, Landscape Architecture, Property, Urban Design, Urban Planning) |
| B | Filters to Professors, Associate Professors, Senior Lecturers, Lecturers, and anyone with a "Dr" prefix |
| C | Deduplicates names (Urban Planning and Urban Design may share staff) |
| D | Searches Find an Expert for each person; fetches their profile page |
| E | Extracts title, research areas, recent projects (2022–2025), email |
| F | Standardises title, infers gender from first name (rough pass — review manually) |
| G | Writes two output files |

### Run

```bash
cd scripts
python scrape_unimelb_msd.py
```

The script prints a live progress log and a summary at the end.  It pauses
1.5 seconds between every HTTP request to avoid being rate-limited.

### Output files

Both files are written to `scripts/output/`.

#### `unimelb_msd_professors.json`

Full structured records, one object per professor, ready to be merged into
`/data/professors.json`.  Schema matches the project's Professor type in
`lib/types.ts`.  Fields that couldn't be scraped are set to sensible defaults
(`hIndex: 0`, `citations: 0`, `reviewsNote: "暫無評價"`, etc.).

IDs start at `au-011` (continuing from the existing 10 professors).

#### `unimelb_msd_summary.csv`

Lightweight review file with columns:

| Column | Description |
|--------|-------------|
| id | Generated professor ID (au-011, au-012, …) |
| name | Full name as scraped |
| title | Standardised title |
| field | One of the 6 architecture field IDs |
| email | Email if found on Find an Expert |
| profileUrl | Find an Expert profile URL |

Open in Excel to do a quick manual review:
- Correct any wrong gender assignments
- Check that the field assignment is right (the Urban Design / Urban Planning
  split sometimes needs manual adjustment)
- Verify titles that were defaulted to "Lecturer" because only a "Dr" prefix
  was found

### After reviewing

1. Copy the corrected records from `unimelb_msd_professors.json` into
   `/data/professors.json` (append to the existing array).
2. Update `hIndex` and `citations` manually where you have data.
3. Run `npm run build` in the project root to check for type errors.

### Known limitations

- Gender inference is a rough heuristic (name endings).  Always review the CSV.
- `hIndex` and `citations` are set to `0` — populate these manually or via a
  separate enrichment script (e.g. from Google Scholar / Semantic Scholar).
- Find an Expert search matches by name; a common name may return the wrong
  person.  Cross-check the profile URL in the CSV.
- MSD page HTML structure changes occasionally.  If the script returns 0 results
  for a page, the selectors in `scrape_msd_page()` may need updating.

---

## scrape_arc_discovery.py

Downloads the ARC Discovery Projects public report, extracts investigators from
seven target Australian universities, enriches their profiles via Semantic Scholar,
maps them to the six architecture field IDs in `data/fields.json`, and writes two
output files for import and manual review.

### What it does

| Step | Action |
|------|--------|
| A | Downloads the ARC Discovery CSV/Excel report from the public RMS URL |
| B | Extracts all unique investigators at the 7 target universities |
| C | Searches Semantic Scholar for each investigator (h-index, citations, recent papers) |
| D | Extracts 5–10 research keywords from ARC project titles + Semantic Scholar paper titles |
| E | Maps each investigator to the closest field ID via keyword scoring |
| F | Formats each investigator as a `professors.json`-compatible object (IDs from `au-011`) |
| G | Saves JSON + CSV and prints a summary |

### Prerequisites

```bash
pip install requests pandas openpyxl
```

### Run

```bash
cd scripts
python scrape_arc_discovery.py
```

The script pauses **2 seconds** between every Semantic Scholar API call to stay within rate limits.
Progress is printed live. A full run with 100+ investigators takes ~5–10 minutes.

### Output files

Both files are written to `scripts/output/`.

#### `arc_investigators_full.json`

Array of professor objects ready to be merged into `/data/professors.json`.
Schema matches the project's `Professor` type in `lib/types.ts`.

IDs continue from `au-011` (the UniMelb MSD scraper ends at au-010 region).
Fields that couldn't be determined are set to safe defaults (`hIndex: 0`,
`gender: "unknown"`, `email: ""`, `reviewsNote: "暫無評價"`).

#### `arc_investigators_review.csv`

| Column | Description |
|--------|-------------|
| id | Generated professor ID (au-011, au-012, …) |
| name | Full name from ARC report |
| university | University code (unimelb, usyd, unsw, …) |
| field | Assigned field ID |
| researchAreas | Comma-separated extracted keywords |
| hIndex | From Semantic Scholar (0 = not found) |
| arcProjects | Pipe-separated ARC project titles |
| needsReview | TRUE if field was defaulted, hIndex=0, or SS match failed |

### Review workflow

Open `arc_investigators_review.csv` in Excel:
1. Filter `needsReview = TRUE` — check field assignments and correct if needed
2. Cross-check names with `hIndex = 0` manually (Semantic Scholar may use a different name variant)
3. Correct `gender` in the JSON file after review (field is set to `"unknown"` by default)

After reviewing:
1. Merge corrected records from `arc_investigators_full.json` into `/data/professors.json`
2. Run `npm run build` in the project root to check for type errors

### Known limitations

- Semantic Scholar name matching is fuzzy. Common names (e.g. "Wei Zhang") may return the wrong author — check the review CSV.
- Gender is always `"unknown"` — populate manually or add a name-gender lookup step.
- Field mapping is keyword-based; interdisciplinary researchers may land in the wrong field.
- The ARC report column names change between years. If the script prints `"Could not find investigator column"`, check the `_COL_ALIASES` dict in the script and add the actual column name.

---

*Last updated: 2026-04-18*
