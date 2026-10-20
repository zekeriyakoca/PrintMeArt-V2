"""
Writes museum facts (museum-data.json) and stories (stories.json) into
catalog."Products"."Metadata", and artist bios (artists.json) into the Artist
attributes' Description and Metadata.Description_nl. Existing metadata keys are
kept: only the keys below are added or overwritten, so the script is safe to re-run.

    python3 import_museum_content.py            # dry run: shows what would change
    DATABASE_URL=postgresql://... python3 import_museum_content.py --apply
"""
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
FACT_KEYS = ("Museum", "Location", "ObjectNumber", "CreditLine", "Dimensions", "Subjects")
STORY_KEYS = ("Story", "Story_nl")
ARTIST_GROUP_ID = 5


def build_patches():
    facts = json.loads((HERE / "museum-data.json").read_text())["products"]
    stories = json.loads((HERE / "stories.json").read_text())
    patches = {}
    for pid, product in facts.items():
        patch = {k: product[k] for k in FACT_KEYS if product.get(k)}
        patch.update({k: v for k, v in stories.get(pid, {}).items() if k in STORY_KEYS})
        patches[int(pid)] = patch
    return patches


def load_bios():
    return json.loads((HERE / "artists.json").read_text())


def quote(text):
    return "'" + text.replace("'", "''") + "'"


def to_sql(patches, bios):
    lines = [
        f'UPDATE catalog."Products" SET "Metadata" = "Metadata" || $json${json.dumps(patch, ensure_ascii=False)}$json$::jsonb, '
        f'"UpdatedAt" = now() WHERE "Id" = {pid};'
        for pid, patch in sorted(patches.items())
    ] + [
        f'UPDATE catalog."ProductAttributes" SET "Description" = {quote(bio["bio"])}, '
        f'"Metadata" = coalesce("Metadata", \'{{}}\'::jsonb) || jsonb_build_object(\'Description_nl\', {quote(bio["bio_nl"])}) '
        f'WHERE "Id" = {int(aid)} AND "GroupId" = {ARTIST_GROUP_ID};'
        for aid, bio in sorted(bios.items(), key=lambda item: int(item[0]))
    ]
    return "\n".join(lines) + "\n"


def main():
    patches, bios = build_patches(), load_bios()
    with_story = sum(1 for p in patches.values() if "Story" in p)
    print(f"{len(patches)} products to update, {with_story} with a story; {len(bios)} artist bios")

    if "--apply" not in sys.argv:
        pid = next(pid for pid, p in patches.items() if "Story" in p)
        print(f"\nexample, product {pid}:\n{json.dumps(patches[pid], ensure_ascii=False, indent=2)}")
        print("\ndry run: nothing written. Pass --apply to write.")
        return

    subprocess.run(
        ["psql", os.environ["DATABASE_URL"], "-v", "ON_ERROR_STOP=1", "--single-transaction", "-q"],
        input=to_sql(patches, bios), text=True, check=True,
    )
    print("done")


if __name__ == "__main__":
    main()
