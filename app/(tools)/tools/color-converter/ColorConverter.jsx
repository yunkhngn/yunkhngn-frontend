// yunkhngn-fe/app/(tools)/tools/color-converter/ColorConverter.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorConverter() {
  const [hex, setHex] = useState('#3b82f6');
  const [copied, setCopied] = useState('');

  const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const formats = [
    { key: 'hex', label: 'HEX', value: hex.toUpperCase() },
    { key: 'rgb', label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { key: 'hsl', label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { key: 'oklch', label: 'OKLCH (approx)', value: `oklch(${(hsl.l / 100).toFixed(2)} ${(hsl.s / 200).toFixed(3)} ${hsl.h})` },
  ];

  function copy(key, value) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl border border-border shrink-0" style={{ backgroundColor: hex }} />
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground block">Chọn màu</label>
          <input
            type="color"
            value={hex}
            onChange={e => setHex(e.target.value)}
            className="w-full h-8 cursor-pointer rounded-lg border border-border"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">HEX</label>
          <input
            value={hex}
            onChange={e => setHex(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="space-y-2">
        {formats.map(({ key, label, value }) => (
          <div key={key} className="bg-muted/40 rounded-lg px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-mono">{value}</p>
            </div>
            <button onClick={() => copy(key, value)} className="p-1 rounded hover:bg-muted ml-2 shrink-0">
              {copied === key ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
