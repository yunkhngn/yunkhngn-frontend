// yunkhngn-fe/app/(tools)/tools/jwt-decoder/JwtDecoder.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function decodeJwt(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Token không hợp lệ (cần đúng 3 phần)');

  function b64Decode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return JSON.parse(atob(str));
  }

  return {
    header: b64Decode(parts[0]),
    payload: b64Decode(parts[1]),
  };
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-muted transition-colors">
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
    </button>
  );
}

export default function JwtDecoder() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [decoded, setDecoded] = useState(null);

  function decode() {
    try {
      setDecoded(decodeJwt(input));
      setError('');
    } catch (e) {
      setError(e.message);
      setDecoded(null);
    }
  }

  const exp = decoded?.payload?.exp;
  const isExpired = exp ? exp * 1000 < Date.now() : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">JWT Token</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={4}
          placeholder="Paste JWT token vào đây..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      <button
        onClick={decode}
        disabled={!input.trim()}
        className="w-full px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors disabled:opacity-40"
      >
        Decode
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {decoded && (
        <div className="space-y-3">
          {exp !== undefined && (
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${isExpired ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-600'}`}>
              {isExpired
                ? '❌ Token đã hết hạn'
                : `✅ Còn hạn đến ${new Date(exp * 1000).toLocaleString()}`}
            </div>
          )}
          {[
            { label: 'Header', data: decoded.header },
            { label: 'Payload', data: decoded.payload },
          ].map(({ label, data }) => {
            const json = JSON.stringify(data, null, 2);
            return (
              <div key={label} className="bg-muted/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                  <CopyButton text={json} />
                </div>
                <pre className="text-xs font-mono overflow-x-auto text-foreground">{json}</pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
