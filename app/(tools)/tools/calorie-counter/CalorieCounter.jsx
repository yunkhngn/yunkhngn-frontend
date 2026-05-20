// app/(tools)/tools/calorie-counter/CalorieCounter.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Salad } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { readNestJson } from '@/lib/api/readJson';
import ReactMarkdown from 'react-markdown';

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
              <Button type="submit" className="w-full gap-2" disabled={!query.trim()}>
                Tính Calo <Salad size={16} />
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
            <div className="text-sm text-foreground">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 my-3 space-y-1.5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 my-3 space-y-1.5">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  table: ({ children }) => <div className="overflow-x-auto my-3"><table className="min-w-full border-collapse border border-border text-left text-xs">{children}</table></div>,
                  thead: ({ children }) => <thead className="bg-muted text-muted-foreground uppercase font-semibold">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
                  tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
                  th: ({ children }) => <th className="px-3 py-2 border border-border font-medium">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-2 border border-border">{children}</td>,
                }}
              >
                {result.suggestion}
              </ReactMarkdown>
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
