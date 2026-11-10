import { addDays, diffDays, mondayOf, weekdayIndex } from './date-utils';
import { holidaysOn, type Holiday } from './holidays';
import { PEOPLE_BY_ID, ROTATION, type Person } from './rotation.config';

export interface Turn {
  /** Lunes del turno. */
  monday: string;
  /** Martes del turno. */
  tuesday: string;
  /** Último día del turno. */
  end: string;
  person: Person;
  holidays: Holiday[];
}

export function personForDate(iso: string): Person {
  const monday = mondayOf(iso);
  const weeks = Math.round(diffDays(monday, ROTATION.anchorMonday) / 7);
  const total = ROTATION.order.length;
  const anchorIndex = ROTATION.order.indexOf(ROTATION.anchorPersonId);
  const index = (((anchorIndex + weeks) % total) + total) % total;

  return PEOPLE_BY_ID[ROTATION.order[index]];
}

export function isOfficeDay(iso: string): boolean {
  return (ROTATION.officeDayOffsets as readonly number[]).includes(weekdayIndex(iso));
}

export function turnForMonday(mondayIso: string): Turn {
  const monday = mondayOf(mondayIso);
  const tuesday = addDays(monday, 1);

  return {
    monday,
    tuesday,
    end: tuesday,
    person: personForDate(monday),
    holidays: [...holidaysOn(monday), ...holidaysOn(tuesday)],
  };
}

export function turnForDate(iso: string): Turn {
  return turnForMonday(mondayOf(iso));
}

/**
 * Devuelve el turno actual (si hoy es lunes o martes) y los siguientes.
 * Si hoy es miércoles o posterior, arranca en el lunes siguiente.
 */
export function nextTurns(fromIso: string, count: number): Turn[] {
  let monday = mondayOf(fromIso);

  if (diffDays(fromIso, monday) > 1) {
    monday = addDays(monday, 7);
  }

  return Array.from({ length: count }, (_, index) => turnForMonday(addDays(monday, index * 7)));
}

export function nextTurnForPerson(personId: string, fromIso: string): Turn {
  const turns = nextTurns(fromIso, ROTATION.order.length + 4);
  return turns.find((turn) => turn.person.id === personId) ?? turns[0];
}
