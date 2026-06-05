import React, { useMemo, useState, useEffect } from 'react';
import { tokenizeLetterContent } from '@/lib/letterContent';
import { cn } from '@/lib/utils';

export default function TextReveal({
  contentJSON,
  font = 'fz',
  enableAnimation = true,
  onComplete,
}) {
  const tokens = useMemo(() => tokenizeLetterContent(contentJSON), [contentJSON]);
  const [visibleCount, setVisibleCount] = useState(enableAnimation ? 0 : tokens.length);

  useEffect(() => {
    setVisibleCount(enableAnimation ? 0 : tokens.length);
  }, [tokens, enableAnimation]);

  useEffect(() => {
    if (!enableAnimation) {
      setVisibleCount(tokens.length);
      onComplete?.();
      return;
    }

    let timeoutId;

    const revealNext = (index) => {
      if (index >= tokens.length) {
        onComplete?.();
        return;
      }

      setVisibleCount(index + 1);

      const currentToken = tokens[index];
      if (currentToken.type === 'space') {
        revealNext(index + 1);
        return;
      }

      let delay = 300; // base typing delay

      if (currentToken.type === 'word') {
        const text = currentToken.text;
        const lastChar = text[text.length - 1];
        if (['.', '?', '!'].includes(lastChar)) {
          delay += 400;
        } else if ([',', ';', ':', '-'].includes(lastChar)) {
          delay += 200;
        }
      } else if (currentToken.type === 'newline') {
        delay = 400;
      }

      timeoutId = setTimeout(() => revealNext(index + 1), delay);
    };

    if (tokens.length > 0 && visibleCount < tokens.length) {
      timeoutId = setTimeout(() => revealNext(visibleCount), 100);
    }

    return () => clearTimeout(timeoutId);
  }, [tokens, enableAnimation, onComplete]);

  const fontClass = font === 'reebie' ? 'font-reebie' : 'font-fz';

  return (
    <div className={cn("whitespace-pre-wrap leading-relaxed select-none tracking-wide text-2xl md:text-3xl", fontClass)}>
      {tokens.map((token, index) => {
        const isRevealed = index < visibleCount;
        if (token.type === 'newline') {
          return (
            <br
              key={index}
              style={{ display: isRevealed ? 'inline' : 'none' }}
            />
          );
        }
        return (
          <span
            key={index}
            className={cn(
              "transition-opacity duration-500 ease-out",
              isRevealed ? "opacity-100" : "opacity-0 pointer-events-none select-none"
            )}
          >
            {token.text}
          </span>
        );
      })}
    </div>
  );
}
