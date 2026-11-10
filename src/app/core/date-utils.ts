export const TIME_ZONE = 'America/Guayaquil';

const DAY_MS = 86_400_000;

export interface IsoParts {
  year: number;
  month: number;
  day: number;
}

export interface CalendarCell {
  iso: string;
  day: number;
  inMonth: boolean;
  weekday: number;
}

export function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

export function fromIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toIso(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function isoParts(iso: string): IsoParts {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month: month - 1, day };
}

export function addDays(iso: string, days: number): string {
  const date = fromIso(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

export function diffDays(later: string, earlier: string): number {
  return Math.round((fromIso(later).getTime() - fromIso(earlier).getTime()) / DAY_MS);
}

/** 0 = lunes, 6 = domingo. */
export function weekdayIndex(iso: string): number {
  return (fromIso(iso).getUTCDay() + 6) % 7;
}

export function mondayOf(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

export function todayInGuayaquil(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const read = (type: string): string => parts.find((part) => part.type === type)?.value ?? '';

  return `${read('year')}-${read('month')}-${read('day')}`;
}

const capitalize = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

const monthFormatter = new Intl.DateTimeFormat('es-EC', {
  month: 'long',
  timeZone: 'UTC',
});

const longFormatter = new Intl.DateTimeFormat('es-EC', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

const shortFormatter = new Intl.DateTimeFormat('es-EC', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export function monthName(month: number): string {
  return capitalize(monthFormatter.format(new Date(Date.UTC(2024, month, 1))));
}

export function formatMonth(year: number, month: number): string {
  return `${monthName(month)} ${year}`;
}

export function formatDayLong(iso: string): string {
  return capitalize(longFormatter.format(fromIso(iso)).replace(',', ''));
}

export function formatDayShort(iso: string): string {
  return capitalize(shortFormatter.format(fromIso(iso)).replace(',', ''));
}

export function formatDayMonth(iso: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(fromIso(iso));
}

export function formatRange(startIso: string, endIso: string): string {
  const start = isoParts(startIso);
  const end = isoParts(endIso);

  if (start.year === end.year && start.month === end.month) {
    return `${start.day} y ${end.day} de ${monthName(start.month).toLowerCase()}`;
  }

  if (start.year === end.year) {
    return `${formatDayMonth(startIso)} – ${formatDayMonth(endIso)}`;
  }

  return `${formatDayMonth(startIso)} ${start.year} – ${formatDayMonth(endIso)} ${end.year}`;
}

export function relativeDaysLabel(targetIso: string, fromIso: string): string {
  const diff = diffDays(targetIso, fromIso);

  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  if (diff < 0) return `hace ${Math.abs(diff)} días`;
  if (diff < 7) return `en ${diff} días`;

  if (diff % 7 === 0) {
    const weeks = diff / 7;
    return `en ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }

  return `en ${diff} días`;
}

export function monthCells(year: number, month: number): CalendarCell[][] {
  const first = `${year}-${pad2(month + 1)}-01`;
  const start = mondayOf(first);
  const weeks: CalendarCell[][] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: CalendarCell[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const iso = addDays(start, weekIndex * 7 + dayIndex);
      const parts = isoParts(iso);

      week.push({
        iso,
        day: parts.day,
        inMonth: parts.year === year && parts.month === month,
        weekday: dayIndex,
      });
    }

    weeks.push(week);
  }

  return weeks;
}
