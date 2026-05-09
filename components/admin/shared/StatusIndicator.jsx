import { CheckCircle2, FileEdit, ToggleRight, ToggleLeft } from 'lucide-react';

const presets = {
  published: { icon: CheckCircle2, className: 'text-emerald-500' },
  draft: { icon: FileEdit, className: 'text-amber-500' },
  active: { icon: ToggleRight, className: 'text-green-500' },
  inactive: { icon: ToggleLeft, className: 'text-muted-foreground' },
  visible: { icon: CheckCircle2, className: 'text-emerald-500' },
  hidden: { icon: FileEdit, className: 'text-muted-foreground' },
};

export function StatusIndicator({ status, size = 'h-4 w-4', showLabel = false, showIcon = true }) {
  const preset = presets[status];
  if (!preset) return null;
  const Icon = preset.icon;
  
  return (
    <div className="flex items-center gap-1.5 flex-none">
      {showIcon && <Icon className={`${size} ${preset.className}`} />}
      {showLabel && (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${preset.className}`}>
          {status}
        </span>
      )}
    </div>
  );
}
