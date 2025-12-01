import "@/styles/globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import FloatingControls from "@/components/ui/FloatingControls";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Playfair_Display } from 'next/font/google';

import { Toaster } from 'sonner';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
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
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthGuard>
          <main className={playfair.variable}>
            <Component {...pageProps} />
            <FloatingControls />
            <CommandMenu />
            <div className="fixed bottom-4 left-4 text-xs text-muted-foreground/50 hidden md:block pointer-events-none z-50 select-none">
              Press <kbd className="font-mono font-bold">⌘ K</kbd> to search
            </div>
            <Toaster position="top-right" />
          </main>
        </AuthGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}
