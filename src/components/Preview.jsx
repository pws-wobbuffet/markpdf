import React, { useMemo, useRef, useEffect } from 'react';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export default function Preview({
  content, showOptions, onToggleOptions,
  zoom = 1, onZoomIn, onZoomOut, onZoomReset, onSetZoom,
}) {
  const html = useMemo(() => {
    try { return marked.parse(content || ''); }
    catch { return '<p>Parse error</p>'; }
  }, [content]);

  const paneBodyRef = useRef(null);
  const pct = Math.round(zoom * 100);

  // ── Smooth zoom: Cmd+Scroll (Mac), Ctrl+Scroll (Win/Linux), trackpad pinch ──
  // Browsers report pinch as wheel+ctrlKey; Cmd+scroll as wheel+metaKey.
  // Requires addEventListener with passive:false to allow preventDefault.
  useEffect(() => {
    const el = paneBodyRef.current;
    if (!el || !onSetZoom) return;
    const onWheel = (e) => {
      if (!e.metaKey && !e.ctrlKey) return;
      e.preventDefault();
      const delta = -e.deltaY / 400;
      onSetZoom(prev => Math.min(2.0, Math.max(0.25, prev + delta)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onSetZoom]);

  // ── Pan: left-click+drag ──
  // Plain object ref for drag state avoids re-renders during drag.
  useEffect(() => {
    const el = paneBodyRef.current;
    if (!el) return;
    const drag = { active: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 };

    const onDown = (e) => {
      if (e.button !== 0) return;
      drag.active = true;
      drag.startX      = e.clientX;
      drag.startY      = e.clientY;
      drag.scrollLeft  = el.scrollLeft;
      drag.scrollTop   = el.scrollTop;
      el.style.cursor  = 'grabbing';
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!drag.active) return;
      el.scrollLeft = drag.scrollLeft - (e.clientX - drag.startX);
      el.scrollTop  = drag.scrollTop  - (e.clientY - drag.startY);
    };
    const onUp = () => {
      if (!drag.active) return;
      drag.active     = false;
      el.style.cursor = '';
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ── Center: scroll pane to horizontally center the sheet ──
  const handleCenter = () => {
    const el = paneBodyRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop  = 0;
  };

  return (
    <section className="pane preview-pane">
      <div className="pane-head">
        Preview
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={onZoomOut} disabled={zoom <= 0.25}
              title="Zoom out" aria-label="Zoom out">−</button>
            <button className="zoom-pct" onClick={onZoomReset}
              title="Reset to 100%" aria-label={`Zoom ${pct}%, click to reset`}>{pct}%</button>
            <button className="zoom-btn" onClick={onZoomIn} disabled={zoom >= 2.0}
              title="Zoom in" aria-label="Zoom in">+</button>
            <button className="zoom-btn zoom-center-btn" onClick={handleCenter}
              title="Center view (⌘+drag to pan)" aria-label="Center view">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
              </svg>
            </button>
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

      <div className="pane-body" ref={paneBodyRef}>
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
