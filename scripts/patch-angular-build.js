// Temporary patch for @angular/build dev-server requiring ESM-only Vite via CommonJS.
// Safely replaces require-based imports with dynamic import() to avoid ERR_REQUIRE_ESM.
// Remove once @angular/build ships a native fix.

const fs = require('node:fs');
const path = require('node:path');

const patches = [
  {
    file: path.join('node_modules', '@angular', 'build', 'src', 'builders', 'dev-server', 'vite', 'index.js'),
    replacements: [
      {
        from: "const { createServer, normalizePath } = await Promise.resolve().then(() => __importStar(require('vite')));",
        to: "const { createServer, normalizePath } = await import('vite');",
      },
    ],
  },
  {
    file: path.join('node_modules', '@angular', 'build', 'src', 'builders', 'dev-server', 'vite', 'server.js'),
    replacements: [
      {
        from: "const { normalizePath } = await Promise.resolve().then(() => __importStar(require('vite')));",
        to: "const { normalizePath } = await import('vite');",
      },
      {
        from: "const { default: basicSslPlugin } = await Promise.resolve().then(() => __importStar(require('@vitejs/plugin-basic-ssl')));",
        to: "const { default: basicSslPlugin } = await import('@vitejs/plugin-basic-ssl');",
      },
    ],
  },
];

let patchedAny = false;

for (const { file, replacements } of patches) {
  if (!fs.existsSync(file)) {
    console.warn(`[patch-angular-build] Skipped missing file: ${file}`);
    continue;
  }

  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  for (const { from, to } of replacements) {
    if (content.includes(to)) {
      continue;
    }
    if (!content.includes(from)) {
      console.warn(`[patch-angular-build] Pattern not found in ${file}, leaving untouched.`);
      continue;
    }
    content = content.replace(from, to);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.info(`[patch-angular-build] Patched ${file}`);
    patchedAny = true;
  }
}

if (!patchedAny) {
  console.info('[patch-angular-build] No changes applied (already patched or patterns missing).');
}
