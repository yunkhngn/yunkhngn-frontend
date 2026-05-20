'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { FocusModeProvider } from '@/contexts/FocusModeContext';
import { Toaster } from 'sonner';
import PresenceTracker from '@/components/live/PresenceTracker';

export default function Providers({ children }) {
  useEffect(() => {
    document.documentElement.classList.add('theme-ready');
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <PresenceTracker />
        <NotificationProvider>
          <FocusModeProvider>
            {children}
            <Toaster position="top-right" offset="80px" />
          </FocusModeProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
