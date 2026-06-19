import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Info, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, Field, TextArea, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { PageLoader } from '@/components/feedback/PageLoader';
import { jobsApi } from '@/lib/api/jobs.api';
import { technologiesApi } from '@/lib/api/technologies.api';
import { ApiRequestError } from '@/lib/api/client';
import {
  mapPublishJobApiErrors,
  toIsoDateTimeLocal,
  validatePublishJobForm,
} from '@/lib/publishJobValidation';
import { JobPaymentFields } from '@/components/empresa/JobPaymentFields';
import { TechStackPicker } from '@/components/empresa/TechStackPicker';
import { formatJobPayment, toJobPaymentPayload } from '@/lib/jobPayment';
import { invalidateAfterJobPublish } from '@/lib/queryInvalidation';
import type { JobPaymentType, Technology } from '@/types/api';

export function EmpresaPublishPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const techQuery = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.list(),
  });

  useEffect(() => {
    if (techQuery.isError) {
      toast.error('Não foi possível carregar as tecnologias. Verifique se a API está rodando.');
    }
  }, [techQuery.isError]);

  const createMutation = useMutation({
    mutationFn: () =>
      jobsApi.create({
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
      toast.success('Projeto publicado com sucesso!');
      navigate('/empresa/projetos');
    },
    onError: (err) => {
      const { message, fields } = mapPublishJobApiErrors(err);
      setErrors(fields);
      if (err instanceof ApiRequestError && err.code === 'SESSION_EXPIRED') return;
      toast.error(message);
    },
  });

  const submitPublish = () => {
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
      toast.error('Revise os campos destacados antes de publicar.');
      return;
    }
    createMutation.mutate();
  };

  const techs = techQuery.data ?? [];

  const toggleTech = (id: string, type: 'required' | 'desirable') => {
    if (type === 'required') {
      setRequiredIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
      setDesirableIds((prev) => prev.filter((x) => x !== id));
    } else {
      setDesirableIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
      setRequiredIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const selectedTechs = (ids: string[]) =>
    ids.map((id) => techs.find((t) => t.id === id)).filter(Boolean) as Technology[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPublish();
  };

  usePageShell({
    title: 'Publicar projeto',
    description: 'Defina escopo e requisitos para receber candidatos compatíveis.',
    actions: (
      <>
        <Link to="/empresa/projetos">
          <Btn variant="secondary" size="sm">
            Cancelar
          </Btn>
        </Link>
        <Btn
          size="sm"
          type="submit"
          form="publish-job-form"
          disabled={createMutation.isPending || techQuery.isError}
        >
          {createMutation.isPending ? 'Publicando...' : 'Publicar projeto'}{' '}
          {!createMutation.isPending && <ArrowRight className="h-3.5 w-3.5" />}
        </Btn>
      </>
    ),
  });

  if (techQuery.isLoading) return <PageLoader />;

  return (
    <PageTransition>
        <form id="publish-job-form" onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            <Card className="flex gap-3 border-primary/20 bg-primary/5 p-4 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">Publicação otimizada</p>
                <p className="mt-0.5 text-muted-foreground">
                  Quanto mais detalhada a descrição, melhor o match algorítmico.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Informações principais</h3>
              <div className="mt-4 grid gap-4">
                <Field label="Título do projeto" error={errors.title}>
                  <TextInput
                    placeholder="Ex: Engenheiro de Software Sênior (React/Node)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
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
                  hint="Clique para marcar como obrigatória"
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
                <Field label="Descrição do projeto" error={errors.description}>
                  <TextArea
                    placeholder="Descreva contexto, desafios técnicos e expectativas..."
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Requisitos e diferenciais" error={errors.requirements}>
                  <TextArea
                    placeholder="Habilidades essenciais, anos de experiência..."
                    rows={4}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  />
                </Field>
              </div>
            </Card>

            <div className="flex justify-end lg:hidden">
              <Btn type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Publicando...' : 'Publicar projeto'}
              </Btn>
            </div>
          </div>

          <aside className="space-y-5">
            <Card className="p-6">
              <h3 className="font-display font-semibold">Pré-visualização</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Como freelancers verão seu projeto.
              </p>
              <div className="mt-4 rounded-lg border bg-surface-muted p-4">
                <p className="text-xs font-semibold text-primary">Rascunho</p>
                <p className="mt-1 font-display text-base font-bold">
                  {title || 'Título do projeto'}
                </p>
                <p className="text-xs text-muted-foreground">Sua empresa</p>
                {paymentType && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    {formatJobPayment({
                      paymentType,
                      budgetMin: budgetMin ? Number(budgetMin) : null,
                      budgetMax: budgetMax ? Number(budgetMax) : null,
                      hourlyRate: hourlyRate ? Number(hourlyRate) : null,
                      currency: 'BRL',
                    }) ?? 'Informe os valores de pagamento'}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedTechs(requiredIds)
                    .slice(0, 4)
                    .map((t) => (
                      <span
                        key={t.id}
                        className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
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
