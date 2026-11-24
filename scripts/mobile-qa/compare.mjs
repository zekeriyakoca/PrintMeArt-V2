// node compare.mjs <beforeDir> <afterDir> <outDir>: copies the screenshots and writes index.html (before | after per step)
import fs from 'node:fs';
import path from 'node:path';

const [BEFORE, AFTER, OUT] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const KINDS = ['page-h-overflow', 'off-screen-x', 'text-clipped', 'ios-zoom-input', 'short-field', 'small-tap', 'fixed-overlap', 'tiny-text'];
const read = (dir, dev) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, dev, 'report.json'), 'utf8'));
  } catch {
    return null;
  }
};
const devices = fs.readdirSync(BEFORE).filter((d) => fs.statSync(path.join(BEFORE, d)).isDirectory());
const count = (r) => {
  const c = Object.fromEntries(KINDS.map((k) => [k, 0]));
  for (const s of r?.steps ?? []) for (const i of s.issues ?? []) c[i.kind] = (c[i.kind] ?? 0) + 1;
  return c;
};

let totals = '';
let body = '';
for (const dev of devices) {
  const b = read(BEFORE, dev);
  const a = read(AFTER, dev);
  const cb = count(b);
  const ca = count(a);
  totals += `<tr><th>${dev}</th>${KINDS.map((k) => `<td class="${ca[k] < cb[k] ? 'better' : ca[k] > cb[k] ? 'worse' : ''}">${cb[k]} → ${ca[k]}</td>`).join('')}<td>${b?.console.length ?? '-'} → ${a?.console.length ?? '-'}</td></tr>`;
  for (const side of ['before', 'after']) fs.mkdirSync(path.join(OUT, side, dev), { recursive: true });
  const steps = new Map();
  for (const [side, r, dir] of [['before', b, BEFORE], ['after', a, AFTER]]) {
    for (const s of r?.steps ?? []) {
      const key = s.step.replace(/^\d+-|^!! /, '');
      const entry = steps.get(key) ?? {};
      entry[side] = s;
      steps.set(key, entry);
    }
    for (const f of fs.existsSync(path.join(dir, dev)) ? fs.readdirSync(path.join(dir, dev)) : [])
      if (f.endsWith('.png')) fs.copyFileSync(path.join(dir, dev, f), path.join(OUT, side, dev, f));
  }
  body += `<section id="${dev}"><h2>${dev} <small>${b?.viewport ? b.viewport.width + '×' + b.viewport.height : ''}</small></h2>`;
  if (a?.cartOptions) body += `<p class="opts">Cart options (after): ${esc(a.cartOptions.join(' · '))}</p>`;
  for (const [key, e] of steps) {
    const cell = (side) => {
      const s = e[side];
      if (!s) return '<div class="cell missing">—</div>';
      if (s.error) return `<div class="cell"><p class="err">Step failed: ${esc(s.error)}</p><img loading="lazy" src="${side}/${dev}/ERR-${esc(key)}.png" onerror="this.remove()"></div>`;
      const issues = (s.issues ?? []).filter((i) => i.kind !== 'tiny-text');
      const full = `${side}/${dev}/${s.step}-full.png`;
      const hasFull = fs.existsSync(path.join(OUT, full));
      return `<div class="cell"><a href="${side}/${dev}/${s.step}-view.png" target="_blank"><img loading="lazy" src="${side}/${dev}/${s.step}-view.png"></a>
        ${hasFull ? `<a class="full" href="${full}" target="_blank">full page</a>` : ''}
        <ul>${issues.map((i) => `<li><b>${i.kind}</b> ${esc(i.detail)}</li>`).join('') || '<li class="ok">no layout issues found</li>'}</ul></div>`;
    };
    body += `<div class="step"><h3>${esc(key)}</h3><div class="pair"><div><h4>Before</h4>${cell('before')}</div><div><h4>After</h4>${cell('after')}</div></div></div>`;
  }
  body += '</section>';
}

fs.writeFileSync(
  path.join(OUT, 'index.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mobile QA before / after</title>
<style>
body{font:14px/1.45 -apple-system,system-ui,sans-serif;margin:0;padding:16px 24px;color:#0f172a;background:#f8fafc}
h1{margin:0 0 4px}nav a{margin-right:12px}table{border-collapse:collapse;margin:12px 0 24px;background:#fff}
td,th{border:1px solid #e2e8f0;padding:4px 8px;text-align:center;font-size:12px}td.better{background:#dcfce7}td.worse{background:#fee2e2}
section{margin:32px 0;padding-top:8px;border-top:2px solid #cbd5e1}.step{margin:18px 0;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.cell img{max-width:100%;max-height:640px;border:1px solid #cbd5e1;border-radius:6px;display:block}
h3{margin:0 0 6px}h4{margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase}ul{margin:6px 0 0;padding-left:18px;font-size:12px}
li.ok{color:#15803d;list-style:none;margin-left:-18px}.err{color:#b91c1c}.full{font-size:12px}.opts{font-size:12px;color:#475569}
</style></head><body><h1>Mobile QA: custom page → payment</h1>
<p>Same build and backend on both sides; "before" = current main, "after" = this branch. Counts per issue type over all steps (before → after). Tiny text (under 10.5px) is counted but not listed.</p>
<table><tr><th>device</th>${KINDS.map((k) => `<th>${k}</th>`).join('')}<th>console errors</th></tr>${totals}</table>
<nav>${devices.map((d) => `<a href="#${d}">${d}</a>`).join('')}</nav>${body}</body></html>`,
);
console.log('written ' + path.join(OUT, 'index.html'));
