import { Button } from '@/components/ui/Button';
import { Trash2, Loader2, XCircle } from 'lucide-react';

export function BulkActionBar({ count, onClear, onDelete, loading = false, children }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="flex-1" />
      {children}
      {onDelete && (
        <Button variant="outline" size="sm" onClick={onDelete} disabled={loading}
          className="gap-1.5 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
        </Button>
      )}
      {onClear && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}>
          <XCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
