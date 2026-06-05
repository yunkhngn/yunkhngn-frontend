import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function LetterEditor({
  value,
  onChange,
  font = 'fz',
  onFontChange,
}) {
  // Parse JSON string to plain text for textarea
  const plainText = useMemo(() => {
    if (!value) return '';
    try {
      const doc = typeof value === 'string' ? JSON.parse(value) : value;
      if (doc && Array.isArray(doc.content)) {
        return doc.content
          .map((block) => {
            if (block.content && Array.isArray(block.content)) {
              return block.content.map((c) => c.text || '').join('');
            }
            return '';
          })
          .join('\n\n');
      }
    } catch (e) {
      if (typeof value === 'string') return value;
    }
    return '';
  }, [value]);

  const handleTextChange = (e) => {
    const text = e.target.value;
    const paragraphs = text.split(/\n\n+/);
    const json = {
      type: 'doc',
      content: paragraphs.map((p) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: p }],
      })),
    };
    onChange(JSON.stringify(json));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-400 mb-2">
          Kiểu chữ viết tay (Font)
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onFontChange('fz')}
            className={cn(
              "px-5 py-3 rounded-lg border text-sm font-medium transition-all duration-200 text-left w-full sm:w-auto",
              font === 'fz'
                ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
            )}
          >
            <span className="font-fz text-lg block mb-1">Cỡ chữ FZ</span>
            Chữ nghiêng mềm mại
          </button>
          <button
            type="button"
            onClick={() => onFontChange('reebie')}
            className={cn(
              "px-5 py-3 rounded-lg border text-sm font-medium transition-all duration-200 text-left w-full sm:w-auto",
              font === 'reebie'
                ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
            )}
          >
            <span className="font-reebie text-lg block mb-1">Cỡ chữ Reebie</span>
            Chữ tròn tự nhiên
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-400 mb-2">
          Nội dung bức thư
        </label>
        <textarea
          value={plainText}
          onChange={handleTextChange}
          placeholder="Viết nội dung thư tại đây...&#10;Xuống dòng 2 lần (double enter) để tạo đoạn văn mới."
          className="w-full min-h-[300px] bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono text-sm leading-relaxed"
        />
      </div>

      {plainText && (
        <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-950/40">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3 select-none">
            Xem trước kiểu chữ (Preview)
          </h4>
          <div className={cn(
            "p-4 border border-dashed border-neutral-800 rounded bg-neutral-950 text-neutral-300 leading-relaxed text-xl min-h-[100px] whitespace-pre-wrap",
            font === 'reebie' ? 'font-reebie' : 'font-fz'
          )}>
            {plainText}
          </div>
        </div>
      )}
    </div>
  );
}
