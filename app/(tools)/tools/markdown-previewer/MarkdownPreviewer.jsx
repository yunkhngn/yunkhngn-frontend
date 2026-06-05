// yunkhngn-fe/app/(tools)/tools/markdown-previewer/MarkdownPreviewer.jsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const SAMPLE = `# Hello World

**Bold** và *italic* text.

- Item 1
- Item 2
- Item 3

\`\`\`js
console.log("Hello");
\`\`\`

> Blockquote ở đây
`;

export default function MarkdownPreviewer() {
  const [md, setMd] = useState(SAMPLE);
  const [view, setView] = useState('split');

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['split', 'edit', 'preview'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${view === v ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            {v === 'split' ? 'Split' : v === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>
      <div className={`grid gap-3 ${view === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {(view === 'edit' || view === 'split') && (
          <textarea
            value={md}
            onChange={e => setMd(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="Nhập markdown..."
          />
        )}
        {(view === 'preview' || view === 'split') && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none bg-muted/20 rounded-lg p-3 overflow-auto"
            style={{ minHeight: '14rem' }}
          >
            <ReactMarkdown>{md}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
