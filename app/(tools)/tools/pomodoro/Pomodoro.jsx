// yunkhngn-fe/app/(tools)/tools/pomodoro/Pomodoro.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const MODES = [
  { label: 'Focus', minutes: 25, color: 'text-red-500' },
  { label: 'Short Break', minutes: 5, color: 'text-green-500' },
  { label: 'Long Break', minutes: 15, color: 'text-blue-500' },
];

function beep(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

export default function Pomodoro() {
  const [modeIdx, setModeIdx] = useState(0);
  const [seconds, setSeconds] = useState(MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const audioCtx = useRef(null);

  const mode = MODES[modeIdx];
  const total = mode.minutes * 60;
  const pct = ((total - seconds) / total) * 100;
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    setSeconds(mode.minutes * 60);
    setRunning(false);
  }, [modeIdx, mode.minutes]);

  useEffect(() => {
    if (!running) return;
    if (seconds === 0) {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      beep(audioCtx.current);
      setRunning(false);
      if (modeIdx === 0) setSessions(s => s + 1);
      return;
    }
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, seconds, modeIdx]);

  function reset() {
    setRunning(false);
    setSeconds(mode.minutes * 60);
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        {MODES.map((m, i) => (
          <button
            key={m.label}
            onClick={() => setModeIdx(i)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${modeIdx === i ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
            <circle
              cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (pct / 100) * circumference}
              className={mode.color}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-mono font-bold">{mins}:{secs}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!audioCtx.current) audioCtx.current = new AudioContext();
              setRunning(r => !r);
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {running ? <Pause size={14} /> : <Play size={14} />}
            {running ? 'Tạm dừng' : 'Bắt đầu'}
          </button>
          <button onClick={reset} className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors">
            <RotateCcw size={14} />
          </button>
        </div>
        {sessions > 0 && (
          <p className="text-xs text-muted-foreground">🍅 {sessions} pomodoro{sessions > 1 ? 's' : ''} hôm nay</p>
        )}
      </div>
    </div>
  );
}
