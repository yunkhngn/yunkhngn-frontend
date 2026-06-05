// yunkhngn-fe/app/(tools)/tools/aspect-ratio/AspectRatio.jsx
'use client';

import { useState } from 'react';

const PRESETS = [
  { label: '16:9', w: 16, h: 9 },
  { label: '4:3', w: 4, h: 3 },
  { label: '1:1', w: 1, h: 1 },
  { label: '9:16', w: 9, h: 16 },
  { label: '21:9', w: 21, h: 9 },
  { label: '3:2', w: 3, h: 2 },
];

export default function AspectRatio() {
  const [ratioW, setRatioW] = useState(16);
  const [ratioH, setRatioH] = useState(9);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  function applyPreset(w, h) {
    setRatioW(w); setRatioH(h);
    if (width) setHeight(Math.round(parseFloat(width) * h / w).toString());
    else if (height) setWidth(Math.round(parseFloat(height) * w / h).toString());
  }

  function onWidthChange(v) {
    setWidth(v);
    const n = parseFloat(v);
    if (isFinite(n) && ratioH > 0) setHeight(Math.round(n * ratioH / ratioW).toString());
  }

  function onHeightChange(v) {
    setHeight(v);
    const n = parseFloat(v);
    if (isFinite(n) && ratioW > 0) setWidth(Math.round(n * ratioW / ratioH).toString());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p.w, p.h)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${ratioW === p.w && ratioH === p.h ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Ratio W', value: ratioW, set: v => setRatioW(Number(v)) },
          { label: 'Ratio H', value: ratioH, set: v => setRatioH(Number(v)) },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
            <input type="number" value={value} onChange={e => set(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Width (px)</label>
          <input type="number" value={width} onChange={e => onWidthChange(e.target.value)} placeholder="1920"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Height (px)</label>
          <input type="number" value={height} onChange={e => onHeightChange(e.target.value)} placeholder="1080"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      {width && height && (
        <div className="flex justify-center py-2">
          <div
            className="border-2 border-foreground/20 bg-muted/20 rounded flex items-center justify-center text-xs text-muted-foreground"
            style={{ width: 160, height: Math.round(160 * ratioH / ratioW), maxHeight: 120 }}
          >
            {ratioW}:{ratioH}
          </div>
        </div>
      )}
    </div>
  );
}
