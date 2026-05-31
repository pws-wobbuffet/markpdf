import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Font } from '@react-pdf/renderer';
import { marked } from 'marked';

// ── Google Fonts CSS URLs (italic + bold weights for each family) ───────────
const GFONTS_CSS = {
  newsreader:    'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700;1,6..72,400;1,6..72,700&display=swap',
  lora:          'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  merriweather:  'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  sourceserif:   'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,700;1,8..60,400;1,8..60,700&display=swap',
  spacegrotesk:  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap',
  inter:         'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;1,400&display=swap',
  ibmplexsans:   'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,700;1,400&display=swap',
  jetbrainsmono: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,700;1,400&display=swap',
  ibmplexmono:   'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap',
};

const FAMILY_NAME = {
  newsreader:    'Newsreader',
  lora:          'Lora',
  merriweather:  'Merriweather',
  sourceserif:   'Source Serif 4',
  spacegrotesk:  'Space Grotesk',
  inter:         'Inter',
  ibmplexsans:   'IBM Plex Sans',
  jetbrainsmono: 'JetBrains Mono',
  ibmplexmono:   'IBM Plex Mono',
  georgia:       'Times-Roman',  // built-in fallback
};

// Fonts already registered — avoid re-fetching on repeated downloads
const registered = new Set();

async function parseFontFaces(css) {
  const fonts = [];
  const blocks = css.match(/@font-face\s*\{[^}]+\}/g) ?? [];
  for (const block of blocks) {
    // src: url(...) format(...)  — grab the URL
    const srcMatch = block.match(/src:\s*[^;]*url\(([^)]+)\)/);
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const styleMatch  = block.match(/font-style:\s*(\w+)/);
    if (srcMatch) {
      fonts.push({
        src:         srcMatch[1].replace(/['"]/g, ''),
        fontWeight:  Number(weightMatch?.[1] ?? 400),
        fontStyle:   styleMatch?.[1] ?? 'normal',
      });
    }
  }
  return fonts;
}

async function loadGoogleFont(key, cssUrl) {
  if (registered.has(key)) return;
  const family = FAMILY_NAME[key];
  if (!family || !cssUrl) return;

  try {
    const css   = await fetch(cssUrl).then(r => r.text());
    const fonts = await parseFontFaces(css);
    if (fonts.length > 0) {
      Font.register({ family, fonts });
      registered.add(key);
    }
  } catch (e) {
    console.warn(`[PDF] Could not load font "${family}":`, e.message);
  }
}

// ── Font loader — called before every PDF generation ──────────────────────
export async function ensureFont(printOptions) {
  const key = printOptions?.font ?? 'newsreader';

  if (key === 'custom') {
    const url = printOptions?.customFontUrl;
    const name = printOptions?.customFontName ?? 'Custom';
    if (url && !registered.has('custom')) {
      // Custom fonts are already Google Fonts CSS URLs
      try {
        const css = await fetch(url).then(r => r.text());
        const fonts = await parseFontFaces(css);
        if (fonts.length > 0) {
          Font.register({ family: name, fonts });
          registered.add('custom');
        }
      } catch (e) {
        console.warn('[PDF] Could not load custom font:', e.message);
      }
    }
    return name;
  }

  const cssUrl = GFONTS_CSS[key];
  await loadGoogleFont(key, cssUrl);
  return FAMILY_NAME[key] ?? 'Helvetica';
}

// ── Style factory ──────────────────────────────────────────────────────────
const SIZE_MAP    = { sm: 11, md: 13, lg: 16 };
const SPACING_MAP = { compact: 1.3, regular: 1.6, relaxed: 2.0 };
const MARGIN_MAP  = { narrow: 12, normal: 20, wide: 30 };

function makeStyles(fontFamily, opts) {
  const size    = SIZE_MAP[opts?.size]       ?? 13;
  const leading = SPACING_MAP[opts?.spacing] ?? 1.6;
  const margin  = MARGIN_MAP[opts?.margins]  ?? 20;

  // Mono font for code — always JetBrains Mono if loaded, else Courier
  const mono = registered.has('jetbrainsmono') ? 'JetBrains Mono' : 'Courier';

  return StyleSheet.create({
    page: { paddingTop: margin, paddingBottom: margin, paddingLeft: margin, paddingRight: margin, fontFamily, fontSize: size },
    h1: { fontSize: size * 2.0, fontFamily, fontWeight: 700, marginBottom: 8,  marginTop: 4,  lineHeight: 1.15 },
    h2: { fontSize: size * 1.55, fontFamily, fontWeight: 700, marginBottom: 6, marginTop: 16, lineHeight: 1.15 },
    h3: { fontSize: size * 1.3,  fontFamily, fontWeight: 700, marginBottom: 5, marginTop: 14, lineHeight: 1.15 },
    h4: { fontSize: size * 1.1,  fontFamily, fontWeight: 700, marginBottom: 4, marginTop: 12 },
    paragraph: { lineHeight: leading, marginBottom: size * 0.65, fontFamily },
    bold:      { fontFamily, fontWeight: 700 },
    italic:    { fontFamily, fontStyle: 'italic' },
    code:      { fontFamily: mono, fontSize: size * 0.85, backgroundColor: '#f4f4f4', padding: 2, borderRadius: 2 },
    codeBlock: { fontFamily: mono, fontSize: size * 0.82, backgroundColor: '#f4f4f4', padding: 10, marginBottom: 10, borderRadius: 4 },
    blockquote:{ borderLeftWidth: 3, borderLeftColor: '#cccccc', paddingLeft: 10, marginBottom: 8, color: '#555555' },
    listItem:  { flexDirection: 'row', marginBottom: 3 },
    bullet:    { width: 14, fontFamily, lineHeight: leading },
    listText:  { flex: 1, fontFamily, lineHeight: leading },
    hr:        { borderBottomWidth: 1, borderBottomColor: '#cccccc', marginVertical: 10 },
    tableRow:  { flexDirection: 'row' },
    tableCell: { flex: 1, padding: 5, borderWidth: 0.5, borderColor: '#cccccc', fontSize: size * 0.9, fontFamily },
    tableHead: { fontFamily, fontWeight: 700, backgroundColor: '#f0f0f0' },
    link:      { color: '#1a8a52', textDecoration: 'underline' },
    space:     { marginBottom: size * 0.35 },
  });
}

// ── Inline token renderer ──────────────────────────────────────────────────
function Inline({ tokens, s }) {
  if (!tokens?.length) return null;
  return tokens.map((t, i) => {
    switch (t.type) {
      case 'text':      return <Text key={i}>{t.text}</Text>;
      case 'strong':    return <Text key={i} style={s.bold}><Inline tokens={t.tokens} s={s} /></Text>;
      case 'em':        return <Text key={i} style={s.italic}><Inline tokens={t.tokens} s={s} /></Text>;
      case 'codespan':  return <Text key={i} style={s.code}>{t.text}</Text>;
      case 'link':      return <Link key={i} src={t.href} style={s.link}><Inline tokens={t.tokens} s={s} /></Link>;
      case 'softbreak':
      case 'hardbreak': return <Text key={i}>{'\n'}</Text>;
      case 'html':      return <Text key={i}>{t.text.replace(/<[^>]+>/g, '')}</Text>;
      default:          return t.raw ? <Text key={i}>{t.raw}</Text> : null;
    }
  });
}

// ── Block token renderer ───────────────────────────────────────────────────
function Blocks({ tokens, s, depth = 0 }) {
  return tokens.map((t, i) => {
    switch (t.type) {

      case 'heading': {
        const hs = s[`h${Math.min(t.depth, 4)}`] ?? s.h4;
        return <Text key={i} style={hs}><Inline tokens={t.tokens} s={s} /></Text>;
      }

      case 'paragraph':
        return <Text key={i} style={s.paragraph}><Inline tokens={t.tokens} s={s} /></Text>;

      case 'code':
        return <View key={i} style={s.codeBlock}><Text>{t.text}</Text></View>;

      case 'blockquote':
        return <View key={i} style={s.blockquote}><Blocks tokens={t.tokens} s={s} depth={depth + 1} /></View>;

      case 'list':
        return (
          <View key={i} style={{ marginBottom: 8, paddingLeft: depth * 12 }}>
            {t.items.map((item, j) => (
              <View key={j} style={s.listItem}>
                <Text style={s.bullet}>{t.ordered ? `${j + 1}.  ` : '•   '}</Text>
                <View style={s.listText}>
                  {item.task
                    ? <Text>{item.checked ? '☑ ' : '☐ '}<Inline tokens={item.tokens?.[0]?.tokens} s={s} /></Text>
                    : <Blocks tokens={item.tokens} s={s} depth={depth + 1} />
                  }
                </View>
              </View>
            ))}
          </View>
        );

      case 'table': {
        const cols = t.header.length;
        return (
          <View key={i} style={{ marginBottom: 10 }}>
            <View style={s.tableRow}>
              {t.header.map((cell, j) => (
                <View key={j} style={[s.tableCell, s.tableHead, { flex: 1 / cols }]}>
                  <Text><Inline tokens={cell.tokens} s={s} /></Text>
                </View>
              ))}
            </View>
            {t.rows.map((row, j) => (
              <View key={j} style={s.tableRow}>
                {row.map((cell, k) => (
                  <View key={k} style={[s.tableCell, { flex: 1 / cols }]}>
                    <Text><Inline tokens={cell.tokens} s={s} /></Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      }

      case 'hr':    return <View key={i} style={s.hr} />;
      case 'space': return <View key={i} style={s.space} />;
      case 'html':  return t.text.trim()
        ? <Text key={i} style={s.paragraph}>{t.text.replace(/<[^>]+>/g, '')}</Text>
        : null;
      default:      return null;
    }
  });
}

// ── Document component ─────────────────────────────────────────────────────
function MarkdownPDF({ content, fontFamily, printOptions }) {
  const tokens = marked.lexer(content || '');
  const s = makeStyles(fontFamily, printOptions);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Blocks tokens={tokens} s={s} />
      </Page>
    </Document>
  );
}

// ── Public entry point — called from App.jsx ───────────────────────────────
export async function generatePDF(content, printOptions, title) {
  const { pdf } = await import('@react-pdf/renderer');

  const fontFamily = await ensureFont(printOptions);
  const blob = await pdf(
    <MarkdownPDF content={content} fontFamily={fontFamily} printOptions={printOptions} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'document'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
