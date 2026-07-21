// Shared "###.##<suffix>" credit format used across the calculator — e.g. 12.55B
// instead of 12550000000. Keep this in sync with any new suffix tiers the game adds.
export const SUFFIXES = [
  { suffix: '', value: 1 },
  { suffix: 'K', value: 1e3 },
  { suffix: 'M', value: 1e6 },
  { suffix: 'B', value: 1e9 },
  { suffix: 'T', value: 1e12 },
  { suffix: 'Qa', value: 1e15 },
  { suffix: 'Qi', value: 1e18 },
  { suffix: 'Sx', value: 1e21 },
  { suffix: 'Sp', value: 1e24 },
  { suffix: 'Oc', value: 1e27 },
  { suffix: 'No', value: 1e30 },
];

// Parses a "###.##<suffix>" string into a plain number. Returns 0 for blank
// input and NaN for anything that doesn't match the expected shape.
export function parseCredits(input) {
  if (input == null) return 0;
  const str = String(input).trim();
  if (!str) return 0;
  const match = str.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]{0,2})$/);
  if (!match) return NaN;
  const num = parseFloat(match[1]);
  const suffixRaw = match[2];
  if (!suffixRaw) return num;
  const found = SUFFIXES.find((s) => s.suffix && s.suffix.toLowerCase() === suffixRaw.toLowerCase());
  if (!found) return NaN;
  return num * found.value;
}

// Formats a plain number back into canonical "###.##<suffix>" form.
export function formatCredits(num) {
  if (!isFinite(num) || num <= 0) return '0.00';
  for (let i = SUFFIXES.length - 1; i >= 0; i--) {
    if (num >= SUFFIXES[i].value) {
      const scaled = num / SUFFIXES[i].value;
      return `${scaled.toFixed(2)}${SUFFIXES[i].suffix}`;
    }
  }
  return num.toFixed(2);
}

// Filters keystrokes down to the allowed live-typing shape: up to 3 integer
// digits, an optional decimal point with up to 2 digits, then up to 2 letters.
export function sanitizeCreditTyping(raw) {
  const cleaned = String(raw).replace(/[^0-9a-zA-Z.]/g, '');
  const m = cleaned.match(/^([0-9.]*)([a-zA-Z]*)$/);
  if (!m) return '';
  let [, numPart, letterPart] = m;

  const firstDot = numPart.indexOf('.');
  if (firstDot !== -1) {
    numPart = numPart.slice(0, firstDot + 1) + numPart.slice(firstDot + 1).replace(/\./g, '');
  }

  const [intPart, decPart] = numPart.split('.');
  let result = intPart.slice(0, 3);
  if (numPart.includes('.')) result += '.' + (decPart || '').slice(0, 2);

  return result + letterPart.slice(0, 2);
}
