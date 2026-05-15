'use client';

import React, { useEffect, useState, useRef } from 'react';

const chars = "!<>-_\\/[]{}—=+*^?#________";

export default function TextDecode({ text, delay = 0 }) {
  const [output, setOutput] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let iteration = 0;
    
    const start = () => {
      timerRef.current = setInterval(() => {
        setOutput(
          text
            .split('')
            .map((char, index) => {
              if (index < iteration) return text[index];
              if (index === Math.floor(iteration)) {
                return chars[Math.floor(Math.random() * chars.length)];
              }
              return '';
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(timerRef.current);
          setIsFinished(true);
        }
        
        iteration += 1; // Faster typing
      }, 30); // Faster interval
    };

    const delayTimer = setTimeout(start, delay);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(timerRef.current);
    };
  }, [text, delay]);

  return (
    <span className="font-mono inline-flex items-center">
      {output}
      {!isFinished && (
        <span className="ml-0.5 w-1.5 h-3.5 bg-muted-foreground/60 animate-pulse" />
      )}
    </span>
  );
}

