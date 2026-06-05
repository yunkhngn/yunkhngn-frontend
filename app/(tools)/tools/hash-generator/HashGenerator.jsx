// yunkhngn-fe/app/(tools)/tools/hash-generator/HashGenerator.jsx
'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

async function hashText(text, algorithm) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const generate = useCallback(async () => {
    if (!input) return;
    setLoading(true);
    const results = {};
    for (const alg of ALGORITHMS) {
      results[alg] = await hashText(input, alg);
    }
    setHashes(results);
    setLoading(false);
  }, [input]);

  function copy(key, value) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Text input</label>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); setHashes({}); }}
          rows={3}
          placeholder="Nhập text để hash..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      <button
        onClick={generate}
        disabled={!input || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors disabled:opacity-40"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        Generate Hashes
      </button>
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-2">
          {ALGORITHMS.map(alg => (
            <div key={alg} className="bg-muted/40 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">{alg}</span>
                <button onClick={() => copy(alg, hashes[alg])} className="p-1 rounded hover:bg-muted">
                  {copied === alg ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
                </button>
              </div>
              <p className="text-xs font-mono break-all text-foreground">{hashes[alg]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
