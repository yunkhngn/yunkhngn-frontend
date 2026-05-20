// app/(tools)/tools/password-generator/PasswordGenerator.jsx
'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

function strength(pwd) {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { label: 'Yếu', color: 'bg-red-500', pct: 33 };
  if (score <= 4) return { label: 'Trung bình', color: 'bg-yellow-500', pct: 66 };
  return { label: 'Mạnh', color: 'bg-green-500', pct: 100 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: false });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const charset = Object.entries(options)
      .filter(([, v]) => v)
      .map(([k]) => CHARSETS[k])
      .join('');
    if (!charset) return;
    let pwd = '';
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) pwd += charset[arr[i] % charset.length];
    setPassword(pwd);
    setCopied(false);
  }, [length, options]);

  function copy() {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const str = password ? strength(password) : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Độ dài: {length}</label>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(CHARSETS).map((k) => (
          <label key={k} className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={options[k]}
              onChange={(e) => setOptions((o) => ({ ...o, [k]: e.target.checked }))}
              className="rounded"
            />
            {k}
          </label>
        ))}
      </div>
      <button
        onClick={generate}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
      >
        <RefreshCw size={14} /> Generate
      </button>
      {password && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
            <code className="flex-1 text-sm font-mono text-foreground break-all">{password}</code>
            <button onClick={copy} className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors">
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Độ mạnh</span>
              <span className={str.pct === 100 ? 'text-green-500' : str.pct === 66 ? 'text-yellow-500' : 'text-red-500'}>{str.label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all ${str.color}`} style={{ width: `${str.pct}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
