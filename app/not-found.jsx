import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-8xl font-bold font-serif mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 h-12 text-base font-medium hover:bg-primary/90 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
