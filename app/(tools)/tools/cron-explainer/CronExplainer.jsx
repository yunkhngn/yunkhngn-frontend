// yunkhngn-fe/app/(tools)/tools/cron-explainer/CronExplainer.jsx
'use client';

import { useState } from 'react';
import cronstrue from 'cronstrue';
import 'cronstrue/locales/vi';

const EXAMPLES = [
  { expr: '* * * * *', label: 'Every minute' },
  { expr: '0 * * * *', label: 'Every hour' },
  { expr: '0 9 * * *', label: 'Daily at 9am' },
  { expr: '0 9 * * 1', label: 'Every Monday at 9am' },
  { expr: '0 0 1 * *', label: '1st of every month' },
  { expr: '*/5 * * * *', label: 'Every 5 minutes' },
  { expr: '0 9-17 * * 1-5', label: 'Hourly, Mon–Fri 9am–5pm' },
  { expr: '0 0 * * 0', label: 'Every Sunday midnight' },
];

export default function CronExplainer() {
  const [expr, setExpr] = useState('0 9 * * 1-5');
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState('');

  function explain(value) {
    setExpr(value);
    try {
      const result = cronstrue.toString(value, { locale: 'vi', use24HourTimeFormat: true, throwExceptionOnParseError: true });
      setExplanation(result);
      setError('');
    } catch {
      setExplanation('');
      setError('Cron expression không hợp lệ');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Cron Expression</label>
        <input
          value={expr}
          onChange={e => explain(e.target.value)}
          placeholder="* * * * *"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground mt-1">Định dạng: phút giờ ngày tháng thứ</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {explanation && !error && (
        <div className="bg-muted/40 rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Giải thích</p>
          <p className="text-base font-medium text-foreground">{explanation}</p>
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Ví dụ thường gặp</p>
        <div className="space-y-1">
          {EXAMPLES.map(({ expr: e, label }) => (
            <button
              key={e}
              onClick={() => explain(e)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <code className="text-xs font-mono text-foreground w-32 shrink-0">{e}</code>
              <span className="text-xs text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
