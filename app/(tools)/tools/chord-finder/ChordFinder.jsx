// yunkhngn-fe/app/(tools)/tools/chord-finder/ChordFinder.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const QUALITIES = [
  { label: 'Major', key: 'maj', intervals: [0, 4, 7] },
  { label: 'Minor', key: 'min', intervals: [0, 3, 7] },
  { label: 'Dom 7', key: '7', intervals: [0, 4, 7, 10] },
  { label: 'Maj 7', key: 'maj7', intervals: [0, 4, 7, 11] },
  { label: 'Min 7', key: 'min7', intervals: [0, 3, 7, 10] },
  { label: 'Dim', key: 'dim', intervals: [0, 3, 6] },
  { label: 'Aug', key: 'aug', intervals: [0, 4, 8] },
  { label: 'Sus2', key: 'sus2', intervals: [0, 2, 7] },
  { label: 'Sus4', key: 'sus4', intervals: [0, 5, 7] },
];

const DEGREE_LABELS = ['Root', '3rd', '5th', '7th', '9th', '11th'];

export default function ChordFinder() {
  const [root, setRoot] = useState('C');
  const [quality, setQuality] = useState('maj');
  const [copied, setCopied] = useState(false);

  const q = QUALITIES.find(x => x.key === quality);
  const chordNotes = q ? q.intervals.map(i => NOTES[(NOTES.indexOf(root) + i) % 12]) : [];
  const chordName = `${root}${quality === 'maj' ? '' : quality}`;

  function copy() {
    navigator.clipboard.writeText(chordNotes.join(' - '));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Root Note</label>
        <div className="flex flex-wrap gap-1.5">
          {NOTES.map(n => (
            <button key={n} onClick={() => setRoot(n)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${root === n ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Chord Quality</label>
        <div className="flex flex-wrap gap-1.5">
          {QUALITIES.map(q => (
            <button key={q.key} onClick={() => setQuality(q.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${quality === q.key ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {q.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-muted/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">{chordName}</h3>
          <button onClick={copy} className="p-1.5 rounded hover:bg-muted transition-colors">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
          </button>
        </div>
        <div className="flex gap-2">
          {chordNotes.map((note, i) => (
            <div key={i} className="flex-1 bg-background border border-border rounded-lg py-3 text-center">
              <p className="text-lg font-mono font-bold">{note}</p>
              <p className="text-xs text-muted-foreground mt-1">{DEGREE_LABELS[i] || `${i + 1}th`}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
