import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, Field, TextArea, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/contexts/AuthContext';
import { jobsApi } from '@/lib/api/jobs.api';
import { technologiesApi } from '@/lib/api/technologies.api';
import { ApiRequestError } from '@/lib/api/client';
import {
  mapPublishJobApiErrors,
  toDateTimeLocalInput,
  toIsoDateTimeLocal,
  validatePublishJobForm,
} from '@/lib/publishJobValidation';
import { JobPaymentFields } from '@/components/empresa/JobPaymentFields';
import { TechStackPicker } from '@/components/empresa/TechStackPicker';
import { jobToPaymentFormValues, toJobPaymentPayload } from '@/lib/jobPayment';
import { invalidateAfterJobPublish } from '@/lib/queryInvalidation';
import type { JobPaymentType, Technology } from '@/types/api';

export function EmpresaEditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [requiredIds, setRequiredIds] = useState<string[]>([]);
  const [desirableIds, setDesirableIds] = useState<string[]>([]);
  const [paymentType, setPaymentType] = useState<JobPaymentType | ''>('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  const jobQuery = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
  });

  const techQuery = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.list(),
  });

  const job = jobQuery.data;
  const isOwner = job?.company?.id === user?.id;

  useEffect(() => {
    if (!job || initialized) return;
    setTitle(job.title);
    setDescription(job.description);
    setRequirements(job.requirements ?? '');
    setDeadline(toDateTimeLocalInput(job.deadline));
    setExpiresAt(toDateTimeLocalInput(job.expiresAt));
    setRequiredIds(
      job.technologies?.filter((t) => t.type === 'REQUIRED').map((t) => t.technology.id) ?? [],
    );
    setDesirableIds(
      job.technologies?.filter((t) => t.type === 'DESIRABLE').map((t) => t.technology.id) ?? [],
    );
    const payment = jobToPaymentFormValues(job);
    setPaymentType(payment.paymentType);
    setBudgetMin(payment.budgetMin);
    setBudgetMax(payment.budgetMax);
    setHourlyRate(payment.hourlyRate);
    setInitialized(true);
  }, [job, initialized]);

  const updateMutation = useMutation({
    mutationFn: () =>
      jobsApi.update(id!, {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || undefined,
        deadline: toIsoDateTimeLocal(deadline),
        expiresAt: toIsoDateTimeLocal(expiresAt),
        requiredTechnologyIds: requiredIds,
        desirableTechnologyIds: desirableIds,
        ...toJobPaymentPayload({ paymentType, budgetMin, budgetMax, hourlyRate }),
      }),
    onSuccess: async () => {
      await invalidateAfterJobPublish(queryClient);
      toast.success('Projeto atualizado com sucesso!');
      navigate(`/empresa/projetos/${id}`);
    },
    onError: (err) => {
      const { message, fields } = mapPublishJobApiErrors(err);
      setErrors(fields);
      if (err instanceof ApiRequestError && err.code === 'SESSION_EXPIRED') return;
      toast.error(message);
    },
  });

  const submit = () => {
    const fieldErrors = validatePublishJobForm({
      title,
      description,
      requirements,
      deadline,
      expiresAt,
      requiredIds,
      desirableIds,
      paymentType,
      budgetMin,
      budgetMax,
      hourlyRate,
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      toast.error('Revise os campos destacados antes de salvar.');
      return;
    }
    updateMutation.mutate();
  };

  const techs = techQuery.data ?? [];

  const toggleTech = (techId: string, type: 'required' | 'desirable') => {
    if (type === 'required') {
      setRequiredIds((prev) =>
        prev.includes(techId) ? prev.filter((x) => x !== techId) : [...prev, techId],
      );
      setDesirableIds((prev) => prev.filter((x) => x !== techId));
    } else {
      setDesirableIds((prev) =>
        prev.includes(techId) ? prev.filter((x) => x !== techId) : [...prev, techId],
      );
      setRequiredIds((prev) => prev.filter((x) => x !== techId));
    }
  };

  const selectedTechs = (ids: string[]) =>
    ids.map((techId) => techs.find((t) => t.id === techId)).filter(Boolean) as Technology[];

  usePageShell({
    title: 'Editar projeto',
    description: job?.title,
    actions:
      job && isOwner ? (
        <>
          <Link to={`/empresa/projetos/${id}`}>
            <Btn variant="secondary" size="sm">
              Cancelar
            </Btn>
          </Link>
          <Btn
            size="sm"
            type="submit"
            form="edit-job-form"
            disabled={updateMutation.isPending || techQuery.isError}
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}{' '}
            {!updateMutation.isPending && <ArrowRight className="h-3.5 w-3.5" />}
          </Btn>
        </>
      ) : undefined,
  });

  if (jobQuery.isLoading || techQuery.isLoading) {
    return <PageLoader />;
  }

  if (jobQuery.isError || !job) {
    return <ErrorState title="Projeto não encontrado" onRetry={() => jobQuery.refetch()} />;
  }

  if (!isOwner) {
    return (
      <ErrorState title="Acesso negado" description="Este projeto não pertence à sua empresa." />
    );
  }

  return (
    <PageTransition>
        <form
          id="edit-job-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid gap-5 lg:grid-cols-[2fr_1fr]"
        >
          <div className="space-y-5">
            <Card className="flex gap-3 border-primary/20 bg-primary/5 p-4 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">Atualização do projeto</p>
                <p className="mt-0.5 text-muted-foreground">
                  Alterações refletem imediatamente para freelancers que visualizam a vaga.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Informações principais</h3>
              <div className="mt-4 grid gap-4">
                <Field label="Título da vaga" error={errors.title}>
                  <TextInput value={title} onChange={(e) => setTitle(e.target.value)} required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Prazo de entrega" error={errors.deadline}>
                    <TextInput
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Data de expiração" error={errors.expiresAt}>
                    <TextInput
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <TechStackPicker
                  label="Stack tecnológica (obrigatória)"
                  error={errors.technologies}
                  technologies={techs}
                  selectedIds={requiredIds}
                  variant="required"
                  onToggle={(id) => toggleTech(id, 'required')}
                />
                <TechStackPicker
                  label="Stack desejável"
                  hint="Tecnologias que agregam, mas não são obrigatórias"
                  technologies={techs}
                  selectedIds={desirableIds}
                  variant="desirable"
                  onToggle={(id) => toggleTech(id, 'desirable')}
                  showChips={false}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Orçamento estimado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Informe quanto você pretende investir no projeto.
              </p>
              <div className="mt-5">
                <JobPaymentFields
                  values={{ paymentType, budgetMin, budgetMax, hourlyRate }}
                  errors={errors}
                  onChange={(patch) => {
                    if (patch.paymentType !== undefined) setPaymentType(patch.paymentType);
                    if (patch.budgetMin !== undefined) setBudgetMin(patch.budgetMin);
                    if (patch.budgetMax !== undefined) setBudgetMax(patch.budgetMax);
                    if (patch.hourlyRate !== undefined) setHourlyRate(patch.hourlyRate);
                  }}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Descrição & requisitos</h3>
              <div className="mt-4 grid gap-4">
                <Field label="Descrição da vaga" error={errors.description}>
                  <TextArea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
                </Field>
                <Field label="Requisitos e diferenciais" error={errors.requirements}>
                  <TextArea rows={4} value={requirements} onChange={(e) => setRequirements(e.target.value)} />
                </Field>
              </div>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="p-6">
              <h3 className="font-display font-semibold">Pré-visualização</h3>
              <div className="mt-4 rounded-lg border bg-surface-muted p-4">
                <p className="font-display text-base font-bold">{title || job.title}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedTechs(requiredIds)
                    .slice(0, 4)
                    .map((t) => (
                      <span
                        key={t.id}
                        className="rounded border bg-surface px-2 py-0.5 text-[10px] font-medium"
                      >
                        {t.name}
                      </span>
                    ))}
                </div>
              </div>
            </Card>
          </aside>
        </form>
    </PageTransition>
  );
}
