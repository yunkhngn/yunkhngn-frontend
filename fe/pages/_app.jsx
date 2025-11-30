import "@/styles/globals.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import FloatingControls from "@/components/ui/FloatingControls";
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
          <Component {...pageProps} />
          <FloatingControls />
        </AuthGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}
