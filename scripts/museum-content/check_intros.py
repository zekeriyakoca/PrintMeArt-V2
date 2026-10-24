"""
Checks that every option in the storefront filter sidebar (except Image Quality) has an
introduction in English and Dutch, as the storefront would show it:
- categories: intro.<name> in src/app/i18n/en.json and nl.json
- artists, museums, collections: description and metadata.Description_nl in products/{id}

    DATABASE_URL=postgresql://... python3 check_intros.py
"""
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://lontray.art/catalog-api/catalog/v1/storefront"
ROOT = Path(__file__).resolve().parents[2]


def get(path):
    """GET with backoff: the API rate-limits bursts"""
    for attempt in range(6):
        try:
            req = urllib.request.Request(API + path, headers={"Origin": "https://printmeart.nl"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 5:
                raise
            time.sleep(5 * (attempt + 1))


def first_products():
    """attribute name -> one visible product id carrying it"""
    sql = """SELECT DISTINCT ON (a."Name") a."Name", p."Id" FROM catalog."ProductAttributes" a
             JOIN catalog."ProductProductAttribute" pa ON pa."AttributesId" = a."Id"
             JOIN catalog."Products" p ON p."Id" = pa."ProductsId"
             WHERE a."GroupId" IN (5, 6, 7) AND p."IsVisible" ORDER BY a."Name", p."Id" """
    rows = subprocess.run(["psql", os.environ["DATABASE_URL"], "-At", "-F", "\t", "-c", sql],
                          check=True, capture_output=True, text=True).stdout.splitlines()
    return dict(row.split("\t") for row in rows)


def main():
    groups = get("/filter-options")
    dictionaries = {lang: json.loads((ROOT / f"src/app/i18n/{lang}.json").read_text())["intro"] for lang in ("en", "nl")}
    gaps = []
    categories = [g for g in groups if g["groupType"] == "Categories"]
    for g in categories:
        for name in [g["name"]] + [o["name"] for o in g["options"]]:
            for lang in ("en", "nl"):
                if not dictionaries[lang].get(name, "").strip():
                    gaps.append(f"category {name}: no {lang} intro")
    products = first_products()
    attributes = [(g["name"], o["name"]) for g in groups
                  if g["groupType"] == "Attributes" and g["name"] != "Image Quality" for o in g["options"]]

    def check(item):
        group, name = item
        if name not in products:
            return f"{group} {name}: no visible product to read it from"
        details = next((a for a in get(f"/products/{products[name]}").get("attributeDetails", []) if a["name"] == name), None)
        missing = [lang for lang, text in (("en", (details or {}).get("description")),
                                            ("nl", ((details or {}).get("metadata") or {}).get("Description_nl"))) if not (text or "").strip()]
        return f"{group} {name}: no {'/'.join(missing)} text" if missing else None

    for item in attributes:
        gap = check(item)
        if gap:
            gaps.append(gap)
        time.sleep(0.3)
    print(f"{sum(1 + len(g['options']) for g in categories)} categories, {len(attributes)} attributes checked")
    print("\n".join(gaps) if gaps else "no gaps")


if __name__ == "__main__":
    main()
