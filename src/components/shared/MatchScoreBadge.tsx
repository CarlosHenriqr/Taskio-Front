import { Badge } from '@/components/taskio/ui';
import { normalizeMatchPercent } from '@/lib/matching.util';

type MatchScoreBadgeProps = {
  score?: number | null;
  matchScore?: number | null;
  className?: string;
  suffix?: string;
};

function resolveTone(score: number): 'success' | 'warning' | 'neutral' | 'info' {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  if (score > 0) return 'info';
  return 'neutral';
}

function resolveScore(score?: number | null, matchScore?: number | null): number | null {
  if (score !== undefined && score !== null) return score;
  if (matchScore !== undefined && matchScore !== null) return matchScore;
  return null;
}

export function MatchScoreBadge({ score, matchScore, className, suffix = 'match' }: MatchScoreBadgeProps) {
  const resolved = resolveScore(score, matchScore);
  if (resolved === null || resolved <= 0) return null;

  const rounded = normalizeMatchPercent({ matchPercent: resolved });
  return (
    <Badge tone={resolveTone(rounded)} className={className}>
      {rounded}% {suffix}
    </Badge>
  );
}

export function MatchScoreBar({ score, matchScore, className = '' }: MatchScoreBadgeProps) {
  const resolved = resolveScore(score, matchScore);
  if (resolved === null || resolved <= 0) return null;

  const rounded = normalizeMatchPercent({ matchPercent: resolved });
  const barColor =
    rounded >= 70 ? 'bg-success' : rounded >= 40 ? 'bg-warning' : rounded > 0 ? 'bg-info' : 'bg-muted';

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">Compatibilidade</span>
        <span className="font-semibold tabular-nums">{rounded}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${rounded}%` }}
        />
      </div>
    </div>
  );
}
