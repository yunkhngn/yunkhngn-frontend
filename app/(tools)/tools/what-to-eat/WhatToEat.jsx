// yunkhngn-fe/app/(tools)/tools/what-to-eat/WhatToEat.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MEAL_EMOJI = { sáng: '🌅', trưa: '☀️', chiều: '🌤️', tối: '🌙' };

const ERROR_MESSAGES = {
  LOCATION_DENIED:
    'Bạn chưa cho phép truy cập vị trí. Vui lòng bật lại trong cài đặt trình duyệt.',
  LOCATION_UNAVAILABLE:
    'Không xác định được vị trí. Kiểm tra Location Services trên máy và thử lại.',
  LOCATION_TIMEOUT: 'Lấy vị trí quá lâu. Thử lại nhé.',
  NETWORK_ERROR: 'Không kết nối được. Kiểm tra mạng và thử lại.',
  AI_ERROR: 'AI đang bận. Thử lại sau nhé.',
};

export default function WhatToEat() {
  const [toolState, setToolState] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [result, setResult] = useState(null);
  const [errorKey, setErrorKey] = useState(null);

  const callSuggest = async (c) => {
    setToolState('loading');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/tools/what-to-eat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: c.lat,
            lon: c.lon,
            timezone: 'Asia/Ho_Chi_Minh',
          }),
        },
      );
      if (!res.ok) throw new Error('AI_ERROR');
      const data = await res.json();
      setResult(data);
      setToolState('success');
    } catch {
      setErrorKey('AI_ERROR');
      setToolState('error');
    }
  };

  const locate = () => {
    setToolState('locating');
    setErrorKey(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(c);
        callSuggest(c);
      },
      (err) => {
        const key =
          err.code === 1
            ? 'LOCATION_DENIED'
            : err.code === 3
              ? 'LOCATION_TIMEOUT'
              : 'LOCATION_UNAVAILABLE';
        setErrorKey(key);
        setToolState('error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const retry = () => {
    if (errorKey === 'LOCATION_DENIED') {
      setToolState('idle');
    } else {
      locate();
    }
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
              Mình cần biết vị trí của bạn để lấy thời tiết và gợi ý món phù
              hợp nhất.
            </p>
            <Button onClick={locate} className="gap-2">
              <MapPin size={16} />
              Cho tôi biết vị trí
            </Button>
          </motion.div>
        )}

        {(toolState === 'locating' || toolState === 'loading') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 gap-3 py-8"
          >
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {toolState === 'locating'
                ? 'Đang lấy vị trí...'
                : 'Đang hỏi AI...'}
            </p>
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
            {/* Context panel */}
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

            {/* Suggestion */}
            <div className="flex-1">
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                {result.suggestion}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => callSuggest(coords)}
                className="mt-4 gap-2 text-muted-foreground"
              >
                <RefreshCw size={14} />
                Gợi ý lại
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
            className="flex flex-col items-center justify-center flex-1 gap-4 py-8"
          >
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              {ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.AI_ERROR}
            </p>
            <Button variant="outline" size="sm" onClick={retry}>
              Thử lại
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
