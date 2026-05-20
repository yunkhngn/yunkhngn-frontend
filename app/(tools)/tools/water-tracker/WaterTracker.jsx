// app/(tools)/tools/water-tracker/WaterTracker.jsx
'use client';

import { useState } from 'react';

export default function WaterTracker() {
  const [weight, setWeight] = useState('');
  const [consumed, setConsumed] = useState(0);

  const target = weight ? Math.round(parseFloat(weight) * 35) : null;
  const pct = target ? Math.min(100, Math.round((consumed / target) * 100)) : 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Cân nặng (kg)</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => { setWeight(e.target.value); setConsumed(0); }}
          placeholder="65"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {target && (
        <>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold text-foreground">{consumed} ml</span>
              <span className="text-sm text-muted-foreground">/ {target} ml</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{pct}% mục tiêu</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[250, 350, 500].map((ml) => (
              <button
                key={ml}
                onClick={() => setConsumed((c) => c + ml)}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
              >
                +{ml} ml
              </button>
            ))}
            <button
              onClick={() => setConsumed(0)}
              className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm text-muted-foreground transition-colors"
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
}
