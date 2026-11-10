import { isoParts } from './date-utils';

export type HolidayKind = 'nacional' | 'local' | 'suspension';

export interface Holiday {
  /** Fecha en formato YYYY-MM-DD. */
  date: string;
  name: string;
  kind: HolidayKind;
  /** false = fecha preliminar pendiente de resolución oficial. */
  confirmed: boolean;
  note?: string;
}

/**
 * Feriados nacionales de Ecuador, feriados locales de Guayaquil y
 * jornadas suspendidas por decreto.
 *
 * 2026: calendario oficial (Ministerio del Trabajo / Viceministerio de Turismo)
 *       + Decretos 249 (2 ene) y 507 (20 nov).
 * 2027: calendario preliminar. La resolución oficial puede mover fechas,
 *       sobre todo en noviembre y diciembre.
 *
 * Para actualizar la app solo hay que editar esta lista.
 */
export const HOLIDAYS: Holiday[] = [
  // 2026 — confirmados
  { date: '2026-01-01', name: 'Año Nuevo', kind: 'nacional', confirmed: true },
  {
    date: '2026-01-02',
    name: 'Jornada suspendida (Decreto 249)',
    kind: 'suspension',
    confirmed: true,
    note: 'No recuperable.',
  },
  { date: '2026-02-16', name: 'Carnaval', kind: 'nacional', confirmed: true },
  { date: '2026-02-17', name: 'Carnaval', kind: 'nacional', confirmed: true },
  { date: '2026-04-03', name: 'Viernes Santo', kind: 'nacional', confirmed: true },
  { date: '2026-05-01', name: 'Día del Trabajo', kind: 'nacional', confirmed: true },
  {
    date: '2026-05-25',
    name: 'Batalla de Pichincha',
    kind: 'nacional',
    confirmed: true,
    note: 'Trasladado del domingo 24 de mayo.',
  },
  {
    date: '2026-07-25',
    name: 'Fundación de Guayaquil',
    kind: 'local',
    confirmed: true,
    note: 'Feriado local de Guayaquil.',
  },
  {
    date: '2026-08-10',
    name: 'Primer Grito de Independencia',
    kind: 'nacional',
    confirmed: true,
  },
  {
    date: '2026-10-09',
    name: 'Independencia de Guayaquil',
    kind: 'nacional',
    confirmed: true,
  },
  {
    date: '2026-11-02',
    name: 'Día de los Difuntos',
    kind: 'nacional',
    confirmed: true,
  },
  {
    date: '2026-11-03',
    name: 'Independencia de Cuenca',
    kind: 'nacional',
    confirmed: true,
  },
  {
    date: '2026-11-20',
    name: 'Jornada suspendida (Decreto 507)',
    kind: 'suspension',
    confirmed: true,
    note: 'Festival de Artes Vivas. No es feriado nacional.',
  },
  { date: '2026-12-25', name: 'Navidad', kind: 'nacional', confirmed: true },

  // 2027 — preliminares
  { date: '2027-01-01', name: 'Año Nuevo', kind: 'nacional', confirmed: false },
  { date: '2027-02-08', name: 'Carnaval', kind: 'nacional', confirmed: false },
  { date: '2027-02-09', name: 'Carnaval', kind: 'nacional', confirmed: false },
  { date: '2027-03-26', name: 'Viernes Santo', kind: 'nacional', confirmed: false },
  {
    date: '2027-04-30',
    name: 'Día del Trabajo',
    kind: 'nacional',
    confirmed: false,
    note: 'Trasladado del sábado 1 de mayo.',
  },
  {
    date: '2027-05-24',
    name: 'Batalla de Pichincha',
    kind: 'nacional',
    confirmed: false,
  },
  {
    date: '2027-07-25',
    name: 'Fundación de Guayaquil',
    kind: 'local',
    confirmed: false,
    note: 'Feriado local de Guayaquil.',
  },
  {
    date: '2027-08-09',
    name: 'Primer Grito de Independencia',
    kind: 'nacional',
    confirmed: false,
    note: 'Trasladado del martes 10 de agosto.',
  },
  {
    date: '2027-10-08',
    name: 'Independencia de Guayaquil',
    kind: 'nacional',
    confirmed: false,
    note: 'Trasladado del sábado 9 de octubre.',
  },
  {
    date: '2027-11-01',
    name: 'Día de los Difuntos',
    kind: 'nacional',
    confirmed: false,
    note: 'Fecha preliminar sujeta a resolución oficial.',
  },
  {
    date: '2027-11-02',
    name: 'Independencia de Cuenca',
    kind: 'nacional',
    confirmed: false,
    note: 'Fecha preliminar sujeta a resolución oficial.',
  },
  {
    date: '2027-12-24',
    name: 'Navidad',
    kind: 'nacional',
    confirmed: false,
    note: 'Descanso trasladado del sábado 25.',
  },
  { date: '2027-12-25', name: 'Navidad', kind: 'nacional', confirmed: false },
  {
    date: '2027-12-31',
    name: 'Año Nuevo 2028',
    kind: 'nacional',
    confirmed: false,
    note: 'Descanso trasladado del sábado 1 de enero de 2028.',
  },
];

const holidaysByDate = new Map<string, Holiday[]>();

for (const holiday of HOLIDAYS) {
  const current = holidaysByDate.get(holiday.date) ?? [];
  current.push(holiday);
  holidaysByDate.set(holiday.date, current);
}

export function holidaysOn(iso: string): Holiday[] {
  return holidaysByDate.get(iso) ?? [];
}

export function holidaysInMonth(year: number, month: number): Holiday[] {
  return HOLIDAYS.filter((holiday) => {
    const parts = isoParts(holiday.date);
    return parts.year === year && parts.month === month;
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function holidayKindLabel(kind: HolidayKind): string {
  switch (kind) {
    case 'nacional':
      return 'Nacional';
    case 'local':
      return 'Local';
    case 'suspension':
      return 'Jornada suspendida';
  }
}
