import { useEffect, useMemo, useState } from 'react';
import { CYCLES, DARK, LIGHT, RARITY_BY_NAME, RARITY_COLOR, TIER_DOT_COLOR, TIER_ORDER, TIER_STYLE, TYPE_BY_NAME, buildCycleRoadmap } from './data.js';
import { loadPersistedState, savePersistedState } from './storage.js';
import SettingsMenu from './SettingsMenu.jsx';

const OUTLINE = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
const TIER_GROUPS = Object.keys(TIER_ORDER).sort((a, b) => TIER_ORDER[b] - TIER_ORDER[a]);
const RAINBOW_DOT_GRADIENT_ID = 'roadmapRainbowDot';

export default function Roadmap() {
  const [persisted] = useState(() => loadPersistedState() || {});
  const [dark, setDark] = useState(() => persisted.dark ?? true);
  const [cycle, setCycle] = useState(() => (persisted.cycle && persisted.cycle <= CYCLES.length ? persisted.cycle : 1));
  const [view, setView] = useState('list');
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [expandedName, setExpandedName] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    savePersistedState({ ...persisted, dark, cycle });
  }, [dark, cycle]);

  const theme = dark ? DARK : LIGHT;

  const stepCount = CYCLES[cycle - 1].length;

  const roadmap = useMemo(() => {
    const rows = CYCLES[cycle - 1];
    return buildCycleRoadmap(rows).map((d) => {
      const rarity = RARITY_BY_NAME[d.name] || '';
      const rawRarityColor = RARITY_COLOR[rarity] || theme.textSecondary;
      const rarityColor = rarity === 'COMMON' && dark ? '#ffffff' : rawRarityColor;
      return { ...d, rarity: rarity || '—', rarityColor, type: TYPE_BY_NAME[d.name] || '—' };
    });
  }, [cycle, dark]);

  const q = query.trim().toLowerCase();
  const filtered = roadmap.filter((d) => {
    if (q && !d.name.toLowerCase().includes(q)) return false;
    if (filterType !== 'ALL' && d.type !== filterType) return false;
    if (filterRarity !== 'ALL' && d.rarity !== filterRarity) return false;
    return true;
  });

  const grouped = TIER_GROUPS.map((tier) => ({ tier, droids: filtered.filter((d) => d.maxTier === tier) })).filter(
    (g) => g.droids.length
  );

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 50px', background: theme.pageBg, color: theme.text, transition: 'background 0.15s' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                <rect width="36" height="36" rx="10" fill="#312e81" />
                <path d="M9 22a9 9 0 0 1 18 0z" fill="#818cf8" />
                <circle cx="14.5" cy="17" r="1.8" fill="#1f2430" />
                <circle cx="21.5" cy="17" r="1.8" fill="#1f2430" />
                <rect x="9" y="24" width="18" height="4" rx="2" fill="#4f46e5" />
              </svg>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>Droid Tycoon RB Planner</span>
            </a>
            <SettingsMenu theme={theme} dark={dark} onToggleTheme={() => setDark((d) => !d)} showAds={false} onToggleAds={() => {}} adsEnabled={false} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <a
              href="/"
              title="Back to planner"
              aria-label="Back to planner"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 9,
                border: `1px solid ${theme.border}`,
                background: theme.cardBg,
                color: theme.text,
                textDecoration: 'none',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              ←
            </a>
            <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Rebirth Roadmap</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: theme.textSecondary, maxWidth: 560 }}>
            The same droid gets reused at higher tiers across later rebirth steps. This groups every droid in a cycle by the{' '}
            <strong style={{ color: theme.text }}>highest tier it will ever need</strong> — so you know which ones are worth evolving
            early, and which can stay at a low tier the whole cycle.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CYCLES.map((_, i) => i + 1).map((n) => (
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

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            ['list', 'List'],
            ['timeline', 'Timeline'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                border: `1px solid ${view === key ? theme.accent : theme.pillBorder}`,
                background: view === key ? theme.accent : theme.pillBg,
                color: view === key ? '#fff' : theme.text,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a droid…"
            style={{
              flex: isMobile ? '1 1 100%' : '1 1 200px',
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: theme.inputBg,
              color: theme.text,
              fontSize: 13,
            }}
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle(theme)}>
            <option value="ALL">All Types</option>
            <option value="Worker">Worker</option>
            <option value="Astromech">Astromech</option>
            <option value="Battle">Battle</option>
          </select>
          <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} style={selectStyle(theme)}>
            <option value="ALL">All Rarities</option>
            <option value="COMMON">Common</option>
            <option value="RARE">Rare</option>
            <option value="EPIC">Epic</option>
            <option value="LEGENDARY">Legendary</option>
            <option value="MYTHIC">Mythic</option>
          </select>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '18px 13px', fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>No droids match this filter.</div>
        )}

        {view === 'timeline' && filtered.length > 0 && (
          <TimelineChart
            theme={theme}
            dark={dark}
            droids={filtered}
            stepCount={stepCount}
            isMobile={isMobile}
            expandedName={expandedName}
            setExpandedName={setExpandedName}
          />
        )}

        {view === 'list' && grouped.map(({ tier, droids }) => (
          <div key={tier} style={{ background: theme.cardBg, borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 700,
                  background: TIER_STYLE[tier].bg,
                  color: TIER_STYLE[tier].fg,
                  padding: '4px 10px',
                  borderRadius: 7,
                  textShadow: tier === 'RAINBOW' ? OUTLINE : 'none',
                }}
              >
                {tier}
              </span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>
                {droids.length} droid{droids.length === 1 ? '' : 's'} top out here
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {droids.map((d) => {
                const expanded = expandedName === d.name;
                return (
                  <div key={d.name} style={{ borderTop: `1px solid ${theme.rowBorder}` }}>
                    <div
                      onClick={() => setExpandedName((cur) => (cur === d.name ? null : d.name))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '10px 4px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: d.rarityColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.name}
                        </span>
                        <span style={{ fontSize: 11, color: theme.textMuted }}>
                          {d.type} · {d.rarity} · first needed RB {d.firstStep}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: theme.textSecondary, flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
                    </div>
                    {expanded && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 4px 12px' }}>
                        {d.occurrences.map((o, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              background: TIER_STYLE[o.tier].bg,
                              color: TIER_STYLE[o.tier].fg,
                              padding: '3px 8px',
                              borderRadius: 6,
                              textShadow: o.tier === 'RAINBOW' ? OUTLINE : 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            RB {o.step} · {o.tier}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

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
            Groups are sorted <strong style={{ color: theme.text }}>highest tier first</strong> — focus early evolving on droids near the
            top, since you'll need them at that tier eventually anyway.
          </div>
          <div>Droids in the lowest groups never need more than that tier this cycle — safe to sell freely once you're past their last appearance.</div>
        </div>

        <p style={{ margin: '4px 0 0', fontSize: 11, color: theme.textMuted, textAlign: 'center' }}>
          Requirements are community-sourced and may shift with updates — verify at the Rebirth Station before selling.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px' }}>
          {[
            ['Privacy Policy', '/privacy.html'],
            ['About', '/about.html'],
            ['Contact', '/contact.html'],
            ['RB Requirements', '/rb-requirements.html'],
          ].map(([label, href]) => (
            <a key={href} href={href} style={{ fontSize: 11, color: theme.textMuted, textDecoration: 'underline' }}>
              {label}
            </a>
          ))}
        </div>
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

// Each droid gets one horizontal lane spanning every rebirth step in the
// cycle, with a dot at each step it's required and a connecting line —
// so its whole upgrade path (e.g. picked up BASE at RB2, not needed again
// until KYBER at RB38) reads left-to-right at a glance.
function TimelineChart({ theme, dark, droids, stepCount, isMobile, expandedName, setExpandedName }) {
  const stepWidth = isMobile ? 10 : 14;
  const chartPadding = 14;
  const labelWidth = isMobile ? 92 : 125;
  const rowHeight = 38;
  const dotY = rowHeight / 2 - 4;
  const labelY = rowHeight - 5;
  // Extra right-side room so a tier label (e.g. "GALACTIC") anchored on the
  // last dot has space to render without clipping against the chart edge.
  const rightLabelMargin = 42;
  const chartWidth = chartPadding + (stepCount - 1) * stepWidth + rightLabelMargin;
  const stepX = (step) => chartPadding + (step - 1) * stepWidth;

  const tickSteps = Array.from({ length: stepCount }, (_, i) => i + 1).filter(
    (s) => s === 1 || s === stepCount || s % 5 === 0
  );

  const dotFill = (tier) => (tier === 'RAINBOW' ? `url(#${RAINBOW_DOT_GRADIENT_ID})` : TIER_DOT_COLOR[tier]);

  return (
    <div style={{ background: theme.cardBg, borderRadius: 16, padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {TIER_GROUPS.map((tier) => (
          <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                flexShrink: 0,
                background: tier === 'RAINBOW' ? TIER_STYLE.RAINBOW.bg : TIER_DOT_COLOR[tier],
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 600, color: theme.textMuted }}>{tier}</span>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: `1px solid ${theme.rowBorder}`, borderRadius: 10 }}>
        <div style={{ width: labelWidth + chartWidth }}>
          <svg width={0} height={0} style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id={RAINBOW_DOT_GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff5757" />
                <stop offset="20%" stopColor="#ffb347" />
                <stop offset="40%" stopColor="#ffe066" />
                <stop offset="60%" stopColor="#5ce65c" />
                <stop offset="80%" stopColor="#5cb8ff" />
                <stop offset="100%" stopColor="#a76cf7" />
              </linearGradient>
            </defs>
          </svg>

          <div style={{ display: 'flex', background: theme.tableHeaderBg }}>
            <div style={{ width: labelWidth, flexShrink: 0, position: 'sticky', left: 0, background: theme.tableHeaderBg, borderRight: `1px solid ${theme.rowBorder}` }} />
            <svg width={chartWidth} height={22} style={{ overflow: 'visible' }}>
              {tickSteps.map((s) => (
                <text key={s} x={stepX(s)} y={15} textAnchor="middle" fontSize={9} fontWeight={700} fill={theme.textMuted}>
                  {s}
                </text>
              ))}
            </svg>
          </div>

          {droids.map((d) => {
            const expanded = expandedName === d.name;
            const points = d.occurrences.map((o) => `${stepX(o.step)},${dotY}`).join(' ');
            return (
              <div key={d.name}>
                <div
                  onClick={() => setExpandedName((cur) => (cur === d.name ? null : d.name))}
                  style={{ display: 'flex', borderTop: `1px solid ${theme.rowBorder}`, cursor: 'pointer' }}
                >
                  <div
                    style={{
                      width: labelWidth,
                      flexShrink: 0,
                      position: 'sticky',
                      left: 0,
                      background: theme.cardBg,
                      borderRight: `1px solid ${theme.rowBorder}`,
                      padding: '4px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 12, color: d.rarityColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.name}
                    </span>
                    <span style={{ fontSize: 9, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.type} · {d.rarity}
                    </span>
                  </div>
                  <svg width={chartWidth} height={rowHeight} style={{ overflow: 'visible' }}>
                    <polyline points={points} fill="none" stroke={theme.textMuted} strokeWidth={1.5} opacity={0.45} />
                    {d.occurrences.map((o, i) => {
                      const isMaxTier = o.tier === d.maxTier && o.step === d.maxTierStep;
                      return (
                        <g key={i}>
                          <circle cx={stepX(o.step)} cy={dotY} r={4} fill={dotFill(o.tier)} stroke={theme.cardBg} strokeWidth={1.2}>
                            <title>{`RB ${o.step} · ${o.tier}`}</title>
                          </circle>
                          {isMaxTier && (
                            <text x={stepX(o.step)} y={labelY} textAnchor="middle" fontSize={7.5} fontWeight={700} fill={theme.textMuted}>
                              {o.tier}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
                {expanded && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 10px 12px', background: theme.tableHeaderBg }}>
                    {d.occurrences.map((o, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: TIER_STYLE[o.tier].bg,
                          color: TIER_STYLE[o.tier].fg,
                          padding: '3px 8px',
                          borderRadius: 6,
                          textShadow: o.tier === 'RAINBOW' ? OUTLINE : 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        RB {o.step} · {o.tier}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 11, color: theme.textMuted }}>Tap a droid's row for its exact RB steps. Hover a dot for a tooltip.</p>
    </div>
  );
}
