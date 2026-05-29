import React, { useState, useEffect } from 'react';

export const FONTS = {
  newsreader:    { label: 'Newsreader',    value: '"Newsreader", Georgia, serif' },
  lora:          { label: 'Lora',          value: '"Lora", Georgia, serif' },
  merriweather:  { label: 'Merriweather',  value: '"Merriweather", Georgia, serif' },
  sourceserif:   { label: 'Source Serif',  value: '"Source Serif 4", Georgia, serif' },
  georgia:       { label: 'Georgia',       value: 'Georgia, "Times New Roman", serif' },
  spacegrotesk:  { label: 'Space Grotesk', value: '"Space Grotesk", system-ui, sans-serif' },
  inter:         { label: 'Inter',         value: '"Inter", system-ui, sans-serif' },
  ibmplexsans:   { label: 'IBM Plex Sans', value: '"IBM Plex Sans", system-ui, sans-serif' },
  jetbrainsmono: { label: 'JetBrains Mono',value: '"JetBrains Mono", ui-monospace, monospace' },
  ibmplexmono:   { label: 'IBM Plex Mono', value: '"IBM Plex Mono", ui-monospace, monospace' },
};

export const SIZES     = { sm: { label: 'S', value: '13px' }, md: { label: 'M', value: '16px' }, lg: { label: 'L', value: '19px' } };
export const SPACINGS  = { compact: { label: 'Tight', value: '1.5' }, regular: { label: 'Regular', value: '1.7' }, relaxed: { label: 'Loose', value: '2.0' } };
export const MARGINS   = { narrow: { label: 'Narrow', value: '12' }, normal: { label: 'Normal', value: '20' }, wide: { label: 'Wide', value: '30' } };
export const PAGE_SIZES = {
  a4:     { label: 'A4',     value: 'A4 portrait' },
  letter: { label: 'Letter', value: 'letter portrait' },
  a5:     { label: 'A5',     value: 'A5 portrait' },
};

export const DEFAULT_PRINT_OPTIONS = {
  font: 'newsreader', size: 'md', spacing: 'regular', margins: 'normal', pageSize: 'a4',
  customFontUrl: '', customFontName: '',
};

const FONT_GROUPS = [
  { label: 'Serif',      keys: ['newsreader', 'lora', 'merriweather', 'sourceserif', 'georgia'] },
  { label: 'Sans-serif', keys: ['spacegrotesk', 'inter', 'ibmplexsans'] },
  { label: 'Monospace',  keys: ['jetbrainsmono', 'ibmplexmono'] },
];

// Parse a Google Fonts URL or a plain font name into { url, name }
function parseGoogleFont(raw) {
  const s = raw.trim();
  if (!s) return null;
  if (s.startsWith('http')) {
    try {
      const u = new URL(s);
      const family = u.searchParams.get('family');
      if (family) {
        // "Playfair+Display:wght@400;700" → "Playfair Display"
        const name = family.split(':')[0].split('|')[0].replace(/\+/g, ' ');
        return { url: s, name };
      }
    } catch {}
    return null;
  }
  // Plain font name — construct a Google Fonts CSS2 URL
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(s)}:wght@400;500;600;700&display=swap`;
  return { url, name: s };
}

function Seg({ options, value, onChange }) {
  return (
    <div className="po-seg">
      {Object.entries(options).map(([id, { label }]) => (
        <button key={id} className={value === id ? 'active' : ''} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function PrintOptionsPanel({ options, onChange, onClose }) {
  const set = (key) => (val) => onChange({ ...options, [key]: val });

  const [inputVal, setInputVal] = useState(options.customFontName || '');
  useEffect(() => { if (!options.customFontName) setInputVal(''); }, [options.customFontName]);

  const applyCustomFont = () => {
    const parsed = parseGoogleFont(inputVal);
    if (parsed) {
      onChange({ ...options, customFontUrl: parsed.url, customFontName: parsed.name, font: 'custom' });
    }
  };

  const clearCustomFont = () => {
    setInputVal('');
    onChange({ ...options, customFontUrl: '', customFontName: '', font: 'newsreader' });
  };

  return (
    <aside className="pane po-pane">
      <div className="pane-head">
        PDF options
        <button className="po-close" onClick={onClose} title="Close" aria-label="Close PDF options">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
      </div>

      <div className="pane-body po-body">
        <div className="po-group">
          <span className="po-label">Body font</span>
          <select className="po-select" value={options.font} onChange={(e) => set('font')(e.target.value)}>
            {options.customFontName && (
              <option value="custom">✦ {options.customFontName}</option>
            )}
            {FONT_GROUPS.map(({ label, keys }) => (
              <optgroup key={label} label={label}>
                {keys.map((k) => <option key={k} value={k}>{FONTS[k].label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="po-group">
          <span className="po-label">Custom Google Font</span>
          <div className="po-custom-row">
            <input
              className="po-input"
              type="text"
              placeholder={`Font name or Google Fonts URL`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCustomFont()}
              onBlur={applyCustomFont}
            />
            {options.customFontName && (
              <button className="po-clear-btn" onClick={clearCustomFont} title="Remove">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
              </button>
            )}
          </div>
          {options.customFontName
            ? <span className="po-custom-status ok">✓ {options.customFontName}</span>
            : <span className="po-custom-status">e.g. Playfair Display · or paste a URL</span>
          }
        </div>

        <div className="po-group">
          <span className="po-label">Font size</span>
          <Seg options={SIZES}      value={options.size}     onChange={set('size')} />
        </div>
        <div className="po-group">
          <span className="po-label">Line spacing</span>
          <Seg options={SPACINGS}   value={options.spacing}  onChange={set('spacing')} />
        </div>
        <div className="po-group">
          <span className="po-label">Page margins</span>
          <Seg options={MARGINS}    value={options.margins}  onChange={set('margins')} />
        </div>
        <div className="po-group">
          <span className="po-label">Page size</span>
          <Seg options={PAGE_SIZES} value={options.pageSize} onChange={set('pageSize')} />
        </div>

        <p className="po-hint">Changes apply to the preview and the downloaded PDF.</p>
      </div>
    </aside>
  );
}
