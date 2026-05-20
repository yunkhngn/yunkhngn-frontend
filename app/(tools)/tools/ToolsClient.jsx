// yunkhngn-fe/app/(tools)/tools/ToolsClient.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ToolCard from './ToolCard';
import WhatToEat from './what-to-eat/WhatToEat';
import ChromeExtensionCard from './ChromeExtensionCard';
import BMI from './bmi/BMI';
import SleepCalculator from './sleep-calculator/SleepCalculator';
import WaterTracker from './water-tracker/WaterTracker';
import RandomQuote from './random-quote/RandomQuote';
import JsonFormatter from './json-formatter/JsonFormatter';
import Base64 from './base64/Base64';
import UuidGenerator from './uuid-generator/UuidGenerator';

const CATEGORIES = [
  { key: 'food', label: 'Ăn uống', emoji: '🍜' },
  { key: 'health', label: 'Sức khoẻ', emoji: '💪' },
  { key: 'entertainment', label: 'Giải trí', emoji: '🎉' },
  { key: 'coding', label: 'Coding', emoji: '💻' },
  { key: 'utility', label: 'Tiện ích', emoji: '🛠' },
];

const TOOLS = [
  {
    id: 'what-to-eat',
    icon: '🍜',
    name: 'Hôm nay ăn gì?',
    description: 'Gợi ý món ăn dựa theo thời tiết và giờ hiện tại.',
    category: 'food',
    Component: WhatToEat,
  },
  {
    id: 'bmi',
    icon: '⚖️',
    name: 'Tính BMI',
    description: 'Nhập chiều cao và cân nặng để tính chỉ số BMI.',
    category: 'health',
    Component: BMI,
  },
  {
    id: 'sleep-calculator',
    icon: '🌙',
    name: 'Tính giờ ngủ',
    description: 'Nhập giờ thức dậy để biết nên đi ngủ lúc mấy giờ.',
    category: 'health',
    Component: SleepCalculator,
  },
  {
    id: 'water-tracker',
    icon: '💧',
    name: 'Nhắc uống nước',
    description: 'Nhập cân nặng để tính lượng nước cần uống mỗi ngày.',
    category: 'health',
    Component: WaterTracker,
  },
  {
    id: 'random-quote',
    icon: '💬',
    name: 'Random Quote',
    description: 'Quote ngẫu nhiên theo chủ đề: động lực, cuộc sống, coding.',
    category: 'entertainment',
    Component: RandomQuote,
  },
  {
    id: 'json-formatter',
    icon: '📋',
    name: 'JSON Formatter',
    description: 'Paste JSON để format + validate. Copy kết quả 1 click.',
    category: 'coding',
    Component: JsonFormatter,
  },
  {
    id: 'base64',
    icon: '🔤',
    name: 'Base64',
    description: 'Encode hoặc decode Base64 ngay lập tức.',
    category: 'coding',
    Component: Base64,
  },
  {
    id: 'uuid-generator',
    icon: '🆔',
    name: 'UUID Generator',
    description: 'Generate UUID v4. Copy 1 click hoặc batch ×5.',
    category: 'coding',
    Component: UuidGenerator,
  },
];

const CHROME_EXTENSIONS = [
  {
    id: 'fptu-schedule',
    icon: '🗓',
    name: 'FPTU Schedule',
    description: 'Quản lý và xuất lịch học, lịch thi, reminder từ FAP.',
    storeUrl: 'https://chromewebstore.google.com/detail/fptu-schedule/obiiippodjlfcmdipfbkneknbakjekfm',
  },
  {
    id: 'better-sleep',
    icon: '😴',
    name: 'Better Sleep',
    description: 'Sleep planning and tracker.',
    storeUrl: 'https://chromewebstore.google.com/detail/better-sleep/bbeciemkpnopjobcaapiipfolhnninkm',
  },
];

export default function ToolsClient() {
  const [selectedId, setSelectedId] = useState(null);
  const selected = TOOLS.find((t) => t.id === selectedId);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const activeCategoryKeys = [...new Set(TOOLS.map((t) => t.category))];

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      !debouncedSearch ||
      tool.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      tool.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isFiltering = debouncedSearch !== '' || activeCategory !== 'all';

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Search + filter controls */}
          <div className="mb-6 space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tool..."
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                Tất cả
              </button>
              {CATEGORIES.filter((c) => activeCategoryKeys.includes(c.key)).map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tools: flat grid when filtering, sectioned when not */}
          {isFiltering ? (
            filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    icon={tool.icon}
                    name={tool.name}
                    description={tool.description}
                    onClick={() => setSelectedId(tool.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Không tìm thấy tool nào.
              </p>
            )
          ) : (
            <div className="space-y-10">
              {CATEGORIES.filter((c) => activeCategoryKeys.includes(c.key)).map((cat) => {
                const tools = TOOLS.filter((t) => t.category === cat.key);
                if (tools.length === 0) return null;
                return (
                  <section key={cat.key}>
                    <h2 className="text-base font-semibold text-foreground mb-4">
                      {cat.emoji} {cat.label}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          id={tool.id}
                          icon={tool.icon}
                          name={tool.name}
                          description={tool.description}
                          onClick={() => setSelectedId(tool.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Chrome Extensions — always visible, below tools */}
          <section className="mt-12">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
                <path d="M12 8h8.5A10 10 0 0 0 12 2v6z" fill="#EA4335"/>
                <path d="M3.5 16.5A10 10 0 0 0 20.5 16.5H12l-8.5 0z" fill="#FBBC04" opacity="0.01"/>
                <path d="M12 8h8.5A10 10 0 0 1 20.5 16.5L16 12H12V8z" fill="#FBBC04"/>
                <path d="M3.5 16.5A10 10 0 0 0 12 22l4-8H3.5z" fill="#34A853"/>
                <path d="M3.5 7.5A10 10 0 0 0 3.5 16.5L8 12l-4.5-4.5z" fill="#EA4335" opacity="0.01"/>
                <path d="M12 2A10 10 0 0 0 3.5 7.5L8 12l4-4z" fill="#EA4335" opacity="0.1"/>
              </svg>
              Chrome Extensions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHROME_EXTENSIONS.map((ext) => (
                <ChromeExtensionCard
                  key={ext.id}
                  icon={ext.icon}
                  name={ext.name}
                  description={ext.description}
                  storeUrl={ext.storeUrl}
                />
              ))}
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
