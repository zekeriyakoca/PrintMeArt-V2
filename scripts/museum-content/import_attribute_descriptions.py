"""
Writes the descriptions in attribute-descriptions.json (museums, collections and
artists that had none) into catalog."ProductAttributes": English into Description,
Dutch into Metadata.Description_nl. Other metadata keys are kept; safe to re-run.
The storefront shows them above the product list for that attribute.

    python3 import_attribute_descriptions.py            # dry run
    DATABASE_URL=postgresql://... python3 import_attribute_descriptions.py --apply
"""
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent


def quote(text):
    return "'" + text.replace("'", "''") + "'"


def to_sql(descriptions):
    return "\n".join(
        f'UPDATE catalog."ProductAttributes" SET "Description" = {quote(d["description"])}, '
        f'"Metadata" = coalesce("Metadata", \'{{}}\'::jsonb) || jsonb_build_object(\'Description_nl\', {quote(d["description_nl"])}) '
        f'WHERE "Id" = {int(aid)} AND "Name" = {quote(d["name"])};'
        for aid, d in sorted(descriptions.items(), key=lambda item: int(item[0]))
    ) + "\n"


def main():
    descriptions = json.loads((HERE / "attribute-descriptions.json").read_text())
    print(f"{len(descriptions)} attribute descriptions")
    if "--apply" not in sys.argv:
        print("dry run: nothing written. Pass --apply to write.")
        return
    subprocess.run(
        ["psql", os.environ["DATABASE_URL"], "-v", "ON_ERROR_STOP=1", "--single-transaction", "-q"],
        input=to_sql(descriptions), text=True, check=True,
    )
    print("done")


if __name__ == "__main__":
    main()
