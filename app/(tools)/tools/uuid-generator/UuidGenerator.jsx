// app/(tools)/tools/uuid-generator/UuidGenerator.jsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function genUUID() {
  return crypto.randomUUID();
}

export default function UuidGenerator() {
  const [uuids, setUuids] = useState([genUUID()]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  function copy(uuid, idx) {
    navigator.clipboard.writeText(uuid);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }

  function generateBatch() {
    setUuids(Array.from({ length: 5 }, genUUID));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setUuids([genUUID()])}
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
        >
          Generate
        </button>
        <button
          onClick={generateBatch}
          className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
        >
          ×5
        </button>
      </div>
      <div className="space-y-2">
        {uuids.map((uuid, i) => (
          <div key={uuid} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
            <code className="flex-1 text-xs font-mono text-foreground break-all">{uuid}</code>
            <button
              onClick={() => copy(uuid, i)}
              className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              {copiedIdx === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-muted-foreground" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
