import React, { useState } from 'react';

const ACCENTS = [
  { id: 'green',  label: 'Green',  l: '#1a8a52', d: '#3ddc84', inkL: '#ffffff', inkD: '#06120c', softL: '#e8f3ec', softD: '#16241c' },
  { id: 'violet', label: 'Violet', l: '#7c3aed', d: '#c98bff', inkL: '#ffffff', inkD: '#0f0820', softL: '#f1ebfd', softD: '#1e1430' },
  { id: 'amber',  label: 'Amber',  l: '#b45309', d: '#fbbf24', inkL: '#ffffff', inkD: '#1a1004', softL: '#fdf0e0', softD: '#291c08' },
  { id: 'cyan',   label: 'Cyan',   l: '#0e7490', d: '#22d3ee', inkL: '#ffffff', inkD: '#04141a', softL: '#e2f3f7', softD: '#0c2630' },
  { id: 'slate',  label: 'Slate',  l: '#475569', d: '#94a3b8', inkL: '#ffffff', inkD: '#0a0f17', softL: '#eef1f5', softD: '#1a222e' },
];

const SWATCH_COLORS = {
  green: '#1a8a52', violet: '#7c3aed', amber: '#d97706', cyan: '#0891b2', slate: '#475569',
};

export default function TweaksPanel({ accent, paperStyle, density, theme, onAccent, onPaper, onDensity }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="tweaks">
      <div
        className={`tweaks-head${open ? ' tweaks-head-border' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        Tweaks
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'none' : 'rotate(180deg)', transition: 'transform 150ms' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {open && (
        <div className="tweaks-body">
          {/* Accent */}
          <div>
            <span className="tw-label">Accent</span>
            <div className="tw-swatches">
              {ACCENTS.map((a) => (
                <div
                  key={a.id}
                  className={`tw-sw${accent === a.id ? ' active' : ''}`}
                  style={{ background: SWATCH_COLORS[a.id] }}
                  title={a.label}
                  onClick={() => onAccent(a.id)}
                />
              ))}
            </div>
          </div>

          {/* Preview paper */}
          <div>
            <span className="tw-label">Preview paper</span>
            <div className="seg">
              {[['plain', 'Plain'], ['bordered', 'Border'], ['shadowed', 'Sheet']].map(([v, l]) => (
                <button key={v} className={paperStyle === v ? 'active' : ''} onClick={() => onPaper(v)}>{l}</button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div>
            <span className="tw-label">Density</span>
            <div className="seg">
              {[['compact', 'Snug'], ['regular', 'Regular'], ['roomy', 'Roomy']].map(([v, l]) => (
                <button key={v} className={density === v ? 'active' : ''} onClick={() => onDensity(v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ACCENTS };
