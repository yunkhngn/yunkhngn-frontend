'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { FocusModeProvider } from '@/contexts/FocusModeContext';
import { Toaster } from 'sonner';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <FocusModeProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-right" offset="80px" />
          </ThemeProvider>
        </FocusModeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
