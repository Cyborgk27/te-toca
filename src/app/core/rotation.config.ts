export interface Person {
  id: string;
  name: string;
  short: string;
  color: string;
  rgb: string;
}

/**
 * Orden de la rotación y fecha ancla.
 * El ancla es el lunes en que empieza el turno de `anchorPersonId`.
 * Cambiar estos datos es suficiente para ajustar toda la app.
 */
export const ROTATION = {
  anchorMonday: '2026-11-09',
  anchorPersonId: 'daniel',
  order: ['roberto', 'daniel', 'bryan', 'kevin'],
  officeDayOffsets: [0, 1],
  meId: 'kevin',
  timezone: 'America/Guayaquil',
} as const;

export const PEOPLE: Person[] = [
  {
    id: 'roberto',
    name: 'Roberto Oyola',
    short: 'RO',
    color: '#6D28D9',
    rgb: '109, 40, 217',
  },
  {
    id: 'daniel',
    name: 'Daniel Hinostroza',
    short: 'DH',
    color: '#C4007A',
    rgb: '196, 0, 122',
  },
  {
    id: 'bryan',
    name: 'Bryan Vera',
    short: 'BV',
    color: '#0E7490',
    rgb: '14, 116, 144',
  },
  {
    id: 'kevin',
    name: 'Kevin Cepeda',
    short: 'KC',
    color: '#B45309',
    rgb: '180, 83, 9',
  },
];

export const PEOPLE_BY_ID: Record<string, Person> = Object.fromEntries(
  PEOPLE.map((person) => [person.id, person]),
);

export const WEEKDAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;

export function firstName(person: Person): string {
  return person.name.split(' ')[0];
}
