"""
scrape_unimelb_msd.py
=====================
Scrapes UniMelb MSD faculty pages, filters by academic title,
then enriches each person from the Find an Expert API.

Output:
  output/unimelb_msd_professors.json   — full structured records
  output/unimelb_msd_summary.csv       — id, name, title, field, email, profileUrl

Usage:
  pip install requests beautifulsoup4
  python scrape_unimelb_msd.py
"""

import json
import csv
import time
import re
import os
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

PAGES = {
    "architectural-design":   "https://msd.unimelb.edu.au/about-us/our-people/architecture",
    "construction-management":"https://msd.unimelb.edu.au/about-us/our-people/construction-management",
    "landscape-architecture": "https://msd.unimelb.edu.au/about-us/our-people/landscape-architecture",
    "property":               "https://msd.unimelb.edu.au/about-us/our-people/property",
    "urban-planning-design":  "https://msd.unimelb.edu.au/about-us/our-people/urban-design",
    "urban-planning":         "https://msd.unimelb.edu.au/about-us/our-people/urban-planning",
}

# Both urban-planning URLs map to the same field id
FIELD_MAP = {
    "urban-planning-design": "urban-planning",
    "urban-planning":        "urban-planning",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

REQUEST_DELAY = 1.5   # seconds between every HTTP request

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Step A — Scrape MSD people pages
# ---------------------------------------------------------------------------

def fetch_page(url: str) -> BeautifulSoup | None:
    """Fetch a URL and return a BeautifulSoup object, or None on failure."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except Exception as e:
        print(f"  [WARN] Failed to fetch {url}: {e}")
        return None


def scrape_msd_page(field_key: str, url: str) -> list[dict]:
    """
    Parse one MSD people page.  Returns a list of raw person dicts:
      { name, raw_title, profile_url, field_key }
    """
    print(f"\nScraping [{field_key}] {url}")
    soup = fetch_page(url)
    if soup is None:
        return []
    time.sleep(REQUEST_DELAY)

    people = []

    # MSD people pages typically use cards with class patterns like
    # "people-card", "staff-card", or similar.  We try several selectors
    # and fall back to a broad search for any <a> that links to /profiles/.
    card_selectors = [
        "div.people-card",
        "div.staff-card",
        "div.person-card",
        "article.people-item",
        "li.people-item",
    ]

    cards = []
    for selector in card_selectors:
        cards = soup.select(selector)
        if cards:
            break

    if not cards:
        # Broad fallback: find any anchor pointing to a profile path
        links = soup.find_all("a", href=re.compile(r"/profiles?/|/staff/|/people/"))
        # De-duplicate by href
        seen_hrefs = set()
        for link in links:
            href = link.get("href", "")
            if href in seen_hrefs:
                continue
            seen_hrefs.add(href)
            # Try to find a name and title near the link
            container = link.find_parent(["div", "li", "article"]) or link
            name_text = link.get_text(strip=True)
            title_el = container.find(class_=re.compile(r"title|role|position", re.I))
            raw_title = title_el.get_text(strip=True) if title_el else ""
            if name_text:
                people.append({
                    "name":        name_text,
                    "raw_title":   raw_title,
                    "profile_url": link["href"] if link["href"].startswith("http")
                                   else "https://msd.unimelb.edu.au" + link["href"],
                    "field_key":   field_key,
                })
        print(f"  Found {len(people)} people (fallback link scan)")
        return people

    for card in cards:
        # Name — usually in an <h3>, <h4>, or element with class containing "name"
        name_el = (
            card.find(class_=re.compile(r"\bname\b", re.I))
            or card.find(["h3", "h4", "h5"])
        )
        name = name_el.get_text(strip=True) if name_el else ""

        # Title / role
        title_el = card.find(class_=re.compile(r"title|role|position|subtitle", re.I))
        raw_title = title_el.get_text(strip=True) if title_el else ""

        # Profile URL
        link_el = card.find("a", href=True)
        profile_url = ""
        if link_el:
            href = link_el["href"]
            profile_url = href if href.startswith("http") else "https://msd.unimelb.edu.au" + href

        if name:
            people.append({
                "name":        name,
                "raw_title":   raw_title,
                "profile_url": profile_url,
                "field_key":   field_key,
            })

    print(f"  Found {len(people)} people")
    return people


# ---------------------------------------------------------------------------
# Step — Title filter
# ---------------------------------------------------------------------------

TITLE_KEYWORDS = ["Professor", "Senior Lecturer", "Lecturer", "Dr"]

def passes_title_filter(name: str, raw_title: str) -> bool:
    """Return True if the person should be kept."""
    for kw in TITLE_KEYWORDS:
        if kw.lower() in raw_title.lower():
            return True
    # Also accept if name starts with "Dr "
    if name.strip().startswith("Dr "):
        return True
    return False


# ---------------------------------------------------------------------------
# Step B — Find an Expert enrichment
# ---------------------------------------------------------------------------

FAE_SEARCH_URL = "https://findanexpert.unimelb.edu.au/api/search"
FAE_PROFILE_BASE = "https://findanexpert.unimelb.edu.au/profile"


def search_find_an_expert(first_name: str, last_name: str) -> dict | None:
    """
    Call the FAE search API.  Return the first matching person record or None.
    """
    params = {"query": f"{first_name} {last_name}", "type": "person"}
    try:
        resp = requests.get(FAE_SEARCH_URL, params=params, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results") or data.get("hits") or data.get("data") or []
        if isinstance(results, list) and results:
            return results[0]
    except Exception as e:
        print(f"    [WARN] FAE search failed for {first_name} {last_name}: {e}")
    return None


def fetch_fae_profile(person_id: str | int, slug: str) -> BeautifulSoup | None:
    """Fetch and parse a FAE profile page."""
    url = f"{FAE_PROFILE_BASE}/{person_id}-{slug}"
    print(f"    Fetching FAE profile: {url}")
    return fetch_page(url)


def extract_fae_data(soup: BeautifulSoup, profile_url: str) -> dict:
    """
    Extract title, research areas, recent projects, email from a FAE profile page.
    Returns a dict with keys: fae_title, research_areas, recent_projects, email.
    """
    result = {
        "fae_title":        "",
        "research_areas":   [],
        "recent_projects":  [],
        "email":            "",
        "fae_profile_url":  profile_url,
    }

    if soup is None:
        return result

    # --- Title ---
    title_el = (
        soup.find(class_=re.compile(r"position|title|role", re.I))
        or soup.find("h2")
    )
    if title_el:
        result["fae_title"] = title_el.get_text(strip=True)

    # --- Email ---
    email_link = soup.find("a", href=re.compile(r"^mailto:", re.I))
    if email_link:
        result["email"] = email_link["href"].replace("mailto:", "").strip()

    # --- Research areas / keywords ---
    kw_section = (
        soup.find(class_=re.compile(r"keyword|research.area|tag", re.I))
        or soup.find(id=re.compile(r"keyword|research", re.I))
    )
    if kw_section:
        tags = kw_section.find_all(["li", "span", "a"])
        for t in tags:
            text = t.get_text(strip=True)
            if text and text not in result["research_areas"]:
                result["research_areas"].append(text)
    # Cap at 6
    result["research_areas"] = result["research_areas"][:6]

    # --- Recent projects (2022–2025) ---
    current_year = 2025
    cutoff_year  = 2022
    project_section = soup.find(id=re.compile(r"project|grant|funding", re.I))
    if not project_section:
        project_section = soup.find(class_=re.compile(r"project|grant|funding", re.I))
    if project_section:
        project_items = project_section.find_all(
            ["li", "div", "article"],
            class_=re.compile(r"project|grant|item", re.I)
        ) or project_section.find_all("li")

        for item in project_items:
            text = item.get_text(" ", strip=True)
            # Try to extract a year from the text
            year_match = re.search(r"\b(20\d{2})\b", text)
            year = int(year_match.group(1)) if year_match else current_year
            if year >= cutoff_year:
                title_text = text[:200]   # truncate very long strings
                result["recent_projects"].append({
                    "year":        year,
                    "title":       title_text,
                    "fundingBody": "暫無資料",
                })
            if len(result["recent_projects"]) >= 3:
                break

    return result


# ---------------------------------------------------------------------------
# Step C — Standardise title
# ---------------------------------------------------------------------------

def standardise_title(raw: str, name: str = "") -> str:
    """Map raw title text to one of the 4 standard values."""
    r = raw.lower()
    if "associate professor" in r:
        return "Associate Professor"
    if "professor" in r:
        return "Professor"
    if "senior lecturer" in r:
        return "Senior Lecturer"
    if "lecturer" in r:
        return "Lecturer"
    # Fallback: Dr prefix in name
    if name.strip().startswith("Dr "):
        return "Lecturer"
    return "Lecturer"   # default if we kept them through filter


# ---------------------------------------------------------------------------
# Step D — Gender heuristic
# ---------------------------------------------------------------------------

# Common female endings on first names (very rough heuristic)
FEMALE_ENDINGS = ("a", "e", "i", "ie", "y")
# Hard exceptions that end in 'a'/'e' but are typically male
MALE_EXCEPTIONS = {"Luke", "Jake", "Mike", "Blake", "Chase", "Lance", "Blaine",
                   "Bruce", "Steve", "Shane", "Kyle", "Bryce", "Vince"}
# Known female ending combos (consonant + y) vs male (vowel + y / standalone)
MALE_Y_ENDINGS = {"ay", "ey", "oy", "uy"}

def infer_gender(first_name: str) -> str:
    """Return 'female', 'male', or 'unknown' based on first name heuristics."""
    if not first_name:
        return "unknown"
    name = first_name.strip().title()

    if name in MALE_EXCEPTIONS:
        return "male"

    lower = name.lower()

    # Ends in 'ie' or 'i' — usually female
    if lower.endswith("ie") or lower.endswith("i"):
        return "female"

    # Ends in 'y' — female only if preceded by a consonant (not vowel+y)
    if lower.endswith("y"):
        if len(lower) >= 3 and lower[-3:-1] not in ("ay", "ey", "oy", "uy"):
            return "female"
        return "male"

    # Ends in 'a' or 'e'
    if lower.endswith("a") or lower.endswith("e"):
        return "female"

    return "male"


# ---------------------------------------------------------------------------
# Step E — Build output record
# ---------------------------------------------------------------------------

def split_name(full_name: str) -> tuple[str, str]:
    """Return (first_name, last_name) from a full name string."""
    # Strip title prefixes
    for prefix in ("Prof ", "Professor ", "Dr ", "A/Prof ", "Assoc Prof "):
        if full_name.startswith(prefix):
            full_name = full_name[len(prefix):]
            break
    parts = full_name.strip().split()
    if len(parts) == 0:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


def build_record(idx: int, person: dict, fae: dict) -> dict:
    """Construct the final JSON record for one professor."""
    first, last = split_name(person["name"])

    std_title = standardise_title(
        fae.get("fae_title") or person.get("raw_title", ""),
        person["name"]
    )

    # Resolve field id (handle the urban-planning-design alias)
    raw_field = person["field_key"]
    field_id = FIELD_MAP.get(raw_field, raw_field)

    return {
        "id":            f"au-{idx:03d}",
        "name":          person["name"],
        "gender":        infer_gender(first),
        "title":         std_title,
        "university":    "unimelb",
        "department":    "Faculty of Architecture, Building and Planning",
        "country":       "australia",
        "field":         field_id,
        "researchAreas": fae.get("research_areas", []),
        "recentProjects": fae.get("recent_projects", []),
        "hIndex":        0,
        "citations":     0,
        "rating":        0,
        "reviewCount":   0,
        "reviews":       [],
        "reviewsNote":   "暫無評價",
        "email":         fae.get("email", ""),
        "profileUrl":    fae.get("fae_profile_url") or person.get("profile_url", ""),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    all_raw: list[dict] = []
    per_page_counts: dict[str, int] = {}

    # Step A — scrape all pages
    for field_key, url in PAGES.items():
        people = scrape_msd_page(field_key, url)
        per_page_counts[field_key] = len(people)
        all_raw.extend(people)
        time.sleep(REQUEST_DELAY)

    print(f"\nTotal scraped (before filter): {len(all_raw)}")

    # Deduplicate by name (same person may appear on two urban-planning pages)
    seen_names: set[str] = set()
    deduped: list[dict] = []
    for p in all_raw:
        key = p["name"].strip().lower()
        if key and key not in seen_names:
            seen_names.add(key)
            deduped.append(p)

    print(f"After deduplication: {len(deduped)}")

    # Filter by title
    filtered = [p for p in deduped if passes_title_filter(p["name"], p.get("raw_title", ""))]
    print(f"After title filter:  {len(filtered)}")

    # Step B/C/D/E — enrich and build records
    records: list[dict] = []
    enriched_count = 0

    for i, person in enumerate(filtered):
        print(f"\n[{i+1}/{len(filtered)}] {person['name']} ({person['field_key']})")
        first, last = split_name(person["name"])

        fae_data: dict = {}

        if first and last:
            search_result = search_find_an_expert(first, last)
            time.sleep(REQUEST_DELAY)

            if search_result:
                # Try to extract id and slug from the search result
                person_id  = search_result.get("id") or search_result.get("personId") or ""
                slug_raw   = (
                    search_result.get("slug")
                    or search_result.get("url", "")
                    .split("/profile/")[-1]
                    .rstrip("/")
                )
                # slug may already contain the id prefix
                slug = re.sub(r"^\d+-", "", slug_raw)

                if person_id and slug:
                    profile_soup = fetch_fae_profile(person_id, slug)
                    time.sleep(REQUEST_DELAY)
                    profile_url = f"{FAE_PROFILE_BASE}/{person_id}-{slug}"
                    if profile_soup:
                        fae_data = extract_fae_data(profile_soup, profile_url)
                        enriched_count += 1
                        print(f"  Enriched: {len(fae_data.get('research_areas', []))} areas, "
                              f"{len(fae_data.get('recent_projects', []))} projects")
                    else:
                        fae_data = {"fae_profile_url": profile_url}
                else:
                    print(f"  [WARN] Could not extract id/slug from FAE result: {search_result}")
            else:
                print(f"  Not found on Find an Expert")
        else:
            print(f"  [SKIP] Could not split name: {person['name']!r}")

        record = build_record(11 + i, person, fae_data)
        records.append(record)

    # Step F — save outputs
    json_path = os.path.join(OUTPUT_DIR, "unimelb_msd_professors.json")
    csv_path  = os.path.join(OUTPUT_DIR, "unimelb_msd_summary.csv")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"\nSaved JSON: {json_path}")

    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:  # utf-8-sig for Excel
        writer = csv.DictWriter(f, fieldnames=["id", "name", "title", "field", "email", "profileUrl"])
        writer.writeheader()
        for r in records:
            writer.writerow({
                "id":         r["id"],
                "name":       r["name"],
                "title":      r["title"],
                "field":      r["field"],
                "email":      r["email"],
                "profileUrl": r["profileUrl"],
            })
    print(f"Saved CSV:  {csv_path}")

    # --- Summary ---
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("\nPeople found per department page:")
    for k, v in per_page_counts.items():
        print(f"  {k:<30} {v}")
    print(f"\nTotal after deduplication:  {len(deduped)}")
    print(f"Total after title filter:   {len(filtered)}")
    print(f"Total enriched from FAE:    {enriched_count}")

    print("\nBreakdown by field:")
    from collections import Counter
    field_counts = Counter(r["field"] for r in records)
    for field, count in sorted(field_counts.items()):
        print(f"  {field:<35} {count}")

    print("\nBreakdown by title:")
    title_counts = Counter(r["title"] for r in records)
    for title, count in sorted(title_counts.items()):
        print(f"  {title:<25} {count}")

    print("\nDone.")


if __name__ == "__main__":
    main()
