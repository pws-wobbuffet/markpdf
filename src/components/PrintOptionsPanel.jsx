import React, { useEffect, useRef } from 'react';

export const FONTS = {
  serif: { label: 'Serif',  value: '"Newsreader", Georgia, serif' },
  sans:  { label: 'Sans',   value: '"Space Grotesk", system-ui, sans-serif' },
  mono:  { label: 'Mono',   value: '"JetBrains Mono", ui-monospace, monospace' },
};
export const SIZES    = { sm: { label: 'S', value: '14px' }, md: { label: 'M', value: '16px' }, lg: { label: 'L', value: '18px' } };
export const SPACINGS = { compact: { label: 'Tight', value: '1.5' }, regular: { label: 'Regular', value: '1.7' }, relaxed: { label: 'Loose', value: '2.0' } };
export const MARGINS  = { narrow: { label: 'Narrow', value: '12' }, normal: { label: 'Normal', value: '20' }, wide: { label: 'Wide', value: '30' } };

export const DEFAULT_PRINT_OPTIONS = { font: 'serif', size: 'md', spacing: 'regular', margins: 'normal' };

function Seg({ options, value, onChange }) {
  return (
    <div className="po-seg">
      {Object.entries(options).map(([id, { label }]) => (
        <button
          key={id}
          className={value === id ? 'active' : ''}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function PrintOptionsPanel({ options, onChange, onClose }) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    // slight delay so the toggle click itself doesn't immediately close
    const id = setTimeout(() => document.addEventListener('mousedown', handle), 50);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handle); };
  }, [onClose]);

  const set = (key) => (val) => onChange({ ...options, [key]: val });

  return (
    <div className="po-panel" ref={panelRef} role="dialog" aria-label="PDF options">
      <div className="po-head">
        <span>PDF options</span>
        <button className="po-close" onClick={onClose} aria-label="Close">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
      </div>

      <div className="po-body">
        <div className="po-group">
          <span className="po-label">Body font</span>
          <Seg options={FONTS}    value={options.font}    onChange={set('font')} />
        </div>
        <div className="po-group">
          <span className="po-label">Font size</span>
          <Seg options={SIZES}    value={options.size}    onChange={set('size')} />
        </div>
        <div className="po-group">
          <span className="po-label">Line spacing</span>
          <Seg options={SPACINGS} value={options.spacing} onChange={set('spacing')} />
        </div>
        <div className="po-group">
          <span className="po-label">Page margins</span>
          <Seg options={MARGINS}  value={options.margins} onChange={set('margins')} />
        </div>
      </div>

      <div className="po-footer">
        <span className="po-hint">Changes apply to the preview</span>
      </div>
    </div>
  );
}
