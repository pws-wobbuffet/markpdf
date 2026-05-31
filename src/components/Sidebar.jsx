import React from 'react';

function relativeTime(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const FileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M6 3h9l5 5v13H6z"/><path d="M15 3v6h5"/>
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
    <path d="M8 1.5a6.5 6.5 0 0 0-2.05 12.67c.32.06.44-.14.44-.31v-1.2c-1.8.39-2.18-.77-2.18-.77-.3-.75-.72-.95-.72-.95-.59-.4.04-.39.04-.39.65.05.99.67.99.67.58.99 1.51.7 1.88.54.06-.42.23-.7.41-.86-1.44-.16-2.95-.72-2.95-3.2 0-.71.25-1.28.67-1.74-.07-.16-.29-.82.06-1.71 0 0 .55-.18 1.8.66a6.2 6.2 0 0 1 3.27 0c1.25-.84 1.8-.66 1.8-.66.35.89.13 1.55.06 1.71.42.46.67 1.03.67 1.74 0 2.49-1.51 3.04-2.95 3.2.23.2.44.59.44 1.2v1.78c0 .17.12.38.45.31A6.5 6.5 0 0 0 8 1.5z"/>
  </svg>
);

const CoffeeIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M3.5 6h7v3.5a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5z"/>
    <path d="M10.5 7h1.2a1.3 1.3 0 0 1 0 2.6h-1.2"/>
    <path d="M5 3.5c-.3.4-.3.8 0 1.2M7.3 3.5c-.3.4-.3.8 0 1.2"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
    <path d="M8 13.5S2.5 10 2.5 6.2A2.7 2.7 0 0 1 8 5a2.7 2.7 0 0 1 5.5 1.2C13.5 10 8 13.5 8 13.5z"/>
  </svg>
);

export default function Sidebar({ docs, activeId, onSelect, onNew, onDelete }) {
  return (
    <aside className="pane docs">
      <div className="pane-head">
        Documents
        <button className="add-btn" onClick={onNew} title="New document">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>
      <div className="pane-body">
        <div className="doc-list">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className={`doc-item${doc.id === activeId ? ' active' : ''}`}
              onClick={() => onSelect(doc.id)}
            >
              <FileIcon />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="doc-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.title || 'Untitled'}
                </div>
                <div className="doc-meta">{relativeTime(doc.updatedAt)}</div>
              </div>
              {docs.length > 1 && (
                <button
                  className="doc-del"
                  onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                  title="Delete"
                >✕</button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Surface 5 — donation footer */}
      <div className="side-footer">
        <div className="donate-2">
          <span className="donate-lbl">
            <span className="donate-heart"><HeartIcon /></span>
            Support
          </span>
          <span className="donate-spacer" />
          <div className="donate-icons">
            <a href="https://github.com/sponsors/pomaretta" target="_blank" rel="noopener" title="GitHub Sponsors">
              <GithubIcon />
            </a>
            <a href="https://buymeacoffee.com/pomaretta" target="_blank" rel="noopener" title="Buy me a coffee">
              <CoffeeIcon />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
