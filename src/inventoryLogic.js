import { TIER_ORDER, TYPE_BY_NAME, parseRaw } from './data.js';

export const TIERS = Object.keys(TIER_ORDER).sort((a, b) => TIER_ORDER[a] - TIER_ORDER[b]);

export function allDroidNames(cycles) {
  return [...new Set([...Object.keys(TYPE_BY_NAME), ...cycles.flatMap((rows) => rows.flatMap((row) => parseRaw(row.raw).map((d) => d.name)))])].sort();
}

export function normalizeInventory(value, names) {
  const valid = new Set(names);
  const ids = new Set();
  return (Array.isArray(value) ? value : []).flatMap((d, index) => {
    if (!d || !valid.has(d.name) || !Object.hasOwn(TIER_ORDER, d.tier)) return [];
    let id = typeof d.id === 'string' && d.id ? d.id : `saved-${index}`;
    while (ids.has(id)) id += `-${index}`;
    ids.add(id);
    return [{ id, name: d.name, tier: d.tier }];
  });
}

export function recommendInventory(inventory, rows, rebirth) {
  const requirements = new Map();
  for (const row of rows) {
    if (row.step <= rebirth) continue;
    for (const d of parseRaw(row.raw)) {
      if (!requirements.has(d.name)) requirements.set(d.name, []);
      requirements.get(d.name).push({ step: row.step, tier: d.tier });
    }
  }
  const best = new Map();
  for (const d of inventory) {
    const previous = best.get(d.name);
    if (!previous || TIER_ORDER[d.tier] > TIER_ORDER[previous.tier]) best.set(d.name, d);
  }
  return inventory.map((d) => {
    const needed = requirements.get(d.name) || [];
    if (!needed.length) return { ...d, action: 'SELL', reason: 'No remaining rebirth needs this droid.' };
    if (best.get(d.name).id !== d.id) return { ...d, action: 'SELL', reason: `Duplicate — keep your ${best.get(d.name).tier} copy for rebirths.` };
    const target = needed.reduce((highest, entry) => TIER_ORDER[entry.tier] > TIER_ORDER[highest] ? entry.tier : highest, needed[0].tier);
    const targetStep = needed.find((entry) => entry.tier === target).step;
    const upgrade = TIER_ORDER[d.tier] < TIER_ORDER[target];
    return {
      ...d, action: upgrade ? 'UPGRADE' : 'KEEP', target, targetStep, next: needed[0],
      reason: upgrade ? `Keep and upgrade to ${target} by RB ${targetStep}.` : `Keep through RB ${needed.at(-1).step}; ${target} covers every remaining requirement.`,
    };
  });
}
