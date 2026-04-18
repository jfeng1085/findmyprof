"""
Enriches professors.json with real hIndex and citations from OpenAlex.
- Filters institutions by country_code == "AU" to avoid name collisions (e.g. RMIT vs MIT)
- Skips professors that already have hIndex > 0 (resumable)
- Saves progress every 50 records
- Run: python scripts/enrich_openalex.py
"""

import json
import time
import sys
import requests
from pathlib import Path

PROFESSORS_PATH = Path("data/professors.json")
UA = "FindMyProf/1.0 (fengjie19930211@gmail.com)"
SAVE_INTERVAL = 50
DELAY = 0.2  # ~5 req/s — safer rate to avoid 429s

OPENALEX_NAME_MAP = {
    "university of melbourne": "unimelb",
    "university of sydney": "usyd",
    "unsw sydney": "unsw",
    "university of new south wales": "unsw",
    "monash university": "monash",
    "university of queensland": "uq",
    "australian national university": "anu",
    "queensland university of technology": "qut",
    "university of adelaide": "uadelaide",
    "rmit university": "rmit",
    "university of western australia": "uwa",
    "curtin university": "curtin",
    "deakin university": "deakin",
    "university of hong kong": "hku",
    "hong kong university of science and technology": "hkust",
    "chinese university of hong kong": "cuhk",
    "national university of singapore": "nus",
    "nanyang technological university": "ntu",
}


def institution_to_id(display_name: str) -> str | None:
    return OPENALEX_NAME_MAP.get(display_name.lower().strip())


def lookup(name: str) -> dict | None:
    try:
        r = requests.get(
            "https://api.openalex.org/authors",
            params={"search": name, "per_page": 1},
            headers={"User-Agent": UA},
            timeout=10,
        )
        r.raise_for_status()
        results = r.json().get("results", [])
        if not results:
            return None
        a = results[0]
        stats = a.get("summary_stats", {})
        affils = a.get("last_known_institutions", [])
        au_affils = [i for i in affils if i.get("country_code") == "AU"]
        best_affil = au_affils[0] if au_affils else (affils[0] if affils else None)
        return {
            "hIndex": stats.get("h_index", 0) or 0,
            "citations": a.get("cited_by_count", 0) or 0,
            "institution_name": best_affil["display_name"] if best_affil else None,
            "institution_id": institution_to_id(best_affil["display_name"]) if best_affil else None,
        }
    except Exception as e:
        print(f"  ERROR: {e}", flush=True)
        return None


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    profs = json.loads(PROFESSORS_PATH.read_text(encoding="utf-8"))

    todo = [p for p in profs if p.get("hIndex", 0) == 0]
    print(f"Total: {len(profs)} professors. To enrich: {len(todo)}. Already done: {len(profs) - len(todo)}.")

    updated = 0
    not_found = 0

    for i, prof in enumerate(profs):
        if prof.get("hIndex", 0) > 0:
            continue

        result = lookup(prof["name"])
        if result:
            prof["hIndex"] = result["hIndex"]
            prof["citations"] = result["citations"]
            if result["institution_id"]:
                prof["university"] = result["institution_id"]
            updated += 1
            print(
                f"[{i+1}/{len(profs)}] {prof['name']} -> h={result['hIndex']} c={result['citations']} uni={result['institution_name']}",
                flush=True,
            )
        else:
            not_found += 1
            print(f"[{i+1}/{len(profs)}] {prof['name']} -> not found", flush=True)

        if (i + 1) % SAVE_INTERVAL == 0:
            PROFESSORS_PATH.write_text(json.dumps(profs, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  -- saved checkpoint ({i+1} processed) --", flush=True)

        time.sleep(DELAY)

    PROFESSORS_PATH.write_text(json.dumps(profs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDone. Updated: {updated}, Not found: {not_found}")


if __name__ == "__main__":
    main()
