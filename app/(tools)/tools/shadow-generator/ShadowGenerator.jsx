// yunkhngn-fe/app/(tools)/tools/shadow-generator/ShadowGenerator.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function hex2rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
}

export default function ShadowGenerator() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(4);
  const [blur, setBlur] = useState(6);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(25);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  const shadow = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${hex2rgba(color, opacity)}`;
  const css = `box-shadow: ${shadow};`;

  function copy() {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const sliders = [
    { key: 'x', label: `X: ${x}px`, value: x, set: setX, min: -50, max: 50 },
    { key: 'y', label: `Y: ${y}px`, value: y, set: setY, min: -50, max: 50 },
    { key: 'blur', label: `Blur: ${blur}px`, value: blur, set: setBlur, min: 0, max: 100 },
    { key: 'spread', label: `Spread: ${spread}px`, value: spread, set: setSpread, min: -50, max: 50 },
    { key: 'opacity', label: `Opacity: ${opacity}%`, value: opacity, set: setOpacity, min: 0, max: 100 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-center py-6 bg-muted/20 rounded-xl">
        <div className="w-24 h-24 bg-background rounded-xl" style={{ boxShadow: shadow }} />
      </div>
      <div className="space-y-3">
        {sliders.map(({ key, label, value, set, min, max }) => (
          <div key={key}>
            <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
            <input type="range" min={min} max={max} value={value} onChange={e => set(Number(e.target.value))} className="w-full" />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Màu</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-10 h-8 rounded border border-border cursor-pointer" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
            <input type="checkbox" checked={inset} onChange={e => setInset(e.target.checked)} className="rounded" />
            Inset
          </label>
        </div>
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
