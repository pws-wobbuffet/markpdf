import React, { useState, useEffect, useRef, useCallback } from 'react';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Preview from './Preview';

// ── Storage helpers ──────────────────────────────────────────────────────────
const STORE_KEY = 'markpdf.docs';
const ACTIVE_KEY = 'markpdf.activeId';

const DEFAULT_CONTENT = `# Welcome to markpdf

Write Markdown here. The preview updates live on the right.

## Features

- **Syntax highlighted** editor
- Live **HTML preview**
- One-click **PDF export** — nothing leaves your browser
- Multiple documents saved **locally**

## Try it

Some *italic* and **bold** text, and some \`inline code\`.

> A blockquote looks like this.

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('world'));
\`\`\`

| Column A | Column B |
|---------|---------|
| Row 1   | Value 1 |
| Row 2   | Value 2 |

---

**Tip:** Click the document title above to rename it.
`;

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function defaultDoc() {
  return { id: makeId(), title: 'Welcome', content: DEFAULT_CONTENT, updatedAt: new Date().toISOString() };
}

function loadDocs() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const docs = raw ? JSON.parse(raw) : null;
    return docs && docs.length > 0 ? docs : [defaultDoc()];
  } catch { return [defaultDoc()]; }
}

function saveDocs(docs) {
  localStorage.setItem(STORE_KEY, JSON.stringify(docs));
}

function loadActiveId(docs) {
  const saved = localStorage.getItem(ACTIVE_KEY);
  return docs.find(d => d.id === saved) ? saved : docs[0].id;
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Theme
  const [theme, setTheme] = useState(() => {
    const s = localStorage.getItem('markpdf.theme');
    return s || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('markpdf.theme', theme);
  }, [theme]);

  // Documents
  const [docs, setDocs] = useState(loadDocs);
  const [activeId, setActiveId] = useState(() => loadActiveId(loadDocs()));

  const activeDoc = docs.find(d => d.id === activeId) ?? docs[0];

  const persistDoc = useCallback((updated) => {
    const next = docs.map(d => d.id === updated.id ? updated : d);
    setDocs(next);
    saveDocs(next);
  }, [docs]);

  const updateContent = useCallback((content) => {
    persistDoc({ ...activeDoc, content, updatedAt: new Date().toISOString() });
  }, [activeDoc, persistDoc]);

  const updateTitle = useCallback((title) => {
    persistDoc({ ...activeDoc, title, updatedAt: new Date().toISOString() });
  }, [activeDoc, persistDoc]);

  const newDoc = () => {
    const doc = { id: makeId(), title: 'Untitled', content: '# Untitled\n\nStart writing…\n', updatedAt: new Date().toISOString() };
    const next = [doc, ...docs];
    setDocs(next);
    saveDocs(next);
    setActiveId(doc.id);
    localStorage.setItem(ACTIVE_KEY, doc.id);
  };

  const selectDoc = (id) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  };

  const deleteDoc = (id) => {
    const next = docs.filter(d => d.id !== id);
    if (next.length === 0) { newDoc(); return; }
    setDocs(next);
    saveDocs(next);
    if (activeId === id) {
      setActiveId(next[0].id);
      localStorage.setItem(ACTIVE_KEY, next[0].id);
    }
  };

  // PDF export
  const downloadPDF = () => {
    const prev = document.title;
    document.title = activeDoc.title || 'document';
    window.print();
    // Restore after print dialog closes
    const restore = () => { document.title = prev; window.removeEventListener('focus', restore); };
    window.addEventListener('focus', restore);
  };

  // Resizable split
  const [editorWidth, setEditorWidth] = useState(50); // percent
  const isDragging = useRef(false);
  const paneAreaRef = useRef(null);

  const startDrag = (e) => {
    e.preventDefault();
    isDragging.current = true;
    e.currentTarget.classList.add('dragging');
    const divider = e.currentTarget;

    const onMove = (ev) => {
      if (!isDragging.current || !paneAreaRef.current) return;
      const rect = paneAreaRef.current.getBoundingClientRect();
      const x = (ev.clientX ?? ev.touches?.[0]?.clientX) - rect.left;
      const pct = Math.min(80, Math.max(20, (x / rect.width) * 100));
      setEditorWidth(pct);
    };
    const onUp = () => {
      isDragging.current = false;
      divider.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Mobile tab
  const [mobileTab, setMobileTab] = useState('editor');

  return (
    <div className="app">
      <Toolbar
        title={activeDoc?.title ?? ''}
        onTitleChange={updateTitle}
        onDownloadPDF={downloadPDF}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      {/* Mobile tabs */}
      <div className="mobile-tabs">
        <button className={`mobile-tab-btn${mobileTab === 'editor' ? ' active' : ''}`}
          onClick={() => setMobileTab('editor')}>Editor</button>
        <button className={`mobile-tab-btn${mobileTab === 'preview' ? ' active' : ''}`}
          onClick={() => setMobileTab('preview')}>Preview</button>
      </div>

      <div className="main-area">
        <Sidebar
          docs={docs}
          activeId={activeId}
          onSelect={selectDoc}
          onNew={newDoc}
          onDelete={deleteDoc}
        />

        <div className="pane-area" ref={paneAreaRef}>
          {/* Editor pane */}
          <div
            className={`editor-pane${mobileTab === 'preview' ? ' mob-hidden' : ' mob-visible'}`}
            style={{ flex: `0 0 ${editorWidth}%` }}
          >
            <div className="pane-label">MARKDOWN</div>
            <Editor
              content={activeDoc?.content ?? ''}
              onChange={updateContent}
            />
          </div>

          {/* Draggable divider */}
          <div className="divider" onPointerDown={startDrag} />

          {/* Preview pane */}
          <div
            className={`preview-pane${mobileTab === 'editor' ? ' mob-hidden' : ' mob-visible'}`}
          >
            <div className="pane-label preview-label">PREVIEW</div>
            <Preview content={activeDoc?.content ?? ''} />
          </div>
        </div>
      </div>
    </div>
  );
}
