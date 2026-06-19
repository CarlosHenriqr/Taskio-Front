import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Field, TextInput } from '@/components/taskio/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useSlowActionHint } from '@/hooks/useSlowActionHint';
import { mapApiErrors } from '@/lib/utils';

type LoginCompanyFormProps = {
  'aria-hidden'?: boolean;
};

export function LoginCompanyForm({ 'aria-hidden': ariaHidden }: LoginCompanyFormProps) {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const loadingHint = useSlowActionHint(isLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFormError('');
    try {
      const path = await login(
        { email: identifier.trim(), password, type: 'company' },
        rememberMe,
      );
      navigate(path);
      toast.success('Login realizado com sucesso!');
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setFormError(message);
      setErrors(fields);
      toast.error(message);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
      aria-hidden={ariaHidden}
      id="login-panel-company-form"
    >
      <Field label="E-mail ou CNPJ" htmlFor="identifier-company" error={errors.email}>
        <TextInput
          id="identifier-company"
          type="text"
          autoComplete="username"
          placeholder="seu@email.com ou CNPJ"
          icon={Mail}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </Field>
      <Field label="Senha" htmlFor="senha-company" error={errors.password}>
        <TextInput
          id="senha-company"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Link
          to="/recuperar-senha/empresa"
          className="mt-1 inline-block text-xs font-medium text-primary link-underline"
        >
          Esqueci minha senha
        </Link>
      </Field>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Lembrar de mim neste dispositivo
      </label>
      {formError && !Object.keys(errors).length && (
        <p className="text-sm text-destructive">{formError}</p>
      )}
      <Btn type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? loadingHint : 'Entrar'} <ArrowRight className="h-4 w-4" />
      </Btn>
    </form>
  );
}
