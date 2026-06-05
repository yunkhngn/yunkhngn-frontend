// yunkhngn-fe/app/(tools)/tools/ToolsClient.jsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Utensils,
  Activity,
  Sparkles,
  Code,
  Wrench,
  ChefHat,
  Scale,
  Moon,
  Droplet,
  Quote,
  Braces,
  Binary,
  Fingerprint,
  SearchCode,
  QrCode,
  Ruler,
  KeyRound,
  Film,
  Salad,
  CalendarDays,
  MoonStar,
  Loader2,
  Receipt,
  Banknote,
  ArrowLeftRight,
  Timer,
  Cake,
  Clock,
  ScanLine,
  CalendarClock,
  Hash,
  FileText,
  CalendarCheck,
  Pipette,
  Layers,
  Sun,
  Frame,
  Square,
  Drum,
  Gauge,
  Music2,
  AudioWaveform,
  ChevronsUpDown,
} from 'lucide-react';
import ToolCard from './ToolCard';
import ChromeExtensionCard from './ChromeExtensionCard';

const ToolLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

const TOOL_COMPONENTS = {
  'what-to-eat': dynamic(() => import('./what-to-eat/WhatToEat'), { loading: ToolLoader }),
  'bmi': dynamic(() => import('./bmi/BMI'), { loading: ToolLoader }),
  'sleep-calculator': dynamic(() => import('./sleep-calculator/SleepCalculator'), { loading: ToolLoader }),
  'water-tracker': dynamic(() => import('./water-tracker/WaterTracker'), { loading: ToolLoader }),
  'random-quote': dynamic(() => import('./random-quote/RandomQuote'), { loading: ToolLoader }),
  'json-formatter': dynamic(() => import('./json-formatter/JsonFormatter'), { loading: ToolLoader }),
  'base64': dynamic(() => import('./base64/Base64'), { loading: ToolLoader }),
  'uuid-generator': dynamic(() => import('./uuid-generator/UuidGenerator'), { loading: ToolLoader }),
  'regex-tester': dynamic(() => import('./regex-tester/RegexTester'), { loading: ToolLoader }),
  'qr-generator': dynamic(() => import('./qr-generator/QrGenerator'), { loading: ToolLoader }),
  'unit-converter': dynamic(() => import('./unit-converter/UnitConverter'), { loading: ToolLoader }),
  'password-generator': dynamic(() => import('./password-generator/PasswordGenerator'), { loading: ToolLoader }),
  'movie-suggest': dynamic(() => import('./movie-suggest/MovieSuggest'), { loading: ToolLoader }),
  'calorie-counter': dynamic(() => import('./calorie-counter/CalorieCounter'), { loading: ToolLoader }),
  'tip-calculator': dynamic(() => import('./tip-calculator/TipCalculator'), { loading: ToolLoader }),
  'loan-calculator': dynamic(() => import('./loan-calculator/LoanCalculator'), { loading: ToolLoader }),
  'currency-converter': dynamic(() => import('./currency-converter/CurrencyConverter'), { loading: ToolLoader }),
  'countdown': dynamic(() => import('./countdown/Countdown'), { loading: ToolLoader }),
  'age-calculator': dynamic(() => import('./age-calculator/AgeCalculator'), { loading: ToolLoader }),
  'pomodoro': dynamic(() => import('./pomodoro/Pomodoro'), { loading: ToolLoader }),
  'jwt-decoder': dynamic(() => import('./jwt-decoder/JwtDecoder'), { loading: ToolLoader }),
  'timestamp-converter': dynamic(() => import('./timestamp-converter/TimestampConverter'), { loading: ToolLoader }),
  'hash-generator': dynamic(() => import('./hash-generator/HashGenerator'), { loading: ToolLoader }),
  'markdown-previewer': dynamic(() => import('./markdown-previewer/MarkdownPreviewer'), { loading: ToolLoader }),
  'cron-explainer': dynamic(() => import('./cron-explainer/CronExplainer'), { loading: ToolLoader }),
  'color-converter': dynamic(() => import('./color-converter/ColorConverter'), { loading: ToolLoader }),
  'gradient-generator': dynamic(() => import('./gradient-generator/GradientGenerator'), { loading: ToolLoader }),
  'contrast-checker': dynamic(() => import('./contrast-checker/ContrastChecker'), { loading: ToolLoader }),
  'aspect-ratio': dynamic(() => import('./aspect-ratio/AspectRatio'), { loading: ToolLoader }),
  'shadow-generator': dynamic(() => import('./shadow-generator/ShadowGenerator'), { loading: ToolLoader }),
  'bpm-tapper': dynamic(() => import('./bpm-tapper/BpmTapper'), { loading: ToolLoader }),
  'metronome': dynamic(() => import('./metronome/Metronome'), { loading: ToolLoader }),
  'chord-finder': dynamic(() => import('./chord-finder/ChordFinder'), { loading: ToolLoader }),
  'note-frequency': dynamic(() => import('./note-frequency/NoteFrequency'), { loading: ToolLoader }),
  'key-transposer': dynamic(() => import('./key-transposer/KeyTransposer'), { loading: ToolLoader }),
};

const CATEGORIES = [
  { key: 'food', label: 'Ăn uống', icon: Utensils },
  { key: 'health', label: 'Sức khoẻ', icon: Activity },
  { key: 'entertainment', label: 'Giải trí', icon: Sparkles },
  { key: 'coding', label: 'Coding', icon: Code },
  { key: 'utility', label: 'Tiện ích', icon: Wrench },
  { key: 'daily', label: 'Hằng ngày', icon: CalendarClock },
  { key: 'designer', label: 'Designer', icon: Layers },
  { key: 'musician', label: 'Âm nhạc', icon: AudioWaveform },
];

const TOOLS = [
  { id: 'what-to-eat', icon: ChefHat, name: 'Hôm nay ăn gì?', description: 'Gợi ý món ăn dựa theo thời tiết và giờ hiện tại.', category: 'food' },
  { id: 'bmi', icon: Scale, name: 'Tính BMI', description: 'Nhập chiều cao và cân nặng để tính chỉ số BMI.', category: 'health' },
  { id: 'sleep-calculator', icon: Moon, name: 'Tính giờ ngủ', description: 'Nhập giờ thức dậy để biết nên đi ngủ lúc mấy giờ.', category: 'health' },
  { id: 'water-tracker', icon: Droplet, name: 'Nhắc uống nước', description: 'Nhập cân nặng để tính lượng nước cần uống mỗi ngày.', category: 'health' },
  { id: 'random-quote', icon: Quote, name: 'Random Quote', description: 'Quote ngẫu nhiên theo chủ đề: động lực, cuộc sống, coding.', category: 'entertainment' },
  { id: 'json-formatter', icon: Braces, name: 'JSON Formatter', description: 'Paste JSON để format + validate. Copy kết quả 1 click.', category: 'coding' },
  { id: 'base64', icon: Binary, name: 'Base64', description: 'Encode hoặc decode Base64 ngay lập tức.', category: 'coding' },
  { id: 'uuid-generator', icon: Fingerprint, name: 'UUID Generator', description: 'Generate UUID v4. Copy 1 click hoặc batch ×5.', category: 'coding' },
  { id: 'regex-tester', icon: SearchCode, name: 'Regex Tester', description: 'Nhập pattern + test string để highlight match trực tiếp.', category: 'coding' },
  { id: 'qr-generator', icon: QrCode, name: 'QR Code Generator', description: 'Nhập text hoặc URL để tạo QR code. Download PNG.', category: 'utility' },
  { id: 'unit-converter', icon: Ruler, name: 'Unit Converter', description: 'Đổi đơn vị nhiệt độ, cân nặng, và khoảng cách.', category: 'utility' },
  { id: 'password-generator', icon: KeyRound, name: 'Password Generator', description: 'Tạo mật khẩu ngẫu nhiên với tùy chọn độ dài và ký tự.', category: 'utility' },
  { id: 'movie-suggest', icon: Film, name: 'Gợi ý phim AI', description: 'Hỏi AI gợi ý phim dựa trên tâm trạng và thể loại.', category: 'entertainment' },
  { id: 'calorie-counter', icon: Salad, name: 'Tính calo ăn uống', description: 'Nhập mô tả món ăn để AI ước lượng calo & macros.', category: 'health' },
  { id: 'tip-calculator', icon: Receipt, name: 'Chia bill & tính tip', description: 'Nhập tổng bill, % tip, số người → tiền mỗi người.', category: 'daily' },
  { id: 'loan-calculator', icon: Banknote, name: 'Tính lãi suất vay', description: 'Gốc + lãi suất + kỳ hạn → EMI tháng + tổng lãi.', category: 'daily' },
  { id: 'currency-converter', icon: ArrowLeftRight, name: 'Đổi tiền tệ', description: 'Tỷ giá thực từ frankfurter.app, 10 loại tiền phổ biến.', category: 'daily' },
  { id: 'countdown', icon: Timer, name: 'Đếm ngược sự kiện', description: 'Chọn ngày giờ → đếm ngược d/h/m/s.', category: 'daily' },
  { id: 'age-calculator', icon: Cake, name: 'Tính tuổi', description: 'Nhập ngày sinh → tuổi chính xác + ngày sinh nhật tiếp theo.', category: 'daily' },
  { id: 'pomodoro', icon: Clock, name: 'Pomodoro Timer', description: '25/5 focus sessions, tùy chỉnh thời gian, âm thanh.', category: 'coding' },
  { id: 'jwt-decoder', icon: ScanLine, name: 'JWT Decoder', description: 'Paste JWT → header + payload decoded, kiểm tra exp.', category: 'coding' },
  { id: 'timestamp-converter', icon: CalendarCheck, name: 'Timestamp Converter', description: 'Unix ↔ human readable, nhiều timezone.', category: 'coding' },
  { id: 'hash-generator', icon: Hash, name: 'Hash Generator', description: 'Text → SHA-1 / SHA-256 / SHA-384 / SHA-512.', category: 'coding' },
  { id: 'markdown-previewer', icon: FileText, name: 'Markdown Previewer', description: 'Paste markdown → rendered preview real-time.', category: 'coding' },
  { id: 'cron-explainer', icon: CalendarClock, name: 'Cron Explainer', description: 'Paste cron expression → giải thích tiếng người.', category: 'coding' },
  { id: 'color-converter', icon: Pipette, name: 'Color Converter', description: 'HEX ↔ RGB ↔ HSL ↔ OKLCH, copy one-click.', category: 'designer' },
  { id: 'gradient-generator', icon: Sun, name: 'Gradient Generator', description: 'Pick màu → CSS linear/radial gradient + copy code.', category: 'designer' },
  { id: 'contrast-checker', icon: Frame, name: 'Contrast Checker', description: '2 màu → WCAG AA/AAA pass/fail + contrast ratio.', category: 'designer' },
  { id: 'aspect-ratio', icon: Square, name: 'Aspect Ratio Calc', description: 'Nhập width → height theo ratio, common presets.', category: 'designer' },
  { id: 'shadow-generator', icon: Layers, name: 'Shadow Generator', description: 'Visual CSS box-shadow builder + copy code.', category: 'designer' },
  { id: 'bpm-tapper', icon: Drum, name: 'BPM Tapper', description: 'Tap spacebar/button theo nhịp → BPM hiện.', category: 'musician' },
  { id: 'metronome', icon: Gauge, name: 'Metronome', description: 'Visual + click âm thanh, chỉnh BPM slider.', category: 'musician' },
  { id: 'chord-finder', icon: Music2, name: 'Chord Finder', description: 'Chọn root note + quality → notes trong chord.', category: 'musician' },
  { id: 'note-frequency', icon: AudioWaveform, name: 'Note Frequency', description: 'Bảng tần số C0–C8, click note để nghe.', category: 'musician' },
  { id: 'key-transposer', icon: ChevronsUpDown, name: 'Key Transposer', description: 'Nhập lyrics + chords → transpose lên/xuống n semitones.', category: 'musician' },
];

const CHROME_EXTENSIONS = [
  {
    id: 'fptu-schedule',
    icon: CalendarDays,
    name: 'FPTU Schedule',
    description: 'Quản lý và xuất lịch học, lịch thi, reminder từ FAP.',
    storeUrl: 'https://chromewebstore.google.com/detail/fptu-schedule/obiiippodjlfcmdipfbkneknbakjekfm',
  },
  {
    id: 'better-sleep',
    icon: MoonStar,
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
    <AnimatePresence mode="wait">
      {selected ? (
        <motion.div
          key="expanded"
          className="bg-card border border-border rounded-xl p-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {selected.icon && <selected.icon className="w-6 h-6 text-foreground" />}
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
          {(() => { const ToolComponent = TOOL_COMPONENTS[selected.id]; return ToolComponent ? <ToolComponent /> : null; })()}
        </motion.div>
      ) : (
        <motion.div
          key="grid"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
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
              {CATEGORIES.filter((c) => activeCategoryKeys.includes(c.key)).map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat.key
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {Icon && <Icon size={14} />}
                    {cat.label}
                  </button>
                );
              })}
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
                const Icon = cat.icon;
                return (
                  <section key={cat.key}>
                    <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                      {Icon && <Icon size={18} className="text-foreground" />}
                      {cat.label}
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
