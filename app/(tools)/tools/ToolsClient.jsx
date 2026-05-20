// yunkhngn-fe/app/(tools)/tools/ToolsClient.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ToolCard from './ToolCard';
import WhatToEat from './what-to-eat/WhatToEat';

const TOOLS = [
  {
    id: 'what-to-eat',
    icon: '🍜',
    name: 'Hôm nay ăn gì?',
    description: 'Gợi ý món ăn dựa theo thời tiết và giờ hiện tại.',
    Component: WhatToEat,
  },
];

export default function ToolsClient() {
  const [selectedId, setSelectedId] = useState(null);
  const selected = TOOLS.find((t) => t.id === selectedId);

  const close = useCallback(() => setSelectedId(null), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <AnimatePresence mode="popLayout">
      {selected ? (
        <motion.div
          key="expanded"
          layoutId={`tool-${selected.id}`}
          className="bg-card border border-border rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selected.icon}</span>
              <h2 className="text-lg font-semibold">{selected.name}</h2>
            </div>
            <button
              onClick={close}
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <selected.Component />
        </motion.div>
      ) : (
        <motion.div
          key="grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {TOOLS.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              icon={tool.icon}
              name={tool.name}
              description={tool.description}
              onClick={() => setSelectedId(tool.id)}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
