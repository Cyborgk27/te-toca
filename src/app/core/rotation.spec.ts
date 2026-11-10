import { describe, expect, it } from 'vitest';
import { monthCells, mondayOf } from './date-utils';
import { holidaysOn } from './holidays';
import { nextTurns, personForDate, turnForMonday } from './rotation';

describe('rotación de oficina', () => {
  it('reproduce las fechas de Kevin Cepeda', () => {
    expect(personForDate('2026-09-28').id).toBe('kevin');
    expect(personForDate('2026-09-29').id).toBe('kevin');
    expect(personForDate('2026-10-26').id).toBe('kevin');
    expect(personForDate('2026-10-27').id).toBe('kevin');
  });

  it('el 9 y 10 de noviembre de 2026 le toca a Daniel', () => {
    expect(personForDate('2026-11-09').id).toBe('daniel');
    expect(personForDate('2026-11-10').id).toBe('daniel');
  });

  it('el turno de Roberto del 2 y 3 de noviembre cae en feriado', () => {
    const turn = turnForMonday('2026-11-02');

    expect(turn.person.id).toBe('roberto');
    expect(turn.monday).toBe('2026-11-02');
    expect(turn.end).toBe('2026-11-03');
    expect(turn.holidays.map((holiday) => holiday.name)).toContain('Día de los Difuntos');
    expect(turn.holidays.map((holiday) => holiday.name)).toContain('Independencia de Cuenca');
    expect(holidaysOn('2026-11-02')).toHaveLength(1);
    expect(holidaysOn('2026-11-03')).toHaveLength(1);
  });

  it('un domingo el siguiente turno arranca el lunes', () => {
    const turns = nextTurns('2026-11-08', 2);

    expect(turns[0].monday).toBe('2026-11-09');
    expect(turns[0].person.id).toBe('daniel');
    expect(turns[1].person.id).toBe('bryan');
  });

  it('un miércoles el siguiente turno arranca el lunes siguiente', () => {
    const turns = nextTurns('2026-11-11', 1);

    expect(turns[0].monday).toBe('2026-11-16');
    expect(turns[0].person.id).toBe('bryan');
  });

  it('la semana empieza en lunes', () => {
    expect(mondayOf('2026-11-09')).toBe('2026-11-09');
    expect(mondayOf('2026-11-10')).toBe('2026-11-09');
    expect(mondayOf('2026-11-15')).toBe('2026-11-09');
    expect(mondayOf('2026-11-16')).toBe('2026-11-16');
  });

  it('la cuadrícula de noviembre de 2026 empieza el lunes 26 de octubre', () => {
    const weeks = monthCells(2026, 10);

    expect(weeks[0][0].iso).toBe('2026-10-26');
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks[0][6].iso).toBe('2026-11-01');
    expect(weeks[0][6].inMonth).toBe(true);
  });
});
