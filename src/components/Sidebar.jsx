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
    </aside>
  );
}
