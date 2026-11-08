import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

  useEffect(() => {
    savePersistedState({ ...persisted, dark, cycle });
  }, [dark, cycle]);

  const theme = dark ? DARK : LIGHT;
  const stepCount = CYCLES[cycle - 1].length;

  const roadmap = useMemo(() => {
    return buildCycleRoadmap(CYCLES[cycle - 1]).map((d) => {
      const rarity = RARITY_BY_NAME[d.name] || '';
      const rawRarityColor = RARITY_COLOR[rarity] || theme.textSecondary;
      return {
        ...d,
        rarity: rarity || '—',
        rarityColor: rarity === 'COMMON' && dark ? '#ffffff' : rawRarityColor,
        type: TYPE_BY_NAME[d.name] || '—',
        lastStep: d.occurrences[d.occurrences.length - 1].step,
      };
    });
  }, [cycle, dark]);

  // Two decisions matter: a droid reused at a higher tier later is worth
  // evolving (and worth buying a better copy of), a droid that appears once
  // is disposable the moment its step is done. Keepers are banded by the
  // ceiling tier they eventually need, so the top of the chart is "evolve
  // these as far as they go" and the bottom is "spend nothing on these".
  const bands = useMemo(() => {
    const keepers = roadmap.filter((d) => d.occurrences.length > 1);
    const oneOffs = roadmap.filter((d) => d.occurrences.length === 1);
    const byStep = (a, b) => a.firstStep - b.firstStep || a.name.localeCompare(b.name);

    const out = TIER_GROUPS.map((tier) => ({
      key: tier,
      tier,
      label: `EVOLVE TO ${tier}`,
      note: 'keep · buy any better copy up to this tier',
      droids: keepers.filter((d) => d.maxTier === tier).sort(byStep),
    })).filter((g) => g.droids.length);

    if (oneOffs.length) {
      out.push({
        key: 'ONE_OFF',
        tier: null,
        label: 'ONE-OFF',
        note: 'needed at a single rebirth — sell right after',
        droids: oneOffs.sort(byStep),
      });
    }
    return out;
  }, [roadmap]);

  const keeperCount = roadmap.filter((d) => d.occurrences.length > 1).length;
  const oneOffCount = roadmap.length - keeperCount;

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 50px', background: theme.pageBg, color: theme.text, transition: 'background 0.15s' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <a
            href="/"
            title="Back to planner"
            aria-label="Back to planner"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36,
              borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.cardBg, color: theme.text,
              textDecoration: 'none', fontSize: 18, flexShrink: 0,
            }}
          >
            ←
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Rebirth Roadmap</h1>
            <span style={{ fontSize: 12, color: theme.textMuted }}>Every droid in the cycle on one timeline — keep, evolve, or sell</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CYCLES.map((_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setCycle(n)}
              style={{
                padding: '9px 15px', borderRadius: 9,
                border: `1px solid ${n === cycle ? theme.accent : theme.pillBorder}`,
                background: n === cycle ? theme.accent : theme.pillBg,
                color: n === cycle ? '#fff' : theme.text,
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              Cycle {n}
            </button>
          ))}
        </div>

        <div
          style={{
            background: theme.cardBg, borderRadius: 14, padding: '12px 16px', fontSize: 12.5,
            color: theme.textSecondary, lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: 4,
          }}
        >
          <div>
            Each row is one droid across all {stepCount} rebirths of this cycle. A dot is a rebirth that needs it, colored by the tier it's
            needed at; the <strong style={{ color: theme.text }}>solid line runs until the last time you need it</strong>, and the{' '}
            <strong style={{ color: theme.sellFg }}>red dashed tail is dead weight</strong> — safe to sell from there on.
          </div>
          <div>
            <strong style={{ color: theme.keepFg }}>{keeperCount} keepers</strong> come back at a higher tier later, banded by how far they
            must eventually evolve · <strong style={{ color: theme.sellFg }}>{oneOffCount} one-offs</strong> sit in the bottom band with a
            single dot.
          </div>
        </div>

        <TimelineChart theme={theme} bands={bands} stepCount={stepCount} />

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

// Gantt-style chart: rebirth steps run along a sticky axis at the top, one
// lane per droid underneath. Lanes are grouped into bands by the ceiling tier
// the droid eventually needs, so vertical position alone says how much to
// invest in it, and the red tail after a lane's last dot says when to dump it.
function TimelineChart({ theme, bands, stepCount }) {
  const wrapRef = useRef(null);
  const [avail, setAvail] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setAvail(el.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = avail > 0 && avail < 560;
  const labelWidth = narrow ? 96 : 132;
  const rowHeight = narrow ? 19 : 21;
  const padLeft = 12;
  const padRight = 14;
  // Fit the whole cycle in the card when there's room; below that, lock to a
  // readable step spacing and let the chart scroll horizontally under the
  // sticky name column.
  const fitWidth = Math.max(0, (avail || 900) - labelWidth - padLeft - padRight);
  const stepWidth = Math.min(26, Math.max(11, fitWidth / (stepCount - 1)));
  const chartWidth = padLeft + (stepCount - 1) * stepWidth + padRight;
  const stepX = (step) => padLeft + (step - 1) * stepWidth;
  const midY = rowHeight / 2;
  const dotR = narrow ? 3.4 : 3.8;

  const tickSteps = Array.from({ length: stepCount }, (_, i) => i + 1).filter(
    (s) => s === 1 || s === stepCount || s % 5 === 0
  );
  const gridSteps = Array.from({ length: stepCount }, (_, i) => i + 1).filter((s) => s % 5 === 0 || s === 1);

  const dotFill = (tier) => (tier === 'RAINBOW' ? `url(#${RAINBOW_DOT_GRADIENT_ID})` : TIER_DOT_COLOR[tier]);
  const totalWidth = labelWidth + chartWidth;
  // Only become a horizontal scroll container when the cycle genuinely does
  // not fit: an `overflow-x` of its own would also make the axis row's
  // `position: sticky` useless, since it could then only stick inside this
  // box rather than to the viewport as the page scrolls past 40-odd lanes.
  const scrolls = chartWidth > fitWidth + 1;

  const axisRow = (position) => (
    <div
      style={{
        display: 'flex', background: theme.tableHeaderBg, zIndex: 3,
        ...(position === 'top'
          ? { position: scrolls ? 'static' : 'sticky', top: 0, borderBottom: `1px solid ${theme.rowBorder}` }
          : { borderTop: `1px solid ${theme.rowBorder}` }),
      }}
    >
      <div
        style={{
          width: labelWidth, flexShrink: 0, position: 'sticky', left: 0, zIndex: 1,
          background: theme.tableHeaderBg, borderRight: `1px solid ${theme.rowBorder}`,
          display: 'flex', alignItems: 'center', padding: '0 8px',
          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em', color: theme.textMuted,
        }}
      >
        REBIRTH →
      </div>
      <svg width={chartWidth} height={20}>
        {tickSteps.map((s) => (
          <text key={s} x={stepX(s)} y={14} textAnchor="middle" fontSize={9} fontWeight={700} fill={theme.textMuted}>
            {s}
          </text>
        ))}
      </svg>
    </div>
  );

  return (
    <div ref={wrapRef} style={{ background: theme.cardBg, borderRadius: 16, padding: '14px 12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 13px', alignItems: 'center', padding: '0 2px' }}>
        {TIER_GROUPS.map((tier) => (
          <span key={tier} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                background: tier === 'RAINBOW' ? TIER_STYLE.RAINBOW.bg : TIER_DOT_COLOR[tier],
              }}
            />
            <span style={{ fontSize: 10, fontWeight: 600, color: theme.textMuted }}>{tier}</span>
          </span>
        ))}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width="22" height="8">
            <line x1="0" y1="4" x2="22" y2="4" stroke={theme.sellFg} strokeWidth="1.6" strokeDasharray="3 3" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 600, color: theme.textMuted }}>SAFE TO SELL</span>
        </span>
      </div>

      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden="true">
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

      <div
        style={{
          overflowX: scrolls ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch',
          border: `1px solid ${theme.rowBorder}`, borderRadius: 10,
        }}
      >
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          {axisRow('top')}

          {bands.map((band) => (
            <div key={band.key}>
              <div
                style={{
                  width: totalWidth, background: theme.tableHeaderBg,
                  borderTop: `1px solid ${theme.rowBorder}`, borderBottom: `1px solid ${theme.rowBorder}`,
                }}
              >
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap',
                  padding: '5px 8px', position: 'sticky', left: 0, width: 'fit-content', zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap',
                    background: band.tier ? TIER_STYLE[band.tier].bg : theme.sellBg,
                    color: band.tier ? TIER_STYLE[band.tier].fg : theme.sellFg,
                    textShadow: band.tier === 'RAINBOW' ? OUTLINE : 'none',
                  }}
                >
                  {band.label}
                </span>
                <span style={{ fontSize: 10.5, color: theme.textMuted }}>
                  {band.droids.length} droid{band.droids.length === 1 ? '' : 's'} · {band.note}
                </span>
              </div>
              </div>

              {band.droids.map((d) => (
                <div key={d.name} style={{ display: 'flex', borderTop: `1px solid ${theme.rowBorder}` }}>
                  <div
                    style={{
                      width: labelWidth, flexShrink: 0, position: 'sticky', left: 0, zIndex: 1,
                      background: theme.cardBg, borderRight: `1px solid ${theme.rowBorder}`,
                      padding: '0 8px', display: 'flex', alignItems: 'center', minWidth: 0, height: rowHeight,
                    }}
                    title={`${d.name} — ${d.type} · ${d.rarity}`}
                  >
                    <span
                      style={{
                        fontWeight: 700, fontSize: narrow ? 10 : 11, color: d.rarityColor,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {d.name}
                    </span>
                  </div>
                  <svg width={chartWidth} height={rowHeight}>
                    {gridSteps.map((s) => (
                      <line key={s} x1={stepX(s)} y1={0} x2={stepX(s)} y2={rowHeight} stroke={theme.rowBorder} strokeWidth={1} />
                    ))}
                    {d.occurrences.length > 1 && (
                      <line
                        x1={stepX(d.firstStep)} y1={midY} x2={stepX(d.lastStep)} y2={midY}
                        stroke={theme.textMuted} strokeWidth={1.6} opacity={0.5}
                      />
                    )}
                    {d.lastStep < stepCount && (
                      <line
                        x1={stepX(d.lastStep) + dotR + 2} y1={midY} x2={stepX(stepCount)} y2={midY}
                        stroke={theme.sellFg} strokeWidth={1.4} strokeDasharray="3 3" opacity={0.75}
                      />
                    )}
                    {d.occurrences.map((o, i) => (
                      <circle
                        key={i}
                        cx={stepX(o.step)} cy={midY} r={o.tier === d.maxTier ? dotR + 0.9 : dotR}
                        fill={dotFill(o.tier)} stroke={theme.cardBg} strokeWidth={1}
                      >
                        <title>{`${d.name} — RB ${o.step} · ${o.tier}`}</title>
                      </circle>
                    ))}
                  </svg>
                </div>
              ))}
            </div>
          ))}
          {scrolls && axisRow('bottom')}
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 11, color: theme.textMuted, padding: '0 2px' }}>
        The largest dot on a lane is the highest tier that droid ever needs. Hover or tap a dot for its exact rebirth and tier.
      </p>
    </div>
  );
}
