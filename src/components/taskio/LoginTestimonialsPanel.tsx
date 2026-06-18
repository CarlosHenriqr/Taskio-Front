import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Testimonial = {
  id: string;
  name: string;
  quote: string;
  rating: string;
  initials: string;
  avatarClass: string;
  className: string;
  floatDelay: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'avery',
    name: 'Avery Davis',
    quote:
      'O que me surpreendeu foi a qualidade das empresas. Não tem aquele cliente que some depois de aprovar o briefing. A Taskio filtra bem dos dois lados.',
    rating: '4.9',
    initials: 'AD',
    avatarClass: 'from-rose-400 to-orange-500',
    className:
      'right-[-4%] top-[2%] z-30 max-w-[min(42vw,200px)] sm:right-0 sm:max-w-[185px] lg:max-w-[195px]',
    floatDelay: 0,
  },
  {
    id: 'donna',
    name: 'Donna Stroupe',
    quote:
      'Antes da Taskio, ficava semanas procurando projetos bons no LinkedIn. Aqui, em dois dias já estava onboard em uma startup de fintech. O processo é sério, os clientes também.',
    rating: '4.9',
    initials: 'DS',
    avatarClass: 'from-amber-300 to-yellow-500',
    className:
      'left-[-4%] top-[28%] z-30 max-w-[min(42vw,200px)] sm:left-0 sm:max-w-[185px] lg:max-w-[195px]',
    floatDelay: 0.6,
  },
  {
    id: 'howard',
    name: 'Howard Ong',
    quote:
      'Recebi propostas alinhadas com minha senioridade desde o primeiro dia. Nada de projetos pagando R$50 por hora por trabalho que vale dez vezes mais.',
    rating: '4.9',
    initials: 'HO',
    avatarClass: 'from-sky-500 to-indigo-600',
    className:
      'right-[-4%] top-[36%] z-20 max-w-[min(42vw,200px)] sm:right-0 sm:max-w-[185px] lg:max-w-[195px]',
    floatDelay: 1.2,
  },
  {
    id: 'chiaki',
    name: 'Chiaki Sato',
    quote:
      'Já usei outras plataformas, mas nenhuma tinha o nível técnico de matching que a Taskio tem. Me conectaram com um projeto de ML exatamente na stack que eu trabalho.',
    rating: '4.9',
    initials: 'CS',
    avatarClass: 'from-slate-600 to-slate-800',
    className:
      'bottom-[0%] left-[-4%] z-30 max-w-[min(42vw,200px)] sm:left-0 sm:max-w-[185px] lg:max-w-[200px]',
    floatDelay: 1.8,
  },
];

function DotGrid({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-4 gap-1.5 opacity-35', className)} aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
      ))}
    </div>
  );
}

function TestimonialsBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a4a45] via-[#0d6b63] to-[#15803d]" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 28px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 22px)
          `,
        }}
      />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#052e2b]/70 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-[40%] bg-[#064e3b]/80 blur-2xl" />
      <div className="absolute -right-10 top-1/3 h-48 w-48 rounded-full bg-[#0f766e]/40 blur-2xl" />
      <DotGrid className="absolute left-[8%] top-[22%]" />
      <DotGrid className="absolute bottom-[18%] right-[10%]" />
    </>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <motion.article
      className={cn('absolute rounded-2xl bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)]', t.className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, -7, 0] }}
      transition={{
        opacity: { duration: 0.5, delay: t.floatDelay * 0.15 },
        y: { duration: 4.5 + t.floatDelay, repeat: Infinity, ease: 'easeInOut', delay: t.floatDelay },
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-inner',
            t.avatarClass,
          )}
        >
          {t.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <p className="truncate text-sm font-semibold text-gray-900">{t.name}</p>
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-primary px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary-foreground">
              <Star className="h-2.5 w-2.5 fill-current" />
              {t.rating}/5
            </span>
          </div>
        </div>
      </div>
      <p className="mt-2 line-clamp-4 text-[10px] leading-snug text-gray-600 sm:text-[11px]">
        &ldquo;{t.quote}&rdquo;
      </p>
    </motion.article>
  );
}

function PhoneMockup() {
  return (
    <motion.div
      className="absolute left-1/2 top-[54%] z-20 w-[min(72vw,320px)] -translate-x-1/2 -translate-y-1/2 sm:w-[300px] lg:w-[420px] xl:w-[520px]"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative">
        <div className="absolute -left-[5px] top-[18%] h-8 w-[5px] rounded-l-full bg-zinc-600" aria-hidden />
        <div className="absolute -left-[5px] top-[28%] h-14 w-[5px] rounded-l-full bg-zinc-600" aria-hidden />
        <div className="absolute -left-[5px] top-[42%] h-14 w-[5px] rounded-l-full bg-zinc-600" aria-hidden />
        <div className="absolute -right-[5px] top-[26%] h-20 w-[5px] rounded-r-full bg-zinc-600" aria-hidden />

        <div className="rounded-[4rem] border-[8px] border-black bg-black p-[6px] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="relative overflow-hidden rounded-[3.3rem] bg-white">
            <div
              className="absolute left-1/2 top-4 z-50 h-[42px] w-[140px] -translate-x-1/2 rounded-full bg-black"
              aria-hidden
            />

            <div className="px-8 pb-10 pt-20">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Plataforma técnica
              </span>

              <h3 className="mt-4 text-[28px] font-black leading-[0.92] tracking-tight text-black sm:text-[34px] lg:text-[42px]">
                Talentos
                <br />
                técnicos
                <br />
                <span className="text-primary">qualificados</span> para
                <br />
                projetos sérios
              </h3>

              <p className="mt-6 text-sm leading-relaxed text-zinc-500">
                Conectamos empresas a profissionais especializados com matching técnico e validação
                de experiência profissional.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-semibold text-white">
                  Publicar um projeto
                  <ArrowRight className="h-4 w-4" />
                </div>

                <div className="w-full rounded-xl border py-4 text-center text-sm font-semibold">
                  Sou freelancer
                </div>
              </div>

              <div className="mt-8 space-y-3 border-t pt-6">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Onboarding em 48h
                </div>

                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Suporte com background técnico
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-3 left-1/2 h-[5px] w-[140px] -translate-x-1/2 rounded-full bg-zinc-300"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LoginTestimonialsPanel() {
  return (
    <aside
      className="relative h-full min-h-[min(62vh,620px)] w-full overflow-hidden lg:min-h-screen"
      aria-label="Depoimentos"
    >
      <TestimonialsBackground />

      <div className="relative flex h-full flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <motion.header
          className="relative z-10 shrink-0"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="inline-block rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
            Guest Testimonial
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            What They Say?
          </h2>
        </motion.header>

        <div className="relative mx-auto mt-4 w-full max-w-lg flex-1 sm:max-w-xl lg:mt-2 lg:max-w-2xl">
          <div className="relative h-full min-h-[440px] w-full sm:min-h-[500px] lg:min-h-[600px]">
            <svg
              className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full lg:block"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M 78 22 Q 58 38 50 45" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="0.35" />
              <path d="M 22 42 Q 38 48 50 52" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="0.35" />
              <path d="M 20 78 Q 36 68 50 62" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="0.35" />
              <path d="M 80 55 Q 64 52 50 50" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="0.35" />
            </svg>

            <PhoneMockup />
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
