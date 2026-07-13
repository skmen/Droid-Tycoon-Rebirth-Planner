import { useEffect, useMemo, useState } from 'react';
import { CYCLES, DARK, LIGHT, RARITY_BY_NAME, RARITY_COLOR, TIER_STYLE, TYPE_BY_NAME, parseRaw } from './data.js';
import TableRow from './TableRow.jsx';
import AdUnit from './AdUnit.jsx';
import SettingsMenu from './SettingsMenu.jsx';
import { loadPersistedState, savePersistedState } from './storage.js';

const AD_SLOT_TOP = '2218723355';
const AD_SLOT_SIDEBAR = '2804634020';

const RARITY_ORDER = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3, MYTHIC: 4, '—': -1 };
const TIER_ORDER = { DEFAULT: 0, GOLD: 1, DIAMOND: 2, RAINBOW: 3, BESKAR: 4 };
const OUTLINE = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';

function clampRebirth(v) {
  let n = parseInt(v, 10);
  if (isNaN(n)) n = 0;
  return Math.max(0, Math.min(27, n));
}

export default function App() {
  const [persisted] = useState(() => loadPersistedState() || {});
  const [rebirth, setRebirth] = useState(() => persisted.rebirth ?? 0);
  const [rebirthInput, setRebirthInput] = useState(() => String(persisted.rebirth ?? 0));
  const [cycle, setCycle] = useState(() => persisted.cycle ?? 1);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(() => persisted.dark ?? true);
  const [showAds, setShowAds] = useState(() => persisted.showAds ?? true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [filterTier, setFilterTier] = useState('ALL');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [expandedName, setExpandedName] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    savePersistedState({ rebirth, cycle, dark, showAds });
  }, [rebirth, cycle, dark, showAds]);

  const cycleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const theme = dark ? DARK : LIGHT;
  const rows = CYCLES[cycle - 1];
  const showRarityCol = !isMobile;
  const gridCols = isMobile ? '1fr 56px 76px 92px' : '1fr 60px 85px 90px 100px';

  const nextRow = rows.find((r) => r.step === rebirth + 1);
  const isMaxed = rebirth >= 27;
  const hasNext = !isMaxed && !!nextRow;

  const decorate = (it) => {
    const rarity = RARITY_BY_NAME[it.name] || '';
    const rawRarityColor = RARITY_COLOR[rarity] || theme.textSecondary;
    const rarityColor = rarity === 'COMMON' && dark ? '#ffffff' : rawRarityColor;
    const mobileNameColor = rarity === 'COMMON' ? rarityColor : rawRarityColor;
    const nameColor = isMobile ? mobileNameColor : rarity === 'COMMON' ? rarityColor : theme.text;
    return {
      ...it,
      rarity: rarity || '—',
      rarityColor,
      nameColor,
      type: TYPE_BY_NAME[it.name] || '—',
      tierBg: (TIER_STYLE[it.tier] || TIER_STYLE.DEFAULT).bg,
      tierFg: (TIER_STYLE[it.tier] || TIER_STYLE.DEFAULT).fg,
      textOutline: it.tier === 'RAINBOW' ? OUTLINE : 'none',
    };
  };

  // Combines tier/rarity styling (decorate) with the keep/sell verdict for
  // each droid required by the next rebirth — one source of truth used by
  // both the mobile combined list and the desktop two-section layout.
  const nextDroids = nextRow
    ? parseRaw(nextRow.raw).map((it) => {
        const decorated = decorate(it);
        const laterOccurrences = rows
          .filter((r) => r.step > nextRow.step)
          .flatMap((r) => parseRaw(r.raw).filter((x) => x.name === it.name).map((x) => ({ ...x, step: r.step })));
        const sameTierLater = laterOccurrences.find((x) => x.tier === it.tier);
        const higherTierLater = laterOccurrences.find((x) => x.tier !== it.tier);
        if (sameTierLater) {
          return { ...decorated, badge: '⚠ KEEP', badgeBg: theme.sellBg, badgeFg: theme.sellFg, note: `Needed again at RB ${sameTierLater.step}.` };
        }
        if (higherTierLater) {
          return {
            ...decorated,
            badge: '↑ SELL, OR UPGRADE',
            badgeBg: theme.unlockBg,
            badgeFg: theme.unlockFg,
            note: `You can sell this ${it.tier} now, but you'll need a ${higherTierLater.tier} version by RB ${higherTierLater.step}.`,
          };
        }
        return { ...decorated, badge: '✓ SELL', badgeBg: theme.keepBg, badgeFg: theme.keepFg, note: '' };
      })
    : [];

  let upcomingTable = [];
  rows
    .filter((r) => r.step > rebirth)
    .forEach((r) => {
      parseRaw(r.raw).forEach((it) => upcomingTable.push({ name: it.name, tier: it.tier, step: r.step }));
    });
  upcomingTable.sort((a, b) => a.step - b.step || a.name.localeCompare(b.name));
  upcomingTable = upcomingTable.map(decorate);

  const q = query.trim().toLowerCase();
  if (q) upcomingTable = upcomingTable.filter((r) => r.name.toLowerCase().includes(q));
  if (filterType !== 'ALL') upcomingTable = upcomingTable.filter((r) => r.type === filterType);
  if (filterRarity !== 'ALL') upcomingTable = upcomingTable.filter((r) => r.rarity === filterRarity);
  if (filterTier !== 'ALL') upcomingTable = upcomingTable.filter((r) => r.tier === filterTier);

  if (sortKey) {
    upcomingTable = [...upcomingTable].sort((a, b) => {
      let av, bv;
      if (sortKey === 'name') {
        av = a.name;
        bv = b.name;
      } else if (sortKey === 'type') {
        av = a.type;
        bv = b.type;
      } else if (sortKey === 'rarity') {
        av = RARITY_ORDER[a.rarity] ?? -1;
        bv = RARITY_ORDER[b.rarity] ?? -1;
      } else if (sortKey === 'tier') {
        av = TIER_ORDER[a.tier] ?? 0;
        bv = TIER_ORDER[b.tier] ?? 0;
      }
      if (av < bv) return -1 * sortDir;
      if (av > bv) return 1 * sortDir;
      return a.name.localeCompare(b.name);
    });
  }

  upcomingTable = upcomingTable.map((r) => {
    const expanded = expandedName === r.name;
    let occurrencesText = '';
    if (expanded) {
      const occ = rows
        .filter((rr) => rr.step > rebirth)
        .flatMap((rr) => parseRaw(rr.raw).filter((it) => it.name === r.name).map((it) => `RB ${rr.step} (${it.tier})`));
      occurrencesText = occ.length ? `Needed at: ${occ.join(', ')}` : 'Not required again this cycle.';
    }
    return { ...r, expanded, occurrencesText };
  });

  let verdict = null;
  if (q) {
    const upcomingMatches = [];
    const pastMatches = [];
    rows.forEach((r) => {
      parseRaw(r.raw).forEach((it) => {
        if (it.name.toLowerCase().includes(q)) {
          const entry = { ...it, step: r.step };
          (r.step > rebirth ? upcomingMatches : pastMatches).push(entry);
        }
      });
    });
    upcomingMatches.sort((a, b) => a.step - b.step);
    if (upcomingMatches.length) {
      const list = upcomingMatches.map((m) => `RB ${m.step} (${m.tier})`).join(', ');
      verdict = { badge: '⚠ KEEP', bg: theme.sellBg, fg: theme.sellFg, detail: `Needed at: ${list}.` };
    } else if (pastMatches.length) {
      verdict = { badge: '✓ SAFE TO SELL', bg: theme.keepBg, fg: theme.keepFg, detail: 'Only needed earlier this cycle — not required again.' };
    } else {
      verdict = { badge: '✓ SAFE TO SELL', bg: theme.keepBg, fg: theme.keepFg, detail: `"${query.trim()}" isn't required anywhere in Cycle ${cycle}.` };
    }
  }

  const droidNamesDatalist = useMemo(() => {
    const allNames = new Set();
    CYCLES.forEach((c) => c.forEach((r) => parseRaw(r.raw).forEach((it) => allNames.add(it.name))));
    return Array.from(allNames).sort();
  }, []);

  const sortArrow = (key) => (sortKey === key ? (sortDir === 1 ? ' ▲' : ' ▼') : '');

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '28px 20px 50px',
        background: theme.pageBg,
        color: theme.text,
        transition: 'background 0.15s',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                <rect width="36" height="36" rx="10" fill="#312e81" />
                <path d="M9 22a9 9 0 0 1 18 0z" fill="#818cf8" />
                <circle cx="14.5" cy="17" r="1.8" fill="#1f2430" />
                <circle cx="21.5" cy="17" r="1.8" fill="#1f2430" />
                <rect x="9" y="24" width="18" height="4" rx="2" fill="#4f46e5" />
              </svg>
              <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Droid Tycoon Rebirth Planner</h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: theme.textSecondary, maxWidth: 520 }}>
              Unofficial fan tool — plan your next rebirth and check droids to keep or sell.
            </p>
          </div>
          <SettingsMenu
            theme={theme}
            dark={dark}
            onToggleTheme={() => setDark((d) => !d)}
            showAds={showAds}
            onToggleAds={() => setShowAds((s) => !s)}
          />
        </div>

        {showAds && !isMobile && (
          <div
            style={{
              border: `1px solid ${theme.adBorder}`,
              borderRadius: 12,
              background: theme.adBg,
              padding: 8,
              boxSizing: 'border-box',
              minHeight: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <AdUnit slot={AD_SLOT_TOP} width={728} height={90} />
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
          <div style={{ flex: '2 1 520px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <div style={{ background: theme.cardBg, borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCycle(n)}
                    style={{
                      padding: '9px 15px',
                      borderRadius: 9,
                      border: `1px solid ${n === cycle ? theme.accent : theme.pillBorder}`,
                      background: n === cycle ? theme.accent : theme.pillBg,
                      color: n === cycle ? '#fff' : theme.text,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Cycle {n}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary }}>Current rebirth level</label>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 800 }}>
                    <span>RB</span>
                    <input
                      type="number"
                      min="0"
                      max="27"
                      value={rebirthInput}
                      onChange={(e) => {
                        setRebirthInput(e.target.value);
                        setRebirth(clampRebirth(e.target.value));
                      }}
                      onBlur={() => setRebirthInput(String(rebirth))}
                      style={{
                        width: 76,
                        padding: '2px 10px',
                        borderRadius: 9,
                        border: `1px solid ${theme.border}`,
                        fontSize: 26,
                        fontWeight: 800,
                        fontFamily: "'JetBrains Mono',monospace",
                        color: theme.text,
                        background: theme.inputBg,
                      }}
                    />
                    {hasNext && <span>→ {nextRow.step}</span>}
                  </div>
                  {hasNext && (
                    <div style={{ fontSize: 13, color: theme.textSecondary }}>
                      needs{' '}
                      <span style={{ fontWeight: 800, fontSize: 19, color: '#fff', textShadow: OUTLINE, fontFamily: "'JetBrains Mono',monospace" }}>
                        {nextRow.credits}
                      </span>{' '}
                      credits
                    </div>
                  )}
                  {hasNext && !!nextRow.unlocks && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: theme.unlockFg, background: theme.unlockBg, padding: '4px 10px', borderRadius: 999 }}>
                      unlocks {nextRow.unlocks}
                    </div>
                  )}
                </div>
              </div>

              {isMaxed && (
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.accent, background: theme.accentSoftBg, borderRadius: 12, padding: '14px 16px' }}>
                  Cycle complete — Super Rebirth to advance into the next cycle.
                </div>
              )}

              {hasNext && (
                <div>
                  <hr style={{ border: 'none', borderTop: `1px solid ${theme.rowBorder}`, margin: '0 0 14px' }} />

                  {isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 0 4px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Droid</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>After rebirth</span>
                      </div>
                      {nextDroids.map((d, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0', borderBottom: `1px solid ${theme.rowBorder}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: d.tierBg,
                                color: d.tierFg,
                                padding: '7px 11px',
                                borderRadius: 9,
                                fontSize: 12,
                                fontWeight: 700,
                                textShadow: d.textOutline,
                              }}
                            >
                              <span style={{ fontSize: 9, letterSpacing: '0.06em', opacity: 0.9 }}>{d.tier}</span>
                              <span>{d.name}</span>
                            </div>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 11,
                                color: d.badgeFg,
                                background: d.badgeBg,
                                padding: '3px 9px',
                                borderRadius: 999,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {d.badge}
                            </span>
                          </div>
                          {!!d.note && <div style={{ fontSize: 11, color: theme.textMuted }}>{d.note}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                        {nextDroids.map((d, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              background: d.tierBg,
                              color: d.tierFg,
                              padding: '7px 11px',
                              borderRadius: 9,
                              fontSize: 12,
                              fontWeight: 700,
                              textShadow: d.textOutline,
                            }}
                          >
                            <span style={{ fontSize: 9, letterSpacing: '0.06em', opacity: 0.9 }}>{d.tier}</span>
                            <span>{d.name}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: `1px solid ${theme.rowBorder}`, paddingTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          After this rebirth
                        </div>
                        {nextDroids.map((v, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: `1px solid ${theme.rowBorder}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12 }}>
                              <span style={{ fontWeight: 600, color: theme.text }}>
                                {v.tier} {v.name}
                              </span>
                              <span
                                style={{
                                  fontWeight: 800,
                                  fontSize: 11,
                                  color: v.badgeFg,
                                  background: v.badgeBg,
                                  padding: '3px 9px',
                                  borderRadius: 999,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {v.badge}
                              </span>
                            </div>
                            {!!v.note && <div style={{ fontSize: 11, color: theme.textMuted }}>{v.note}</div>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ background: theme.cardBg, borderRadius: 16, padding: '18px 20px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Keep or sell?</h2>
              <p style={{ margin: '0 0 12px', fontSize: 12, color: theme.textMuted }}>Type a droid's name to check Cycle {cycle}.</p>

              <input
                list="droid-names"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Mono-WLKR, R7, BB9…"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: 9,
                  border: `1px solid ${theme.border}`,
                  fontSize: 14,
                  marginBottom: 12,
                  background: theme.inputBg,
                  color: theme.text,
                }}
              />
              <datalist id="droid-names">
                {droidNamesDatalist.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>

              {verdict && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 15px', borderRadius: 10, background: verdict.bg, marginBottom: 14 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: verdict.fg }}>{verdict.badge}</div>
                  <div style={{ fontSize: 12, color: verdict.fg, fontWeight: 600 }}>{verdict.detail}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle(theme)}>
                  <option value="ALL">All Types</option>
                  <option value="Worker">Worker</option>
                  <option value="Astromech">Astromech</option>
                  <option value="Battle">Battle</option>
                </select>
                {showRarityCol && (
                  <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} style={selectStyle(theme)}>
                    <option value="ALL">All Rarities</option>
                    <option value="COMMON">Common</option>
                    <option value="RARE">Rare</option>
                    <option value="EPIC">Epic</option>
                    <option value="LEGENDARY">Legendary</option>
                    <option value="MYTHIC">Mythic</option>
                  </select>
                )}
                <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} style={selectStyle(theme)}>
                  <option value="ALL">All Tiers</option>
                  <option value="DEFAULT">Default</option>
                  <option value="GOLD">Gold</option>
                  <option value="DIAMOND">Diamond</option>
                  <option value="RAINBOW">Rainbow</option>
                  <option value="BESKAR">Beskar</option>
                </select>
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto', border: `1px solid ${theme.rowBorder}`, borderRadius: 10 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: gridCols,
                    fontSize: 10,
                    fontWeight: 700,
                    color: theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '9px 13px',
                    background: theme.tableHeaderBg,
                    position: 'sticky',
                    top: 0,
                  }}
                >
                  <div onClick={() => cycleSort('name')} style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'left' }}>
                    Droid{sortArrow('name')}
                  </div>
                  <div style={{ textAlign: 'center' }}>RB</div>
                  <div onClick={() => cycleSort('type')} style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}>
                    Type{sortArrow('type')}
                  </div>
                  {showRarityCol && (
                    <div onClick={() => cycleSort('rarity')} style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}>
                      Rarity{sortArrow('rarity')}
                    </div>
                  )}
                  <div onClick={() => cycleSort('tier')} style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}>
                    Tier{sortArrow('tier')}
                  </div>
                </div>
                {upcomingTable.map((row) => (
                  <TableRow
                    key={`${row.step}-${row.tier}-${row.name}`}
                    theme={theme}
                    row={row}
                    gridCols={gridCols}
                    showRarityCol={showRarityCol}
                    expanded={row.expanded}
                    onToggle={() => setExpandedName((cur) => (cur === row.name ? null : row.name))}
                  />
                ))}
                {upcomingTable.length === 0 && (
                  <div style={{ padding: '18px 13px', fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                    Nothing left to gather this cycle.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 220 }}>
            {showAds && (
              <div
                style={{
                  border: `1px solid ${theme.adBorder}`,
                  borderRadius: 12,
                  background: theme.adBg,
                  padding: 8,
                  boxSizing: 'border-box',
                  minHeight: 250,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <AdUnit slot={AD_SLOT_SIDEBAR} width={300} height={250} />
              </div>
            )}
            <div
              style={{
                background: theme.cardBg,
                borderRadius: 16,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 12,
                color: theme.textSecondary,
                lineHeight: 1.5,
              }}
            >
              <div>
                Required droids must be <strong style={{ color: theme.text }}>active</strong> in your base — the rest area counts, the Droidex doesn't.
              </div>
              <div>Higher tiers cover lower ones for the same droid.</div>
            </div>
          </div>
        </div>

        <p style={{ margin: '4px 0 0', fontSize: 11, color: theme.textMuted, textAlign: 'center' }}>
          Requirements are community-sourced and may shift with updates — verify at the Rebirth Station before selling.
        </p>
      </div>
    </div>
  );
}

function selectStyle(theme) {
  return {
    padding: '7px 10px',
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    background: theme.inputBg,
    color: theme.text,
    fontSize: 12,
  };
}
