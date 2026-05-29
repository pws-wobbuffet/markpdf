import React, { useState, useRef } from 'react';

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

      <button className="btn-primary" onClick={onDownloadPDF}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/>
        </svg>
        <span className="btn-text">Download PDF</span>
      </button>
    </header>
  );
}
