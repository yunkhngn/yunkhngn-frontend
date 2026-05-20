// app/(tools)/tools/qr-generator/QrGenerator.jsx
'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function QrGenerator() {
  const [text, setText] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!text.trim()) { setDataUrl(''); setError(''); return; }
    QRCode.toDataURL(text, { width: 256, margin: 2 })
      .then((url) => { setDataUrl(url); setError(''); })
      .catch(() => setError('Không thể tạo QR.'));
  }, [text]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qrcode.png';
    a.click();
  }

  return (
    <div className="space-y-4">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="https://yunkhngn.dev"
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {dataUrl && (
        <div className="flex flex-col items-center gap-3">
          <img src={dataUrl} alt="QR Code" className="rounded-xl border border-border" width={200} height={200} />
          <button
            onClick={download}
            className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
          >
            Tải PNG
          </button>
        </div>
      )}
    </div>
  );
}
