import { Wallet } from 'lucide-react';
import type { Job } from '@/types/api';
import { formatJobPayment } from '@/lib/jobPayment';
import { cn } from '@/lib/utils';

type JobPaymentBlockProps = {
  payment: Pick<Job, 'paymentType' | 'budgetMin' | 'budgetMax' | 'hourlyRate' | 'currency'> | null | undefined;
  className?: string;
};

export function JobPaymentBlock({ payment, className }: JobPaymentBlockProps) {
  const label = payment ? formatJobPayment(payment) : null;
  if (!label) return null;

  return (
    <div
      className={cn(
        'rounded-lg border border-primary/20 bg-primary/5 px-4 py-3',
        className,
      )}
    >
      <p className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary/80">
        <Wallet className="h-3 w-3" />
        Orçamento estimado
      </p>
      <p className="mt-1 text-sm font-semibold text-primary">{label}</p>
    </div>
  );
}
