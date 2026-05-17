interface StatsBarProps {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

export function StatsBar({ total, active, completed, overdue }: StatsBarProps) {
  const items = [
    { label: 'Всего', value: total },
    { label: 'Активные', value: active },
    { label: 'Выполненные', value: completed },
    { label: 'Просроченные', value: overdue },
  ];

  return (
    <section className="stats-bar" aria-label="Сводка задач">
      {items.map((item) => (
        <div key={item.label} className="stat-item">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
