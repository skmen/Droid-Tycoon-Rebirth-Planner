import { useEffect, useMemo, useState } from 'react';
import { CYCLES, DARK, LIGHT, TIER_STYLE } from './data.js';
import { allDroidNames, normalizeInventory, recommendInventory, TIERS } from './inventoryLogic.js';
import { loadInventoryState, loadPersistedState, saveInventoryState, savePersistedState } from './storage.js';
import SettingsMenu from './SettingsMenu.jsx';

const order = { UPGRADE: 0, KEEP: 1, SELL: 2 };
const outline = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';

export default function Inventory() {
  const names = useMemo(() => allDroidNames(CYCLES), []);
  const [saved] = useState(() => loadPersistedState() || {});
  const [dark, setDark] = useState(() => saved.dark ?? true);
  const [cycle, setCycle] = useState(() => saved.cycle ?? 1);
  const [rebirth, setRebirth] = useState(() => saved.rebirth ?? 0);
  const [inventory, setInventory] = useState(() => normalizeInventory(loadInventoryState(), names));
  const [name, setName] = useState('');
  const [tier, setTier] = useState('DEFAULT');
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
  const counts = rows.reduce((result, row) => ({ ...result, [row.action]: result[row.action] + 1 }), { UPGRADE: 0, KEEP: 0, SELL: 0 });

  const add = (event) => {
    event.preventDefault();
    if (!names.includes(name)) return;
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    setInventory((current) => [...current, { id, name, tier }]);
    setName('');
  };

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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: 12 }}>
          <label><span style={label}>Cycle</span><select value={cycle} onChange={(event) => setCycle(Number(event.target.value))} style={field}>{CYCLES.map((_, i) => <option key={i} value={i + 1}>Cycle {i + 1}</option>)}</select></label>
          <label><span style={label}>Completed RB</span><input type="number" min="0" max="40" value={rebirth} onChange={(event) => setRebirth(Math.max(0, Math.min(40, Number.parseInt(event.target.value, 10) || 0)))} style={{ ...field, width: 96 }} /></label>
        </div>
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 14, margin: '0 0 4px' }}>Add a droid</h2>
        <p style={{ fontSize: 12, color: theme.textMuted, margin: '0 0 12px' }}>Add each copy separately. Change its tier here when you upgrade it.</p>
        <form onSubmit={add} className="inventory-form" style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) minmax(120px, 0.45fr) auto', gap: 10, alignItems: 'end' }}>
          <label style={{ minWidth: 0 }}><span style={label}>Droid</span><select required value={name} onChange={(event) => setName(event.target.value)} style={{ ...field, width: '100%' }}><option value="">Choose a droid…</option>{names.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label><span style={label}>Current tier</span><select value={tier} onChange={(event) => setTier(event.target.value)} style={{ ...field, width: '100%' }}>{TIERS.map((t) => <option key={t}>{t}</option>)}</select></label>
          <button type="submit" style={{ ...field, padding: '9px 18px', border: 'none', background: theme.accent, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>+ Add</button>
        </form>
      </section>

      <section style={card}>
        <h2 style={{ fontSize: 14, margin: '0 0 4px' }}>Your inventory</h2>
        <p style={{ fontSize: 12, color: theme.textMuted, margin: '0 0 14px' }}>{inventory.length} droids · {counts.UPGRADE} to upgrade · {counts.KEEP} to keep · {counts.SELL} to sell</p>
        {rows.length === 0 ? <p style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', padding: '20px 0' }}>Your inventory is empty. Add a droid above to get a recommendation.</p> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {rows.map((d) => {
              const color = d.action === 'SELL' ? theme.sellFg : d.action === 'KEEP' ? theme.keepFg : theme.accent;
              const background = d.action === 'SELL' ? theme.sellBg : d.action === 'KEEP' ? theme.keepBg : theme.accentSoftBg;
              return <article key={d.id} className="inventory-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) minmax(170px, 1.5fr) auto', gap: 12, alignItems: 'center', padding: '13px 14px', border: `1px solid ${theme.border}`, borderRadius: 12 }}>
                <div style={{ minWidth: 0 }}><strong style={{ display: 'block', fontSize: 13, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</strong>
                  {d.copyCount > 1 && <span style={{ display: 'block', fontSize: 10, color: theme.textMuted, marginBottom: 6 }}>Copy {d.copyNumber} of {d.copyCount}</span>}
                  <select aria-label={`Tier for ${d.name}${d.copyCount > 1 ? ` copy ${d.copyNumber}` : ''}`} value={d.tier} onChange={(event) => updateTier(d.id, event.target.value)} style={{ ...field, width: '100%', maxWidth: 150, background: TIER_STYLE[d.tier].bg, color: TIER_STYLE[d.tier].fg, textShadow: d.tier === 'RAINBOW' ? outline : 'none', fontWeight: 800 }}>{TIERS.map((t) => <option key={t}>{t}</option>)}</select>
                </div>
                <div><span style={{ display: 'inline-block', padding: '4px 9px', borderRadius: 999, background, color, fontSize: 10, fontWeight: 800 }}>{d.action === 'UPGRADE' ? 'KEEP & UPGRADE' : d.action}</span>
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
