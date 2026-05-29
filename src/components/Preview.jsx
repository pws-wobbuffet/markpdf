import React, { useMemo } from 'react';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

const DENSITY_PADDING = {
  compact: '32px 36px',
  regular: '44px 48px',
  roomy:   '56px 60px',
};

export default function Preview({ content, paperStyle = 'shadowed', density = 'regular' }) {
  const html = useMemo(() => {
    try { return marked.parse(content || ''); }
    catch { return '<p>Parse error</p>'; }
  }, [content]);

  return (
    <div className="pane" style={{ borderRight: 'none' }}>
      <div className="pane-head">
        Preview
        <span className="muted">A4</span>
      </div>
      <div className="pane-body">
        <div className="preview-wrap">
          <article
            className={`sheet ${paperStyle}`}
            style={{ padding: DENSITY_PADDING[density] }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
