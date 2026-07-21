const STORAGE_KEY = 'droid-tycoon-planner';
const CALCULATOR_STORAGE_KEY = 'droid-tycoon-calculator';

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

// Kept under its own key so calculator inputs never overwrite (or get
// overwritten by) the main planner's rebirth/cycle state.
export function loadCalculatorState() {
  try {
    const raw = localStorage.getItem(CALCULATOR_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCalculatorState(state) {
  try {
    localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — persistence is best-effort
  }
}
