// app/(tools)/tools/sleep-calculator/SleepCalculator.jsx
'use client';

import { useState } from 'react';

function getSleepTimes(wakeTime) {
  const [hours, minutes] = wakeTime.split(':').map(Number);
  const wakeMs = hours * 60 + minutes;
  const times = [];
  for (let cycles = 6; cycles >= 2; cycles--) {
    const sleepMs = wakeMs - cycles * 90 - 15; // 15 min to fall asleep
    const h = ((Math.floor(sleepMs / 60) % 24) + 24) % 24;
    const m = ((sleepMs % 60) + 60) % 60;
    times.push({
      time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      cycles,
    });
  }
  return times;
}

export default function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('07:00');

  const times = getSleepTimes(wakeTime);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Giờ thức dậy</label>
        <input
          type="time"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <p className="text-xs text-muted-foreground">Nên đi ngủ lúc:</p>
      <div className="space-y-2">
        {times.map(({ time, cycles }) => (
          <div
            key={time}
            className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-2"
          >
            <span className="text-lg font-semibold text-foreground">{time}</span>
            <span className="text-xs text-muted-foreground">{cycles} chu kỳ ({cycles * 1.5}h)</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Mỗi chu kỳ ngủ khoảng 90 phút. Thức dậy giữa chu kỳ sẽ cảm thấy mệt mỏi hơn.</p>
    </div>
  );
}
