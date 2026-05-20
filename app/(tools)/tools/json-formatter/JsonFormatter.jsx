// app/(tools)/tools/json-formatter/JsonFormatter.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  let formatted = '';
  let error = '';
  try {
    if (input.trim()) {
      formatted = JSON.stringify(JSON.parse(input), null, 2);
    }
  } catch (e) {
    error = e.message;
  }

  function copy() {
    if (!formatted) return;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Input JSON</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value"}'
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 font-mono">{error}</p>
      )}
      {formatted && (
        <div className="relative">
          <button
            onClick={copy}
            className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
          </button>
          <pre className="bg-muted/40 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">{formatted}</pre>
        </div>
      )}
    </div>
  );
}
