import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Calendar,
  CalendarClock,
  Layers,
  Percent,
  Sparkles,
  Star,
  Target,
} from 'lucide-react';
import type { PillFilterOption } from '@/components/shared/PillFilter';

export type MinMatchFilterValue = '' | '20' | '40' | '50' | '70' | '80';
export type TechRoleFilterValue = '' | 'REQUIRED' | 'DESIRABLE';
export type DeadlineFilterValue = '' | '7' | '14' | '30';
export type SortFilterValue = 'match' | 'recent' | 'deadline_asc' | 'deadline_desc';

export const MIN_MATCH_OPTIONS: PillFilterOption<MinMatchFilterValue>[] = [
  { value: '', label: 'Qualquer', icon: Layers, tone: 'neutral' },
  { value: '20', label: '≥ 20%', icon: Percent, tone: 'neutral' },
  { value: '40', label: '≥ 40%', icon: Percent, tone: 'info' },
  { value: '50', label: '≥ 50%', icon: Target, tone: 'info' },
  { value: '70', label: '≥ 70%', icon: Sparkles, tone: 'success' },
  { value: '80', label: '≥ 80%', icon: Star, tone: 'success' },
];

export const TECH_ROLE_OPTIONS: PillFilterOption<TechRoleFilterValue>[] = [
  { value: '', label: 'Todas', icon: Layers, tone: 'primary' },
  { value: 'REQUIRED', label: 'Obrigatórias', icon: Target, tone: 'warning' },
  { value: 'DESIRABLE', label: 'Desejáveis', icon: Sparkles, tone: 'info' },
];

export const DEADLINE_OPTIONS: PillFilterOption<DeadlineFilterValue>[] = [
  { value: '', label: 'Qualquer prazo', icon: Calendar, tone: 'neutral' },
  { value: '7', label: 'Até 7 dias', icon: CalendarClock, tone: 'warning' },
  { value: '14', label: 'Até 14 dias', icon: CalendarClock, tone: 'info' },
  { value: '30', label: 'Até 30 dias', icon: CalendarClock, tone: 'primary' },
];

export const SORT_OPTIONS: PillFilterOption<SortFilterValue>[] = [
  { value: 'match', label: 'Compatibilidade', icon: Sparkles, tone: 'success' },
  { value: 'recent', label: 'Recentes', icon: ArrowDownWideNarrow, tone: 'primary' },
  { value: 'deadline_asc', label: 'Prazo próximo', icon: CalendarClock, tone: 'warning' },
  { value: 'deadline_desc', label: 'Prazo distante', icon: ArrowUpWideNarrow, tone: 'info' },
];
