// yunkhngn-fe/app/(tools)/tools/contrast-checker/ContrastChecker.jsx
'use client';

import { useState } from 'react';

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const channels = [rgb.r, rgb.g, rgb.b];
  const [r, g, b] = channels.map(v => {
    const linear = v / 255;
    return linear <= 0.03928 ? linear / 12.92 : Math.pow((linear + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function Badge({ pass, label }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${pass ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>
      {pass ? '✓' : '✗'} {label}
    </span>
  );
}

export default function ContrastChecker() {
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#3b82f6');

  const ratio = hexToRgb(fg) && hexToRgb(bg) ? contrastRatio(fg, bg) : 0;

  const checks = [
    { label: 'AA Normal (4.5:1)', pass: ratio >= 4.5 },
    { label: 'AA Large (3:1)', pass: ratio >= 3 },
    { label: 'AAA Normal (7:1)', pass: ratio >= 7 },
    { label: 'AAA Large (4.5:1)', pass: ratio >= 4.5 },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-6 border border-border flex items-center justify-center" style={{ backgroundColor: bg }}>
        <p className="text-2xl font-bold" style={{ color: fg }}>The quick brown fox</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Foreground (chữ)', value: fg, set: setFg },
          { label: 'Background (nền)', value: bg, set: setBg },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={value} onChange={e => set(e.target.value)}
                className="w-10 h-8 rounded border border-border cursor-pointer" />
              <input value={value} onChange={e => set(e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted/40 rounded-lg px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground mb-1">Contrast Ratio</p>
        <p className="text-3xl font-mono font-bold">{ratio.toFixed(2)}:1</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map(c => <Badge key={c.label} {...c} />)}
      </div>
    </div>
  );
}
