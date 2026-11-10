import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  diffDays,
  formatDayLong,
  formatDayShort,
  formatMonth,
  formatRange,
  isoParts,
  monthName,
  relativeDaysLabel,
  todayInGuayaquil,
  weekdayIndex,
} from './core/date-utils';
import { holidayKindLabel } from './core/holidays';
import { buildIcs } from './core/ics';
import {
  isOfficeDay,
  nextTurnForPerson,
  nextTurns,
  turnForDate,
  type Turn,
} from './core/rotation';
import {
  PEOPLE,
  ROTATION,
  WEEKDAY_LETTERS,
  firstName,
  type Person,
} from './core/rotation.config';
import { buildMonthView, type ViewDay } from './core/view-model';

type Theme = 'light' | 'dark';
type ViewMode = 'month' | 'year';

interface PersonOverview {
  person: Person;
  turn: Turn;
  isMe: boolean;
}

interface MonthWarning {
  range: string;
  person: string;
  holidays: string;
}

interface YearMonth {
  month: number;
  name: string;
  weeks: ViewDay[][];
  hasTurnHoliday: boolean;
}

function normalizeMonth(year: number, month: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function readInitialTheme(): Theme {
  return document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly initialToday = todayInGuayaquil();

  protected readonly rotation = ROTATION;
  protected readonly people = PEOPLE;
  protected readonly weekdays = WEEKDAY_LETTERS;

  protected readonly today = signal(this.initialToday);
  protected readonly theme = signal<Theme>(readInitialTheme());
  protected readonly view = signal<ViewMode>('month');
  protected readonly cursor = signal({
    year: isoParts(this.initialToday).year,
    month: isoParts(this.initialToday).month,
  });

  protected readonly fmtDayLong = formatDayLong;
  protected readonly fmtDayShort = formatDayShort;
  protected readonly fmtRange = formatRange;
  protected readonly kindLabel = holidayKindLabel;
  protected readonly first = firstName;

  protected readonly officeWindow = computed(() => isOfficeDay(this.today()));
  protected readonly currentTurn = computed(() => turnForDate(this.today()));
  protected readonly upcoming = computed(() => nextTurns(this.today(), 8));
  protected readonly heroTurn = computed(() =>
    this.officeWindow() ? this.currentTurn() : this.upcoming()[0],
  );
  protected readonly sideTurn = computed(() => this.upcoming()[1]);
  protected readonly heroPerson = computed(() => this.heroTurn().person);
  protected readonly heroHolidays = computed(() => this.heroTurn().holidays);
  protected readonly heroHolidayText = computed(() =>
    this.heroHolidays()
      .map((holiday) => holiday.name)
      .join(' · '),
  );

  protected readonly heroTitle = computed(() => {
    const turn = this.heroTurn();
    const name = firstName(turn.person);

    if (this.officeWindow()) {
      return weekdayIndex(this.today()) === 0
        ? `Hoy y mañana le toca a ${name}`
        : `Hoy le toca a ${name}`;
    }

    const days = diffDays(turn.monday, this.today());
    return days === 1 ? `Mañana le toca a ${name}` : `El lunes ${isoParts(turn.monday).day} le toca a ${name}`;
  });

  protected readonly heroSubtitle = computed(() => {
    const turn = this.heroTurn();
    const range = formatRange(turn.monday, turn.end);

    if (this.officeWindow()) {
      return `Turno de ${range}`;
    }

    return `Turno de ${range} · ${relativeDaysLabel(turn.monday, this.today())}`;
  });

  protected readonly heroBadges = computed<string[]>(() => {
    if (!this.officeWindow()) {
      return ['Próximo turno'];
    }

    return weekdayIndex(this.today()) === 0 ? ['Hoy', 'Mañana'] : ['Hoy'];
  });

  protected readonly monthView = computed(() =>
    buildMonthView(this.cursor().year, this.cursor().month, this.today()),
  );
  protected readonly monthWeeks = computed(() => this.monthView().weeks);
  protected readonly monthHolidays = computed(() => this.monthView().holidays);
  protected readonly monthTentative = computed(() => this.monthView().hasUnconfirmed);

  protected readonly monthWarnings = computed<MonthWarning[]>(() =>
    this.monthView().turnHolidays.map((warning) => ({
      range: formatRange(warning.turn.monday, warning.turn.end),
      person: warning.turn.person.name,
      holidays: warning.holidays.map((holiday) => holiday.name).join(' · '),
    })),
  );

  protected readonly monthLabel = computed(() =>
    this.view() === 'year'
      ? `${this.cursor().year}`
      : formatMonth(this.cursor().year, this.cursor().month),
  );

  protected readonly yearMonths = computed<YearMonth[]>(() => {
    const year = this.cursor().year;

    return Array.from({ length: 12 }, (_, month) => {
      const data = buildMonthView(year, month, this.today());

      return {
        month,
        name: monthName(month),
        weeks: data.weeks,
        hasTurnHoliday: data.turnHolidays.length > 0,
      };
    });
  });

  protected readonly personOverview = computed<PersonOverview[]>(() =>
    PEOPLE.map((person) => ({
      person,
      turn: nextTurnForPerson(person.id, this.today()),
      isMe: person.id === ROTATION.meId,
    })),
  );

  protected readonly myNextTurn = computed(() =>
    nextTurnForPerson(ROTATION.meId, this.today()),
  );

  constructor() {
    this.applyTheme(this.theme());

    const timer = setInterval(() => {
      const current = todayInGuayaquil();

      if (current !== this.today()) {
        this.today.set(current);
      }
    }, 60_000);

    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected prev(): void {
    if (this.view() === 'year') {
      this.cursor.update((cursor) => ({ ...cursor, year: cursor.year - 1 }));
      return;
    }

    this.cursor.update((cursor) => normalizeMonth(cursor.year, cursor.month - 1));
  }

  protected next(): void {
    if (this.view() === 'year') {
      this.cursor.update((cursor) => ({ ...cursor, year: cursor.year + 1 }));
      return;
    }

    this.cursor.update((cursor) => normalizeMonth(cursor.year, cursor.month + 1));
  }

  protected goToday(): void {
    const today = todayInGuayaquil();
    const parts = isoParts(today);

    this.today.set(today);
    this.cursor.set({ year: parts.year, month: parts.month });
    this.view.set('month');
  }

  protected setView(view: ViewMode): void {
    this.view.set(view);
  }

  protected openMonth(month: number): void {
    this.cursor.update((cursor) => ({ ...cursor, month }));
    this.view.set('month');
  }

  protected toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);
  }

  protected isCurrentTurn(turn: Turn): boolean {
    return this.officeWindow() && turn.monday === this.currentTurn().monday;
  }

  protected turnStatus(turn: Turn): string {
    if (this.isCurrentTurn(turn)) {
      return 'En curso';
    }

    return relativeDaysLabel(turn.monday, this.today());
  }

  protected personNextLabel(turn: Turn): string {
    if (this.isCurrentTurn(turn)) {
      return `En curso · ${formatRange(turn.monday, turn.end)}`;
    }

    return `Próximo: ${formatDayShort(turn.monday)}`;
  }

  protected holidayNames(turn: Turn): string {
    return turn.holidays.map((holiday) => holiday.name).join(' · ');
  }

  protected downloadIcs(): void {
    const calendar = buildIcs(this.today());
    const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'te-toca-rotacion.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.dataset['theme'] = theme;

    try {
      localStorage.setItem('te-toca-theme', theme);
    } catch {
      // El navegador puede bloquear localStorage; no es crítico.
    }

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0f0d16' : '#c4007a');
  }
}
