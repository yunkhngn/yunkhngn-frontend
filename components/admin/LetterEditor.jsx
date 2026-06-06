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
        // Each block is one line; join with a single newline so the textarea
        // round-trips exactly (blank lines = empty paragraphs).
        return doc.content
          .map((block) => {
            if (block.content && Array.isArray(block.content)) {
              return block.content.map((c) => c.text || '').join('');
            }
            return '';
          })
          .join('\n');
      }
    } catch (e) {
      if (typeof value === 'string') return value;
    }
    return '';
  }, [value]);

  const handleTextChange = (e) => {
    const text = e.target.value;
    // One textarea line = one paragraph block. Blank lines become empty
    // paragraphs so the tokenizer reproduces every line break exactly.
    const lines = text.split('\n');
    const json = {
      type: 'doc',
      content: lines.map((line) =>
        line === ''
          ? { type: 'paragraph' }
          : { type: 'paragraph', content: [{ type: 'text', text: line }] },
      ),
    };
    onChange(JSON.stringify(json));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: editor */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Handwriting font
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onFontChange('fz')}
              className={cn(
                "px-5 py-3 rounded-lg border text-sm font-medium transition-all duration-200 text-left",
                font === 'fz'
                  ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "bg-background border-border text-muted-foreground hover:border-neutral-500"
              )}
            >
              <span className="font-fz text-lg block mb-1">FZ font</span>
              Soft &amp; flowing
            </button>
            <button
              type="button"
              onClick={() => onFontChange('reebie')}
              className={cn(
                "px-5 py-3 rounded-lg border text-sm font-medium transition-all duration-200 text-left",
                font === 'reebie'
                  ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "bg-background border-border text-muted-foreground hover:border-neutral-500"
              )}
            >
              <span className="font-reebie text-lg block mb-1">Reebie font</span>
              Round &amp; natural
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Letter content
          </label>
          <textarea
            value={plainText}
            onChange={handleTextChange}
            placeholder="Write your letter here...&#10;Press Enter twice (double enter) to start a new paragraph."
            className="w-full h-[440px] resize-none bg-background border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Right: live preview */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Font preview
        </label>
        <div className={cn(
          "p-6 border border-border rounded-lg bg-[#fdfaf5] text-[#2a211a] leading-relaxed text-xl h-full min-h-[440px] overflow-y-auto whitespace-pre-wrap shadow-sm",
          font === 'reebie' ? 'font-reebie' : 'font-fz'
        )}>
          {plainText || (
            <span className="text-neutral-400 text-base font-sans not-italic">
              Preview will appear here as you type…
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
