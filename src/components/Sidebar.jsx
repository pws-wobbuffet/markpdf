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

export default function Sidebar({ docs, activeId, onSelect, onNew, onDelete }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-label">Documents</span>
        <button className="btn btn-ghost btn-icon" onClick={onNew} title="New document" style={{ padding: '3px 7px', fontSize: 16 }}>
          ＋
        </button>
      </div>
      <div className="sidebar-list">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className={`doc-item${doc.id === activeId ? ' active' : ''}`}
            onClick={() => onSelect(doc.id)}
          >
            <span className="doc-icon">📄</span>
            <div className="doc-info">
              <div className="doc-title">{doc.title || 'Untitled'}</div>
              <div className="doc-meta">{relativeTime(doc.updatedAt)}</div>
            </div>
            {docs.length > 1 && (
              <button
                className="doc-delete"
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                title="Delete"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
