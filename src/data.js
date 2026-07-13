import droidData from './droid-data.json';

export const TIER_STYLE = {
  DEFAULT: { bg: '#eef0f4', fg: '#4b5563' },
  GOLD: { bg: '#fef3c7', fg: '#92620a' },
  DIAMOND: { bg: '#bfe3fb', fg: '#0c3f66' },
  RAINBOW: { bg: 'linear-gradient(90deg,#ff5757,#ffb347,#ffe066,#5ce65c,#5cb8ff,#a76cf7)', fg: '#ffffff' },
  BESKAR: { bg: 'linear-gradient(135deg,#e8e9eb,#9aa0a6 45%,#c9ccd1)', fg: '#000000' },
};

export const LIGHT = {
  pageBg: '#f4f5f9', cardBg: '#fff', text: '#1c1f2b', textSecondary: '#6b7280', textMuted: '#9199ab',
  border: '#dfe1ec', inputBg: '#f9fafc', adBg: '#eceefa', adBorder: '#c7cbe0', adText: '#8b8fa8',
  tableHeaderBg: '#f9fafc', rowBorder: '#f1f2f7', accent: '#4f46e5', accentSoftBg: '#f5f3ff',
  unlockBg: '#ecfdf5', unlockFg: '#0d9488', pillBg: '#f9fafc', pillBorder: '#dfe1ec',
  keepBg: '#ecfdf5', keepFg: '#047857', sellBg: '#fef2f2', sellFg: '#b91c1c',
};

export const DARK = {
  pageBg: '#131420', cardBg: '#1b1d2b', text: '#e7e8f0', textSecondary: '#9296b0', textMuted: '#6b7086',
  border: '#2c2f42', inputBg: '#20222f', adBg: '#1f2233', adBorder: '#33364d', adText: '#6b7086',
  tableHeaderBg: '#20222f', rowBorder: '#2a2c3d', accent: '#818cf8', accentSoftBg: '#211f42',
  unlockBg: '#0f2f2b', unlockFg: '#34d399', pillBg: '#20222f', pillBorder: '#2c2f42',
  keepBg: '#132a20', keepFg: '#34d399', sellBg: '#301619', sellFg: '#f87171',
};

// Game data (rebirth cycles, droid rarity/type) lives in ./droid-data.json —
// edit that file to update requirements, no other code changes needed.
export const CYCLES = droidData.cycles;
export const RARITY_BY_NAME = droidData.rarityByName;
export const TYPE_BY_NAME = droidData.typeByName;

export const RARITY_COLOR = {
  COMMON: '#000000', RARE: '#00b8d9', EPIC: '#6b21a8', LEGENDARY: '#f97316', MYTHIC: '#e0338e',
};

export function parseRaw(raw) {
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

// Dev-only safety net: a hand-edit to droid-data.json that adds a droid name
// without a matching rarity/type entry fails silently in the UI (renders "—")
// rather than erroring, so surface it loudly here instead.
if (import.meta.env.DEV) {
  const missingRarity = new Set();
  const missingType = new Set();
  CYCLES.forEach((cycle) => {
    cycle.forEach((row) => {
      parseRaw(row.raw).forEach(({ name }) => {
        if (!RARITY_BY_NAME[name]) missingRarity.add(name);
        if (!TYPE_BY_NAME[name]) missingType.add(name);
      });
    });
  });
  if (missingRarity.size || missingType.size) {
    console.warn(
      '[droid-data.json] Some droid names are missing from rarityByName/typeByName and will show "—" in the app:',
      { missingRarity: [...missingRarity], missingType: [...missingType] }
    );
  }
}
