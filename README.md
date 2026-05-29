# markpdf

**Write Markdown. Export PDF. Nothing leaves your browser.**

🔗 **Live:** https://pws-wobbuffet.github.io/markpdf/

## What it does

- Full-featured Markdown editor with syntax highlighting (CodeMirror 6)
- Live rendered preview side-by-side
- One-click PDF export via browser print
- Multiple documents saved in `localStorage` — no server, no account
- Draggable split pane

## Run locally

```bash
git clone https://github.com/pws-wobbuffet/markpdf.git
cd markpdf
pnpm install
pnpm dev
# open http://localhost:4321/markpdf/
```

## Stack

- [Astro](https://astro.build) + [React](https://react.dev)
- [CodeMirror 6](https://codemirror.net) — editor with markdown syntax highlighting
- [marked](https://marked.js.org) — markdown → HTML parser
- Browser `window.print()` for PDF export

## License

[MIT](./LICENSE)
