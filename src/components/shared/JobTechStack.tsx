import { Card } from '@/components/taskio/ui';
import type { JobTechnology } from '@/types/api';

type JobTechStackProps = {
  technologies?: JobTechnology[];
  variant?: 'card' | 'inline';
  className?: string;
};

export function JobTechStack({
  technologies = [],
  variant = 'card',
  className = '',
}: JobTechStackProps) {
  if (technologies.length === 0) return null;

  const content = (
    <>
      {variant === 'card' && (
        <h3 className="font-display font-semibold">Stack técnica</h3>
      )}
      <div className={`flex flex-wrap gap-1.5 ${variant === 'card' ? 'mt-3' : ''}`}>
        {technologies.map((t) => (
          <span
            key={t.technology.id}
            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
              t.type === 'REQUIRED' ? 'border-primary/30 bg-primary/5' : 'bg-surface-muted'
            }`}
          >
            {t.technology.name}
            {t.type === 'REQUIRED' ? ' *' : ''}
          </span>
        ))}
      </div>
      {technologies.some((t) => t.type === 'REQUIRED') && (
        <p className={`text-[10px] text-muted-foreground ${variant === 'card' ? 'mt-2' : 'mt-1.5'}`}>
          * tecnologia obrigatória
        </p>
      )}
    </>
  );

  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
  }

  return <Card className={`p-6 ${className}`}>{content}</Card>;
}
