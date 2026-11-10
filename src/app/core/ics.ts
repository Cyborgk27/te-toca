import { addDays, formatRange } from './date-utils';
import { nextTurns } from './rotation';

const DISCLAIMER =
  'Calendario referencial. Los feriados y las condiciones de asistencia pueden variar por disposiciones internas del banco. Confirma con tu lider tecnico antes de asistir.';

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function compactDate(iso: string): string {
  return iso.replace(/-/g, '');
}

function stamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

/**
 * iCalendar recomienda líneas de máximo 75 octetos. Las líneas largas se
 * pliegan con un espacio inicial en la continuación.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const maxBytes = 73;
  const chunks: string[] = [];
  let current = '';
  let bytes = 0;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;

    if (bytes + charBytes > maxBytes) {
      chunks.push(current);
      current = ` ${char}`;
      bytes = 1 + charBytes;
    } else {
      current += char;
      bytes += charBytes;
    }
  }

  chunks.push(current);

  return chunks.join('\r\n');
}

/**
 * Genera un calendario ICS con los turnos de las próximas `weeks` semanas.
 * Los eventos son de día completo (lunes y martes).
 */
export function buildIcs(fromIso: string, weeks = 52): string {
  const turns = nextTurns(fromIso, weeks);
  const now = stamp();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Te Toca//Rotacion de oficina//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Te Toca - Rotacion de oficina',
    'X-WR-TIMEZONE:America/Guayaquil',
  ];

  for (const turn of turns) {
    const holidayNote =
      turn.holidays.length > 0
        ? ` Feriado: ${turn.holidays.map((holiday) => holiday.name).join(', ')}.`
        : '';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${turn.monday}-${turn.person.id}@te-toca`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${compactDate(turn.monday)}`,
      `DTEND;VALUE=DATE:${compactDate(addDays(turn.end, 1))}`,
      `SUMMARY:${escapeIcs(`Oficina - ${turn.person.name}`)}`,
      `DESCRIPTION:${escapeIcs(
        `Turno de oficina (lunes y martes), ${formatRange(turn.monday, turn.end)}.${holidayNote} ${DISCLAIMER}`,
      )}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n');
}

export { DISCLAIMER };
