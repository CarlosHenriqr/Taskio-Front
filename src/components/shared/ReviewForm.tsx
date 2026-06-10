import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Star, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, Field, TextArea } from '@/components/taskio/ui';
import { reviewsApi } from '@/lib/api/reviews.api';
import { mapApiErrors } from '@/lib/utils';
import type { ApplicationReviewStatus } from '@/types/api';

type ReviewFormProps = {
  applicationId: string;
  title: string;
  reviewStatus?: ApplicationReviewStatus | null;
  isLoading?: boolean;
  onSuccess?: () => void;
};

export function ReviewForm({
  applicationId,
  title,
  reviewStatus,
  isLoading,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        applicationId,
        rating,
        comment: comment || undefined,
      }),
    onSuccess: () => {
      toast.success('Avaliação enviada!');
      setComment('');
      onSuccess?.();
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
      </Card>
    );
  }

  if (!reviewStatus?.canReview) {
    const alreadyReviewed =
      reviewStatus &&
      (reviewStatus.userReviewed || reviewStatus.companyReviewed) &&
      !reviewStatus.canReview;

    if (alreadyReviewed) {
      return (
        <Card className="border-success/30 bg-success/5 p-6">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="font-display font-semibold text-success">Avaliação enviada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Obrigado pelo feedback. Sua avaliação já foi registrada neste projeto.
              </p>
            </div>
          </div>
        </Card>
      );
    }

    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold flex items-center gap-2">
        <Star className="h-4 w-4 text-warning" />
        {title}
      </h3>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          reviewMutation.mutate();
        }}
      >
        <Field label="Nota (1-5)">
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
          />
        </Field>
        <Field label="Comentário">
          <TextArea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Compartilhe como foi a experiência neste projeto."
          />
        </Field>
        <Btn type="submit" className="w-full" disabled={reviewMutation.isPending}>
          Enviar avaliação
        </Btn>
      </form>
    </Card>
  );
}
