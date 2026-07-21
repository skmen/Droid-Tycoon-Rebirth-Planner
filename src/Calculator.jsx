import { useEffect, useMemo, useState } from 'react';
import { CYCLES, DARK, LIGHT } from './data.js';
import { formatCredits, parseCredits, sanitizeCreditTyping } from './creditFormat.js';
import { loadCalculatorState, loadPersistedState, saveCalculatorState, savePersistedState } from './storage.js';
import SettingsMenu from './SettingsMenu.jsx';

const SCRAP_HIT_SECONDS = 2;
const MISSION_CREDIT_CHANCE = 0.8;
const MISSION_RAINBOW_BP_CHANCE = 0.15;
const MISSION_BESKAR_BP_CHANCE = 0.05;
const MISSION_SLOTS = 5;

function computeHourlyRate({ scrapCredits, scrapBlankChance, missionReward, missionDurations, hourlyGen }) {
  const scrapPerHit = scrapCredits > 0 ? scrapCredits * (1 - Math.min(100, Math.max(0, scrapBlankChance)) / 100) : 0;
  const scrapHourly = (scrapPerHit / SCRAP_HIT_SECONDS) * 3600;

  const missionsHourly = missionDurations.reduce((sum, minutes) => {
    if (!minutes || minutes <= 0) return sum;
    const perMissionExpected = MISSION_CREDIT_CHANCE * missionReward;
    return sum + perMissionExpected * (60 / minutes);
  }, 0);

  return { scrapHourly, missionsHourly, hourlyGen: hourlyGen || 0, total: scrapHourly + missionsHourly + (hourlyGen || 0) };
}

function formatDuration(hours) {
  if (!isFinite(hours) || hours <= 0) return '0m';
  const totalMinutes = Math.round(hours * 60);
  const d = Math.floor(totalMinutes / (60 * 24));
  const h = Math.floor((totalMinutes % (60 * 24)) / 60);
  const m = totalMinutes % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

export default function Calculator() {
  const [persisted] = useState(() => loadPersistedState() || {});
  const [dark, setDark] = useState(() => persisted.dark ?? true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    savePersistedState({ ...persisted, dark });
  }, [dark]);

  const defaultTarget = useMemo(() => {
    if (persisted.rebirth == null || !persisted.cycle) return '';
    const rows = CYCLES[(persisted.cycle || 1) - 1];
    const nextRow = rows.find((r) => r.step === (persisted.rebirth ?? 0) + 1);
    return nextRow ? nextRow.credits : '';
  }, []);

  const [saved] = useState(() => loadCalculatorState() || {});
  const [currentBalance, setCurrentBalance] = useState(() => saved.currentBalance ?? '');
  const [targetBalance, setTargetBalance] = useState(() => saved.targetBalance ?? defaultTarget);
  const [scrapCredits, setScrapCredits] = useState(() => saved.scrapCredits ?? '');
  const [scrapBlankChance, setScrapBlankChance] = useState(() => saved.scrapBlankChance ?? '');
  const [missionReward, setMissionReward] = useState(() => saved.missionReward ?? '');
  const [missionDurations, setMissionDurations] = useState(() => saved.missionDurations ?? Array(MISSION_SLOTS).fill(''));
  const [hourlyGen, setHourlyGen] = useState(() => saved.hourlyGen ?? '');

  useEffect(() => {
    saveCalculatorState({ currentBalance, targetBalance, scrapCredits, scrapBlankChance, missionReward, missionDurations, hourlyGen });
  }, [currentBalance, targetBalance, scrapCredits, scrapBlankChance, missionReward, missionDurations, hourlyGen]);

  const theme = dark ? DARK : LIGHT;

  const current = parseCredits(currentBalance) || 0;
  const target = parseCredits(targetBalance) || 0;
  const remaining = Math.max(0, target - current);

  const rate = computeHourlyRate({
    scrapCredits: parseCredits(scrapCredits) || 0,
    scrapBlankChance: Number(scrapBlankChance) || 0,
    missionReward: parseCredits(missionReward) || 0,
    missionDurations: missionDurations.map((m) => Number(m) || 0),
    hourlyGen: parseCredits(hourlyGen) || 0,
  });

  const hoursToTarget = rate.total > 0 ? remaining / rate.total : Infinity;

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
            <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Credit Time Calculator</h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: theme.textSecondary, maxWidth: 560 }}>
            Estimate how long it'll take to reach a target credit balance based on your scrap, mission, and hourly generation rates.
          </p>
        </div>

        <Card theme={theme}>
          <SectionTitle theme={theme}>Balance</SectionTitle>
          <FieldRow isMobile={isMobile}>
            <CreditField theme={theme} label="Current balance" value={currentBalance} onChange={setCurrentBalance} placeholder="e.g. 12.55B" />
            <CreditField theme={theme} label="Target balance" value={targetBalance} onChange={setTargetBalance} placeholder="e.g. 45.00T" />
          </FieldRow>
        </Card>

        <Card theme={theme}>
          <SectionTitle theme={theme}>Scrap table</SectionTitle>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: theme.textMuted }}>
            Regular scrap only — each hit is a 2s animation, and some hits give a blueprint or upgrade chip instead of credits.
          </p>
          <FieldRow isMobile={isMobile}>
            <CreditField theme={theme} label="Credits per hit" value={scrapCredits} onChange={setScrapCredits} placeholder="e.g. 2.50M" />
            <NumberField theme={theme} label="Blueprint/chip chance (%)" value={scrapBlankChance} onChange={setScrapBlankChance} placeholder="e.g. 20" min={0} max={100} />
          </FieldRow>
        </Card>

        <Card theme={theme}>
          <SectionTitle theme={theme}>Mission rewards (Beskar missions)</SectionTitle>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: theme.textMuted }}>
            Every Beskar mission has the same reward odds — {(MISSION_RAINBOW_BP_CHANCE * 100).toFixed(0)}% rainbow blueprint,{' '}
            {(MISSION_BESKAR_BP_CHANCE * 100).toFixed(0)}% beskar blueprint, {(MISSION_CREDIT_CHANCE * 100).toFixed(0)}% credits — only the mission length
            differs by droid. Leave a droid's minutes blank if you're not running it.
          </p>
          <div style={{ marginBottom: 14 }}>
            <CreditField theme={theme} label="Credit reward per successful mission" value={missionReward} onChange={setMissionReward} placeholder="e.g. 8.00M" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${MISSION_SLOTS}, 1fr)`, gap: 10 }}>
            {missionDurations.map((v, i) => (
              <NumberField
                key={i}
                theme={theme}
                label={`Droid ${i + 1} (min)`}
                value={v}
                onChange={(next) =>
                  setMissionDurations((cur) => {
                    const copy = [...cur];
                    copy[i] = next;
                    return copy;
                  })
                }
                placeholder="—"
                min={0}
              />
            ))}
          </div>
        </Card>

        <Card theme={theme}>
          <SectionTitle theme={theme}>Hourly generation</SectionTitle>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: theme.textMuted }}>Base's passive/offline credit generation per hour.</p>
          <CreditField theme={theme} label="Credits per hour" value={hourlyGen} onChange={setHourlyGen} placeholder="e.g. 40.00M" />
        </Card>

        <Card theme={theme} accent>
          <SectionTitle theme={theme}>Result</SectionTitle>
          {rate.total <= 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: theme.textSecondary }}>Fill in at least one credit source above to get an estimate.</p>
          ) : remaining <= 0 ? (
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.accent }}>You're already at (or past) your target balance.</p>
          ) : (
            <>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: theme.accent, marginBottom: 10 }}>
                {formatDuration(hoursToTarget)}
              </div>
              <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>
                {formatCredits(remaining)} credits needed at ≈ {formatCredits(rate.total)}/hour combined
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: theme.textMuted, marginTop: 10 }}>
                <span>Scrap: ≈ {formatCredits(rate.scrapHourly)}/hour</span>
                <span>Missions: ≈ {formatCredits(rate.missionsHourly)}/hour</span>
                <span>Hourly generation: ≈ {formatCredits(rate.hourlyGen)}/hour</span>
              </div>
            </>
          )}
        </Card>

        <p style={{ margin: '4px 0 0', fontSize: 11, color: theme.textMuted, textAlign: 'center' }}>
          This is a rough estimate only — it doesn't account for larger credit rewards from missions, higher-quality scrap pulls, or general randomness in
          the scrap table.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px' }}>
          {[
            ['Privacy Policy', '/privacy.html'],
            ['About', '/about.html'],
            ['Contact', '/contact.html'],
            ['How to use', '/how-to.html'],
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

function Card({ theme, accent, children }) {
  return (
    <div style={{ background: theme.cardBg, borderRadius: 16, padding: '18px 20px', border: accent ? `1px solid ${theme.accent}` : 'none' }}>
      {children}
    </div>
  );
}

function SectionTitle({ theme, children }) {
  return <h2 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: theme.text }}>{children}</h2>;
}

function FieldRow({ isMobile, children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>{children}</div>;
}

function fieldLabelStyle(theme) {
  return { fontSize: 12, fontWeight: 600, color: theme.textSecondary };
}

function fieldInputStyle(theme) {
  return {
    padding: '9px 12px',
    borderRadius: 9,
    border: `1px solid ${theme.border}`,
    fontSize: 14,
    fontFamily: "'JetBrains Mono',monospace",
    color: theme.text,
    background: theme.inputBg,
    width: '100%',
    boxSizing: 'border-box',
  };
}

function CreditField({ theme, label, value, onChange, placeholder }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={fieldLabelStyle(theme)}>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(sanitizeCreditTyping(e.target.value))}
        onBlur={() => {
          const parsed = parseCredits(value);
          onChange(isFinite(parsed) && value.trim() ? formatCredits(parsed) : '');
        }}
        style={fieldInputStyle(theme)}
      />
    </label>
  );
}

function NumberField({ theme, label, value, onChange, placeholder, min, max }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={fieldLabelStyle(theme)}>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={fieldInputStyle(theme)}
      />
    </label>
  );
}
