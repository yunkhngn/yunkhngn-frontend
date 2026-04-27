import "@/styles/globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "next-themes";
import { FocusModeProvider } from "@/contexts/FocusModeContext";
import FloatingControls from "@/components/ui/FloatingControls";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Playfair_Display, JetBrains_Mono, Be_Vietnam_Pro } from 'next/font/google';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { AnimatePresence, motion } from 'framer-motion';
import GoogleAnalytics from "@/components/seo/GoogleAnalytics";
import CookieConsent from "@/components/ui/CookieConsent";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

import { Toaster } from 'sonner';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam-pro',
});

function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');

  useEffect(() => {
    if (!loading && !user && isAdminRoute) {
      router.push('/login');
    }
  }, [user, loading, router, isAdminRoute]);

  if (loading && isAdminRoute) {
    return null;
  }

  if (!user && isAdminRoute) {
    return null;
  }

  return children;
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const getLayout = Component.getLayout || ((page) => page);
  const isAdminRoute = router.pathname.startsWith('/admin');

  useEffect(() => {
    document.body.classList.add(playfair.variable, jetbrainsMono.variable, beVietnamPro.variable, 'font-sans');
    return () => {
      document.body.classList.remove(playfair.variable, jetbrainsMono.variable, beVietnamPro.variable, 'font-sans');
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <FocusModeProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ProgressBar
              height="4px"
              color="#3b82f6"
              options={{ showSpinner: false }}
              shallowRouting
            />
            <GoogleAnalytics />
            <AuthGuard>
              <ErrorBoundary>
                <main>
                  {getLayout(
                    isAdminRoute ? (
                      <Component {...pageProps} />
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={router.route}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Component {...pageProps} />
                        </motion.div>
                      </AnimatePresence>
                    )
                  )}
                  <FloatingControls />
                  <CommandMenu />

                  <Toaster position="top-right" offset="80px" />
                  <CookieConsent />
                </main>
              </ErrorBoundary>
            </AuthGuard>
          </ThemeProvider>
        </FocusModeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
