// app/(tools)/tools/regex-tester/RegexTester.jsx
'use client';

import { useState, useMemo } from 'react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testStr, setTestStr] = useState('');

  const { matches, error, highlighted } = useMemo(() => {
    if (!pattern || !testStr) return { matches: [], error: null, highlighted: testStr };
    try {
      const re = new RegExp(pattern, flags);
      const ms = [...testStr.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];
      const spans = [];
      let last = 0;
      ms.forEach((m) => {
        if (m.index > last) spans.push({ text: testStr.slice(last, m.index), match: false });
        spans.push({ text: m[0], match: true });
        last = m.index + m[0].length;
      });
      if (last < testStr.length) spans.push({ text: testStr.slice(last), match: false });
      return { matches: ms, error: null, highlighted: spans };
    } catch (e) {
      return { matches: [], error: e.message, highlighted: testStr };
    }
  }, [pattern, flags, testStr]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Pattern</label>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="\d+"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="w-20">
          <label className="text-xs text-muted-foreground mb-1 block">Flags</label>
          <input
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="gi"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Test string</label>
        <textarea
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          rows={3}
          placeholder="abc 123 def 456"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>
      {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
      {!error && testStr && pattern && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground mb-2">{matches.length} match{matches.length !== 1 ? 'es' : ''}</p>
          <p className="text-sm font-mono leading-relaxed break-all">
            {Array.isArray(highlighted)
              ? highlighted.map((s, i) =>
                  s.match ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{s.text}</mark>
                  ) : (
                    <span key={i}>{s.text}</span>
                  )
                )
              : highlighted}
          </p>
        </div>
      )}
    </div>
  );
}
