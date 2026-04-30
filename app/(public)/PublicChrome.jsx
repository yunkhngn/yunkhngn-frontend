'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import DefaultNavbar from '@/components/template/Default/Navbar';
import DefaultFooter from '@/components/template/Default/Footer';
import InteractiveBackground from '@/components/ui/InteractiveBackground';
import FloatingCmdK from '@/components/ui/FloatingCmdK';
import FloatingControls from '@/components/ui/FloatingControls';
import { CommandMenu } from '@/components/ui/CommandMenu';
import CookieConsent from '@/components/ui/CookieConsent';
import GoogleAnalytics from '@/components/seo/GoogleAnalytics';
import { useFocusMode } from '@/contexts/FocusModeContext';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function PublicChrome({ children }) {
  const pathname = usePathname();
  const { isFocusMode } = useFocusMode();

  return (
    <ErrorBoundary>
      <GoogleAnalytics />
      <div className="flex flex-col min-h-screen font-sans bg-background text-foreground relative">
        {!isFocusMode && (
          <div className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0">
            <InteractiveBackground />
          </div>
        )}
        {!isFocusMode && <DefaultNavbar />}
        <main className="flex-1 relative z-10 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        {!isFocusMode && pathname !== '/khoa-ai' && <DefaultFooter />}
      </div>
      <FloatingCmdK />
      <FloatingControls />
      <CommandMenu />
      <CookieConsent />
    </ErrorBoundary>
  );
}
