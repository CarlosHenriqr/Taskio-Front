import { parseJobContent } from '@/lib/jobDescription.util';

type JobDescriptionViewProps = {
  description?: string | null;
  requirements?: string | null;
  className?: string;
};

export function JobDescriptionView({
  description,
  requirements,
  className = '',
}: JobDescriptionViewProps) {
  const parsed = parseJobContent(description, requirements);

  if (!parsed.intro && parsed.sections.length === 0 && !parsed.plain) {
    return null;
  }

  return (
    <div className={className}>
      {parsed.plain && (
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {parsed.plain}
        </p>
      )}

      {parsed.intro && (
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {parsed.intro}
        </p>
      )}

      {parsed.sections.map((section, index) => (
        <section
          key={section.title}
          className={`mt-5 pt-5 ${parsed.intro || parsed.plain || index > 0 ? 'border-t border-border' : ''}`}
        >
          <h3 className="font-display text-base font-semibold text-foreground/90">
            {section.title}
          </h3>
          {section.lines.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {section.lines.map((line, i) => (
                <li key={`${section.title}-${i}`}>{line}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
