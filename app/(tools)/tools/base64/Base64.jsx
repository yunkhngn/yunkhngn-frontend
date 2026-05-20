// app/(tools)/tools/base64/Base64.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function Base64() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  let output = '';
  let error = '';
  try {
    if (input) {
      output = mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
    }
  } catch {
    error = mode === 'encode' ? 'Không thể encode.' : 'Input không hợp lệ.';
  }

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['encode', 'decode'].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setInput(''); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === m ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {m === 'encode' ? 'Encode' : 'Decode'}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? 'Nhập text...' : 'Nhập Base64...'}
        rows={4}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {output && !error && (
        <div className="relative">
          <button
            onClick={copy}
            className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
          </button>
          <pre className="bg-muted/40 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all pr-8">{output}</pre>
        </div>
      )}
    </div>
  );
}
