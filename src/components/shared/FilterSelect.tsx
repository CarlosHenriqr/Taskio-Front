import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

export function FilterSelect({ className, children, ...props }: FilterSelectProps) {
  return (
    <div className="relative min-w-0">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-lg border border-border/70 bg-surface py-2 pl-3 pr-9 text-sm outline-none transition-colors duration-200',
          'hover:border-primary/25 focus:border-primary focus:ring-1 focus:ring-primary/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
    </div>
  );
}
