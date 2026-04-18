"""
scrape_arc_discovery.py
-----------------------
Downloads the ARC Discovery Projects report, extracts investigators from
target Australian universities, enriches their profiles via Semantic Scholar,
maps them to fields.json field IDs, and outputs:
  - scripts/output/arc_investigators_full.json   (professor objects)
  - scripts/output/arc_investigators_review.csv  (manual review sheet)

Run from the /scripts directory:
  python scrape_arc_discovery.py
"""

import csv
import io
import json
import os
import re
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

import requests

# Force UTF-8 output on Windows (avoids cp1252 encode errors for box-drawing chars)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── paths ──────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

RAW_CSV  = OUTPUT_DIR / "arc_discovery_raw.csv"
RAW_XLSX = OUTPUT_DIR / "arc_discovery_raw.xlsx"
OUT_JSON = OUTPUT_DIR / "arc_investigators_full.json"
OUT_CSV  = OUTPUT_DIR / "arc_investigators_review.csv"

ARC_URL = (
    "https://rms.arc.gov.au/RMS/Report/Download/Report/"
    "1b0c8b2e-7bb0-4f2d-8f52-ad207cfbb41d/289"
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── university mapping ──────────────────────────────────────────────────────
UNI_MAP = {
    "University of Melbourne":          "unimelb",
    "University of Sydney":             "usyd",
    "UNSW Sydney":                      "unsw",
    "University of New South Wales":    "unsw",
    "Monash University":                "monash",
    "University of Queensland":         "uq",
    "University of Adelaide":           "uadelaide",
    "Australian National University":   "anu",
}

TARGET_UNIS = set(UNI_MAP.keys())

# ── field keyword mapping ───────────────────────────────────────────────────
FIELD_KEYWORDS = {
    "architectural-design":   ["architect", "building", "design", "facade",
                                "housing", "heritage", "construction", "spatial"],
    "urban-planning":         ["urban", "city", "planning", "transport", "land",
                                "zoning", "infrastructure", "metropolitan"],
    "landscape-architecture": ["landscape", "park", "garden", "green",
                                "ecology", "vegetation", "biodiversity", "open space"],
    "interior-design":        ["interior", "space", "lighting", "furniture",
                                "workplace", "indoor"],
    "construction-management":["construction", "project management", "procurement",
                                "contractor", "building information", "bim", "cost"],
    "property":               ["property", "real estate", "housing market",
                                "valuation", "investment", "rent", "mortgage"],
}
DEFAULT_FIELD = "architectural-design"

# ── stopwords for keyword extraction ───────────────────────────────────────
STOPWORDS = {
    "the","and","of","in","for","a","an","to","with","on","at","by","from",
    "as","is","are","was","were","be","been","being","have","has","had","do",
    "does","did","will","would","could","should","may","might","shall","can",
    "need","that","this","these","those","it","its","we","our","they","their",
    "project","research","study","using","used","use","based","new","high","low",
    "large","small","data","system","analysis","australian","australia","into",
    "which","what","how","when","where","who","than","more","also","such","other",
    "between","within","across","through","during","under","over","after","before",
    "further","about","through","between","against","along","among","around",
    "during","until","while","although","because","since","unless","whether",
    "both","each","few","more","most","no","not","only","same","so","very",
    "just","but","or","if","all","any","some","one","two","three","four","five",
}


# ══════════════════════════════════════════════════════════════════════════════
# STEP A — Download the ARC report
# ══════════════════════════════════════════════════════════════════════════════

def _manual_download_instructions():
    print("""
  *** MANUAL DOWNLOAD REQUIRED ***

  The ARC RMS download link requires an authenticated browser session.
  Please download the file manually:

  1. Open this URL in your browser (must be logged in, or use the public report):
       https://rms.arc.gov.au/RMS/Report/Download/Report/1b0c8b2e-7bb0-4f2d-8f52-ad207cfbb41d/289

     If that requires login, use the public ARC Grants Dataset instead:
       https://www.arc.gov.au/sites/default/files/2024-10/ARC_DP_Grants_2024.xlsx
     (or search: arc.gov.au "Discovery Projects" "excel" for the latest year)

  2. Save the file as one of:
       scripts/output/arc_discovery_raw.xlsx   (preferred)
       scripts/output/arc_discovery_raw.csv

  3. Re-run this script — it will detect and use the local file.
""")


def download_arc_report():
    import pandas as pd
    print("\n─── STEP A: Downloading ARC Discovery report ───")

    # If a local file already exists (from a previous run or manual download), use it
    for local_path, reader in [(RAW_XLSX, _read_excel), (RAW_CSV, _read_csv)]:
        if local_path.exists() and local_path.stat().st_size > 10_000:
            print(f"  Found local file: {local_path} ({local_path.stat().st_size:,} bytes)")
            # Quick sanity-check: make sure it's not an HTML file
            try:
                sample = local_path.read_bytes()[:100]
                if b"<!DOCTYPE" in sample or b"<html" in sample:
                    print(f"  Skipping {local_path.name} — looks like HTML, not data.")
                    local_path.unlink()
                    continue
            except Exception:
                pass
            try:
                return reader(local_path)
            except Exception as e:
                print(f"  Could not read {local_path.name}: {e} — re-downloading.")

    # Attempt network download
    print(f"  Fetching: {ARC_URL}")
    try:
        resp = requests.get(ARC_URL, headers=HEADERS, timeout=60)
        resp.raise_for_status()
    except Exception as e:
        _manual_download_instructions()
        raise SystemExit(f"Download failed: {e}")

    content_type = resp.headers.get("Content-Type", "")
    content      = resp.content
    print(f"  HTTP {resp.status_code} | Content-Type: {content_type} | {len(content):,} bytes")

    # Detect HTML (auth-wall or redirect)
    if b"<!DOCTYPE" in content[:200] or b"<html" in content[:200]:
        _manual_download_instructions()
        raise SystemExit(
            "Server returned an HTML page instead of data.\n"
            "The URL requires authentication. See instructions above."
        )

    # Detect format from Content-Type or XLSX magic bytes (PK zip header)
    is_xlsx = (
        "spreadsheetml" in content_type
        or "excel" in content_type
        or content[:4] == b"PK\x03\x04"
    )

    if is_xlsx:
        RAW_XLSX.write_bytes(content)
        print(f"  Saved as Excel: {RAW_XLSX}")
        return _read_excel(RAW_XLSX)
    else:
        RAW_CSV.write_bytes(content)
        print(f"  Saved as CSV: {RAW_CSV}")
        return _read_csv(RAW_CSV)


def _read_excel(path):
    try:
        import pandas as pd
        df = pd.read_excel(path, engine="openpyxl")
    except Exception as e:
        raise RuntimeError(f"Failed to read Excel: {e}")
    _print_preview(df)
    return df


def _read_csv(path):
    import pandas as pd
    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        for sep in (",", "\t", ";"):
            try:
                df = pd.read_csv(path, encoding=enc, sep=sep,
                                 on_bad_lines="skip", engine="python")
                if len(df.columns) >= 3:
                    _print_preview(df)
                    return df
            except Exception:
                continue
    raise RuntimeError(
        f"Could not parse {path.name} as CSV with any encoding/separator. "
        "Try saving the file as UTF-8 CSV from Excel."
    )


def _print_preview(df):
    print(f"\n  Columns ({len(df.columns)}): {list(df.columns)}")
    print(f"  Rows: {len(df)}")
    print("\n  First 3 rows:")
    print(df.head(3).to_string())


# ══════════════════════════════════════════════════════════════════════════════
# STEP B — Extract investigators
# ══════════════════════════════════════════════════════════════════════════════

# Column name candidates (ARC report columns vary by year)
_COL_ALIASES = {
    "investigator": ["Investigator", "CI Name", "Chief Investigator",
                     "Investigator Name", "Name"],
    "institution":  ["Institution", "Administering Institution", "University",
                     "Organisation", "Organization"],
    "title":        ["Project Title", "Title", "Grant Title"],
    "year":         ["Start Year", "Year", "Funding Year", "Commencing Year",
                     "Year Funded"],
    "role":         ["Role", "CI Role", "Investigator Role"],
}


def _find_col(df, key):
    candidates = _COL_ALIASES.get(key, [key])
    cols_lower  = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand in df.columns:
            return cand
        if cand.lower() in cols_lower:
            return cols_lower[cand.lower()]
    # Partial match
    for cand in candidates:
        for col in df.columns:
            if cand.lower() in col.lower():
                return col
    return None


def _match_uni(raw_institution):
    if not isinstance(raw_institution, str):
        return None, None
    inst = raw_institution.strip()
    for target, code in UNI_MAP.items():
        if target.lower() in inst.lower() or inst.lower() in target.lower():
            return target, code
    return None, None


def extract_investigators(df):
    print("\n─── STEP B: Extracting investigators ───")

    col_inv  = _find_col(df, "investigator")
    col_inst = _find_col(df, "institution")
    col_titl = _find_col(df, "title")
    col_year = _find_col(df, "year")
    col_role = _find_col(df, "role")

    print(f"  Mapped columns → investigator: {col_inv!r}, institution: {col_inst!r}, "
          f"title: {col_titl!r}, year: {col_year!r}, role: {col_role!r}")

    if not col_inv or not col_inst:
        raise ValueError(
            "Could not find investigator or institution column. "
            f"Available columns: {list(df.columns)}"
        )

    total_rows = len(df)
    investigators = defaultdict(lambda: {
        "name": "",
        "uni_name": "",
        "uni_code": "",
        "projects": [],
        "years": set(),
        "roles": set(),
    })

    for _, row in df.iterrows():
        name = str(row.get(col_inv, "")).strip()
        if not name or name.lower() in ("nan", ""):
            continue

        uni_name, uni_code = _match_uni(row.get(col_inst, ""))
        if not uni_code:
            continue

        key = (name, uni_code)
        rec = investigators[key]
        rec["name"]     = name
        rec["uni_name"] = uni_name
        rec["uni_code"] = uni_code

        proj_title = str(row.get(col_titl, "")).strip() if col_titl else ""
        year_val   = row.get(col_year, 0) if col_year else 0
        role_val   = str(row.get(col_role, "")).strip() if col_role else ""

        if proj_title and proj_title.lower() != "nan":
            try:
                year_int = int(float(str(year_val)))
            except (ValueError, TypeError):
                year_int = 0
            rec["projects"].append({"title": proj_title, "year": year_int})
            if year_int:
                rec["years"].add(year_int)
        if role_val and role_val.lower() != "nan":
            rec["roles"].add(role_val)

    result = list(investigators.values())
    print(f"  Total rows in file: {total_rows}")
    print(f"  Unique investigators at target unis: {len(result)}")

    by_uni = Counter(r["uni_code"] for r in result)
    for uni, cnt in sorted(by_uni.items()):
        print(f"    {uni}: {cnt}")

    return result


# ══════════════════════════════════════════════════════════════════════════════
# STEP C — Enrich via Semantic Scholar
# ══════════════════════════════════════════════════════════════════════════════

SS_URL = "https://api.semanticscholar.org/graph/v1/paper/search"

UNI_SHORT = {
    "unimelb":  "Melbourne",
    "usyd":     "Sydney",
    "unsw":     "UNSW",
    "monash":   "Monash",
    "uq":       "Queensland",
    "uadelaide":"Adelaide",
    "anu":      "Australian National",
}


def enrich_semantic_scholar(investigators):
    print("\n─── STEP C: Enriching via Semantic Scholar ───")
    total   = len(investigators)
    matched = 0

    for i, rec in enumerate(investigators, 1):
        name      = rec["name"]
        uni_short = UNI_SHORT.get(rec["uni_code"], rec["uni_code"])
        parts     = name.split()
        first     = parts[0] if parts else name
        last      = parts[-1] if len(parts) > 1 else name

        print(f"  [{i}/{total}] {name} ({uni_short})", end=" ... ", flush=True)

        params = {
            "query":  f"{first} {last} {uni_short}",
            "fields": "authors,authors.hIndex,authors.affiliations,"
                      "authors.citationCount,authors.papers",
            "limit":  5,
        }

        try:
            resp = requests.get(SS_URL, params=params, timeout=20)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"ERROR ({e})")
            _set_ss_defaults(rec)
            time.sleep(2)
            continue

        best_author = _best_author_match(name, uni_short, data)

        if best_author:
            rec["hIndex"]    = best_author.get("hIndex") or 0
            rec["citations"] = best_author.get("citationCount") or 0
            rec["ss_id"]     = best_author.get("authorId", "")
            rec["ss_papers"] = [
                p.get("title", "") for p in (best_author.get("papers") or [])[:5]
            ]
            rec["ss_matched"] = True
            matched += 1
            print(f"h={rec['hIndex']} citations={rec['citations']}")
        else:
            print("no match")
            _set_ss_defaults(rec)

        time.sleep(2)

    print(f"\n  Semantic Scholar: {matched}/{total} matched")
    return investigators


def _set_ss_defaults(rec):
    rec["hIndex"]     = 0
    rec["citations"]  = 0
    rec["ss_id"]      = ""
    rec["ss_papers"]  = []
    rec["ss_matched"] = False


def _best_author_match(target_name, uni_short, data):
    papers = data.get("data", [])
    target_lower = target_name.lower()

    candidates = []
    for paper in papers:
        for author in paper.get("authors", []):
            a_name = author.get("name", "").lower()
            # Name similarity check
            target_parts = set(target_lower.split())
            author_parts = set(a_name.split())
            overlap = len(target_parts & author_parts)
            if overlap >= min(2, len(target_parts)):
                # Check affiliation
                affiliations = " ".join(
                    a.get("name", "") for a in (author.get("affiliations") or [])
                ).lower()
                aff_match = uni_short.lower() in affiliations
                candidates.append((overlap + (2 if aff_match else 0), author))

    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0][1]


# ══════════════════════════════════════════════════════════════════════════════
# STEP D — Extract research keywords
# ══════════════════════════════════════════════════════════════════════════════

def extract_keywords(rec):
    texts = []
    for proj in rec.get("projects", []):
        texts.append(proj.get("title", ""))
    texts.extend(rec.get("ss_papers", []))

    combined = " ".join(texts).lower()
    # Tokenise — keep only alpha words 3+ chars
    words = re.findall(r"[a-z]{3,}", combined)
    freq  = Counter(w for w in words if w not in STOPWORDS)

    keywords = [w for w, _ in freq.most_common(20)]
    return keywords[:10] if len(keywords) >= 5 else keywords


# ══════════════════════════════════════════════════════════════════════════════
# STEP E — Map to field ID
# ══════════════════════════════════════════════════════════════════════════════

def map_field(keywords, rec):
    combined = " ".join(keywords).lower()
    for proj in rec.get("projects", []):
        combined += " " + proj.get("title", "").lower()

    scores = {}
    for field_id, kws in FIELD_KEYWORDS.items():
        score = sum(1 for kw in kws if kw in combined)
        scores[field_id] = score

    best_field = max(scores, key=scores.get)
    if scores[best_field] == 0:
        return DEFAULT_FIELD, True  # defaulted, flag for review

    return best_field, False


# ══════════════════════════════════════════════════════════════════════════════
# STEP F — Format output objects
# ══════════════════════════════════════════════════════════════════════════════

def format_professors(investigators):
    print("\n─── STEP F: Formatting professor objects ───")
    professors = []
    start_id   = 11  # au-011 continues from existing 10 professors

    for i, rec in enumerate(investigators):
        keywords        = extract_keywords(rec)
        field_id, flagged = map_field(keywords, rec)
        rec["field"]    = field_id
        rec["flagged"]  = flagged or not rec.get("ss_matched", False) or rec.get("hIndex", 0) == 0

        recent_projects = sorted(
            rec.get("projects", []),
            key=lambda p: p.get("year", 0),
            reverse=True,
        )[:5]

        prof = {
            "id":           f"au-{start_id + i:03d}",
            "name":         rec["name"],
            "gender":       "unknown",
            "title":        "Professor",
            "university":   rec["uni_code"],
            "department":   rec["uni_name"],
            "country":      "australia",
            "field":        field_id,
            "researchAreas": keywords[:10] if keywords else ["architecture"],
            "recentProjects": [
                {
                    "year":        p.get("year", 0),
                    "title":       p.get("title", ""),
                    "fundingBody": "ARC Discovery",
                }
                for p in recent_projects
            ],
            "hIndex":       rec.get("hIndex", 0),
            "citations":    rec.get("citations", 0),
            "rating":       0,
            "reviewCount":  0,
            "reviews":      [],
            "reviewsNote":  "暫無評價",
            "email":        "",
            "profileUrl":   "",
        }

        prof["_needsReview"] = rec["flagged"]
        professors.append(prof)

    print(f"  Formatted {len(professors)} professor objects (IDs au-011 to au-{10 + len(professors):03d})")
    return professors


# ══════════════════════════════════════════════════════════════════════════════
# STEP G — Save outputs + summary
# ══════════════════════════════════════════════════════════════════════════════

def save_outputs(professors, investigators):
    print("\n─── STEP G: Saving outputs ───")

    # Strip internal flags before saving JSON
    clean_profs = []
    for p in professors:
        cp = {k: v for k, v in p.items() if not k.startswith("_")}
        clean_profs.append(cp)

    OUT_JSON.write_text(
        json.dumps(clean_profs, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"  JSON → {OUT_JSON}")

    # CSV review sheet
    with OUT_CSV.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "id", "name", "university", "field",
            "researchAreas", "hIndex", "arcProjects", "needsReview",
        ])
        writer.writeheader()
        for prof in professors:
            arc_proj_titles = " | ".join(
                p.get("title", "") for p in prof.get("recentProjects", [])
            )
            writer.writerow({
                "id":           prof["id"],
                "name":         prof["name"],
                "university":   prof["university"],
                "field":        prof["field"],
                "researchAreas": ", ".join(prof.get("researchAreas", [])),
                "hIndex":       prof["hIndex"],
                "arcProjects":  arc_proj_titles,
                "needsReview":  "TRUE" if prof.get("_needsReview") else "FALSE",
            })
    print(f"  CSV  → {OUT_CSV}")

    # Summary
    print("\n═══ FINAL SUMMARY ═══")
    by_uni   = Counter(p["university"] for p in professors)
    by_field = Counter(p["field"] for p in professors)
    flagged  = sum(1 for p in professors if p.get("_needsReview"))

    total_inv   = sum(1 for rec in investigators)  # after uni filter
    ss_matched  = sum(1 for rec in investigators if rec.get("ss_matched"))

    print(f"  Total investigators at target unis : {total_inv}")
    print(f"  Enriched via Semantic Scholar      : {ss_matched}")
    print(f"  Flagged for manual review          : {flagged}")
    print("\n  By university:")
    for uni, cnt in sorted(by_uni.items()):
        print(f"    {uni}: {cnt}")
    print("\n  By field:")
    for field, cnt in sorted(by_field.items()):
        print(f"    {field}: {cnt}")


# ══════════════════════════════════════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════════════════════════════════════

def main():
    df            = download_arc_report()
    investigators = extract_investigators(df)

    if not investigators:
        print("\n  No investigators found — check column mapping above and re-run.")
        return

    investigators = enrich_semantic_scholar(investigators)
    professors    = format_professors(investigators)
    save_outputs(professors, investigators)


if __name__ == "__main__":
    main()
