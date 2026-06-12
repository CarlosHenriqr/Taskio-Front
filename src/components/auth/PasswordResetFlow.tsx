import { useMemo, useState } from 'react';
import { ArrowRight, KeyRound, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { authApi, type PasswordResetAccountType } from '@/lib/api/auth.api';
import { Btn, Field, TextInput } from '@/components/taskio/ui';
import { mapApiErrors } from '@/lib/utils';

type Step = 'email' | 'code' | 'reset';

type PasswordResetFlowProps = {
  accountType?: PasswordResetAccountType;
  /** When set, skips the email step and sends the code to this address. */
  presetEmail?: string;
  onComplete?: () => void;
  compact?: boolean;
};

const STEP_LABELS: Record<Step, string> = {
  email: 'E-mail',
  code: 'Código',
  reset: 'Nova senha',
};

export function PasswordResetFlow({
  accountType = 'user',
  presetEmail,
  onComplete,
  compact = false,
}: PasswordResetFlowProps) {
  const steps = useMemo<Step[]>(
    () => (presetEmail ? ['code', 'reset'] : ['email', 'code', 'reset']),
    [presetEmail],
  );

  const [step, setStep] = useState<Step>(presetEmail ? 'code' : 'email');
  const [email, setEmail] = useState(presetEmail ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeSent, setCodeSent] = useState(false);

  const stepIndex = steps.indexOf(step);
  const btnSize = compact ? 'sm' : 'lg';

  const sendCode = async () => {
    const targetEmail = (presetEmail ?? email).trim().toLowerCase();
    if (!targetEmail) {
      toast.error('Informe o e-mail.');
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.forgotPassword(targetEmail, accountType);
      setEmail(targetEmail);
      setCodeSent(true);
      setStep('code');
      toast.success('Código enviado para seu e-mail.');
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendCode();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: 'Informe o código de 6 dígitos enviado por e-mail.' });
      toast.error('Código inválido. Informe 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyResetCode(email, code, accountType);
      toast.success('Código verificado!');
      setStep('reset');
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        code,
        newPassword,
        confirmNewPassword: confirmPassword,
        type: accountType,
      });
      toast.success('Senha redefinida com sucesso!');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setCodeSent(false);
      setStep(presetEmail ? 'code' : 'email');
      onComplete?.();
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const stepDescription =
    step === 'email'
      ? 'Informe o e-mail da sua conta para receber o código.'
      : step === 'code'
        ? codeSent
          ? `Digite o código enviado para ${email}.`
          : 'Solicite o código de verificação no seu e-mail.'
        : 'Defina sua nova senha.';

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col gap-1">
            <div
              className={`h-1 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <span
              className={`text-[10px] font-medium uppercase tracking-wider ${
                i <= stepIndex ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {STEP_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{stepDescription}</p>

      {step === 'email' && (
        <form className="space-y-4" onSubmit={handleEmail}>
          <Field label="E-mail" error={errors.email}>
            <TextInput
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Btn className="w-full" size={btnSize} type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar código'} <ArrowRight className="h-4 w-4" />
          </Btn>
        </form>
      )}

      {step === 'code' && (
        <div className="space-y-4">
          {presetEmail && !codeSent && (
            <div className="rounded-lg border border-border/70 bg-surface-muted/40 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">Enviar código para</p>
              <p className="mt-0.5 text-muted-foreground">{presetEmail}</p>
              <Btn className="mt-3" size={btnSize} type="button" disabled={loading} onClick={sendCode}>
                {loading ? 'Enviando...' : 'Enviar código'} <ArrowRight className="h-4 w-4" />
              </Btn>
            </div>
          )}

          {(codeSent || !presetEmail) && (
            <form className="space-y-4" onSubmit={handleVerify}>
              <Field label="Código de verificação" error={errors.code} hint="6 dígitos numéricos">
                <TextInput
                  placeholder="000000"
                  icon={KeyRound}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="\d{6}"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </Field>
              <Btn className="w-full" size={btnSize} type="submit" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar código'} <ArrowRight className="h-4 w-4" />
              </Btn>
              <button
                type="button"
                className="w-full text-center text-xs text-primary hover:underline"
                onClick={() => {
                  if (presetEmail) {
                    void sendCode();
                  } else {
                    setStep('email');
                  }
                }}
                disabled={loading}
              >
                Reenviar código
              </button>
            </form>
          )}
        </div>
      )}

      {step === 'reset' && (
        <form className="space-y-4" onSubmit={handleReset}>
          <Field label="Nova senha" error={errors.newPassword} hint="Mínimo 8 caracteres">
            <TextInput
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>
          <Field label="Confirmar senha" error={errors.confirmNewPassword}>
            <TextInput
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>
          <Btn className="w-full" size={btnSize} type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Redefinir senha'} <ArrowRight className="h-4 w-4" />
          </Btn>
        </form>
      )}
    </div>
  );
}
