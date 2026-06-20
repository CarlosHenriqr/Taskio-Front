import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Building2, Shield, Mail, Phone, Settings, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { AvatarUpload } from '@/components/taskio/AvatarUpload';
import { Badge, Btn, Card, Field, TextInput } from '@/components/taskio/ui';
import { PasswordResetFlow } from '@/components/auth/PasswordResetFlow';
import { ProfileSectionTabs } from '@/components/profile/ProfileSectionTabs';
import { BillingPanel } from '@/components/profile/BillingPanel';
import { PageTransition } from '@/components/layout/PageTransition';
import { usePageShell } from '@/contexts/ShellContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { profileApi } from '@/lib/api/profile.api';
import { isValidPhone, normalizePhoneDigits } from '@/lib/profileValidation';
import { mapApiErrors } from '@/lib/utils';
import { invalidateProfile } from '@/lib/queryInvalidation';
import { queryKeys } from '@/lib/queryKeys';
import type { ComponentType } from 'react';

type AccountSection = 'account' | 'billing';

const ACCOUNT_SECTION_TABS = [
  {
    value: 'account' as const,
    label: 'Conta e segurança',
    description: 'Logo, dados de acesso e senha',
    icon: Settings,
  },
  {
    value: 'billing' as const,
    label: 'Plano e cobrança',
    description: 'Assinatura, limites e upgrade',
    icon: CreditCard,
  },
] as const;

const SECTION_BY_PARAM: Record<string, AccountSection> = { plano: 'billing' };
const PARAM_BY_SECTION: Partial<Record<AccountSection, string>> = { billing: 'plano' };

function resolveSection(searchParams: URLSearchParams): AccountSection {
  return SECTION_BY_PARAM[searchParams.get('secao') ?? ''] ?? 'account';
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-border/70 bg-surface-muted/30 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function EmpresaAccountPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [section, setSection] = useState<AccountSection>(() => resolveSection(searchParams));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.me(user!.id),
    queryFn: () => profileApi.me(),
    enabled: !!user?.id,
  });

  useEffect(() => {
    setSection(resolveSection(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name ?? '');
      setPhone(profileQuery.data.phone ?? '');
    }
  }, [profileQuery.data]);

  const isDirty = useMemo(
    () =>
      name !== (profileQuery.data?.name ?? '') ||
      phone !== (profileQuery.data?.phone ?? ''),
    [name, phone, profileQuery.data?.name, profileQuery.data?.phone],
  );

  const setAccountSection = (next: AccountSection) => {
    setSection(next);
    const param = PARAM_BY_SECTION[next];
    setSearchParams(param ? { secao: param } : {}, { replace: true });
  };

  const saveProfileMutation = useMutation({
    mutationFn: () =>
      profileApi.updateCompany({
        name: name.trim(),
        phone: normalizePhoneDigits(phone),
      }),
    onSuccess: async () => {
      await invalidateProfile(queryClient);
      toast.success('Dados da conta atualizados.');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const handleSaveProfile = () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error('Informe a razão social com pelo menos 2 caracteres.');
      return;
    }
    const phoneDigits = normalizePhoneDigits(phone);
    if (phoneDigits && !isValidPhone(phone)) {
      toast.error('Informe um telefone válido (10 ou 11 dígitos).');
      return;
    }
    saveProfileMutation.mutate();
  };

  const sectionDescriptions: Record<AccountSection, string> = {
    account: 'Gerencie os dados de acesso e a segurança da empresa.',
    billing: 'Acompanhe seu plano, limites de uso e faça upgrade.',
  };

  usePageShell({
    title: 'Configurar conta',
    description: sectionDescriptions[section],
  });

  if (profileQuery.isLoading) {
    return <PageLoader />;
  }

  if (profileQuery.isError) {
    return <ErrorState onRetry={() => profileQuery.refetch()} />;
  }

  const profile = profileQuery.data!;

  return (
    <PageTransition>
      <div className="space-y-6">
        <ProfileSectionTabs
          value={section}
          onChange={setAccountSection}
          options={ACCOUNT_SECTION_TABS}
        />

        {section === 'billing' ? (
          <BillingPanel />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            <Card className="overflow-hidden">
              <SectionHeader
                icon={Building2}
                title="Logo e identidade"
                description="Logo, razão social e contato que aparecem para os freelancers."
              />
              <div className="p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="shrink-0">
                    <AvatarUpload
                      name={profile.name}
                      avatarUrl={profile.avatarUrl}
                      onUpload={async (file) => {
                        const data = await profileApi.uploadCompanyAvatar(file);
                        await invalidateProfile(queryClient);
                        return data;
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Razão social / Nome">
                        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
                      </Field>
                      <Field label="E-mail">
                        <div className="space-y-2">
                          <TextInput value={profile.email ?? ''} disabled icon={Mail} />
                          <Badge tone="outline">Não editável</Badge>
                        </div>
                      </Field>
                      <Field
                        label="Telefone"
                        className="sm:col-span-2"
                        hint="10 ou 11 dígitos (com DDD)"
                      >
                        <TextInput
                          icon={Phone}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="48999999999"
                        />
                      </Field>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                      <Btn
                        type="button"
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={saveProfileMutation.isPending || !isDirty}
                      >
                        <Save className="h-3.5 w-3.5" />
                        {saveProfileMutation.isPending ? 'Salvando...' : 'Salvar dados'}
                      </Btn>
                      {isDirty && (
                        <span className="text-xs text-muted-foreground">Alterações não salvas</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <SectionHeader
                icon={Shield}
                title="Segurança"
                description="Redefina sua senha com um código enviado ao e-mail da conta."
              />
              <div className="p-6">
                <PasswordResetFlow accountType="company" presetEmail={profile.email} compact />
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
