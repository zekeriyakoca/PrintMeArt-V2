# Mobile QA

Walks the custom design flow (upload → Preview & Design → options → add to cart → cart sidebar → cart → checkout → Stripe)
on iPhone SE (320), iPhone 14, Pixel 7, Galaxy S9+, a 360 px phone, iPad Mini and desktop. Each step is screenshotted and
checked for: page wider than the screen, content cut off at an edge, clipped text, fields that make iOS zoom in (under
16 px), short fields, small tap targets, fixed layers covering each other, console errors.

```bash
npm run build && PORT=4000 node dist/store-front/server/server.mjs   # the SSR build: the dev server cannot serve /cart
scripts/mobile-qa/run.sh /tmp/qa-before                              # main
scripts/mobile-qa/run.sh /tmp/qa-after                               # your branch, after a rebuild
node scripts/mobile-qa/compare.mjs /tmp/qa-before /tmp/qa-after /tmp/qa-report   # open /tmp/qa-report/index.html
```

Uses Chrome (installed) for the Android/desktop devices and Playwright's WebKit for the Apple ones. The customer upload
container only allows the live site and :4200 for CORS, so locally the walk adds that header to blob responses.
