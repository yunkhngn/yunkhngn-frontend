// yunkhngn-fe/app/(tools)/tools/key-transposer/KeyTransposer.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function noteIndex(note) {
  const i = NOTES_SHARP.indexOf(note);
  return i !== -1 ? i : NOTES_FLAT.indexOf(note);
}

function transposeNote(note, semitones) {
  const i = noteIndex(note);
  if (i === -1) return note;
  return NOTES_SHARP[((i + semitones) % 12 + 12) % 12];
}

function transposeText(text, semitones) {
  return text.replace(
    /\[([A-G][#b]?(?:maj|min|m|aug|dim|sus|add)?(?:\d+)?(?:\/[A-G][#b]?)?)\]/g,
    (_, chord) => {
      const parts = chord.split('/');
      const transposed = parts.map(part => {
        const match = part.match(/^([A-G][#b]?)(.*)/);
        if (!match) return part;
        return transposeNote(match[1], semitones) + match[2];
      });
      return `[${transposed.join('/')}]`;
    }
  );
}

const SAMPLE = `[C]Twinkle, twinkle, [G]little star
[F]How I [C]wonder [G]what you [C]are`;

export default function KeyTransposer() {
  const [text, setText] = useState(SAMPLE);
  const [semitones, setSemitones] = useState(0);
  const [copied, setCopied] = useState(false);

  const result = transposeText(text, semitones);

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Lyrics + chords (dùng [C], [Am], [G/B], ...)</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">
          Transpose: {semitones > 0 ? `+${semitones}` : semitones} semitone{semitones !== 1 ? 's' : ''}
        </label>
        <div className="flex items-center gap-3">
          <button onClick={() => setSemitones(s => Math.max(-11, s - 1))}
            className="w-8 h-8 rounded-lg bg-muted hover:bg-accent transition-colors text-lg font-bold">−</button>
          <input type="range" min={-11} max={11} value={semitones}
            onChange={e => setSemitones(Number(e.target.value))} className="flex-1" />
          <button onClick={() => setSemitones(s => Math.min(11, s + 1))}
            className="w-8 h-8 rounded-lg bg-muted hover:bg-accent transition-colors text-lg font-bold">+</button>
          <button onClick={() => setSemitones(0)}
            className="px-2 py-1 rounded text-xs bg-muted hover:bg-accent transition-colors">Reset</button>
        </div>
      </div>
      {semitones !== 0 && (
        <div className="bg-muted/40 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Kết quả</span>
            <button onClick={copy} className="p-1 rounded hover:bg-muted transition-colors">
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
            </button>
          </div>
          <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">{result}</pre>
        </div>
      )}
    </div>
  );
}
