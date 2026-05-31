import React, { useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export default function Preview({ content, showOptions, onToggleOptions, zoom = 1, onZoomIn, onZoomOut, onZoomReset }) {
  const html = useMemo(() => {
    try { return marked.parse(content || ''); }
    catch { return '<p>Parse error</p>'; }
  }, [content]);

  const pct = Math.round(zoom * 100);

  return (
    <section className="pane preview-pane">
      <div className="pane-head">
        Preview
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Zoom controls */}
          <div className="zoom-controls">
            <button
              className="zoom-btn"
              onClick={onZoomOut}
              disabled={zoom <= 0.25}
              title="Zoom out"
              aria-label="Zoom out"
            >−</button>
            <button
              className="zoom-pct"
              onClick={onZoomReset}
              title="Reset to 100%"
              aria-label={`Zoom ${pct}%, click to reset`}
            >{pct}%</button>
            <button
              className="zoom-btn"
              onClick={onZoomIn}
              disabled={zoom >= 2.0}
              title="Zoom in"
              aria-label="Zoom in"
            >+</button>
          </div>

          <span className="muted">A4</span>

          <button
            className={`po-toggle-btn${showOptions ? ' active' : ''}`}
            onClick={onToggleOptions}
            title={showOptions ? 'Close PDF options' : 'PDF options'}
            aria-label="Toggle PDF options"
            aria-expanded={showOptions}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="pane-body">
        <div className="preview-wrap">
          <article
            className="sheet shadowed"
            style={{ zoom }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  );
}
