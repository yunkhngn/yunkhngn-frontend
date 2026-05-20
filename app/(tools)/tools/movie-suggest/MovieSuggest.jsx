// app/(tools)/tools/movie-suggest/MovieSuggest.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { readNestJson } from '@/lib/api/readJson';

const MOODS = ['Vui vẻ', 'Buồn bã', 'Căng thẳng', 'Tò mò', 'Lãng mạn', 'Chán nản'];
const GENRES = ['Hành động', 'Hài hước', 'Kinh dị', 'Tình cảm', 'Viễn tưởng', 'Tâm lý'];

export default function MovieSuggest() {
  const [mood, setMood] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [toolState, setToolState] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const getSuggestion = async () => {
    if (!mood) return;
    setToolState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/tools/movie-suggest`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mood,
            genres: selectedGenres,
            language: 'vi',
          }),
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
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Tâm trạng hiện tại của bạn?</label>
              <div className="flex gap-1.5 flex-wrap">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      mood === m
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Thể loại ưu thích (không bắt buộc)</label>
              <div className="flex gap-1.5 flex-wrap">
                {GENRES.map((g) => {
                  const active = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button onClick={getSuggestion} className="w-full" disabled={!mood}>
              Gợi ý phim 🎬
            </Button>
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
            <p className="text-sm text-muted-foreground">Đang hỏi AI...</p>
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
            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
              {result.suggestion}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={getSuggestion}
                className="gap-2 text-muted-foreground"
              >
                <RefreshCw size={14} /> Gợi ý lại
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToolState('idle')}
                className="text-muted-foreground"
              >
                Đổi tùy chọn
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
