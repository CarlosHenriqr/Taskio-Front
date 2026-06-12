import { useCallback, useState } from 'react';

export const REGISTER_EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.(com|com\.br|net|org|io|dev)$/i;

export const REGISTER_EMAIL_ERROR =
  'Digite um e-mail válido (ex: nome@empresa.com)';

export function isValidRegisterEmail(email: string): boolean {
  return REGISTER_EMAIL_REGEX.test(email.trim());
}

export function getRegisterEmailError(
  email: string,
  options: { touched: boolean; submit?: boolean },
): string | null {
  const trimmed = email.trim();
  if (!options.submit && !options.touched) return null;
  if (!options.submit && !trimmed) return null;
  if (!isValidRegisterEmail(trimmed)) return REGISTER_EMAIL_ERROR;
  return null;
}

export function useRegisterEmailField(initial = '') {
  const [email, setEmailState] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const syncError = useCallback(
    (value: string, nextTouched: boolean, submit = false) => {
      const message = getRegisterEmailError(value, { touched: nextTouched, submit });
      setError(message ?? undefined);
      return !message;
    },
    [],
  );

  const setEmail = useCallback(
    (value: string) => {
      setEmailState(value);
      if (touched || error) {
        syncError(value, true);
      }
    },
    [touched, error, syncError],
  );

  const onBlur = useCallback(() => {
    setTouched(true);
    syncError(email, true);
  }, [email, syncError]);

  const validateForSubmit = useCallback(() => {
    setTouched(true);
    return syncError(email, true, true);
  }, [email, syncError]);

  return {
    email,
    setEmail,
    onBlur,
    error,
    validateForSubmit,
  };
}
