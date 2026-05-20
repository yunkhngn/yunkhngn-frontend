// app/(tools)/tools/bmi/BMI.jsx
'use client';

import { useState } from 'react';

const BMI_CLASSES = [
  { max: 18.5, label: 'Thiếu cân', color: 'text-blue-500' },
  { max: 25, label: 'Bình thường', color: 'text-green-500' },
  { max: 30, label: 'Thừa cân', color: 'text-yellow-500' },
  { max: Infinity, label: 'Béo phì', color: 'text-red-500' },
];

function classify(bmi) {
  return BMI_CLASSES.find((c) => bmi < c.max);
}

export default function BMI() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  const bmi = h > 0 && w > 0 ? w / (h * h) : null;
  const cls = bmi ? classify(bmi) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Chiều cao (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="170"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Cân nặng (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="65"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      {bmi && cls && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{bmi.toFixed(1)}</p>
          <p className={`text-sm font-semibold mt-1 ${cls.color}`}>{cls.label}</p>
        </div>
      )}
    </div>
  );
}
