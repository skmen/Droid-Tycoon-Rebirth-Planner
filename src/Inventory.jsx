import { useEffect, useMemo, useState } from 'react';
import { CYCLES, DARK, LIGHT, RARITY_BY_NAME, RARITY_COLOR, TIER_STYLE, TYPE_BY_NAME } from './data.js';
import { allDroidNames, normalizeInventory, recommendInventory, TIERS } from './inventoryLogic.js';
import { loadInventoryState, loadPersistedState, saveInventoryState, savePersistedState } from './storage.js';
import SettingsMenu from './SettingsMenu.jsx';

const order = { FUSE: 0, UPGRADE: 1, KEEP: 2, SELL: 3 };
const outline = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';

export default function Inventory() {
  const names = useMemo(() => allDroidNames(CYCLES), []);
  const [saved] = useState(() => loadPersistedState() || {});
  const [dark, setDark] = useState(() => saved.dark ?? true);
  const [cycle, setCycle] = useState(() => saved.cycle ?? 1);
  const [rebirth, setRebirth] = useState(() => saved.rebirth ?? 0);
  const [inventory, setInventory] = useState(() => normalizeInventory(loadInventoryState(), names));
  const [query, setQuery] = useState('');
  const [type, setType] = useState('ALL');
  const [tier, setTier] = useState('DEFAULT');
  const [sellOnly, setSellOnly] = useState(false);
  const [rebirthInput, setRebirthInput] = useState(() => String(saved.rebirth ?? 0));
  const theme = dark ? DARK : LIGHT;

  useEffect(() => savePersistedState({ dark, cycle, rebirth }), [dark, cycle, rebirth]);
  useEffect(() => saveInventoryState(inventory), [inventory]);

  const rows = useMemo(() => {
    const copies = new Map();
    for (const d of inventory) copies.set(d.name, (copies.get(d.name) || 0) + 1);
    const seen = new Map();
    return recommendInventory(inventory, CYCLES[cycle - 1], rebirth)
      .map((d) => {
        const copyNumber = (seen.get(d.name) || 0) + 1;
        seen.set(d.name, copyNumber);
        return { ...d, copyNumber, copyCount: copies.get(d.name) };
      })
      .sort((a, b) => order[a.action] - order[b.action] || a.name.localeCompare(b.name) || a.copyNumber - b.copyNumber);
  }, [inventory, cycle, rebirth]);
  const counts = rows.reduce((result, row) => ({ ...result, [row.action]: result[row.action] + 1 }), { FUSE: 0, UPGRADE: 0, KEEP: 0, SELL: 0 });
  const visibleRows = sellOnly ? rows.filter((row) => row.action === 'SELL') : rows;

  const add = (name) => {
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    setInventory((current) => [...current, { id, name, tier }]);
  };

  const toggle = (name) => {
    const owned = inventory.find((d) => d.name === name && d.tier === tier);
    if (owned) remove(owned.id);
    else add(name);
  };

  const matches = names.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()) && (type === 'ALL' || TYPE_BY_NAME[name] === type));
  const nextRow = CYCLES[cycle - 1].find((row) => row.step === rebirth + 1);

  const updateTier = (id, value) => setInventory((current) => current.map((d) => d.id === id ? { ...d, tier: value } : d));
  const remove = (id) => setInventory((current) => current.filter((d) => d.id !== id));
  const field = { padding: '9px 11px', minHeight: 40, borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 12 };
  const card = { background: theme.cardBg, borderRadius: 16, padding: '18px 20px' };
  const label = { display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: theme.textSecondary };

  return <div style={{ minHeight: '100vh', padding: '28px 20px 50px', background: theme.pageBg, color: theme.text }}>
    <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <a href="/" style={{ color: theme.text, textDecoration: 'none', fontSize: 18, fontWeight: 800 }}>🤖 Droid Tycoon RB Planner</a>
        <SettingsMenu theme={theme} dark={dark} onToggleTheme={() => setDark((value) => !value)} showAds={false} onToggleAds={() => {}} adsEnabled={false} />
      </div>
      <div>
        <h1 style={{ fontSize: 23, margin: 0 }}>Droid Inventory</h1>
        <p style={{ fontSize: 13, color: theme.textSecondary, margin: '5px 0 0' }}>Track your droids and see what to keep, upgrade, or sell for future rebirths.</p>
      </div>

      <section style={card}>
        <h2 style={{ fontSize: 14, margin: '0 0 4px' }}>Rebirth progress</h2>
        <p style={{ fontSize: 12, color: theme.textMuted, margin: '0 0 12px' }}>Shared with your planner. RB is the last rebirth you completed.</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {CYCLES.map((_, i) => i + 1).map((n) => <button key={n} type="button" onClick={() => setCycle(n)} style={{ padding: '9px 15px', borderRadius: 9, border: `1px solid ${n === cycle ? theme.accent : theme.pillBorder}`, background: n === cycle ? theme.accent : theme.pillBg, color: n === cycle ? '#fff' : theme.text, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cycle {n}</button>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <label htmlFor="inventory-rebirth" style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary }}>Current rebirth level</label>
          <button type="button" title="Super Rebirth: reset to RB 0 and advance to the next cycle" onClick={() => { setRebirth(0); setRebirthInput('0'); setCycle((current) => current >= CYCLES.length ? 1 : current + 1); }} style={{ padding: '4px 12px', borderRadius: 999, border: `1px solid ${theme.accent}`, background: theme.accentSoftBg, color: theme.accent, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>SRB</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 800, marginTop: 6 }}>
          <span>RB</span>
          <input id="inventory-rebirth" type="number" min="0" max="40" value={rebirthInput} onChange={(event) => { setRebirthInput(event.target.value); setRebirth(Math.max(0, Math.min(40, Number.parseInt(event.target.value, 10) || 0))); }} onBlur={() => setRebirthInput(String(rebirth))} style={{ ...field, width: 76, padding: '2px 10px', fontSize: 26, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }} />
          {nextRow && <button type="button" title={`Mark rebirth ${nextRow.step} complete`} onClick={() => { setRebirth(nextRow.step); setRebirthInput(String(nextRow.step)); }} style={{ padding: '4px 14px', borderRadius: 999, border: `1px solid ${theme.accent}`, background: theme.accentSoftBg, color: theme.accent, fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", cursor: 'pointer' }}>→ {nextRow.step}</button>}
        </div>
        {nextRow && <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8 }}>RB {nextRow.step} needs <strong style={{ color: theme.text }}>{nextRow.credits}</strong> credits</div>}
        {!nextRow && <div style={{ fontSize: 13, color: theme.accent, marginTop: 8 }}>Cycle complete — Super Rebirth to advance.</div>}
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 14, margin: '0 0 4px' }}>Add a droid</h2>
        <p style={{ fontSize: 12, color: theme.textMuted, margin: '0 0 12px' }}>Search by name, choose a type and tier, then click a result to add or remove it.</p>
        <label htmlFor="inventory-search" style={label}>Droid name</label>
        <input id="inventory-search" list="inventory-droid-names" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Mono-WLKR, R7, BB9…" style={{ ...field, width: '100%', padding: '11px 14px', fontSize: 14, marginBottom: 12 }} />
        <datalist id="inventory-droid-names">{matches.map((name) => <option key={name} value={name} />)}</datalist>
        <ToggleRow
          label="Type"
          options={[['ALL', 'All Types'], ['Worker', 'Worker'], ['Astromech', 'Astro'], ['Battle', 'Battle'], ['Protocol', 'Protocol']]}
          value={type}
          onChange={setType}
          theme={theme}
        />
        <ToggleRow
          label="Tier to add"
          options={TIERS.map((value) => [value, value])}
          value={tier}
          onChange={setTier}
          theme={theme}
        />
        <div role="region" aria-label="Droid search results" style={{ maxHeight: 320, overflowY: 'auto', border: `1px solid ${theme.rowBorder}`, borderRadius: 10 }}>
          <div className="inventory-result-grid" style={{ display: 'grid', minWidth: 430, gridTemplateColumns: 'minmax(100px, 1fr) 90px 90px 100px', gap: 6, padding: '9px 13px', background: theme.tableHeaderBg, color: theme.textMuted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', position: 'sticky', top: 0 }}><span>Droid name</span><span>Type</span><span>Rarity</span><span>Tier</span></div>
          {matches.map((name) => {
            const count = inventory.filter((d) => d.name === name && d.tier === tier).length;
            const rarity = RARITY_BY_NAME[name] || '—';
            return <div key={name} style={{ display: 'flex', minWidth: 430, alignItems: 'center', borderTop: `1px solid ${theme.rowBorder}`, background: count ? theme.keepBg : 'transparent' }}>
              <button type="button" onClick={() => toggle(name)} aria-label={`${count ? 'Remove one' : 'Add'} ${tier} ${name}${count ? ` (${count} owned)` : ''}`} className="inventory-result-grid" style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'minmax(100px, 1fr) 90px 90px 100px', gap: 6, alignItems: 'center', padding: '9px 13px', border: 0, background: 'transparent', color: theme.text, textAlign: 'left', fontSize: 12, cursor: 'pointer' }}>
                <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}{count > 0 && <span style={{ color: theme.keepFg }}> ✓ {count > 1 ? `×${count}` : ''}</span>}</strong><span>{TYPE_BY_NAME[name] || '—'}</span><span style={{ color: rarity === 'COMMON' && dark ? '#fff' : RARITY_COLOR[rarity] || theme.textMuted, fontWeight: 700 }}>{rarity}</span><span style={{ padding: '3px 6px', borderRadius: 6, background: TIER_STYLE[tier].bg, color: TIER_STYLE[tier].fg, fontSize: 10, fontWeight: 700, textShadow: tier === 'RAINBOW' ? outline : 'none' }}>{tier}</span>
              </button>
              {count > 0 && <button type="button" onClick={() => add(name)} aria-label={`Add another ${tier} ${name}`} title="Add another copy" style={{ marginRight: 8, border: `1px solid ${theme.keepFg}`, borderRadius: 6, background: theme.keepBg, color: theme.keepFg, fontWeight: 800, cursor: 'pointer' }}>+</button>}
            </div>;
          })}
          {matches.length === 0 && <div style={{ padding: '18px 13px', textAlign: 'center', fontSize: 12, color: theme.textMuted }}>No matching droids.</div>}
        </div>
      </section>

      <section style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
          <h2 style={{ fontSize: 14, margin: 0 }}>Your inventory</h2>
          <button type="button" aria-pressed={sellOnly} onClick={() => setSellOnly((current) => !current)} style={{ padding: '7px 12px', borderRadius: 9, border: `1px solid ${sellOnly ? theme.sellFg : theme.pillBorder}`, background: sellOnly ? theme.sellBg : theme.pillBg, color: sellOnly ? theme.sellFg : theme.text, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Show only droids to sell {sellOnly ? '✓' : ''}</button>
        </div>
        <p style={{ fontSize: 12, color: theme.textMuted, margin: '0 0 14px' }}>{inventory.length} droids · {counts.FUSE} fusion-ready · {counts.UPGRADE} to upgrade · {counts.KEEP} to keep · {counts.SELL} to sell</p>
        {rows.length === 0 ? <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', padding: '20px 0' }}>Your inventory is empty. Add a droid above to get a recommendation.</p> :
          visibleRows.length === 0 ? <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', padding: '20px 0' }}>No droids to sell at this rebirth level.</p> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {visibleRows.map((d) => {
              const color = d.action === 'SELL' ? theme.sellFg : d.action === 'KEEP' ? theme.keepFg : d.action === 'FUSE' ? '#9a6700' : theme.accent;
              const background = d.action === 'SELL' ? theme.sellBg : d.action === 'KEEP' ? theme.keepBg : d.action === 'FUSE' ? '#fef3c7' : theme.accentSoftBg;
              return <article key={d.id} className="inventory-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) minmax(180px, 1.3fr) auto', gap: 10, alignItems: 'center', padding: '9px 12px', border: `1px solid ${theme.border}`, borderRadius: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong title={d.name} style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</strong>
                    <select aria-label={`Tier for ${d.name}${d.copyCount > 1 ? ` copy ${d.copyNumber}` : ''}`} value={d.tier} onChange={(event) => updateTier(d.id, event.target.value)} style={{ ...field, minHeight: 30, width: 108, flexShrink: 0, padding: '4px 6px', background: TIER_STYLE[d.tier].bg, color: TIER_STYLE[d.tier].fg, textShadow: d.tier === 'RAINBOW' ? outline : 'none', fontSize: 10, fontWeight: 800 }}>{TIERS.map((t) => <option key={t}>{t}</option>)}</select>
                  </div>
                  {d.copyCount > 1 && <span style={{ display: 'block', fontSize: 10, color: theme.textMuted, marginTop: 3 }}>Copy {d.copyNumber} of {d.copyCount}</span>}
                </div>
                <div><span style={{ display: 'inline-block', padding: '4px 9px', borderRadius: 999, background, color, fontSize: 10, fontWeight: 800 }}>{d.action === 'UPGRADE' ? 'KEEP & UPGRADE' : d.action === 'FUSE' ? 'FUSE 3' : d.action}</span>
                  <div style={{ fontSize: 12, marginTop: 6, color: theme.text }}>{d.reason}</div>
                  {d.next && <div style={{ fontSize: 11, marginTop: 4, color: theme.textMuted }}>Next needed: RB {d.next.step} ({d.next.tier}) · Target: {d.target}</div>}
                </div>
                <button type="button" aria-label={`Remove ${d.name}${d.copyCount > 1 ? ` copy ${d.copyNumber}` : ''}`} title="Remove from inventory" onClick={() => remove(d.id)} style={{ ...field, minHeight: 32, width: 32, padding: 0, cursor: 'pointer', fontSize: 18 }}>×</button>
              </article>;
            })}
          </div>}
      </section>
      <p style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', lineHeight: 1.5 }}>Higher tiers cover lower requirements. One copy of a named droid is enough for the current rebirth data. Verify requirements at the Rebirth Station before selling.</p>
    </div>
  </div>;
}

function ToggleRow({ label, options, value, onChange, theme }) {
  return <div role="group" aria-label={label} style={{ marginBottom: 12 }}>
    <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, color: theme.textSecondary }}>{label}</div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(([optionValue, text]) => <button
        key={optionValue}
        type="button"
        aria-pressed={value === optionValue}
        onClick={() => onChange(optionValue)}
        style={{
          padding: '9px 12px', borderRadius: 9,
          border: `1px solid ${value === optionValue ? theme.accent : theme.pillBorder}`,
          background: value === optionValue ? theme.accent : theme.pillBg,
          color: value === optionValue ? '#fff' : theme.text,
          fontWeight: 700, fontSize: 12, cursor: 'pointer',
        }}
      >{text}</button>)}
    </div>
  </div>;
}
