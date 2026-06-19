export type JobDescriptionSection = {
  title: string;
  lines: string[];
};

export type ParsedJobDescription = {
  intro?: string;
  sections: JobDescriptionSection[];
  /** Texto bruto quando não há seções detectadas */
  plain?: string;
};

const SECTION_HEADERS = [
  'Atividades',
  'Requisitos',
  'Diferenciais',
  'Contratação',
  'Contratacao',
  'Perfil desejado',
  'Benefícios',
  'Beneficios',
  'Responsabilidades',
  'O que você vai fazer',
  'O que voce vai fazer',
  'Sobre o projeto',
  'Sobre a vaga',
];

function normalizeHeader(line: string): string {
  return line.trim().replace(/:$/, '');
}

function isSectionHeader(line: string): boolean {
  const normalized = normalizeHeader(line).toLowerCase();
  return SECTION_HEADERS.some((h) => h.toLowerCase() === normalized);
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function parseJobDescription(text: string | null | undefined): ParsedJobDescription {
  if (!text?.trim()) {
    return { sections: [] };
  }

  const lines = splitLines(text);
  if (lines.length === 0) {
    return { sections: [] };
  }

  const sections: JobDescriptionSection[] = [];
  const introLines: string[] = [];
  let currentSection: JobDescriptionSection | null = null;
  let foundHeader = false;

  for (const line of lines) {
    if (isSectionHeader(line)) {
      foundHeader = true;
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { title: normalizeHeader(line), lines: [] };
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(line);
    } else {
      introLines.push(line);
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  if (!foundHeader) {
    return { sections: [], plain: text.trim() };
  }

  const intro = introLines.length > 0 ? introLines.join('\n') : undefined;
  return { intro, sections };
}

/** Combina description + requirements em um único conteúdo parseável */
export function parseJobContent(
  description: string | null | undefined,
  requirements?: string | null,
): ParsedJobDescription {
  const main = parseJobDescription(description);

  if (!requirements?.trim()) {
    return main;
  }

  const reqParsed = parseJobDescription(requirements);
  const reqSection: JobDescriptionSection = {
    title: 'Requisitos',
    lines:
      reqParsed.plain
        ? splitLines(reqParsed.plain)
        : [
            ...(reqParsed.intro ? [reqParsed.intro] : []),
            ...reqParsed.sections.flatMap((s) => s.lines),
          ],
  };

  if (reqSection.lines.length === 0) {
    return main;
  }

  const hasReqSection = main.sections.some(
    (s) => s.title.toLowerCase() === 'requisitos',
  );
  if (hasReqSection) {
    return main;
  }

  return {
    ...main,
    sections: [...main.sections, reqSection],
  };
}

/** Primeiro parágrafo / intro para preview em cards */
export function getJobDescriptionPreview(text: string | null | undefined, maxLength = 160): string {
  if (!text?.trim()) return '';

  const parsed = parseJobDescription(text);
  const source = parsed.intro ?? parsed.plain ?? text.trim();
  const firstParagraph = source.split(/\n\n|\n/)[0]?.trim() ?? source;

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }
  return `${firstParagraph.slice(0, maxLength).trim()}…`;
}
