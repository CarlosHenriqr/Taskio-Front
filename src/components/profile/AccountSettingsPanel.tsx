import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, Save, Shield, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordResetFlow } from '@/components/auth/PasswordResetFlow';
import { AvatarUpload } from '@/components/taskio/AvatarUpload';
import { Badge, Btn, Card, Field, TextInput } from '@/components/taskio/ui';
import { profileApi } from '@/lib/api/profile.api';
import { isValidPhone, normalizePhoneDigits } from '@/lib/profileValidation';
import { mapApiErrors } from '@/lib/utils';
import { invalidateProfile } from '@/lib/queryInvalidation';
import type { UserProfile } from '@/types/api';
import { PlanUsageCard } from '@/components/plans/PlanUsageCard';

type AccountSettingsPanelProps = {
  profile: UserProfile;
};

export function AccountSettingsPanel({ profile }: AccountSettingsPanelProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setName(profile.name ?? '');
    setPhone(profile.phone ?? '');
  }, [profile.name, profile.phone]);

  const isDirty = useMemo(
    () => name !== (profile.name ?? '') || phone !== (profile.phone ?? ''),
    [name, phone, profile.name, profile.phone],
  );

  const saveProfileMutation = useMutation({
    mutationFn: () =>
      profileApi.updateUser({ name: name.trim(), phone: normalizePhoneDigits(phone) }),
    onSuccess: async () => {
      await invalidateProfile(queryClient);
      toast.success('Dados da conta atualizados.');
    },
    onError: (err) => toast.error(mapApiErrors(err).message),
  });

  const handleSaveProfile = () => {
    if (name.trim().length < 2) {
      toast.error('Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error('Informe um telefone válido (10 ou 11 dígitos).');
      return;
    }
    saveProfileMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PlanUsageCard />

      <Card className="overflow-hidden">
        <div className="border-b border-border/70 bg-surface-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Identidade da conta</h3>
              <p className="text-sm text-muted-foreground">
                Foto, nome e contato usados no seu perfil e candidaturas.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <AvatarUpload
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                onUpload={async (file) => {
                  const data = await profileApi.uploadUserAvatar(file);
                  await invalidateProfile(queryClient);
                  return data;
                }}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo">
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
                  required
                  hint="10 ou 11 dígitos (com DDD)"
                >
                  <TextInput
                    icon={Phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="48999999999"
                    required
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                <Btn
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
        <div className="border-b border-border/70 bg-surface-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Segurança</h3>
              <p className="text-sm text-muted-foreground">
                Redefina sua senha com código enviado ao e-mail da conta.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <PasswordResetFlow accountType="user" presetEmail={profile.email} compact />
        </div>
      </Card>
    </div>
  );
}
