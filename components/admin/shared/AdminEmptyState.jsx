import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus } from 'lucide-react';

export function AdminEmptyState({ icon, message, action }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-muted-foreground mb-4">{icon}</div>
        <p className="text-muted-foreground text-lg">{message}</p>
        {action && (
          <Button onClick={action.onClick} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />{action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
