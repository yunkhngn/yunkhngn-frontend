// yunkhngn-fe/app/(tools)/layout.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function ToolsLayout({ children }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          ← yunkhngn.dev
        </Link>
        <span className="text-sm font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2">
          Tools
        </span>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full p-1.5 hover:bg-muted transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
          aria-label="Toggle theme"
        >
          {!mounted ? (
            <div className="w-4 h-4" />
          ) : theme === 'dark' ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )}
        </button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
