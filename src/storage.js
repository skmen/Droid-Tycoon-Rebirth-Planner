const STORAGE_KEY = 'droid-tycoon-planner';

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      rebirth: Number.isInteger(parsed.rebirth) ? Math.max(0, Math.min(27, parsed.rebirth)) : undefined,
      cycle: [1, 2, 3, 4].includes(parsed.cycle) ? parsed.cycle : undefined,
      dark: typeof parsed.dark === 'boolean' ? parsed.dark : undefined,
      showAds: typeof parsed.showAds === 'boolean' ? parsed.showAds : undefined,
    };
  } catch {
    return null;
  }
}

export function savePersistedState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — persistence is best-effort
  }
}
