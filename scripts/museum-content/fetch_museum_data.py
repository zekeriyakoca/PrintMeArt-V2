"""
Fetches catalogue facts and museum label texts for products sourced from
Rijksmuseum, Art Institute of Chicago and Cleveland Museum of Art.

Reads product ids + SourceUrl from the catalog DB (read-only) and writes
museum-data.json: one entry per product with the normalised metadata we
store, plus the museum's own text that stories are written from.

    DATABASE_URL=postgresql://... python3 fetch_museum_data.py
"""
import json
import os
import re
import subprocess
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

OUT = Path(__file__).with_name("museum-data.json")

MUSEUMS = {
    "rijks": ("Rijksmuseum", "Amsterdam, Netherlands"),
    "aic": ("Art Institute of Chicago", "Chicago, United States"),
    "cma": ("Cleveland Museum of Art", "Cleveland, United States"),
}

# Getty AAT ids used by Rijksmuseum's Linked Art records
AAT_ENGLISH = "300388277"
AAT_DUTCH = "300388256"
AAT_CREDIT_LINE = "300026687"
AAT_DIMENSIONS = "300435430"
AAT_LABEL_TEXT = "300048722"


def get_json(url, accept="application/json"):
    req = urllib.request.Request(url, headers={"Accept": accept, "User-Agent": "printmeart-content"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def strip_html(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", text or "")).strip() or None


def cm(height, width):
    return f"{height:g} × {width:g} cm"


def load_products():
    sql = """
        SELECT "Id", "Metadata"->>'SourceUrl' FROM catalog."Products"
        WHERE "IsVisible" AND "Metadata"->>'SourceUrl' ~ '(artic\\.edu|clevelandart\\.org|rijksmuseum\\.nl)'
    """
    rows = subprocess.run(
        ["psql", os.environ["DATABASE_URL"], "-At", "-F", "\t", "-c", sql],
        check=True, capture_output=True, text=True,
    ).stdout.splitlines()
    return [(int(pid), url) for pid, url in (row.split("\t") for row in rows)]


def source_of(url):
    if m := re.search(r"artic\.edu/artworks/(\d+)", url):
        return "aic", m.group(1)
    if m := re.search(r"clevelandart\.org/art/([^/?#]+)", url):
        return "cma", m.group(1)
    # Only object numbers resolve reliably; the newer hash-style URLs do not
    if m := re.search(r"rijksmuseum\.nl/.*?/((?:SK|RP|BK|NG)-[A-Z]-[0-9A-Z]+(?:-[0-9A-Z]+)*)", url):
        return "rijks", m.group(1)
    return None, None


def fetch_aic(ids):
    fields = "id,dimensions_detail,credit_line,main_reference_number,description,subject_titles"
    found = {}
    for i in range(0, len(ids), 100):
        batch = ",".join(ids[i:i + 100])
        for d in get_json(f"https://api.artic.edu/api/v1/artworks?limit=100&fields={fields}&ids={batch}")["data"]:
            dims = next((x for x in d.get("dimensions_detail") or [] if x.get("height") and x.get("width")), None)
            found[str(d["id"])] = {
                "ObjectNumber": d.get("main_reference_number"),
                "CreditLine": d.get("credit_line"),
                "Dimensions": dims and cm(dims["height"], dims["width"]),
                "Subjects": ", ".join(d.get("subject_titles") or []) or None,
                "text_en": strip_html(d.get("description")),
            }
    return found


def fetch_cma(accession):
    d = get_json(f"https://openaccess-api.clevelandart.org/api/artworks/{accession}")["data"]
    dims = next((v for v in (d.get("dimensions") or {}).values() if v.get("height") and v.get("width")), None)
    texts = [d.get(k) for k in ("wall_description", "description", "fun_fact", "did_you_know")]
    return {
        "ObjectNumber": d.get("accession_number"),
        "CreditLine": d.get("creditline"),
        "Dimensions": dims and cm(round(dims["height"] * 100, 1), round(dims["width"] * 100, 1)),
        "text_en": strip_html(" ".join(t for t in texts if t)),
    }


def fetch_rijks(object_number):
    hits = get_json(f"https://data.rijksmuseum.nl/search/collection?objectNumber={object_number}")["orderedItems"]
    if not hits:
        return None
    o = get_json(hits[0]["id"], "application/ld+json")

    def text(items, aat, lang):
        for item in items:
            types = [t.get("id", "") for t in item.get("classified_as", [])]
            langs = [l.get("id", "") for l in item.get("language", [])]
            if any(t.endswith(aat) for t in types) and any(l.endswith(lang) for l in langs):
                return item.get("content")

    labels = {}
    for so in o.get("subject_of", []):
        lang = next((l["id"][-9:] for l in so.get("language", [])), None)
        content = text([dict(p, language=so.get("language", [])) for p in so.get("part", [])], AAT_LABEL_TEXT, lang or "")
        if lang and content:
            labels[lang] = content

    dims = re.search(r"height ([\d.]+) cm x width ([\d.]+) cm", text(o.get("referred_to_by", []), AAT_DIMENSIONS, AAT_ENGLISH) or "")
    return {
        "ObjectNumber": object_number,
        "CreditLine": text(o.get("referred_to_by", []), AAT_CREDIT_LINE, AAT_ENGLISH),
        "Dimensions": dims and cm(float(dims.group(1)), float(dims.group(2))),
        "text_en": labels.get(AAT_ENGLISH),
        "text_nl": labels.get(AAT_DUTCH),
    }


def main():
    products = [(pid, *source_of(url)) for pid, url in load_products()]
    products = [p for p in products if p[1]]

    # Several products point at the same museum object; we cannot tell which one is right
    shared = {key for key, n in Counter((s, k) for _, s, k in products).items() if n > 1}

    keys = {s: sorted({k for _, src, k in products if src == s}) for s in MUSEUMS}
    with ThreadPoolExecutor(8) as pool:
        data = {
            "aic": fetch_aic(keys["aic"]),
            "cma": dict(zip(keys["cma"], pool.map(fetch_cma, keys["cma"]))),
            "rijks": dict(zip(keys["rijks"], pool.map(fetch_rijks, keys["rijks"]))),
        }

    result, skipped = {}, []
    for pid, source, key in sorted(products):
        facts = data[source].get(key)
        if (source, key) in shared or not facts:
            skipped.append({"productId": pid, "source": source, "key": key,
                            "reason": "shared source" if facts else "not found"})
            continue
        museum, location = MUSEUMS[source]
        result[str(pid)] = {"source": source, "Museum": museum, "Location": location,
                            **{k: v for k, v in facts.items() if v}}

    OUT.write_text(json.dumps({"products": result, "skipped": skipped}, ensure_ascii=False, indent=2))
    with_text = sum(1 for p in result.values() if p.get("text_en"))
    print(f"{len(result)} products, {with_text} with museum text, {len(skipped)} skipped -> {OUT.name}")


if __name__ == "__main__":
    main()
