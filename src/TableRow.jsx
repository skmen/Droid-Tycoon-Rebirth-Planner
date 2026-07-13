import { useState } from 'react';

export default function TableRow({ theme, row, gridCols, showRarityCol, expanded, onToggle }) {
  const [hover, setHover] = useState(false);

  return (
    <div>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          padding: '9px 13px',
          fontSize: 12,
          borderTop: `1px solid ${theme.rowBorder}`,
          alignItems: 'center',
          cursor: 'pointer',
          background: hover ? theme.tableHeaderBg : 'transparent',
        }}
      >
        <div
          style={{
            fontWeight: 600,
            color: row.nameColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingRight: 6,
          }}
        >
          {row.name}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: theme.textSecondary, textAlign: 'center' }}>
          {row.step}
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.textSecondary,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.type}
        </div>
        {showRarityCol && (
          <div style={{ fontSize: 11, fontWeight: 700, color: row.rarityColor, textAlign: 'center' }}>{row.rarity}</div>
        )}
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: 10,
              fontWeight: 700,
              background: row.tierBg,
              color: row.tierFg,
              padding: '3px 7px',
              borderRadius: 6,
              textShadow: row.textOutline,
              whiteSpace: 'nowrap',
            }}
          >
            {row.tier}
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '8px 13px 12px', fontSize: 11, color: theme.textSecondary, background: theme.tableHeaderBg }}>
          {row.occurrencesText}
        </div>
      )}
    </div>
  );
}
