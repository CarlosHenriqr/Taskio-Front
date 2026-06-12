import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Building2, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, Field, Select, TextInput } from '@/components/taskio/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useRegisterEmailField } from '@/lib/validators';
import { mapApiErrors } from '@/lib/utils';

const SEGMENTS = ['Fintech', 'Healthtech', 'E-commerce', 'SaaS B2B', 'Logística', 'Outro'];

type RegisterCompanyFormProps = {
  id?: string;
  'aria-hidden'?: boolean;
};

export function RegisterCompanyForm({ id, 'aria-hidden': ariaHidden }: RegisterCompanyFormProps) {
  const navigate = useNavigate();
  const { registerCompany, isLoading } = useAuth();
  const [name, setName] = useState('');
  const {
    email,
    setEmail,
    onBlur: onEmailBlur,
    error: emailError,
    validateForSubmit: validateEmail,
  } = useRegisterEmailField();
  const [cnpj, setCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [segment, setSegment] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error('Aceite os termos para continuar.');
      return;
    }
    if (!validateEmail()) {
      return;
    }
    setErrors({});
    try {
      const path = await registerCompany({
        name,
        email,
        password,
        cnpj,
        segment: segment || undefined,
      });
      toast.success('Conta criada com sucesso!');
      navigate(path);
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    }
  };

  return (
    <Card className="p-7" id={id} aria-hidden={ariaHidden}>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Crie sua conta de empresa
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Preencha seus dados para iniciar o processo de aprovação na plataforma.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Field label="Nome da empresa" error={errors.name}>
          <TextInput
            placeholder="Ex: Nexo Financial"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="E-mail profissional" error={errors.email ?? emailError}>
          <TextInput
            type="email"
            placeholder="nome@empresa.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={onEmailBlur}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CNPJ" error={errors.cnpj}>
            <TextInput
              placeholder="00.000.000/0000-00"
              icon={Building2}
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
          </Field>
          <Field label="Senha segura" hint="Mínimo 8 caracteres" error={errors.password}>
            <TextInput
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>
        </div>
        <Field label="Área de atuação" error={errors.segment}>
          <Select value={segment} onChange={(e) => setSegment(e.target.value)}>
            <option value="">Selecione um segmento...</option>
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring/40"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            Concordo com os{' '}
            <Link to="/termos" className="font-medium text-primary hover:underline" target="_blank">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link to="/privacidade" className="font-medium text-primary hover:underline" target="_blank">
              Política de Privacidade
            </Link>{' '}
            da TASKIO.
          </span>
        </label>
        <Btn className="w-full" size="lg" type="submit" disabled={isLoading}>
          {isLoading ? 'Criando conta...' : 'Concluir registro'}{' '}
          <ArrowRight className="h-4 w-4" />
        </Btn>
      </form>
    </Card>
  );
}
