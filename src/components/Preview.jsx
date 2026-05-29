import React, { useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export default function Preview({ content }) {
  const html = useMemo(() => {
    try { return marked.parse(content || ''); }
    catch { return '<p>Parse error</p>'; }
  }, [content]);

  return (
    <section className="pane" style={{ borderRight: 'none' }}>
      <div className="pane-head">
        Preview
        <span className="muted">A4</span>
      </div>
      <div className="pane-body">
        <div className="preview-wrap">
          <article
            className="sheet shadowed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  );
}
