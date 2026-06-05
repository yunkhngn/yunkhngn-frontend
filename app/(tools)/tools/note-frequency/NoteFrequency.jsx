// yunkhngn-fe/app/(tools)/tools/note-frequency/NoteFrequency.jsx
'use client';

import { useState } from 'react';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteFreq(octave, noteIdx) {
  const midi = (octave + 1) * 12 + noteIdx;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playNote(freq) {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1);
}

export default function NoteFrequency() {
  const [playing, setPlaying] = useState(null);
  const [minOct, setMinOct] = useState(3);
  const [maxOct, setMaxOct] = useState(5);

  const octaves = Array.from({ length: maxOct - minOct + 1 }, (_, i) => minOct + i);

  function handlePlay(octave, noteIdx) {
    const key = `${octave}-${noteIdx}`;
    playNote(noteFreq(octave, noteIdx));
    setPlaying(key);
    setTimeout(() => setPlaying(null), 1000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs text-muted-foreground">Octaves:</label>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(o => (
          <button key={o}
            onClick={() => {
              if (o < minOct) { setMinOct(o); }
              else if (o > maxOct) { setMaxOct(o); }
              else if (o === minOct && minOct < maxOct) { setMinOct(o + 1); }
              else if (o === maxOct && maxOct > minOct) { setMaxOct(o - 1); }
              else { setMinOct(o); setMaxOct(o); }
            }}
            className={`w-7 h-7 rounded text-xs font-medium transition-colors ${o >= minOct && o <= maxOct ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            {o}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left px-2 py-1 text-muted-foreground font-medium w-10">Oct</th>
              {NOTE_NAMES.map(n => (
                <th key={n} className={`px-1 py-1 font-medium ${n.includes('#') ? 'text-muted-foreground' : 'text-foreground'}`}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {octaves.map(oct => (
              <tr key={oct} className="border-t border-border/50">
                <td className="px-2 py-1.5 font-mono text-muted-foreground">{oct}</td>
                {NOTE_NAMES.map((n, i) => {
                  const freq = noteFreq(oct, i);
                  const key = `${oct}-${i}`;
                  return (
                    <td key={n} className="px-0.5 py-1">
                      <button
                        onClick={() => handlePlay(oct, i)}
                        title={`${n}${oct} — ${freq.toFixed(2)} Hz`}
                        className={`w-full px-0.5 py-1.5 rounded text-center font-mono text-xs transition-all ${
                          playing === key
                            ? 'bg-foreground text-background'
                            : n.includes('#')
                              ? 'bg-muted/40 hover:bg-muted text-muted-foreground'
                              : 'bg-muted/20 hover:bg-muted text-foreground'
                        }`}
                      >
                        {freq.toFixed(1)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-center">Click vào ô để nghe âm thanh</p>
    </div>
  );
}
