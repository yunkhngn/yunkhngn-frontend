// yunkhngn-fe/app/(tools)/tools/age-calculator/AgeCalculator.jsx
'use client';

import { useState, useEffect } from 'react';

function calcAge(birthDate) {
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) { years--; months += 12; }

  let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday <= now) nextBirthday.setFullYear(now.getFullYear() + 1);
  const daysToNext = Math.ceil((nextBirthday - now) / 86400000);

  return { years, months, days, daysToNext };
}

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!birthDate) { setResult(null); return; }
    setResult(calcAge(birthDate));
  }, [birthDate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Ngày sinh</label>
        <input
          type="date"
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: result.years, l: 'Năm' },
              { v: result.months, l: 'Tháng' },
              { v: result.days, l: 'Ngày' },
            ].map(({ v, l }) => (
              <div key={l} className="bg-muted/40 rounded-lg px-2 py-3 text-center">
                <p className="text-2xl font-mono font-bold">{v}</p>
                <p className="text-xs text-muted-foreground mt-1">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-muted/40 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Sinh nhật tiếp theo</p>
            <p className="text-lg font-semibold">
              {result.daysToNext === 0 ? '🎂 Hôm nay!' : `${result.daysToNext} ngày nữa`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
