import { Building2, UserRound } from 'lucide-react';
import { PillFilter, type PillFilterOption } from '@/components/shared/PillFilter';

export type UserTypeFilterValue = 'user' | 'company';

const USER_TYPE_OPTIONS: PillFilterOption<UserTypeFilterValue>[] = [
  { value: 'user', label: 'Freelancers', icon: UserRound, tone: 'primary' },
  { value: 'company', label: 'Empresas', icon: Building2, tone: 'info' },
];

type UserTypeFilterProps = {
  value: UserTypeFilterValue;
  onChange: (value: UserTypeFilterValue) => void;
  className?: string;
};

export function UserTypeFilter({ value, onChange, className }: UserTypeFilterProps) {
  return (
    <PillFilter
      value={value}
      onChange={onChange}
      options={USER_TYPE_OPTIONS}
      ariaLabel="Filtrar por tipo de usuário"
      showCounts={false}
      className={className}
    />
  );
}
