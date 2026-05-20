// app/(tools)/tools/random-quote/RandomQuote.jsx
'use client';

import { useState } from 'react';

const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'motivation' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein', category: 'motivation' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', category: 'motivation' },
  { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon', category: 'life' },
  { text: 'Get busy living or get busy dying.', author: 'Stephen King', category: 'life' },
  { text: 'You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.', author: 'Dr. Seuss', category: 'life' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds', category: 'coding' },
  { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler', category: 'coding' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson', category: 'coding' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson', category: 'coding' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb', category: 'motivation' },
  { text: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford', category: 'motivation' },
];

const CATEGORIES = ['all', 'motivation', 'life', 'coding'];

export default function RandomQuote() {
  const [category, setCategory] = useState('all');
  const [idx, setIdx] = useState(0);

  const filtered = category === 'all' ? QUOTES : QUOTES.filter((q) => q.category === category);
  const quote = filtered[idx % filtered.length];

  function next() {
    setIdx((i) => (i + 1) % filtered.length);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setIdx(0); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              category === cat
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {cat === 'all' ? 'Tất cả' : cat}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3 min-h-[120px]">
        <p className="text-sm text-foreground leading-relaxed">"{quote.text}"</p>
        <p className="text-xs text-muted-foreground text-right">— {quote.author}</p>
      </div>
      <button
        onClick={next}
        className="w-full px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm font-medium transition-colors"
      >
        Quote khác 🎲
      </button>
    </div>
  );
}
