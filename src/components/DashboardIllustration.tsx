import type { Task } from '../types/planner';

interface DashboardIllustrationProps {
  tasks: Task[];
  activeCount: number;
  completedCount: number;
  overdueCount: number;
  todayCount: number;
  highPriorityCount: number;
}

type RhythmState = 'overdue' | 'busy' | 'calm' | 'complete';

const RHYTHM_COPY: Record<
  RhythmState,
  {
    title: string;
    description: string;
  }
> = {
  overdue: {
    title: 'Нужно разобрать хвосты',
    description: 'Есть просрочки — начните с них.',
  },
  busy: {
    title: 'День насыщенный',
    description: 'Выберите 2-3 главные задачи.',
  },
  calm: {
    title: 'Спокойный день',
    description: 'Можно планировать без спешки.',
  },
  complete: {
    title: 'День закрыт',
    description: 'Отлично, основные задачи закрыты.',
  },
};

export function DashboardIllustration({
  tasks,
  activeCount,
  completedCount,
  overdueCount,
  todayCount,
  highPriorityCount,
}: DashboardIllustrationProps) {
  const state = getRhythmState({
    totalCount: tasks.length,
    activeCount,
    completedCount,
    overdueCount,
    todayCount,
    highPriorityCount,
  });
  const copy = RHYTHM_COPY[state];
  const activeTotal = activeCount + overdueCount;
  const maxValue = Math.max(activeTotal, completedCount, todayCount, highPriorityCount, 1);
  const chartPoints = buildChartPoints(
    [todayCount, highPriorityCount, activeTotal, completedCount],
    maxValue,
  );

  return (
    <section
      className={`dashboard-illustration is-${state}`}
      aria-label="Рабочий ритм"
    >
      <div className="dashboard-illustration-copy">
        <p>Рабочий ритм</p>
        <h2>{copy.title}</h2>
        <span>{copy.description}</span>
      </div>

      <svg
        className="dashboard-illustration-art"
        viewBox="0 0 320 170"
        aria-hidden="true"
      >
        <rect className="rhythm-frame" x="10" y="12" width="300" height="146" rx="18" />
        <path className="rhythm-route rhythm-route-main" d="M28 114 C82 72 118 106 168 70 S258 44 292 58" />
        <path className="rhythm-route rhythm-route-muted" d="M28 128 H292" />
        <rect className="rhythm-card rhythm-card-left" x="28" y="28" width="86" height="44" rx="10" />
        <rect className="rhythm-card rhythm-card-center" x="128" y="42" width="74" height="34" rx="10" />
        <rect className="rhythm-card rhythm-card-right" x="218" y="22" width="74" height="52" rx="10" />
        <polyline className="rhythm-chart" points={chartPoints} />
        <rect
          className="rhythm-bar rhythm-bar-today"
          x="28"
          y="138"
          width={getBarWidth(todayCount, maxValue)}
          height="8"
          rx="4"
        />
        <rect
          className="rhythm-bar rhythm-bar-priority"
          x="118"
          y="138"
          width={getBarWidth(highPriorityCount, maxValue)}
          height="8"
          rx="4"
        />
        <rect
          className="rhythm-bar rhythm-bar-active"
          x="208"
          y="138"
          width={getBarWidth(activeTotal, maxValue)}
          height="8"
          rx="4"
        />
      </svg>

      <div className="rhythm-summary" aria-hidden="true">
        <span>Сегодня {todayCount}</span>
        <span>Высокий {highPriorityCount}</span>
        <span>Активные {activeTotal}</span>
      </div>
    </section>
  );
}

function getRhythmState({
  totalCount,
  activeCount,
  completedCount,
  overdueCount,
  todayCount,
  highPriorityCount,
}: {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  overdueCount: number;
  todayCount: number;
  highPriorityCount: number;
}): RhythmState {
  if (totalCount > 0 && completedCount === totalCount) {
    return 'complete';
  }

  if (overdueCount > 0) {
    return 'overdue';
  }

  if (todayCount >= 5 || highPriorityCount >= 4 || activeCount >= 8) {
    return 'busy';
  }

  return 'calm';
}

function buildChartPoints(values: number[], maxValue: number): string {
  return values
    .map((value, index) => {
      const x = 42 + index * 74;
      const y = 120 - Math.round((value / maxValue) * 46);
      return `${x},${y}`;
    })
    .join(' ');
}

function getBarWidth(value: number, maxValue: number): number {
  return Math.max(18, Math.round((value / maxValue) * 62));
}
