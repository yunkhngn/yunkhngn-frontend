// yunkhngn-fe/app/(tools)/tools/bpm-tapper/BpmTapper.jsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const MAX_TAPS = 8;

export default function BpmTapper() {
  const [bpm, setBpm] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  const taps = useRef([]);
  const lastTap = useRef(0);
  const resetTimer = useRef(null);

  const tap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current > 3000) {
      taps.current = [now];
    } else {
      taps.current = [...taps.current, now].slice(-MAX_TAPS);
    }
    lastTap.current = now;
    setTapCount(c => c + 1);

    if (taps.current.length >= 2) {
      const intervals = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      const avg = intervals.reduce((a, b) => a + b) / intervals.length;
      setBpm(Math.round(60000 / avg));
    }

    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      taps.current = [];
      setBpm(null);
      setTapCount(0);
    }, 3000);
  }, []);

  function reset() {
    taps.current = [];
    setBpm(null);
    setTapCount(0);
    clearTimeout(resetTimer.current);
  }

  useEffect(() => {
    const handler = e => { if (e.key === ' ') { e.preventDefault(); tap(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tap]);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl font-mono font-bold mb-1">{bpm ?? '--'}</div>
        <p className="text-sm text-muted-foreground">BPM</p>
        {tapCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {tapCount} taps ({Math.min(tapCount - 1, MAX_TAPS - 1)} intervals dùng để tính)
          </p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={tap}
          className="w-40 h-16 rounded-2xl bg-foreground text-background text-base font-semibold hover:opacity-90 active:scale-95 transition-all select-none"
        >
          Tap
        </button>
        <button onClick={reset} className="px-4 rounded-2xl bg-muted hover:bg-accent transition-colors">
          <RotateCcw size={16} />
        </button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Nhấn nút hoặc bấm <kbd className="px-1 py-0.5 rounded bg-muted text-xs font-mono">Space</kbd> theo nhịp nhạc. Tự reset sau 3s dừng tap.
      </p>
    </div>
  );
}
