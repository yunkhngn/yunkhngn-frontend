'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MEAL_EMOJI = { sáng: '🌅', trưa: '☀️', chiều: '🌤️', tối: '🌙' };

export default function WhatToEat() {
  const [toolState, setToolState] = useState('idle');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const callSuggest = async (loc) => {
    setToolState('loading');
    setErrorMsg('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/tools/what-to-eat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: loc,
            timezone: 'Asia/Ho_Chi_Minh',
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'AI_ERROR');
      }
      const data = await res.json();
      setResult(data);
      setToolState('success');
    } catch (e) {
      setErrorMsg(
        e.message && e.message !== 'AI_ERROR'
          ? 'Không tìm thấy địa điểm này. Thử tên thành phố khác nhé.'
          : 'AI đang bận. Thử lại sau nhé.',
      );
      setToolState('error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) callSuggest(location.trim());
  };

  return (
    <div className="min-h-[260px] flex flex-col">
      <AnimatePresence mode="wait">
        {toolState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center justify-center flex-1 gap-4 py-8"
          >
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Nhập tên thành phố hoặc quận để mình gợi ý món phù hợp thời tiết
              hôm nay.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xs">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hà Nội, Quận 1..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoFocus
              />
              <Button type="submit" size="icon" disabled={!location.trim()}>
                <ArrowRight size={16} />
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
            className="flex flex-col items-center justify-center flex-1 gap-3 py-8"
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
            className="flex flex-col md:flex-row gap-6 py-2"
          >
            <div className="flex flex-wrap gap-2 md:flex-col md:gap-2 md:min-w-[160px]">
              <span className="inline-flex items-center gap-1.5 text-xs bg-muted rounded-full px-3 py-1.5 text-muted-foreground">
                {MEAL_EMOJI[result.context.meal_type]} Bữa{' '}
                {result.context.meal_type} · {result.context.current_time_vn}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-muted rounded-full px-3 py-1.5 text-muted-foreground">
                📍 {result.context.location_name}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-muted rounded-full px-3 py-1.5 text-muted-foreground">
                🌡️ {result.context.temperature_c.toFixed(0)}°C ·{' '}
                {result.context.weather_description}
              </span>
            </div>

            <div className="flex-1">
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                {result.suggestion}
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => callSuggest(location)}
                  className="gap-2 text-muted-foreground"
                >
                  <RefreshCw size={14} />
                  Gợi ý lại
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setToolState('idle')}
                  className="text-muted-foreground"
                >
                  Đổi địa điểm
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {toolState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 gap-4 py-8"
          >
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {errorMsg}
            </p>
            <Button variant="outline" size="sm" onClick={() => setToolState('idle')}>
              Thử lại
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
