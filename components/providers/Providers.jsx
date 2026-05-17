'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { FocusModeProvider } from '@/contexts/FocusModeContext';
import { Toaster } from 'sonner';
import PresenceTracker from '@/components/live/PresenceTracker';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
