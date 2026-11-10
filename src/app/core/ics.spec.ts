import { describe, expect, it } from 'vitest';
import { buildIcs } from './ics';

describe('exportación .ics', () => {
  it('genera eventos de día completo y avisa cuando el turno cae en feriado', () => {
    const ics = buildIcs('2026-11-02', 2);
    const unfolded = ics.replace(/\r\n[ \t]/g, '');

    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261102');
    expect(ics).toContain('DTEND;VALUE=DATE:20261104');
    expect(unfolded).toContain('Día de los Difuntos');
    expect(unfolded).toContain('Independencia de Cuenca');
    expect(unfolded).toContain('Oficina - Roberto Oyola');
    expect(ics).toContain('END:VCALENDAR');
  });
});
