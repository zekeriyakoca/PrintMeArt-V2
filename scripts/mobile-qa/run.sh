#!/bin/bash
# Mobile regression walk: custom design page → editor → cart → checkout (→ Stripe), on 7 devices in parallel.
#   scripts/mobile-qa/run.sh <outDir> [baseUrl]
# The base URL must be an origin the APIs allow (localhost:4000 or :4200 locally; https://printmeart.nl).
# PAY=iphone-se,pixel-7 also opens the Stripe page on those devices (creates an unpaid draft order).
set -e
cd "$(dirname "$0")"
OUT=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
BASE=${2:-http://localhost:4000}
[ -d node_modules/playwright ] || PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund
npx playwright install webkit >/dev/null
# Test uploads: a portrait and a landscape image
[ -f portrait.jpg ] || sips -z 1536 1024 ../../public/share.jpg --out portrait.jpg >/dev/null
[ -f landscape.jpg ] || sips -z 1024 1536 ../../public/share.jpg --out landscape.jpg >/dev/null
mkdir -p "$OUT"
for d in iphone-se iphone-14 pixel-7 galaxy-s9 small-360 tablet-768 desktop; do
  node flow.mjs "$OUT" "$BASE" "$d" > "$OUT/$d.log" 2>&1 &
done
wait
cat "$OUT"/*.log
