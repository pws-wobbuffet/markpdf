import React, { useState, useRef } from 'react';

export default function Toolbar({ title, onTitleChange, onDownloadPDF, theme, onThemeToggle, showPrintOptions, onTogglePrintOptions }) {
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

      <span className="badge">
        <span className="dot" />
        100% local
      </span>

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

      {/* Settings icon — toggles PDF options panel */}
      <button
        className={`icon-btn${showPrintOptions ? ' icon-btn-active' : ''}`}
        onClick={onTogglePrintOptions}
        title="PDF options"
        aria-label="PDF options"
        aria-expanded={showPrintOptions}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      <button className="btn-primary" onClick={onDownloadPDF}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/>
        </svg>
        Download PDF
      </button>
    </header>
  );
}
