import './globals.css';
import {
  Playfair_Display,
  JetBrains_Mono,
  Be_Vietnam_Pro,
} from 'next/font/google';
import localFont from 'next/font/local';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/next"

import Providers from '@/components/providers/Providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

const reebie = localFont({
  src: '../public/fonts/Reebie.ttf',
  variable: '--font-reebie',
  display: 'swap',
});

const fzHandwriting = localFont({
  src: '../public/fonts/fz-handwriting.ttf',
  variable: '--font-fz',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://yunkhngn.dev'),
  title: {
    default: 'Khoa Nguyễn - Software Engineer',
    template: '%s - Khoa Nguyễn',
  },
  alternates: {
    canonical: 'https://yunkhngn.dev',
  },
  description:
    "I'm Khoa Nguyen (yun.khngn) - a talented software engineering student, self-taught creator, graphic designer, and guitarist/musician.",
  keywords: [
    'Blog',
    'Khoa Nguyen',
    'Software Engineer',
    'Web Developer',
    'React',
    'Next.js',
  ],
  authors: [{ name: 'Khoa Nguyễn', url: 'https://yunkhngn.dev' }],
  creator: 'Khoa Nguyễn',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://yunkhngn.dev',
    siteName: 'Khoa Nguyen',
    images: [
      {
        url: 'https://yunkhngn.dev/api/og?title=Khoa%20Nguy%E1%BB%85n&type=page&description=Software%20Engineer%20%E2%80%A2%20Designer%20%E2%80%A2%20Guitarist',
        width: 1200,
        height: 630,
        alt: 'Khoa Nguyễn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khoa Nguyễn - Software Engineer',
    description:
      "I'm Khoa Nguyen (yun.khngn) - a talented software engineering student, self-taught creator, graphic designer, and guitarist/musician.",
    images: [
      'https://yunkhngn.dev/api/og?title=Khoa%20Nguy%E1%BB%85n&type=page&description=Software%20Engineer%20%E2%80%A2%20Designer%20%E2%80%A2%20Guitarist',
    ],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon-180x180.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
      </head>
      <body
        className={`${playfair.variable} ${jetbrainsMono.variable} ${beVietnamPro.variable} ${reebie.variable} ${fzHandwriting.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
