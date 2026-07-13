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

function row(step, credits, unlocks, raw) {
  return { step, credits, unlocks, raw };
}

export const CYCLES = [
  [
    row(1, '10K', 'WORKER SLOT', 'BASE CB BASE PIT BASE DRK-1 PROBE'),
    row(2, '150K', 'ASTROMECH SLOT', 'BASE BDX EXPLORER BASE 2BB BASE BAL-CORE'),
    row(3, '975K', 'BATTLE SLOT', 'BASE A-LT BASE BU-4D GOLD R9'),
    row(4, '2.95M', 'WORKER SLOT', 'GOLD ARG GOLD B1 SECURITY BASE GROUNDMECH'),
    row(5, '5.35M', 'ASTROMECH SLOT', 'GOLD BU-4D GOLD HOV-R DIAMOND R9'),
    row(6, '9.85M', 'BATTLE SLOT', 'DIAMOND A-LT DIAMOND ARG GOLD GROUNDMECH'),
    row(7, '14.5M', 'WORKER SLOT', 'DIAMOND BU-4D DIAMOND B1 SECURITY GOLD BB'),
    row(8, '36M', 'ASTROMECH SLOT', 'DIAMOND HOV-R GOLD LO GOLD UTIL-TEC'),
    row(9, '89M', 'BATTLE SLOT', 'GOLD TRAK-R GOLD R6 RAINBOW GROUNDMECH'),
    row(10, '220M', 'WORKER SLOT', 'GOLD STRIKE-ORB RAINBOW HAUL-R RAINBOW LO'),
    row(11, '550M', 'ASTROMECH SLOT', 'RAINBOW AMP WALKER RAINBOW B1 HEAVY BASE BB9'),
    row(12, '1.36B', 'WORKER SLOT', 'GOLD PROTO-ROLLER BASE MECHA-DROID BASE MONO-WLKR'),
    row(13, '3.40B', 'ASTROMECH SLOT', 'BASE R7 BASE CYCLO-GRAV BASE B2-RP'),
    row(14, '8.45B', 'WORKER SLOT', 'BASE OPTI-STRK GOLD MONO-WLKR GOLD MECHA-DROID'),
    row(15, '21.00B', 'ASTROMECH SLOT', 'GOLD B2-RP GOLD BB9 GOLD R7'),
    row(16, '52.00B', 'WORKER SLOT', 'GOLD OPTI-STRK DIAMOND MONO-WLKR DIAMOND PROTO-ROLLER'),
    row(17, '130.00B', 'LOUNGE SLOT', 'DIAMOND B2-RP DIAMOND CYCLO-GRAV DIAMOND MECHA-DROID'),
    row(18, '325.00B', 'LOUNGE SLOT', 'DIAMOND BB9 DIAMOND R7 RAINBOW MONO-WLKR'),
    row(19, '810.00B', 'LOUNGE SLOT', 'RAINBOW B2-RP RAINBOW CYCLO-GRAV RAINBOW PROTO-ROLLER'),
    row(20, '2.00T', 'LOUNGE SLOT', 'RAINBOW R7 RAINBOW OPTI-STRK RAINBOW MECHA-DROID'),
    row(21, '3.00T', '', 'BESKAR BB BESKAR ORB-WALKER BESKAR GROUNDMECH'),
    row(22, '4.50T', '', 'BESKAR AMP WALKER BESKAR B1 HEAVY BESKAR PROTO-ROLLER'),
    row(23, '6.00T', '', 'BESKAR OPTI-STRK BESKAR MONO-WLKR BESKAR R7'),
    row(24, '9.00T', '', 'BESKAR BB9 BESKAR CYCLO-GRAV BASE MO-TRAK'),
    row(25, '13.50T', '', 'BESKAR B2-RP BASE IG GOLD DRFT-R'),
    row(26, '21.00T', '', 'GOLD CYCLENS DIAMOND LOADLIFTER RAINBOW RIC-1200'),
    row(27, '32.00T', '', 'DIAMOND KX RAINBOW TRI-TEK BESKAR SNOW MOUSE'),
  ],
  [
    row(1, '10K', '', 'BASE ID10 BASE MOUSE BASE GONK'),
    row(2, '150K', '', 'BASE ROLL-R BASE SENATE HOVERCAM BASE NAV-EX'),
    row(3, '975K', '', 'BASE R4 BASE VECT-ARM GOLD BDX EXPLORER'),
    row(4, '2.95M', '', 'GOLD 2BB GOLD BAL-CORE BASE ORB-WALKER'),
    row(5, '5.35M', '', 'GOLD R4 GOLD VECT-ARM GOLD NAV-EX'),
    row(6, '9.85M', '', 'BASE GUNRUNNER DIAMOND 2BB DIAMOND BAL-CORE'),
    row(7, '14.5M', '', 'DIAMOND ROLL-R DIAMOND BDX EXPLORER GOLD R2'),
    row(8, '36M', '', 'DIAMOND R4 GOLD B2 SUPER GOLD GUNRUNNER'),
    row(9, '89M', '', 'RAINBOW NAV-EX GOLD STRIKE-ORB GOLD AMP WALKER'),
    row(10, '220M', '', 'RAINBOW VECT-ARM DIAMOND R2 DIAMOND B2 SUPER'),
    row(11, '550M', '', 'DIAMOND STRIKE-ORB DIAMOND B2 HEAVY RAINBOW BAL-CORE'),
    row(12, '1.36B', '', 'RAINBOW ORB-WALKER RAINBOW R2 BASE BB9'),
    row(13, '3.40B', '', 'RAINBOW B2 SUPER BASE MECHA-DROID BASE PROTO-ROLLER'),
    row(14, '8.45B', '', 'RAINBOW B2 HEAVY BASE B2-RP GOLD R7'),
    row(15, '21.00B', '', 'RAINBOW STRIKE-ORB GOLD BB9 GOLD PROTO-ROLLER'),
    row(16, '52.00B', '', 'RAINBOW AMP WALKER GOLD MECHA-DROID DIAMOND B2-RP'),
    row(17, '130.00B', '', 'RAINBOW OPTI-POD GOLD MONO-WLKR DIAMOND R7'),
    row(18, '325.00B', '', 'RAINBOW UTIL-TEC DIAMOND BB9 DIAMOND PROTO-ROLLER'),
    row(19, '810.00B', '', 'DIAMOND MECHA-DROID RAINBOW R7 RAINBOW B2-RP'),
    row(20, '2.00T', '', 'RAINBOW MONO-WLKR RAINBOW OPTI-STRK RAINBOW CYCLO-GRAV'),
    row(21, '3.00T', '', 'BESKAR LO BESKAR R6 BESKAR HAUL-R'),
    row(22, '4.50T', '', 'BESKAR SEN-TRI BESKAR STRIKE-ORB BESKAR PROTO-ROLLER'),
    row(23, '6.00T', '', 'BESKAR BB9 BESKAR CYCLO-GRAV BESKAR B2-RP'),
    row(24, '9.00T', '', 'BESKAR OPTI-STRK BESKAR B2-RP BASE SNOW MOUSE'),
    row(25, '13.50T', '', 'BESKAR MONO-WLKR GOLD TRI-TEK BASE RIC-1200'),
    row(26, '21.00T', '', 'GOLD KX DIAMOND DRFT-R RAINBOW IG'),
    row(27, '32.00T', '', 'DIAMOND LEP RAINBOW LOADLIFTER BESKAR MO-TRAK'),
  ],
  [
    row(1, '10K', '', 'BASE MOUSE BASE PIT BASE GONK'),
    row(2, '150K', '', 'BASE R3 BASE 2BB BASE SENATE HOVERCAM'),
    row(3, '975K', '', 'BASE R8 BASE R5 BASE R4'),
    row(4, '2.95M', '', 'GOLD B1 BATTLE GOLD R9 GOLD B1 SECURITY'),
    row(5, '5.35M', '', 'GOLD R3 GOLD 2BB GOLD SENATE HOVERCAM'),
    row(6, '9.85M', '', 'DIAMOND R5 DIAMOND R4 DIAMOND BDX EXPLORER'),
    row(7, '14.5M', '', 'DIAMOND R8 DIAMOND B1 BATTLE DIAMOND R9'),
    row(8, '36M', '', 'RAINBOW R3 RAINBOW B1 SECURITY RAINBOW 2BB'),
    row(9, '89M', '', 'RAINBOW R5 RAINBOW R4 RAINBOW BDX EXPLORER'),
    row(10, '220M', '', 'RAINBOW SENATE HOVERCAM BASE GROUNDMECH BASE TRAK-R'),
    row(11, '550M', '', 'BASE B2 HEAVY BASE B2 SUPER BASE UTIL-TEC'),
    row(12, '1.36B', '', 'RAINBOW BAL-CORE GOLD GROUNDMECH GOLD TRAK-R'),
    row(13, '3.40B', '', 'RAINBOW B2 SUPER BASE MECHA-DROID BASE PROTO-ROLLER'),
    row(14, '8.45B', '', 'RAINBOW B2 HEAVY BASE B2-RP GOLD R7'),
    row(15, '21.00B', '', 'RAINBOW STRIKE-ORB GOLD BB9 GOLD PROTO-ROLLER'),
    row(16, '52.00B', '', 'RAINBOW AMP WALKER GOLD MECHA-DROID DIAMOND B2-RP'),
    row(17, '130.00B', '', 'RAINBOW OPTI-POD GOLD MONO-WLKR DIAMOND R7'),
    row(18, '325.00B', '', 'RAINBOW UTIL-TEC DIAMOND BB9 DIAMOND PROTO-ROLLER'),
    row(19, '810.00B', '', 'DIAMOND MECHA-DROID RAINBOW R7 RAINBOW B2-RP'),
    row(20, '2.00T', '', 'RAINBOW MONO-WLKR RAINBOW OPTI-STRK RAINBOW CYCLO-GRAV'),
    row(21, '3.00T', '', 'BESKAR B2 SUPER BESKAR OPTI-POD BESKAR R2'),
    row(22, '4.50T', '', 'BESKAR GUNRUNNER BESKAR LNG-SHOT BESKAR B2-RP'),
    row(23, '6.00T', '', 'BESKAR MONO-WLKR BESKAR CYCLO-GRAV BESKAR MECHA-DROID'),
    row(24, '9.00T', '', 'BESKAR BB9 BESKAR B2-RP BASE RIC'),
    row(25, '13.50T', '', 'BESKAR PROTO-ROLLER BASE LOADLIFTER GOLD MO-TRAK'),
    row(26, '21.00T', '', 'GOLD LEP DIAMOND TRI-TEK RAINBOW SNOW MOUSE'),
    row(27, '32.00T', '', 'DIAMOND RIC-1200 RAINBOW IG BESKAR DRFT-R'),
  ],
  [
    row(1, '10K', '', 'BASE ID10 BASE PIT BASE DRK-1 PROBE'),
    row(2, '150K', '', 'BASE R3 BASE 2BB BASE SENATE HOVERCAM'),
    row(3, '975K', '', 'GOLD R5 GOLD R8 BASE R4'),
    row(4, '2.95M', '', 'GOLD B1 BATTLE GOLD R9 GOLD B1 SECURITY'),
    row(5, '5.35M', '', 'GOLD R3 GOLD 2BB GOLD SENATE HOVERCAM'),
    row(6, '9.85M', '', 'DIAMOND R5 DIAMOND R4 DIAMOND BDX EXPLORER'),
    row(7, '14.5M', '', 'DIAMOND R8 DIAMOND B1 BATTLE DIAMOND R9'),
    row(8, '36M', '', 'RAINBOW R3 RAINBOW B1 SECURITY RAINBOW 2BB'),
    row(9, '89M', '', 'RAINBOW R5 RAINBOW R4 RAINBOW BDX EXPLORER'),
    row(10, '220M', '', 'RAINBOW SENATE HOVERCAM BASE GROUNDMECH BASE TRAK-R'),
    row(11, '550M', '', 'BASE B2 HEAVY BASE B2 SUPER BASE UTIL-TEC'),
    row(12, '1.36B', '', 'RAINBOW BAL-CORE GOLD GROUNDMECH GOLD TRAK-R'),
    row(13, '3.40B', '', 'RAINBOW B2 SUPER BASE MECHA-DROID BASE PROTO-ROLLER'),
    row(14, '8.45B', '', 'DIAMOND BAL-CORE DIAMOND GROUNDMECH RAINBOW TRAK-R'),
    row(15, '21.00B', '', 'DIAMOND B2 HEAVY RAINBOW B2 SUPER BASE B2-RP'),
    row(16, '52.00B', '', 'RAINBOW UTIL-TEC BASE BB9 GOLD R7'),
    row(17, '130.00B', '', 'BASE OPTI-STRK GOLD CYCLO-GRAV GOLD MECHA-DROID'),
    row(18, '325.00B', '', 'GOLD B2-RP GOLD BB9 DIAMOND R7'),
    row(19, '810.00B', '', 'DIAMOND MECHA-DROID RAINBOW R7 RAINBOW B2-RP'),
    row(20, '2.00T', '', 'RAINBOW MONO-WLKR RAINBOW OPTI-STRK RAINBOW CYCLO-GRAV'),
    row(21, '3.00T', '', 'BESKAR AMP WALKER BESKAR GROUNDMECH BESKAR HAUL-R'),
    row(22, '4.50T', '', 'BESKAR GUNRUNNER BESKAR STRIKE-ORB BESKAR B2 SUPER'),
    row(23, '6.00T', '', 'BESKAR MONO-WLKR BESKAR CYCLO-GRAV BESKAR B2-RP'),
    row(24, '9.00T', '', 'BESKAR MECHA-DROID BESKAR PROTO-ROLLER BASE MO-TRAK'),
    row(25, '13.50T', '', 'BESKAR OPTI-STRK BASE TRI-TEK GOLD DRFT-R'),
    row(26, '21.00T', '', 'GOLD CYCLENS DIAMOND LEP RAINBOW MO-TRAK'),
    row(27, '32.00T', '', 'DIAMOND RIC-1200 RAINBOW SNOW MOUSE BESKAR LOADLIFTER'),
  ],
];

// Source: insider-gaming.com Droid Tycoon Droidex guide. Names not covered there (newer/Beskar-only droids) are left unmapped.
export const RARITY_BY_NAME = {
  MOUSE: 'COMMON', PIT: 'COMMON', GONK: 'COMMON', CB: 'COMMON', R3: 'COMMON', R5: 'COMMON', R8: 'COMMON',
  'DRK-1 PROBE': 'COMMON', 'B1 BATTLE': 'COMMON', ID10: 'COMMON',
  'BDX EXPLORER': 'RARE', ARG: 'RARE', 'SENATE HOVERCAM': 'RARE', 'BU-4D': 'RARE', 'BAL-CORE': 'RARE', 'ROLL-R': 'RARE',
  '2BB': 'RARE', 'A-LT': 'RARE', R4: 'RARE', R9: 'RARE', 'B1 SECURITY': 'RARE', 'NAV-EX': 'RARE', 'VECT-ARM': 'RARE', 'HOV-R': 'RARE',
  GROUNDMECH: 'EPIC', LO: 'EPIC', 'AMP WALKER': 'EPIC', 'SEN-TRI': 'EPIC', 'OPTI-POD': 'EPIC', BB: 'EPIC', R2: 'EPIC', R6: 'EPIC',
  'TRAK-R': 'EPIC', 'ORB-WALKER': 'EPIC', 'UTIL-TEC': 'EPIC', 'B1 HEAVY': 'EPIC', 'B2 SUPER': 'EPIC', 'B2 HEAVY': 'EPIC',
  'STRIKE-ORB': 'EPIC', 'HAUL-R': 'EPIC', 'LNG-SHOT': 'EPIC', 'PROTO-ROLLER': 'EPIC', GUNRUNNER: 'EPIC',
  'MECHA-DROID': 'LEGENDARY', 'MONO-WLKR': 'LEGENDARY', BB9: 'LEGENDARY', R7: 'LEGENDARY', 'B2-RP': 'LEGENDARY',
  'CYCLO-GRAV': 'LEGENDARY', 'OPTI-STRK': 'LEGENDARY',
  BB9000: 'MYTHIC',
  'SNOW MOUSE': 'MYTHIC', RIC: 'MYTHIC', LOADLIFTER: 'MYTHIC', LEP: 'MYTHIC', 'RIC-1200': 'MYTHIC',
  'DRFT-R': 'MYTHIC', CYCLENS: 'MYTHIC', 'MO-TRAK': 'MYTHIC', 'TRI-TEK': 'MYTHIC',
  IG: 'MYTHIC', KX: 'MYTHIC',
};

export const TYPE_BY_NAME = {
  MOUSE: 'Worker', PIT: 'Worker', GONK: 'Worker', 'BDX EXPLORER': 'Worker', ARG: 'Worker', 'SENATE HOVERCAM': 'Worker',
  'BU-4D': 'Worker', 'BAL-CORE': 'Worker', 'ROLL-R': 'Worker', GROUNDMECH: 'Worker', LO: 'Worker', 'AMP WALKER': 'Worker',
  'SEN-TRI': 'Worker', 'OPTI-POD': 'Worker', 'MECHA-DROID': 'Worker', 'MONO-WLKR': 'Worker',
  CB: 'Astromech', R3: 'Astromech', R5: 'Astromech', R8: 'Astromech', '2BB': 'Astromech', 'A-LT': 'Astromech',
  R4: 'Astromech', R9: 'Astromech', BB: 'Astromech', R2: 'Astromech', R6: 'Astromech', 'TRAK-R': 'Astromech',
  'ORB-WALKER': 'Astromech', 'UTIL-TEC': 'Astromech', BB9: 'Astromech', R7: 'Astromech',
  'DRK-1 PROBE': 'Battle', 'B1 BATTLE': 'Battle', ID10: 'Battle', 'B1 SECURITY': 'Battle', 'NAV-EX': 'Battle',
  'VECT-ARM': 'Battle', 'HOV-R': 'Battle', 'B1 HEAVY': 'Battle', 'B2 SUPER': 'Battle', 'B2 HEAVY': 'Battle',
  'STRIKE-ORB': 'Battle', 'HAUL-R': 'Battle', 'LNG-SHOT': 'Battle', 'PROTO-ROLLER': 'Battle', GUNRUNNER: 'Battle',
  'B2-RP': 'Battle', 'CYCLO-GRAV': 'Battle', 'OPTI-STRK': 'Battle',
  'SNOW MOUSE': 'Worker', RIC: 'Worker', LOADLIFTER: 'Worker', LEP: 'Worker', 'RIC-1200': 'Worker',
  'DRFT-R': 'Astromech', CYCLENS: 'Astromech', 'MO-TRAK': 'Astromech', 'TRI-TEK': 'Astromech',
  IG: 'Battle', KX: 'Battle',
};

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
