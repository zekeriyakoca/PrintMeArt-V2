"""
Finds the English Wikipedia summary for every artist of a visible museum product,
as source material for the short artist bios in artists.json.

Writes artist-sources.json. Artists without a matching page (no page, or the page
is not about an artist) are listed under "missing" and get no bio.

    DATABASE_URL=postgresql://... python3 fetch_artist_sources.py
"""
import json
import os
import re
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path(__file__).with_name("artist-sources.json")
ARTIST_WORDS = re.compile(r"painter|artist|printmaker|illustrator|engraver|draughtsman|draftsman|etcher|lithographer|watercolou?rist|calligrapher|sculptor", re.I)


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "printmeart-content/1.0 (zekeriyakocairi@gmail.com)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def load_artists():
    sql = """
        SELECT DISTINCT a."Id", a."Name"
        FROM catalog."ProductAttributes" a
        JOIN catalog."ProductProductAttribute" ppa ON ppa."AttributesId" = a."Id"
        JOIN catalog."Products" p ON p."Id" = ppa."ProductsId"
        WHERE a."GroupId" = 5 AND p."IsVisible" AND p."Metadata" ? 'Museum'
    """
    rows = subprocess.run(
        ["psql", os.environ["DATABASE_URL"], "-At", "-F", "\t", "-c", sql],
        check=True, capture_output=True, text=True,
    ).stdout.splitlines()
    return [(int(i), name) for i, name in (row.split("\t") for row in rows)]


def lookup(titles):
    """Batch lookup by exact title (redirects followed): {requested title: page}."""
    params = urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": 2, "redirects": 1,
        "prop": "extracts|description", "exintro": 1, "explaintext": 1, "exlimit": 20,
        "titles": "|".join(titles),
    })
    data = get_json(f"https://en.wikipedia.org/w/api.php?{params}")["query"]
    aliases = {r["from"]: r["to"] for r in data.get("normalized", []) + data.get("redirects", [])}
    pages = {p["title"]: p for p in data["pages"] if "missing" not in p}
    resolved = {}
    for title in titles:
        target = title
        while target in aliases:
            target = aliases[target]
        if target in pages:
            resolved[title] = pages[target]
    return resolved


def search_title(name):
    params = urllib.parse.urlencode({"action": "query", "format": "json", "list": "search", "srlimit": 1,
                                     "srsearch": f"{name} painter"})
    hits = get_json(f"https://en.wikipedia.org/w/api.php?{params}")["query"]["search"]
    return hits[0]["title"] if hits else None


def same_person(name, title):
    words = lambda s: set(re.findall(r"\w{3,}", s.lower()))
    return bool(words(name) & words(title))


def is_artist(page):
    return ARTIST_WORDS.search(page.get("description") or "") and page.get("extract")


def main():
    artists = load_artists()
    pages = {}
    names = [name for _, name in artists]
    for i in range(0, len(names), 20):
        pages.update(lookup(names[i:i + 20]))

    # Not found by exact title (or found a non-artist page): one search, kept only if the names overlap
    for name in names:
        if name in pages and is_artist(pages[name]):
            continue
        title = search_title(name)
        if title and same_person(name, title):
            pages.update({name: page for page in lookup([title]).values()})

    found, missing = [], []
    for attribute_id, name in artists:
        page = pages.get(name)
        if page and is_artist(page):
            found.append({"id": attribute_id, "name": name, "page": page["title"],
                          "description": page["description"], "extract": page["extract"][:700]})
        else:
            missing.append(name)
    found.sort(key=lambda r: r["name"])
    missing.sort()
    OUT.write_text(json.dumps({"artists": found, "missing": missing}, ensure_ascii=False, indent=2))
    print(f"{len(found)} artists with a source, {len(missing)} missing -> {OUT.name}")


if __name__ == "__main__":
    main()
