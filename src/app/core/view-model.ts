import { formatDayLong, monthCells } from './date-utils';
import { holidaysInMonth, holidaysOn, type Holiday } from './holidays';
import { isOfficeDay, personForDate, turnForMonday, type Turn } from './rotation';
import type { Person } from './rotation.config';

export interface ViewDay {
  iso: string;
  day: number;
  inMonth: boolean;
  weekday: number;
  isToday: boolean;
  isOfficeDay: boolean;
  person: Person | null;
  holidays: Holiday[];
  /** Color de fondo del día cuando hay turno de oficina. */
  tint: string | null;
  holidayTitle: string;
  ariaLabel: string;
}

export interface TurnHolidayWarning {
  turn: Turn;
  holidays: Holiday[];
}

export interface MonthViewData {
  year: number;
  month: number;
  weeks: ViewDay[][];
  holidays: Holiday[];
  turnHolidays: TurnHolidayWarning[];
  hasUnconfirmed: boolean;
}

export function buildMonthView(year: number, month: number, todayIso: string): MonthViewData {
  const weeks = monthCells(year, month).map((week) =>
    week.map((cell) => {
      const officeDay = cell.inMonth && isOfficeDay(cell.iso);
      const person = officeDay ? personForDate(cell.iso) : null;
      const holidays = cell.inMonth ? holidaysOn(cell.iso) : [];
      const holidayTitle = holidays.map((holiday) => holiday.name).join(' · ');
      const aria = [formatDayLong(cell.iso)];

      if (person) {
        aria.push(`Oficina con ${person.name}`);
      } else if (isOfficeDay(cell.iso)) {
        aria.push('Sin turno de oficina');
      }

      if (holidays.length > 0) {
        aria.push(`Feriado: ${holidayTitle}`);
      }

      if (cell.iso === todayIso) {
        aria.push('Hoy');
      }

      return {
        iso: cell.iso,
        day: cell.day,
        inMonth: cell.inMonth,
        weekday: cell.weekday,
        isToday: cell.iso === todayIso,
        isOfficeDay: isOfficeDay(cell.iso),
        person,
        holidays,
        tint: person ? `rgba(${person.rgb}, 0.12)` : null,
        holidayTitle,
        ariaLabel: aria.join('. '),
      } satisfies ViewDay;
    }),
  );

  const holidays = holidaysInMonth(year, month);
  const turnHolidays: TurnHolidayWarning[] = [];

  for (const week of weeks) {
    const mondayCell = week[0];
    const tuesdayCell = week[1];

    if (!mondayCell.inMonth && !tuesdayCell.inMonth) {
      continue;
    }

    const turn = turnForMonday(mondayCell.iso);

    if (turn.holidays.length > 0) {
      turnHolidays.push({ turn, holidays: turn.holidays });
    }
  }

  return {
    year,
    month,
    weeks,
    holidays,
    turnHolidays,
    hasUnconfirmed: holidays.some((holiday) => !holiday.confirmed),
  };
}
