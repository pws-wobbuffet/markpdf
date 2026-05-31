import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { marked } from 'marked';

// ── Font stack mapping from user's PDF options ──────────────────────────────
// react-pdf built-ins: Helvetica, Times-Roman, Courier (+ Bold/Oblique variants)
const FONT_MAP = {
  newsreader:    'Times-Roman',
  lora:          'Times-Roman',
  merriweather:  'Times-Roman',
  sourceserif:   'Times-Roman',
  georgia:       'Times-Roman',
  spacegrotesk:  'Helvetica',
  inter:         'Helvetica',
  ibmplexsans:   'Helvetica',
  jetbrainsmono: 'Courier',
  ibmplexmono:   'Courier',
  custom:        'Helvetica',
};

const SIZE_MAP = { sm: 11, md: 13, lg: 16 };
const SPACING_MAP = { compact: 1.3, regular: 1.6, relaxed: 2.0 };
const MARGIN_MAP = { narrow: 12, normal: 20, wide: 30 };

function makeStyles(opts) {
  const font    = FONT_MAP[opts?.font]    ?? 'Times-Roman';
  const size    = SIZE_MAP[opts?.size]    ?? 13;
  const leading = SPACING_MAP[opts?.spacing] ?? 1.6;
  const margin  = MARGIN_MAP[opts?.margins]  ?? 20;
  const mono    = 'Courier';

  return StyleSheet.create({
    page: {
      paddingTop:    margin,
      paddingBottom: margin,
      paddingLeft:   margin,
      paddingRight:  margin,
      fontFamily: font,
      fontSize: size,
    },
    h1: { fontSize: size * 2,    fontFamily: font, fontStyle: 'bold', marginBottom: 8, marginTop: 4, lineHeight: 1.2 },
    h2: { fontSize: size * 1.55, fontFamily: font, fontStyle: 'bold', marginBottom: 6, marginTop: 14, lineHeight: 1.2 },
    h3: { fontSize: size * 1.3,  fontFamily: font, fontStyle: 'bold', marginBottom: 5, marginTop: 12, lineHeight: 1.2 },
    h4: { fontSize: size * 1.1,  fontFamily: font, fontStyle: 'bold', marginBottom: 4, marginTop: 10 },
    paragraph: { lineHeight: leading, marginBottom: size * 0.7, fontFamily: font },
    bold:      { fontFamily: font, fontStyle: 'bold' },
    italic:    { fontFamily: font, fontStyle: 'italic' },
    boldItalic:{ fontFamily: font, fontStyle: 'bold-italic' },
    code:      { fontFamily: mono, fontSize: size * 0.85, backgroundColor: '#f3f3f3', padding: 2 },
    codeBlock: {
      fontFamily: mono, fontSize: size * 0.82, backgroundColor: '#f3f3f3',
      padding: 10, marginBottom: size * 0.7, borderRadius: 4,
    },
    blockquote: {
      borderLeftWidth: 3, borderLeftColor: '#cccccc', paddingLeft: 10,
      marginBottom: size * 0.7, color: '#555555',
    },
    listItem:  { flexDirection: 'row', marginBottom: 3 },
    bullet:    { width: 14, fontFamily: font, lineHeight: leading },
    listText:  { flex: 1, fontFamily: font, lineHeight: leading },
    hr: { borderBottomWidth: 1, borderBottomColor: '#cccccc', marginVertical: 10 },
    tableRow:  { flexDirection: 'row' },
    tableCell: { flex: 1, padding: 5, borderWidth: 0.5, borderColor: '#cccccc', fontSize: size * 0.9 },
    tableHead: { fontFamily: font, fontStyle: 'bold', backgroundColor: '#f0f0f0' },
    link:      { color: '#1a8a52', textDecoration: 'underline' },
    space:     { marginBottom: size * 0.4 },
  });
}

// ── Inline token renderer ──────────────────────────────────────────────────
function renderInline(tokens, s) {
  if (!tokens || tokens.length === 0) return null;
  return tokens.map((t, i) => {
    switch (t.type) {
      case 'text':
        return <Text key={i}>{t.text}</Text>;
      case 'strong':
        return <Text key={i} style={s.bold}>{renderInline(t.tokens, s)}</Text>;
      case 'em':
        return <Text key={i} style={s.italic}>{renderInline(t.tokens, s)}</Text>;
      case 'codespan':
        return <Text key={i} style={s.code}>{t.text}</Text>;
      case 'link':
        return (
          <Link key={i} src={t.href} style={s.link}>
            {renderInline(t.tokens, s)}
          </Link>
        );
      case 'html':
        // strip tags — can't render arbitrary HTML in PDF
        return <Text key={i}>{t.text.replace(/<[^>]+>/g, '')}</Text>;
      case 'softbreak':
        return <Text key={i}>{'\n'}</Text>;
      case 'hardbreak':
        return <Text key={i}>{'\n'}</Text>;
      default:
        return t.raw ? <Text key={i}>{t.raw}</Text> : null;
    }
  });
}

// ── Block token renderer ───────────────────────────────────────────────────
function renderTokens(tokens, s, depth = 0) {
  return tokens.map((t, i) => {
    switch (t.type) {
      case 'heading': {
        const hStyle = s[`h${Math.min(t.depth, 4)}`] ?? s.h4;
        return (
          <Text key={i} style={hStyle}>
            {renderInline(t.tokens, s)}
          </Text>
        );
      }

      case 'paragraph':
        return (
          <Text key={i} style={s.paragraph}>
            {renderInline(t.tokens, s)}
          </Text>
        );

      case 'code':
        return (
          <View key={i} style={s.codeBlock}>
            <Text>{t.text}</Text>
          </View>
        );

      case 'blockquote':
        return (
          <View key={i} style={s.blockquote}>
            {renderTokens(t.tokens, s, depth + 1)}
          </View>
        );

      case 'list':
        return (
          <View key={i} style={{ marginBottom: 8, paddingLeft: depth * 12 }}>
            {t.items.map((item, j) => (
              <View key={j} style={s.listItem}>
                <Text style={s.bullet}>
                  {t.ordered ? `${j + 1}.` : '•'}
                  {'  '}
                </Text>
                <View style={s.listText}>
                  {item.task
                    ? <Text>{item.checked ? '☑ ' : '☐ '}{renderInline(item.tokens?.[0]?.tokens, s)}</Text>
                    : renderTokens(item.tokens, s, depth + 1)
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
                  <Text>{renderInline(cell.tokens, s)}</Text>
                </View>
              ))}
            </View>
            {t.rows.map((row, j) => (
              <View key={j} style={s.tableRow}>
                {row.map((cell, k) => (
                  <View key={k} style={[s.tableCell, { flex: 1 / cols }]}>
                    <Text>{renderInline(cell.tokens, s)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      }

      case 'hr':
        return <View key={i} style={s.hr} />;

      case 'space':
        return <View key={i} style={s.space} />;

      case 'html':
        // strip HTML tags for PDF
        return t.text.trim()
          ? <Text key={i} style={s.paragraph}>{t.text.replace(/<[^>]+>/g, '')}</Text>
          : null;

      default:
        return null;
    }
  });
}

// ── Main document component ────────────────────────────────────────────────
export default function MarkdownPDF({ content, printOptions }) {
  const tokens = marked.lexer(content || '');
  const s = makeStyles(printOptions);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {renderTokens(tokens, s)}
      </Page>
    </Document>
  );
}
