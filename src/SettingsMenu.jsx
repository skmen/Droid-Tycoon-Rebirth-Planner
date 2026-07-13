import { useEffect, useRef, useState } from 'react';

export default function SettingsMenu({ theme, dark, onToggleTheme, showAds, onToggleAds }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: 'relative', flexShrink: 0, marginLeft: 'auto' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Settings menu"
        aria-expanded={open}
        style={{
          width: 38,
          height: 38,
          padding: 0,
          borderRadius: 9,
          border: `1px solid ${theme.border}`,
          background: theme.cardBg,
          color: theme.text,
          fontSize: 16,
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        ☰
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 180,
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            padding: 6,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <MenuRow theme={theme} label="Theme" value={dark ? 'Dark' : 'Light'} onClick={onToggleTheme} />
          <MenuRow theme={theme} label="Ads" value={showAds ? 'Shown' : 'Hidden'} onClick={onToggleAds} />
        </div>
      )}
    </div>
  );
}

function MenuRow({ theme, label, value, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '9px 10px',
        borderRadius: 8,
        border: 'none',
        background: hover ? theme.tableHeaderBg : 'transparent',
        color: theme.text,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <span>{label}</span>
      <span style={{ color: theme.textSecondary, fontWeight: 700 }}>{value}</span>
    </button>
  );
}
