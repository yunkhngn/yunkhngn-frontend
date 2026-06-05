// yunkhngn-fe/app/(tools)/tools/gradient-generator/GradientGenerator.jsx
'use client';

import { useState } from 'react';
import { Copy, Check, Plus, Trash2 } from 'lucide-react';

const DIRECTIONS = [
  { label: '→', value: 'to right' },
  { label: '←', value: 'to left' },
  { label: '↓', value: 'to bottom' },
  { label: '↑', value: 'to top' },
  { label: '↘', value: '135deg' },
  { label: '↗', value: '45deg' },
];

export default function GradientGenerator() {
  const [colors, setColors] = useState(['#6366f1', '#ec4899']);
  const [direction, setDirection] = useState('to right');
  const [type, setType] = useState('linear');
  const [copied, setCopied] = useState(false);

  function updateColor(i, v) { setColors(c => c.map((x, idx) => idx === i ? v : x)); }
  function removeColor(i) { if (colors.length > 2) setColors(c => c.filter((_, idx) => idx !== i)); }

  const gradient = type === 'linear'
    ? `linear-gradient(${direction}, ${colors.join(', ')})`
    : `radial-gradient(circle, ${colors.join(', ')})`;
  const css = `background: ${gradient};`;

  function copy() {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="h-24 rounded-xl border border-border" style={{ background: gradient }} />
      <div className="flex gap-2">
        {['linear', 'radial'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${type === t ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            {t}
          </button>
        ))}
        {type === 'linear' && DIRECTIONS.map(d => (
          <button key={d.value} onClick={() => setDirection(d.value)}
            className={`w-8 h-8 rounded text-sm font-bold transition-colors ${direction === d.value ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {colors.map((color, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => updateColor(i, e.target.value)}
              className="w-10 h-8 rounded border border-border cursor-pointer" />
            <input value={color} onChange={e => updateColor(i, e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={() => removeColor(i)} disabled={colors.length <= 2}
              className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors">
              <Trash2 size={13} className="text-muted-foreground" />
            </button>
          </div>
        ))}
        <button onClick={() => setColors(c => [...c, '#ffffff'])}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Plus size={13} /> Thêm màu
        </button>
      </div>
      <div className="bg-muted/40 rounded-lg px-3 py-2 flex items-center justify-between">
        <code className="text-xs font-mono text-foreground break-all flex-1">{css}</code>
        <button onClick={copy} className="p-1 rounded hover:bg-muted ml-2 shrink-0">
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
        </button>
      </div>
    </div>
  );
}
