import Head from 'next/head';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function Layout({ children, title = 'Developer Portfolio' }) {
  return (
    <div className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Developer Portfolio & Blog" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">DevPortfolio</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/about">About</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/blog">Blog</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/projects">Projects</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/gallery">Gallery</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        {children}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <a href="#" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">yunkhngn</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
