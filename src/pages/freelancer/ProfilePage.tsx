import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, ArrowLeft, User, Settings, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, Field, TextArea, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { AccountSettingsPanel } from '@/components/profile/AccountSettingsPanel';
import { BillingPanel } from '@/components/profile/BillingPanel';
import { ProfileSectionTabs } from '@/components/profile/ProfileSectionTabs';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { TechStackPicker } from '@/components/profile/TechStackPicker';
import { profileApi } from '@/lib/api/profile.api';
import { technologiesApi } from '@/lib/api/technologies.api';
import {
  getResumeUrlError,
  RESUME_URL_ERROR,
  validateFreelancerProfile,
} from '@/lib/profileValidation';
import { mapApiErrors } from '@/lib/utils';
import { invalidateProfile } from '@/lib/queryInvalidation';
import { queryKeys } from '@/lib/queryKeys';
import type { PortfolioItem, SkillLevel } from '@/types/api';

const DEFAULT_SKILL_LEVEL: SkillLevel = 'BASICO';

export type ProfileSection = 'professional' | 'account' | 'billing';

const PROFILE_SECTION_TABS = [
  {
    value: 'professional' as const,
    label: 'Perfil profissional',
    description: 'Bio, stack, currículo e portfólio',
    icon: User,
  },
  {
    value: 'account' as const,
    label: 'Conta e segurança',
    description: 'Foto, dados de acesso e senha',
    icon: Settings,
  },
  {
    value: 'billing' as const,
    label: 'Plano e cobrança',
    description: 'Assinatura, limites e upgrade',
    icon: CreditCard,
  },
] as const;

const SECTION_BY_PARAM: Record<string, ProfileSection> = {
  conta: 'account',
  plano: 'billing',
};

const PARAM_BY_SECTION: Partial<Record<ProfileSection, string>> = {
  account: 'conta',
  billing: 'plano',
};

function resolveSection(searchParams: URLSearchParams): ProfileSection {
  return SECTION_BY_PARAM[searchParams.get('secao') ?? ''] ?? 'professional';
}

export function FreelancerProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [section, setSection] = useState<ProfileSection>(() => resolveSection(searchParams));
  const [bio, setBio] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [resumeUrlError, setResumeUrlError] = useState('');

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.me(user!.id),
    queryFn: () => profileApi.me(),
    enabled: !!user?.id,
  });

  const techQuery = useQuery({
    queryKey: ['technologies'],
    queryFn: () => technologiesApi.list(),
  });

  const profileHydratedRef = useRef(false);

  useEffect(() => {
    profileHydratedRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    setSection(resolveSection(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (!profileQuery.data || profileHydratedRef.current) return;
    profileHydratedRef.current = true;
    setBio(profileQuery.data.bio ?? '');
    setResumeUrl(profileQuery.data.resumeUrl ?? '');
    setSelectedTechIds(
      profileQuery.data.techStack?.map((s) => s.technology.id) ?? [],
    );
  }, [profileQuery.data]);

  const setProfileSection = (next: ProfileSection) => {
    setSection(next);
    const param = PARAM_BY_SECTION[next];
    setSearchParams(param ? { secao: param } : {}, { replace: true });
  };

  const validateResumeField = (value: string) => {
    const err = getResumeUrlError(value);
    setResumeUrlError(err ?? '');
    return !err;
  };

  const resumeMutation = useMutation({
    mutationFn: () => profileApi.updateResume(resumeUrl.trim()),
    onSuccess: async () => {
      await invalidateProfile(queryClient);
      toast.success('Currículo publicado.');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const deleteResumeMutation = useMutation({
    mutationFn: () => profileApi.deleteResume(),
    onSuccess: async () => {
      setResumeUrl('');
      setResumeUrlError('');
      await invalidateProfile(queryClient);
      toast.success('Currículo removido.');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const handleSaveRef = useRef<() => void>(() => {});

  handleSaveRef.current = () => {
    const effectiveResumeUrl = resumeUrl.trim() || profileQuery.data?.resumeUrl?.trim() || '';
    const phone = profileQuery.data?.phone ?? '';
    const err = validateFreelancerProfile(bio, phone, selectedTechIds.length, effectiveResumeUrl);
    if (err) {
      if (err.includes('currículo') || err === RESUME_URL_ERROR) {
        setResumeUrlError(err);
      }
      toast.error(err);
      return;
    }
    setResumeUrlError('');
    saveMutation.mutate(effectiveResumeUrl);
  };

  const saveMutation = useMutation({
    mutationFn: async (effectiveResumeUrl: string) => {
      const savedResumeUrl = profileQuery.data?.resumeUrl?.trim() ?? '';

      if (effectiveResumeUrl && effectiveResumeUrl !== savedResumeUrl) {
        try {
          await profileApi.updateResume(effectiveResumeUrl);
        } catch (err) {
          console.error('[ProfilePage] resume save failed', err);
          throw Object.assign(err instanceof Error ? err : new Error(String(err)), {
            step: 'resume' as const,
          });
        }
      }

      try {
        await profileApi.updateUser({ bio: bio.trim() });
      } catch (err) {
        console.error('[ProfilePage] bio save failed', err);
        await invalidateProfile(queryClient);
        throw Object.assign(err instanceof Error ? err : new Error(String(err)), {
          step: 'profile' as const,
        });
      }

      const skills = selectedTechIds.map((technologyId) => ({
        technologyId,
        level: DEFAULT_SKILL_LEVEL,
      }));

      try {
        await profileApi.updateTechStack(skills);
      } catch (err) {
        console.error('[ProfilePage] tech stack save failed', err);
        await invalidateProfile(queryClient);
        throw Object.assign(err instanceof Error ? err : new Error(String(err)), {
          step: 'stack' as const,
        });
      }
    },
    onSuccess: async () => {
      await invalidateProfile(queryClient);
      toast.success('Perfil atualizado.');
      navigate('/freelancer/perfil');
    },
    onError: (err: Error & { step?: 'resume' | 'profile' | 'stack' }) => {
      const { message } = mapApiErrors(err);
      const stepMessages: Record<string, string> = {
        resume: 'Erro ao publicar currículo',
        profile: 'Erro ao salvar bio',
        stack: 'Bio salva, mas falha ao salvar stack tecnológica',
      };
      const prefix = err.step ? stepMessages[err.step] : 'Erro ao salvar perfil';
      toast.error(`${prefix}: ${message}`);
    },
  });

  const profile = profileQuery.data;
  const isProfessional = section === 'professional';

  const sectionDescriptions: Record<ProfileSection, string> = {
    professional: 'Monte um perfil técnico completo para matching e candidaturas.',
    account: 'Gerencie identidade, contato e credenciais de acesso.',
    billing: 'Acompanhe seu plano, limites de uso e faça upgrade.',
  };

  usePageShell({
    title: 'Configurações',
    description: sectionDescriptions[section],
    primaryAction: { label: 'Ver projetos', to: '/freelancer/projetos' },
    actionsRevision: `${section}:${profileQuery.isLoading}:${profileQuery.isError}:${saveMutation.isPending}`,
    actions:
      isProfessional && !profileQuery.isLoading && !profileQuery.isError ? (
        <>
          <Link to="/freelancer/perfil">
            <Btn variant="secondary" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Ver perfil
            </Btn>
          </Link>
          <Btn size="sm" onClick={() => handleSaveRef.current()} disabled={saveMutation.isPending}>
            <Save className="h-3.5 w-3.5" /> Salvar perfil
          </Btn>
        </>
      ) : undefined,
  });

  const toggleTech = (technologyId: string) => {
    setSelectedTechIds((prev) =>
      prev.includes(technologyId)
        ? prev.filter((id) => id !== technologyId)
        : [...prev, technologyId],
    );
  };

  const publishResume = () => {
    if (!validateResumeField(resumeUrl)) {
      toast.error(resumeUrlError || RESUME_URL_ERROR);
      return;
    }
    resumeMutation.mutate();
  };

  if (profileQuery.isLoading) {
    return <PageLoader />;
  }

  if (profileQuery.isError) {
    return <ErrorState onRetry={() => profileQuery.refetch()} />;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <ProfileSectionTabs
          value={section}
          onChange={setProfileSection}
          options={PROFILE_SECTION_TABS}
        />

        {section === 'professional' ? (
          <>
            <Card className="p-6">
              <h3 className="font-display font-semibold">Bio</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Descreva sua experiência e especialidades para empresas e o sistema de matching.
              </p>
              <div className="mt-4">
                <Field label="Bio" required hint="Mínimo 10 caracteres">
                  <TextArea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} required />
                </Field>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Currículo</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Obrigatório para se candidatar. Cole um link público do seu CV em PDF hospedado no
                Google Drive, Dropbox, OneDrive ou LinkedIn.
              </p>
              <div className="mt-4 space-y-3">
                <Field
                  label="URL do currículo"
                  required
                  error={resumeUrlError}
                  hint="Ex.: drive.google.com, dropbox.com, onedrive.live.com, linkedin.com"
                >
                  <TextInput
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => {
                      setResumeUrl(e.target.value);
                      if (resumeUrlError) setResumeUrlError('');
                    }}
                    onBlur={() => {
                      if (resumeUrl.trim()) validateResumeField(resumeUrl);
                    }}
                    placeholder="https://drive.google.com/file/d/..."
                    required
                  />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Btn
                    type="button"
                    size="sm"
                    disabled={!resumeUrl.trim() || resumeMutation.isPending}
                    onClick={publishResume}
                  >
                    {resumeMutation.isPending ? 'Salvando...' : 'Publicar currículo'}
                  </Btn>
                  {profile?.resumeUrl && (
                    <>
                      <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                        <Btn type="button" size="sm" variant="secondary">
                          Ver currículo atual
                        </Btn>
                      </a>
                      <Btn
                        type="button"
                        size="sm"
                        variant="danger"
                        disabled={deleteResumeMutation.isPending}
                        onClick={() => deleteResumeMutation.mutate()}
                      >
                        Remover
                      </Btn>
                    </>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold">
                Stack tecnológica <span className="text-destructive">*</span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecione ao menos uma tecnologia. Gravado ao clicar em Salvar perfil.
              </p>
              <TechStackPicker
                technologies={techQuery.data ?? []}
                selectedIds={selectedTechIds}
                onToggle={toggleTech}
                isLoading={techQuery.isLoading}
                isError={techQuery.isError}
                onRetry={() => techQuery.refetch()}
              />
            </Card>

            <ExperienceSection
              experiences={profile?.experiences ?? []}
              onChange={() => invalidateProfile(queryClient)}
            />
            <PortfolioSection
              items={profile?.portfolio ?? []}
              onChange={() => invalidateProfile(queryClient)}
            />
          </>
        ) : section === 'billing' ? (
          <BillingPanel />
        ) : (
          <AccountSettingsPanel profile={profile!} />
        )}
      </div>
    </PageTransition>
  );
}

function PortfolioSection({
  items,
  onChange,
}: {
  items: PortfolioItem[];
  onChange: () => void | Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const add = async () => {
    try {
      await profileApi.createPortfolio({ title, url, description });
      toast.success('Item adicionado ao portfólio.');
      setTitle('');
      setUrl('');
      setDescription('');
      await onChange();
    } catch (err) {
      toast.error(mapApiErrors(err).message);
    }
  };

  const remove = async (id: string) => {
    try {
      await profileApi.deletePortfolio(id);
      toast.success('Item removido.');
      await onChange();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold">Portfólio</h3>
      <div className="mt-4 space-y-4">
        {items.map((p) => (
          <div key={p.id} className="flex items-start justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{p.title}</p>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-primary">
                  {p.url}
                </a>
              )}
            </div>
            <Btn size="sm" variant="ghost" onClick={() => remove(p.id)}>
              <Trash2 className="h-4 w-4" />
            </Btn>
          </div>
        ))}
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextInput placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <TextArea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        <Btn size="sm" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar ao portfólio
        </Btn>
      </div>
    </Card>
  );
}
