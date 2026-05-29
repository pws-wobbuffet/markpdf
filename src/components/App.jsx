import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Preview from './Preview';

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

function makeId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function defaultDoc() { return { id: makeId(), title: 'Welcome', content: DEFAULT_CONTENT, updatedAt: new Date().toISOString() }; }

function _loadDocs() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const docs = raw ? JSON.parse(raw) : null;
    return docs && docs.length > 0 ? docs : [defaultDoc()];
  } catch { return [defaultDoc()]; }
}
function _saveDocs(docs) { localStorage.setItem(STORE_KEY, JSON.stringify(docs)); }
function _loadActiveId(docs) {
  const saved = localStorage.getItem(ACTIVE_KEY);
  return docs.find(d => d.id === saved) ? saved : docs[0].id;
}

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
  const [docs, setDocs] = useState(_loadDocs);
  const [activeId, setActiveId] = useState(() => _loadActiveId(_loadDocs()));

  const activeDoc = docs.find(d => d.id === activeId) ?? docs[0];

  const persistDoc = useCallback((updated) => {
    const next = docs.map(d => d.id === updated.id ? updated : d);
    setDocs(next);
    _saveDocs(next);
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
    setDocs(next); _saveDocs(next);
    setActiveId(doc.id); localStorage.setItem(ACTIVE_KEY, doc.id);
  };

  const selectDoc = (id) => {
    setActiveId(id); localStorage.setItem(ACTIVE_KEY, id);
  };

  const deleteDoc = (id) => {
    const next = docs.filter(d => d.id !== id);
    if (next.length === 0) return;
    setDocs(next); _saveDocs(next);
    if (activeId === id) { setActiveId(next[0].id); localStorage.setItem(ACTIVE_KEY, next[0].id); }
  };

  const downloadPDF = () => {
    const prev = document.title;
    document.title = activeDoc?.title || 'document';
    window.print();
    const restore = () => { document.title = prev; window.removeEventListener('focus', restore); };
    window.addEventListener('focus', restore);
  };

  const lineCount = (activeDoc?.content ?? '').split('\n').length;

  return (
    <div className="app">
      <Toolbar
        title={activeDoc?.title ?? ''}
        onTitleChange={updateTitle}
        onDownloadPDF={downloadPDF}
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      <div className="main-area">
        <Sidebar
          docs={docs}
          activeId={activeId}
          onSelect={selectDoc}
          onNew={newDoc}
          onDelete={deleteDoc}
        />

        <section className="pane">
          <div className="pane-head">
            Markdown
            <span className="muted">{lineCount} lines</span>
          </div>
          <div className="pane-body" style={{ display: 'flex', flexDirection: 'column' }}>
            <Editor content={activeDoc?.content ?? ''} onChange={updateContent} />
          </div>
        </section>

        <Preview content={activeDoc?.content ?? ''} />
      </div>
    </div>
  );
}
