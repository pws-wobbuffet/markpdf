import React, { useState, useRef } from 'react';

export default function Toolbar({ title, onTitleChange, onDownloadPDF, theme, onThemeToggle }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const finishEdit = (e) => {
    setEditing(false);
    onTitleChange(e.target.value || 'Untitled');
  };

  return (
    <div className="toolbar">
      <a className="toolbar-brand" href="#" onClick={(e) => e.preventDefault()}>
        mark<span>pdf</span>
      </a>

      <div className="toolbar-sep" />

      {editing ? (
        <input
          ref={inputRef}
          className="title-input"
          defaultValue={title}
          onBlur={finishEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setEditing(false); } }}
          autoFocus
        />
      ) : (
        <button
          className="title-input"
          onClick={startEdit}
          style={{ background: 'transparent', border: 'none', cursor: 'text', textAlign: 'left' }}
          title="Click to rename"
        >
          {title || 'Untitled'}
        </button>
      )}

      <div className="toolbar-actions">
        <button
          className="btn btn-ghost btn-icon"
          onClick={onThemeToggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ fontSize: 15 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn btn-primary" onClick={onDownloadPDF}>
          <span>⬇</span> Download PDF
        </button>
      </div>
    </div>
  );
}
