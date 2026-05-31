import React, { useState, useEffect, useRef, useCallback } from 'react';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Preview from './Preview';
import PrintOptionsPanel, {
  DEFAULT_PRINT_OPTIONS, FONTS, SIZES, SPACINGS, MARGINS,
} from './PrintOptionsPanel';

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

  // Print options
  const [printOptions, setPrintOptions] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('markpdf.print') || 'null');
      if (!raw) return DEFAULT_PRINT_OPTIONS;
      // Migrate old single-word font keys to new keys
      const fontMigration = { serif: 'newsreader', sans: 'spacegrotesk', mono: 'jetbrainsmono' };
      if (raw.font && fontMigration[raw.font]) raw.font = fontMigration[raw.font];
      return { ...DEFAULT_PRINT_OPTIONS, ...raw };
    } catch { return DEFAULT_PRINT_OPTIONS; }
  });

  // Sidebar open by default; persisted
  const [showPrintOptions, setShowPrintOptions] = useState(() => {
    const s = localStorage.getItem('markpdf.options-open');
    return s === null ? true : s === 'true';
  });
  const togglePrintOptions = () => {
    const next = !showPrintOptions;
    setShowPrintOptions(next);
    localStorage.setItem('markpdf.options-open', String(next));
  };

  // Inject / remove the custom Google Font <link> when the URL changes
  useEffect(() => {
    document.getElementById('markpdf-custom-font')?.remove();
    if (printOptions.customFontUrl) {
      const link = document.createElement('link');
      link.id = 'markpdf-custom-font';
      link.rel = 'stylesheet';
      link.href = printOptions.customFontUrl;
      document.head.appendChild(link);
    }
  }, [printOptions.customFontUrl]);

  // Apply options to CSS vars so the preview and print both use them
  useEffect(() => {
    const r = document.documentElement;
    const bodyFont = printOptions.font === 'custom' && printOptions.customFontName
      ? `"${printOptions.customFontName}", sans-serif`
      : FONTS[printOptions.font]?.value ?? FONTS.newsreader.value;
    r.style.setProperty('--sheet-body-font',   bodyFont);
    r.style.setProperty('--sheet-font-size',   SIZES[printOptions.size]?.value    ?? SIZES.md.value);
    r.style.setProperty('--sheet-line-height', SPACINGS[printOptions.spacing]?.value ?? SPACINGS.regular.value);
    localStorage.setItem('markpdf.print', JSON.stringify(printOptions));
  }, [printOptions]);

  // Resizable editor/preview split
  const [editorFlex, setEditorFlex] = useState(50);
  const epWrapRef = useRef(null);

  const startDividerDrag = useCallback((e) => {
    e.preventDefault();
    const wrap = epWrapRef.current;
    if (!wrap) return;
    const onMove = (ev) => {
      const rect = wrap.getBoundingClientRect();
      const pct = Math.min(75, Math.max(25, ((ev.clientX - rect.left) / rect.width) * 100));
      setEditorFlex(pct);
    };
    const onUp = () => {
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    document.body.style.cursor = 'col-resize';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  // Preview zoom (CSS zoom property — affects layout, pane-body scrolls on overflow)
  const [previewZoom, setPreviewZoom] = useState(1.0);
  const zoomIn    = () => setPreviewZoom(z => Math.min(2.0, Math.round((z + 0.25) * 4) / 4));
  const zoomOut   = () => setPreviewZoom(z => Math.max(0.25, Math.round((z - 0.25) * 4) / 4));
  const zoomReset = () => setPreviewZoom(1.0);

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

  const downloadPDF = useCallback(async () => {
    const sheet = document.querySelector('.sheet');
    if (!sheet) return;

    const marginMm = Number(MARGINS[printOptions.margins]?.value ?? '20');

    const prevZoom = sheet.style.zoom;
    sheet.style.zoom = '1';

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf().set({
        margin:      marginMm,
        filename:    `${activeDoc?.title || 'document'}.pdf`,
        image:       { type: 'png' },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(sheet).save();
    } finally {
      sheet.style.zoom = prevZoom;
    }
  }, [printOptions, activeDoc]);

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

      <div className={`main-area${showPrintOptions ? ' with-options' : ''}`}>
        <Sidebar
          docs={docs}
          activeId={activeId}
          onSelect={selectDoc}
          onNew={newDoc}
          onDelete={deleteDoc}
        />

        {/* Editor + drag divider + Preview share a flex wrapper so the
            drag percentage is relative to just this area, not the full layout */}
        <div className="ep-wrap" ref={epWrapRef}>
          <section className="pane" style={{ flex: `0 0 ${editorFlex}%` }}>
            <div className="pane-head">
              Markdown
              <span className="muted">{lineCount} lines</span>
            </div>
            <div className="pane-body" style={{ display: 'flex', flexDirection: 'column' }}>
              <Editor content={activeDoc?.content ?? ''} onChange={updateContent} />
            </div>
          </section>

          <div className="pane-divider" onPointerDown={startDividerDrag} />

          <Preview
            content={activeDoc?.content ?? ''}
            showOptions={showPrintOptions}
            onToggleOptions={togglePrintOptions}
            zoom={previewZoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomReset={zoomReset}
            onSetZoom={setPreviewZoom}
          />
        </div>

        {showPrintOptions && (
          <PrintOptionsPanel
            options={printOptions}
            onChange={setPrintOptions}
            onClose={togglePrintOptions}
          />
        )}
      </div>
    </div>
  );
}
