import { useRef, useState } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { Btn, Card, Field, Select, TextArea, TextInput } from '@/components/taskio/ui';
import { profileApi } from '@/lib/api/profile.api';
import {
  DEFAULT_JOB_ROLE,
  JOB_ROLE_OTHER_VALUE,
  isKnownJobRole,
  jobRolesByCategory,
  resolveRoleTitle,
} from '@/lib/jobRoles';
import { mapApiErrors } from '@/lib/utils';
import type { CreateExperiencePayload, Experience } from '@/types/api';

function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function experienceToFormState(e: Experience) {
  const roleTitle = e.roleTitle ?? '';
  const known = roleTitle && isKnownJobRole(roleTitle);
  return {
    rolePreset: known ? roleTitle : JOB_ROLE_OTHER_VALUE,
    roleCustom: known ? '' : roleTitle,
    company: e.companyName,
    startDate: isoToDateInput(e.startDate),
    endDate: isoToDateInput(e.endDate),
    isCurrent: !e.endDate,
    description: e.description ?? '',
  };
}

function emptyFormState() {
  return {
    rolePreset: DEFAULT_JOB_ROLE,
    roleCustom: '',
    company: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  };
}

type ExperienceSectionProps = {
  experiences: Experience[];
  onChange: () => void | Promise<void>;
};

export function ExperienceSection({ experiences, onChange }: ExperienceSectionProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rolePreset, setRolePreset] = useState(DEFAULT_JOB_ROLE);
  const [roleCustom, setRoleCustom] = useState('');
  const [company, setCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');

  const roleGroups = jobRolesByCategory();

  const resetForm = () => {
    const empty = emptyFormState();
    setEditingId(null);
    setRolePreset(empty.rolePreset);
    setRoleCustom(empty.roleCustom);
    setCompany(empty.company);
    setStartDate(empty.startDate);
    setEndDate(empty.endDate);
    setIsCurrent(empty.isCurrent);
    setDescription(empty.description);
  };

  const startEdit = (experience: Experience) => {
    const state = experienceToFormState(experience);
    setEditingId(experience.id);
    setRolePreset(state.rolePreset);
    setRoleCustom(state.roleCustom);
    setCompany(state.company);
    setStartDate(state.startDate);
    setEndDate(state.endDate);
    setIsCurrent(state.isCurrent);
    setDescription(state.description);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const buildPayload = (): CreateExperiencePayload | null => {
    const roleTitle = resolveRoleTitle(rolePreset, roleCustom);
    if (!roleTitle) {
      toast.error('Informe o cargo.');
      return null;
    }
    if (!company.trim()) {
      toast.error('Informe a empresa.');
      return null;
    }
    if (!startDate) {
      toast.error('Informe a data de início.');
      return null;
    }
    if (!isCurrent && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error('A data final não pode ser anterior à data de início.');
      return null;
    }

    const payload: CreateExperiencePayload = {
      companyName: company.trim(),
      roleTitle,
      startDate: `${startDate}T12:00:00.000Z`,
      description: description.trim() || undefined,
    };
    if (!isCurrent && endDate) {
      payload.endDate = `${endDate}T12:00:00.000Z`;
    }
    return payload;
  };

  const submit = async () => {
    const payload = buildPayload();
    if (!payload) return;

    try {
      if (editingId) {
        await profileApi.updateExperience(editingId, payload);
        toast.success('Experiência atualizada.');
      } else {
        await profileApi.createExperience(payload);
        toast.success('Experiência adicionada.');
      }
      resetForm();
      await onChange();
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      const fieldMsg = Object.values(fields).find(Boolean);
      toast.error(fieldMsg || message);
    }
  };

  const remove = async (id: string) => {
    try {
      await profileApi.deleteExperience(id);
      toast.success('Experiência removida.');
      if (editingId === id) resetForm();
      await onChange();
    } catch {
      toast.error('Erro ao remover.');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold">Experiências</h3>
      <div className="mt-4 space-y-4">
        {experiences.map((e) => (
          <div key={e.id} className="flex items-start justify-between rounded-lg border p-4">
            <div>
              <p className="font-semibold">{e.roleTitle ?? 'Cargo não informado'}</p>
              <p className="text-xs text-muted-foreground">{e.companyName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isoToDateInput(e.startDate)}
                {e.endDate ? ` — ${isoToDateInput(e.endDate)}` : ' — atual'}
              </p>
            </div>
            <div className="flex gap-1">
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => startEdit(e)}
                aria-label="Editar experiência"
              >
                <Pencil className="h-4 w-4" />
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => remove(e.id)} aria-label="Remover">
                <Trash2 className="h-4 w-4" />
              </Btn>
            </div>
          </div>
        ))}

        <div ref={formRef} className="rounded-lg border border-dashed p-4">
          <p className="mb-3 text-sm font-medium">
            {editingId ? 'Editar experiência' : 'Nova experiência'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Cargo">
              <Select value={rolePreset} onChange={(ev) => setRolePreset(ev.target.value)}>
                {roleGroups.map((g) => (
                  <optgroup key={g.category} label={g.category}>
                    {g.roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value={JOB_ROLE_OTHER_VALUE}>Outro (informar abaixo)</option>
              </Select>
            </Field>
            {rolePreset === JOB_ROLE_OTHER_VALUE && (
              <Field label="Cargo personalizado">
                <TextInput
                  placeholder="Ex.: Analista de Negócios"
                  value={roleCustom}
                  onChange={(ev) => setRoleCustom(ev.target.value)}
                />
              </Field>
            )}
            <Field label="Empresa">
              <TextInput
                placeholder="Nome da empresa"
                value={company}
                onChange={(ev) => setCompany(ev.target.value)}
              />
            </Field>
            <Field label="Data de início">
              <TextInput
                type="date"
                value={startDate}
                onChange={(ev) => setStartDate(ev.target.value)}
              />
            </Field>
            <Field label="Data de término">
              <TextInput
                type="date"
                value={endDate}
                disabled={isCurrent}
                onChange={(ev) => setEndDate(ev.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(ev) => {
                  setIsCurrent(ev.target.checked);
                  if (ev.target.checked) setEndDate('');
                }}
                className="rounded border-input"
              />
              Trabalho atual (sem data de término)
            </label>
          </div>
          <Field label="Descrição" className="mt-3">
            <TextArea
              placeholder="Principais responsabilidades e resultados"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={2}
            />
          </Field>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn size="sm" variant="secondary" onClick={submit}>
              <Plus className="h-4 w-4" />
              {editingId ? 'Salvar alterações' : 'Adicionar experiência'}
            </Btn>
            {editingId && (
              <Btn size="sm" variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4" /> Cancelar
              </Btn>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
