// yunkhngn-fe/app/(tools)/tools/countdown/Countdown.jsx
'use client';

import { useState, useEffect } from 'react';

function getTimeLeft(target) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function Countdown() {
  const [target, setTarget] = useState('');
  const [label, setLabel] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!target) return;
    const update = () => setTimeLeft(getTimeLeft(target));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tên sự kiện</label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="VD: Sinh nhật, Deadline, Trip..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Thời điểm đếm đến</label>
        <input
          type="datetime-local"
          value={target}
          onChange={e => setTarget(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {target && (
        timeLeft ? (
          <div className="space-y-2">
            {label && <p className="text-sm font-medium text-center">{label}</p>}
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: timeLeft.days, l: 'Ngày' },
                { v: timeLeft.hours, l: 'Giờ' },
                { v: timeLeft.minutes, l: 'Phút' },
                { v: timeLeft.seconds, l: 'Giây' },
              ].map(({ v, l }) => (
                <div key={l} className="bg-muted/40 rounded-lg px-2 py-3 text-center">
                  <p className="text-2xl font-mono font-bold">{String(v).padStart(2, '0')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">Sự kiện đã diễn ra!</p>
        )
      )}
    </div>
  );
}
