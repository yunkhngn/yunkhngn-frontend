// yunkhngn-fe/app/(tools)/tools/metronome/Metronome.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

function click(ctx, isAccent) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = isAccent ? 1000 : 800;
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [beats, setBeats] = useState(4);
  const [running, setRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const audioCtx = useRef(null);
  const beatRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      setCurrentBeat(-1);
      beatRef.current = 0;
      return;
    }
    const interval = 60000 / bpm;
    const tick = () => {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      click(audioCtx.current, beatRef.current === 0);
      setCurrentBeat(beatRef.current);
      beatRef.current = (beatRef.current + 1) % beats;
    };
    tick();
    intervalRef.current = setInterval(tick, interval);
    return () => clearInterval(intervalRef.current);
  }, [running, bpm, beats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2 min-h-[2rem]">
        {Array.from({ length: beats }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-75 ${
              currentBeat === i
                ? i === 0 ? 'bg-red-500 border-red-500' : 'bg-foreground border-foreground'
                : 'border-border'
            }`}
          />
        ))}
      </div>
      <div className="text-center">
        <div className="text-5xl font-mono font-bold">{bpm}</div>
        <p className="text-sm text-muted-foreground">BPM</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block">Tempo</label>
        <input type="range" min={40} max={240} value={bpm} onChange={e => setBpm(Number(e.target.value))} className="w-full" />
        <div className="flex flex-wrap gap-2">
          {[60, 80, 100, 120, 140, 160, 180].map(v => (
            <button key={v} onClick={() => setBpm(v)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${bpm === v ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground shrink-0">Nhịp: {beats}/4</label>
        <input type="range" min={1} max={8} value={beats} onChange={e => setBeats(Number(e.target.value))} className="flex-1" />
      </div>
      <button
        onClick={() => setRunning(r => !r)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
      >
        {running ? <><Pause size={16} /> Dừng</> : <><Play size={16} /> Bắt đầu</>}
      </button>
    </div>
  );
}
