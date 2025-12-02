import "@/styles/globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import FloatingControls from "@/components/ui/FloatingControls";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Playfair_Display, JetBrains_Mono } from 'next/font/google';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { AnimatePresence, motion } from 'framer-motion';

import { Toaster } from 'sonner';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
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

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ProgressBar
          height="4px"
          color="#3b82f6"
          options={{ showSpinner: false }}
          shallowRouting
        />
        <AuthGuard>
          <main className={`${playfair.variable} ${jetbrainsMono.variable} font-sans`}>
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
            <div className="fixed bottom-6 left-6 hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl border bg-background/40 backdrop-blur-md shadow-sm text-sm text-muted-foreground pointer-events-none z-50 select-none">
              <span>Press</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
              <span>to search</span>
            </div>
            <Toaster position="top-right" />
          </main>
        </AuthGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}
