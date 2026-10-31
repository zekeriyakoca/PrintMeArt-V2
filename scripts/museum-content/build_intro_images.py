"""Writes src/app/shared/intro-images.ts from intro-images.json. Run from the repo root."""
import json, subprocess
from pathlib import Path

BLOB = "https://genstorageaccount3116.blob.core.windows.net/printme-images/"
images = json.loads(Path("scripts/museum-content/intro-images.json").read_text())
lines = [f"  {json.dumps(i['key'], ensure_ascii=False)}: '{BLOB}{i['file']}'," for i in images]
Path("src/app/shared/intro-images.ts").write_text(
    "/**\n"
    " * The image shown beside the introduction of a category, artist, museum or collection page,\n"
    " * keyed by the same name as the page's categoryName or attributeName. Pages without one show only the text.\n"
    " * Generated from scripts/museum-content/intro-images.json by build_intro_images.py; do not edit by hand.\n"
    " */\n"
    "export const INTRO_IMAGES: Record<string, string> = {\n" + "\n".join(lines) + "\n};\n")
subprocess.run(["npx", "prettier", "--write", "src/app/shared/intro-images.ts"], check=True)
