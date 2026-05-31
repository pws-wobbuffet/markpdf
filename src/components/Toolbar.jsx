import React, { useState, useRef, useEffect } from 'react';

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="3.5" y="7" width="9" height="6" rx="1.2"/>
    <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7"/>
  </svg>
);

function DownloadCombo({ onDownloadPDF, proUrl }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="dl-combo" ref={ref}>
      <button className="dl-combo__main btn-primary" onClick={onDownloadPDF}>
        <DownloadIcon />
        <span className="btn-text">Download</span>
      </button>
      <button
        className={`dl-combo__arrow btn-primary${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="More export formats"
      >
        <ChevronIcon />
      </button>
      {open && (
        <div className="dl-combo__menu">
          <div className="dl-combo__item dl-combo__item--active" onClick={() => { onDownloadPDF(); setOpen(false); }}>
            <DownloadIcon />
            PDF
          </div>
          <a
            className="dl-combo__item dl-combo__item--locked"
            href={proUrl}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
          >
            <span className="dl-combo__item-label">More formats</span>
            <span className="dl-combo__lock">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                <path d="M9 3h4v4"/><path d="M13 3l-6 6"/><path d="M11 9v3.5H3.5V5H7"/>
              </svg>
              <span style={{ fontSize: '10px', color: 'var(--fg-faint)' }}>SaaS</span>
            </span>
          </a>
        </div>
      )}
    </div>
  );
}

export default function Toolbar({ title, onTitleChange, onDownloadPDF, theme, onThemeToggle }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => { inputRef.current?.select(); }, 0);
  };

  const finishEdit = (e) => {
    setEditing(false);
    onTitleChange(e.target.value || 'Untitled');
  };

  return (
    <header className="toolbar">
      <span className="wordmark">mark<span className="accent">pdf</span></span>
      <span className="oss-badge">OSS</span>

      <div className="divider-v" />

      {editing ? (
        <input
          ref={inputRef}
          className="doc-title-input"
          defaultValue={title}
          onBlur={finishEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditing(false); }}
          autoFocus
        />
      ) : (
        <button className="doc-title-btn" onClick={startEdit} title="Click to rename">
          {title || 'Untitled'}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 19h14"/><path d="M14 5l5 5-9 9H5v-5z"/>
          </svg>
        </button>
      )}

      <span className="spacer" />

      <a
        className="trypro"
        href="https://getmarkpdf.com"
        target="_blank"
        rel="noopener"
        title="markpdf pro — sync, charts, custom themes and more"
      >
        Try our SaaS version
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h4v4"/><path d="M13 3l-6 6"/><path d="M11 9v3.5H3.5V5H7"/>
        </svg>
      </a>

      <button
        className="icon-btn"
        onClick={onThemeToggle}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 13a8 8 0 1 1-10-10 7 7 0 0 0 10 10z"/>
          </svg>
        )}
      </button>

      <DownloadCombo
        onDownloadPDF={onDownloadPDF}
        proUrl="https://getmarkpdf.com"
      />
    </header>
  );
}
