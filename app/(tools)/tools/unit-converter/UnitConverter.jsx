// app/(tools)/tools/unit-converter/UnitConverter.jsx
'use client';

import { useState } from 'react';

const CONVERTERS = {
  temperature: {
    label: 'Nhiệt độ',
    units: ['°C', '°F', 'K'],
    convert: (v, from, to) => {
      let celsius = from === '°C' ? v : from === '°F' ? (v - 32) * 5 / 9 : v - 273.15;
      return to === '°C' ? celsius : to === '°F' ? celsius * 9 / 5 + 32 : celsius + 273.15;
    },
  },
  weight: {
    label: 'Cân nặng',
    units: ['kg', 'lb', 'oz'],
    convert: (v, from, to) => {
      let kg = from === 'kg' ? v : from === 'lb' ? v * 0.453592 : v * 0.0283495;
      return to === 'kg' ? kg : to === 'lb' ? kg / 0.453592 : kg / 0.0283495;
    },
  },
  distance: {
    label: 'Khoảng cách',
    units: ['km', 'mi', 'm'],
    convert: (v, from, to) => {
      let m = from === 'm' ? v : from === 'km' ? v * 1000 : v * 1609.34;
      return to === 'm' ? m : to === 'km' ? m / 1000 : m / 1609.34;
    },
  },
};

export default function UnitConverter() {
  const [type, setType] = useState('temperature');
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('°C');
  const [toUnit, setToUnit] = useState('°F');

  const conv = CONVERTERS[type];
  const result = value !== '' && !isNaN(parseFloat(value))
    ? conv.convert(parseFloat(value), fromUnit, toUnit).toFixed(4).replace(/\.?0+$/, '')
    : '';

  function selectType(t) {
    setType(t);
    setValue('');
    setFromUnit(CONVERTERS[t].units[0]);
    setToUnit(CONVERTERS[t].units[1]);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {Object.entries(CONVERTERS).map(([k, c]) => (
          <button
            key={k}
            onClick={() => selectType(k)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              type === k ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Từ</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none"
          >
            {conv.units.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Sang</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none"
          >
            {conv.units.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0"
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {result !== '' && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{result} {toUnit}</p>
          <p className="text-xs text-muted-foreground mt-1">{value} {fromUnit} = {result} {toUnit}</p>
        </div>
      )}
    </div>
  );
}
