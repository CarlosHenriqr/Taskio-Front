const BIO_MIN_LENGTH = 10;

export const RESUME_ALLOWED_HOSTS = [
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'www.dropbox.com',
  'dl.dropboxusercontent.com',
  'onedrive.live.com',
  '1drv.ms',
  'linkedin.com',
  'www.linkedin.com',
] as const;

export const RESUME_URL_ERROR =
  'Use link público do Google Drive, Dropbox, OneDrive ou LinkedIn.';

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhoneDigits(phone);
  return digits.length >= 10 && digits.length <= 11;
}

export function isAllowedResumeHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return RESUME_ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}

export function isValidResumeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return isAllowedResumeHost(parsed.hostname);
  } catch {
    return false;
  }
}

export function getResumeUrlError(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return 'Informe a URL do currículo.';
  if (!isValidResumeUrl(trimmed)) return RESUME_URL_ERROR;
  return null;
}

export function validateFreelancerProfile(
  bio: string,
  phone: string,
  techCount: number,
  resumeUrl: string,
): string | null {
  const bioTrimmed = bio.trim();
  if (!bioTrimmed) return 'A bio é obrigatória.';
  if (bioTrimmed.length < BIO_MIN_LENGTH) {
    return `A bio deve ter pelo menos ${BIO_MIN_LENGTH} caracteres.`;
  }
  if (!isValidPhone(phone)) {
    return 'Informe um telefone válido na aba Conta e segurança (10 ou 11 dígitos).';
  }
  if (techCount < 1) {
    return 'Selecione ao menos uma tecnologia na stack.';
  }
  const resumeErr = getResumeUrlError(resumeUrl);
  if (resumeErr) return resumeErr;
  return null;
}
