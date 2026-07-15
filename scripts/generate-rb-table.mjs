// Generates public/rb-requirements.html from src/droid-data.json at build time,
// so the published table can never drift out of sync with the app's real data.
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const droidData = JSON.parse(readFileSync(path.join(root, 'src/droid-data.json'), 'utf8'));

const TIER_STYLE = {
  DEFAULT: { bg: '#eef0f4', fg: '#4b5563' },
  GOLD: { bg: '#fef3c7', fg: '#92620a' },
  DIAMOND: { bg: '#bfe3fb', fg: '#0c3f66' },
  RAINBOW: { bg: 'linear-gradient(90deg,#ff5757,#ffb347,#ffe066,#5ce65c,#5cb8ff,#a76cf7)', fg: '#ffffff' },
  BESKAR: { bg: 'linear-gradient(135deg,#e8e9eb,#9aa0a6 45%,#c9ccd1)', fg: '#000000' },
};
const OUTLINE = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';

function parseRaw(raw) {
  const parts = raw.split(/\b(BASE|GOLD|DIAMOND|RAINBOW|BESKAR)\b/).filter((s) => s.trim().length);
  const out = [];
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i + 1] !== undefined) {
      const t = parts[i].trim();
      out.push({ tier: t === 'BASE' ? 'DEFAULT' : t, name: parts[i + 1].trim() });
    }
  }
  return out;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function droidPill({ tier, name }) {
  const style = TIER_STYLE[tier] || TIER_STYLE.DEFAULT;
  const outline = tier === 'RAINBOW' ? `text-shadow:${OUTLINE};` : '';
  return `<span class="pill" style="background:${style.bg};color:${style.fg};${outline}"><span class="pill-tier">${escapeHtml(tier)}</span> ${escapeHtml(name)}</span>`;
}

function cycleTable(rows, cycleNum) {
  const body = rows
    .map(
      (r) => `<tr>
        <td class="rb">${r.step}</td>
        <td>${escapeHtml(r.credits)}</td>
        <td>${r.unlocks ? escapeHtml(r.unlocks) : '<span class="muted">—</span>'}</td>
        <td class="droids">${parseRaw(r.raw).map(droidPill).join(' ')}</td>
      </tr>`
    )
    .join('\n');
  return `<h2>Cycle ${cycleNum}</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>RB</th><th>Credits</th><th>Unlocks</th><th>Droids required</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
}

const tables = droidData.cycles.map((rows, i) => cycleTable(rows, i + 1)).join('\n\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Droid Tycoon Rebirth Requirements — All Cycles & Levels</title>
<meta name="description" content="The full rebirth requirements data set used by Droid Tycoon RB Planner, published so the community can verify and flag corrections." />
<link rel="canonical" href="https://nextrebirth.app/rb-requirements.html" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: #131420; color: #e7e8f0; line-height: 1.6; }
  a { color: #818cf8; }
  a:hover { color: #a5b4fc; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 28px 20px 60px; }
  .topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 28px; }
  .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
  .brand span { font-size: 23px; font-weight: 800; letter-spacing: -0.02em; }
  .menu { position: relative; flex-shrink: 0; }
  .menu-btn { width: 38px; height: 38px; padding: 0; border-radius: 9px; border: 1px solid #2c2f42; background: #1b1d2b; color: #e7e8f0; font-size: 16px; line-height: 1; cursor: pointer; }
  .menu-dropdown { display: none; position: absolute; top: calc(100% + 6px); right: 0; min-width: 180px; background: #1b1d2b; border: 1px solid #2c2f42; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); padding: 6px; z-index: 50; flex-direction: column; gap: 2px; }
  .menu-dropdown.open { display: flex; }
  .menu-dropdown a { display: block; padding: 9px 10px; border-radius: 8px; color: #e7e8f0; text-decoration: none; font-size: 13px; font-weight: 600; }
  .menu-dropdown a:hover { background: #20222f; }
  .title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .title-row h1 { margin: 0; }
  .back-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 9px; border: 1px solid #2c2f42; background: #1b1d2b; color: #e7e8f0; text-decoration: none; flex-shrink: 0; font-size: 18px; }
  .back-btn:hover { background: #20222f; }
  h1 { font-size: 26px; font-weight: 800; margin: 0 0 6px; }
  .lede { font-size: 14px; color: #9296b0; margin: 0 0 28px; max-width: 640px; }
  h2 { font-size: 16px; font-weight: 700; margin: 32px 0 10px; }
  p { font-size: 14px; color: #c7c9d9; }
  .table-wrap { overflow-x: auto; border: 1px solid #2c2f42; border-radius: 12px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7086; background: #20222f; padding: 9px 12px; white-space: nowrap; }
  td { padding: 9px 12px; border-top: 1px solid #2a2c3d; vertical-align: top; }
  td.rb { font-family: 'JetBrains Mono', monospace; color: #9296b0; }
  td.droids { display: flex; flex-wrap: wrap; gap: 6px; }
  .muted { color: #6b7086; }
  .pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .pill-tier { font-size: 8px; letter-spacing: 0.05em; opacity: 0.85; }
  footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #2c2f42; font-size: 12px; color: #6b7086; display: flex; flex-wrap: wrap; gap: 14px; }
  footer a { color: #9296b0; }
</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <a class="brand" href="/">
      <svg width="36" height="36" viewBox="0 0 36 36">
        <rect width="36" height="36" rx="10" fill="#312e81" />
        <path d="M9 22a9 9 0 0 1 18 0z" fill="#818cf8" />
        <circle cx="14.5" cy="17" r="1.8" fill="#1f2430" />
        <circle cx="21.5" cy="17" r="1.8" fill="#1f2430" />
        <rect x="9" y="24" width="18" height="4" rx="2" fill="#4f46e5" />
      </svg>
      <span>Droid Tycoon RB Planner</span>
    </a>
    <div class="menu">
      <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false">☰</button>
      <div class="menu-dropdown" id="menuDropdown">
        <a href="/">Home</a>
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
        <a href="/how-to.html">How to use</a>
      </div>
    </div>
  </div>

  <div class="title-row">
    <a class="back-btn" href="/" title="Back to planner" aria-label="Back to planner">←</a>
    <h1>Droid Tycoon Rebirth Requirements</h1>
  </div>
  <p class="lede">The complete rebirth requirements data set used by the planner — every cycle, every rebirth level, straight from the same source file the app runs on. If anything here doesn't match what you're seeing in-game, please <a href="/contact.html">let us know</a>.</p>

  ${tables}

  <footer>
    <a href="/">← Back to planner</a>
    <a href="/privacy.html">Privacy Policy</a>
    <a href="/about.html">About</a>
    <a href="/contact.html">Contact</a>
    <a href="/how-to.html">How to use</a>
  </footer>
</div>
<script>
  var menuBtn = document.getElementById('menuBtn');
  var menuDropdown = document.getElementById('menuDropdown');
  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = menuDropdown.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    if (!menuDropdown.contains(e.target) && e.target !== menuBtn) {
      menuDropdown.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      menuDropdown.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
</script>
</body>
</html>
`;

writeFileSync(path.join(root, 'public/rb-requirements.html'), html);
console.log('Generated public/rb-requirements.html');
