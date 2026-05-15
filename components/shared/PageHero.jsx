import HeroBackground from '@/components/home/HeroBackground';
import { cn } from '@/lib/utils';

export default function PageHero({ eyebrow, title, description, children, className }) {
  return (
    <div className={cn('relative flex flex-col items-center text-center pb-20 space-y-6', className)}>
      <HeroBackground />
      <div className="space-y-4">
        <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-serif">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
