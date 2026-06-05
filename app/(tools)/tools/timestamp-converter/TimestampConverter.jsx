// yunkhngn-fe/app/(tools)/tools/timestamp-converter/TimestampConverter.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const ZONES = [
  { label: 'Local', tz: undefined },
  { label: 'UTC', tz: 'UTC' },
  { label: 'Hà Nội', tz: 'Asia/Ho_Chi_Minh' },
  { label: 'Tokyo', tz: 'Asia/Tokyo' },
  { label: 'New York', tz: 'America/New_York' },
  { label: 'London', tz: 'Europe/London' },
];

function formatInTz(date, tz) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(date);
}

export default function TimestampConverter() {
  const [unix, setUnix] = useState('');
  const [human, setHuman] = useState('');
  const [copied, setCopied] = useState('');

  function fromUnix() {
    const ms = parseFloat(unix);
    if (!isFinite(ms)) return null;
    return new Date(ms > 1e12 ? ms : ms * 1000);
  }

  function fromHuman() {
    const d = new Date(human);
    return isNaN(d) ? null : d;
  }

  const activeDate = unix ? fromUnix() : human ? fromHuman() : null;

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Unix Timestamp (s hoặc ms)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={unix}
              onChange={e => { setUnix(e.target.value); setHuman(''); }}
              placeholder="VD: 1717200000"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => { setUnix(Math.floor(Date.now() / 1000).toString()); setHuman(''); }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-xs hover:bg-accent transition-colors"
            >
              Now
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Ngày giờ</label>
          <input
            type="datetime-local"
            value={human}
            onChange={e => { setHuman(e.target.value); setUnix(''); }}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      {activeDate && (
        <div className="space-y-2">
          <div className="bg-muted/40 rounded-lg px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Unix (s)</p>
              <p className="font-mono text-sm">{Math.floor(activeDate.getTime() / 1000)}</p>
            </div>
            <button
              onClick={() => copy(Math.floor(activeDate.getTime() / 1000).toString(), 's')}
              className="p-1 rounded hover:bg-muted"
            >
              {copied === 's' ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
            </button>
          </div>
          <div className="space-y-1.5">
            {ZONES.map(({ label, tz }) => (
              <div key={label} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                <span className="text-xs font-mono">{formatInTz(activeDate, tz)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
