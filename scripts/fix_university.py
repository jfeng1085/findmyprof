"""
Corrects the university field for all professors via OpenAlex.
The ARC dataset assigns ALL investigators on a grant the lead institution,
so co-investigators from other universities are incorrectly tagged.
This script queries OpenAlex for every professor and updates university
based on their actual AU affiliation.

Run: python scripts/fix_university.py
"""

import json
import time
import sys
import requests
from pathlib import Path

PROFESSORS_PATH = Path("data/professors.json")
UA = "FindMyProf/1.0 (fengjie19930211@gmail.com)"
SAVE_INTERVAL = 50
DELAY = 0.5  # conservative — 2 req/s

OPENALEX_NAME_MAP = {
    # Australia — Group of Eight
    "university of melbourne": "unimelb",
    "the university of melbourne": "unimelb",
    "university of sydney": "usyd",
    "the university of sydney": "usyd",
    "unsw sydney": "unsw",
    "university of new south wales": "unsw",
    "monash university": "monash",
    "university of queensland": "uq",
    "the university of queensland": "uq",
    "australian national university": "anu",
    "university of adelaide": "uadelaide",
    "the university of adelaide": "uadelaide",
    "university of western australia": "uwa",
    "the university of western australia": "uwa",
    # Technology Network
    "rmit university": "rmit",
    "queensland university of technology": "qut",
    "curtin university": "curtin",
    "university of technology sydney": "uts",
    "university of south australia": "unisa",
    # Innovative Research Universities
    "griffith university": "griffith",
    "la trobe university": "latrobe",
    "james cook university": "jcu",
    "flinders university": "flinders",
    "murdoch university": "murdoch",
    "charles darwin university": "cdu",
    # Other major
    "deakin university": "deakin",
    "swinburne university of technology": "swinburne",
    "macquarie university": "macquarie",
    "university of newcastle": "newcastle",
    "the university of newcastle": "newcastle",
    "university of wollongong": "uow",
    "western sydney university": "wsu",
    "edith cowan university": "ecu",
    "australian catholic university": "acu",
    "charles sturt university": "csu",
    "bond university": "bond",
    "southern cross university": "scu",
    "federation university australia": "federation",
    "victoria university": "vu",
    "university of the sunshine coast": "usc",
    "central queensland university": "cqu",
    # Hong Kong
    "university of hong kong": "hku",
    "hong kong university of science and technology": "hkust",
    "chinese university of hong kong": "cuhk",
    # Singapore
    "national university of singapore": "nus",
    "nanyang technological university": "ntu",
}


def lookup_university(name: str) -> str | None:
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
        affils = results[0].get("last_known_institutions", [])
        au_affils = [a for a in affils if a.get("country_code") == "AU"]
        best = au_affils[0] if au_affils else None
        if not best:
            return None
        return OPENALEX_NAME_MAP.get(best["display_name"].lower().strip())
    except Exception as e:
        print(f"  ERROR: {e}", flush=True)
        return None


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    profs = json.loads(PROFESSORS_PATH.read_text(encoding="utf-8"))
    print(f"Total professors: {len(profs)}")

    corrected = 0
    unchanged = 0
    not_found = 0

    for i, prof in enumerate(profs):
        uni_id = lookup_university(prof["name"])

        if uni_id is None:
            not_found += 1
            print(f"[{i+1}/{len(profs)}] {prof['name']} -> not found", flush=True)
        elif uni_id != prof["university"]:
            old = prof["university"]
            prof["university"] = uni_id
            corrected += 1
            print(f"[{i+1}/{len(profs)}] {prof['name']} -> CHANGED {old} -> {uni_id}", flush=True)
        else:
            unchanged += 1
            print(f"[{i+1}/{len(profs)}] {prof['name']} -> confirmed {uni_id}", flush=True)

        if (i + 1) % SAVE_INTERVAL == 0:
            PROFESSORS_PATH.write_text(
                json.dumps(profs, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            print(f"  -- checkpoint saved ({i+1} processed) --", flush=True)

        time.sleep(DELAY)

    PROFESSORS_PATH.write_text(
        json.dumps(profs, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nDone. Corrected: {corrected} | Unchanged: {unchanged} | Not found: {not_found}")


if __name__ == "__main__":
    main()
