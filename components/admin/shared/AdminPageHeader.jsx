import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function AdminPageHeader({ title, description, action, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (action.href ? (
          <Link href={action.href}>
            <Button className="w-full md:w-auto gap-2" onClick={action.onClick}>
              {action.icon}{action.label}
            </Button>
          </Link>
        ) : (
          <Button className="w-full md:w-auto gap-2" onClick={action.onClick}>
            {action.icon}{action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
