import { useEffect, useMemo, useState } from 'react';
import { CYCLES, DARK, LIGHT, RARITY_BY_NAME, RARITY_COLOR, TIER_DOT_COLOR, TIER_ORDER, TIER_STYLE, TYPE_BY_NAME, buildCycleRoadmap } from './data.js';
import { loadPersistedState, savePersistedState } from './storage.js';
import SettingsMenu from './SettingsMenu.jsx';

const OUTLINE = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
const TIER_GROUPS = Object.keys(TIER_ORDER).sort((a, b) => TIER_ORDER[b] - TIER_ORDER[a]);

export default function Roadmap() {
  const [persisted] = useState(() => loadPersistedState() || {});
  const [dark, setDark] = useState(() => persisted.dark ?? true);
  const [cycle, setCycle] = useState(() => (persisted.cycle && persisted.cycle <= CYCLES.length ? persisted.cycle : 1));

  useEffect(() => {
    savePersistedState({ ...persisted, dark, cycle });
  }, [dark, cycle]);

  const theme = dark ? DARK : LIGHT;

  const roadmap = useMemo(() => {
    return buildCycleRoadmap(CYCLES[cycle - 1]).map((d) => {
      const rarity = RARITY_BY_NAME[d.name] || '';
      const rawRarityColor = RARITY_COLOR[rarity] || theme.textSecondary;
      return {
        ...d,
        rarity: rarity || '—',
        rarityColor: rarity === 'COMMON' && dark ? '#ffffff' : rawRarityColor,
        type: TYPE_BY_NAME[d.name] || '—',
      };
    });
  }, [cycle, dark]);

  // Two decisions matter: a droid reused at a higher tier later is worth
  // evolving (and worth buying a better copy of), a droid that appears once
  // is disposable the moment its step is done.
  const keepers = roadmap.filter((d) => d.occurrences.length > 1);
  const oneOffs = roadmap
    .filter((d) => d.occurrences.length === 1)
    .sort((a, b) => a.firstStep - b.firstStep || a.name.localeCompare(b.name));

  const keeperGroups = TIER_GROUPS.map((tier) => ({
    tier,
    droids: keepers.filter((d) => d.maxTier === tier).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.droids.length);

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 50px', background: theme.pageBg, color: theme.text, transition: 'background 0.15s' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
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
            <span style={{ fontSize: 12, color: theme.textMuted }}>Keep or sell, for your whole cycle, at a glance</span>
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
            <strong style={{ color: theme.keepFg }}>{keepers.length} keepers</strong> come back at a higher tier later this cycle — evolve
            them, and buy a better copy whenever one shows up, as far as their badge says.
          </div>
          <div>
            <strong style={{ color: theme.sellFg }}>{oneOffs.length} one-offs</strong> are needed at exactly one rebirth step and never again
            — sell them right after.
          </div>
          <div style={{ fontSize: 11.5, color: theme.textMuted }}>
            Numbers under each name are the rebirth steps it's required at; the dot's color is the tier needed at that step.
          </div>
        </div>

        <TierLegend theme={theme} />

        <SectionHeading theme={theme} color={theme.keepFg} title="Keep & evolve" subtitle="grouped by the highest tier each droid ever needs" />

        {keeperGroups.map(({ tier, droids }) => (
          <div key={tier} style={{ background: theme.cardBg, borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11, fontWeight: 700, background: TIER_STYLE[tier].bg, color: TIER_STYLE[tier].fg,
                  padding: '4px 10px', borderRadius: 7, textShadow: tier === 'RAINBOW' ? OUTLINE : 'none',
                }}
              >
                EVOLVE TO {tier}
              </span>
              <span style={{ fontSize: 11.5, color: theme.textMuted }}>
                {droids.length} droid{droids.length === 1 ? '' : 's'} · never needs more than {tier} this cycle
              </span>
            </div>
            <DroidGrid theme={theme} droids={droids} />
          </div>
        ))}

        <SectionHeading theme={theme} color={theme.sellFg} title="One-off requirements" subtitle="used once, then safe to sell" />

        <div style={{ background: theme.cardBg, borderRadius: 16, padding: '14px 16px' }}>
          <DroidGrid theme={theme} droids={oneOffs} showTierBadge />
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

function SectionHeading({ theme, color, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color, letterSpacing: '-0.01em' }}>{title}</h2>
      <span style={{ fontSize: 11.5, color: theme.textMuted }}>{subtitle}</span>
    </div>
  );
}

function TierLegend({ theme }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 14px' }}>
      {TIER_GROUPS.map((tier) => (
        <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Dot tier={tier} />
          <span style={{ fontSize: 10, fontWeight: 600, color: theme.textMuted }}>{tier}</span>
        </div>
      ))}
    </div>
  );
}

function Dot({ tier, size = 9 }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
        background: tier === 'RAINBOW' ? TIER_STYLE.RAINBOW.bg : TIER_DOT_COLOR[tier],
      }}
    />
  );
}

// One cell per droid: name, what it is, and the full step-by-step ladder of
// rebirths it's required at. Everything a keep/sell call needs is on the face
// of the cell — nothing to expand, nothing to search for.
function DroidGrid({ theme, droids, showTierBadge = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: 10 }}>
      {droids.map((d) => (
        <div
          key={d.name}
          style={{
            border: `1px solid ${theme.rowBorder}`, borderRadius: 10, padding: '8px 10px',
            display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0,
          }}
        >
          <span
            style={{
              fontWeight: 700, fontSize: 12.5, color: d.rarityColor, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
            title={d.name}
          >
            {d.name}
          </span>
          <span style={{ fontSize: 10, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.type} · {d.rarity}
          </span>
          {showTierBadge ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: theme.textSecondary, fontWeight: 700 }}>
              <Dot tier={d.occurrences[0].tier} />
              RB {d.occurrences[0].step} · {d.occurrences[0].tier}
            </span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 8px', alignItems: 'center' }}>
              {d.occurrences.map((o, i) => (
                <span
                  key={i}
                  title={`RB ${o.step} · ${o.tier}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700,
                    color: o.tier === d.maxTier ? theme.text : theme.textSecondary,
                  }}
                >
                  <Dot tier={o.tier} size={o.tier === d.maxTier ? 10 : 8} />
                  {o.step}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
