'use client';

import { useEffect } from 'react';
import './globals.css';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h1 className="text-6xl font-bold font-serif mb-4">Oops!</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-md">
            Something went wrong. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 h-12 text-base font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
