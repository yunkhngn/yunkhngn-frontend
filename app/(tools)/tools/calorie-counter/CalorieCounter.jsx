// app/(tools)/tools/calorie-counter/CalorieCounter.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { readNestJson } from '@/lib/api/readJson';

export default function CalorieCounter() {
  const [query, setQuery] = useState('');
  const [toolState, setToolState] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const getEstimate = async () => {
    if (!query.trim()) return;
    setToolState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/tools/calorie-estimate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim() }),
        },
      );
      if (!res.ok) throw new Error();
      const data = await readNestJson(res);
      setResult(data);
      setToolState('success');
    } catch {
      setErrorMsg('AI đang bận. Thử lại sau nhé.');
      setToolState('error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getEstimate();
  };

  return (
    <div className="min-h-[260px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {toolState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground text-center max-w-xs mx-auto">
              Nhập mô tả bữa ăn của bạn để AI ước tính lượng calo và macros dinh dưỡng.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ví dụ: 1 bát phở bò chín nhiều bánh phở, 1 cốc trà sữa ít đường..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
              <Button type="submit" className="w-full" disabled={!query.trim()}>
                Tính Calo 🥗
              </Button>
            </form>
          </motion.div>
        )}

        {toolState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-8"
          >
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Đang tính toán dinh dưỡng...</p>
          </motion.div>
        )}

        {toolState === 'success' && result && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-sm leading-relaxed whitespace-pre-line text-foreground markdown-content">
              {result.suggestion}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={getEstimate}
                className="gap-2 text-muted-foreground"
              >
                <RefreshCw size={14} /> Tính lại
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToolState('idle')}
                className="text-muted-foreground"
              >
                Nhập bữa ăn khác
              </Button>
            </div>
          </motion.div>
        )}

        {toolState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-8"
          >
            <p className="text-sm text-muted-foreground text-center">{errorMsg}</p>
            <Button variant="outline" size="sm" onClick={() => setToolState('idle')}>
              Thử lại
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
