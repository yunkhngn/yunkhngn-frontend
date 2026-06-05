'use client';

import { useState } from 'react';

const PRESETS = [5, 10, 15, 20, 25];

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState(10);
  const [people, setPeople] = useState(1);

  const billNum = parseFloat(bill) || 0;
  const tip = billNum * tipPct / 100;
  const total = billNum + tip;
  const perPerson = people > 0 ? total / people : 0;
  const tipPerPerson = people > 0 ? tip / people : 0;

  const fmt = v => v.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tổng bill</label>
        <input
          type="number"
          value={bill}
          onChange={e => setBill(e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tip: {tipPct}%</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setTipPct(p)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${tipPct === p ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {p}%
            </button>
          ))}
        </div>
        <input type="range" min={0} max={50} value={tipPct} onChange={e => setTipPct(Number(e.target.value))} className="w-full" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Số người: {people}</label>
        <input type="range" min={1} max={20} value={people} onChange={e => setPeople(Number(e.target.value))} className="w-full" />
      </div>
      {billNum > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { label: 'Tip', value: tip },
            { label: 'Tổng', value: total },
            { label: 'Tip/người', value: tipPerPerson },
            { label: 'Tổng/người', value: perPerson },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/40 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold font-mono">{fmt(value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
