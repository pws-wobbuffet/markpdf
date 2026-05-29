import React, { useMemo } from 'react';
import { marked } from 'marked';

// Configure marked for GFM
marked.setOptions({ gfm: true, breaks: false });

export default function Preview({ content }) {
  const html = useMemo(() => {
    try { return marked.parse(content || ''); }
    catch { return '<p>Parse error</p>'; }
  }, [content]);

  return (
    <div className="preview-pane">
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
