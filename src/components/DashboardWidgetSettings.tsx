import { useState } from 'react';
import type { DashboardWidgets } from '../types/account';
import {
  DASHBOARD_PRESETS,
  type DashboardPresetId,
} from '../storage/dashboardWidgetsStorage';

interface DashboardWidgetSettingsProps {
  widgets: DashboardWidgets;
  onChange: (widgets: DashboardWidgets) => Promise<void>;
}

const FEATURES: Array<{
  key: keyof Omit<DashboardWidgets, 'setupCompleted'>;
  title: string;
  description: string;
  audience: string;
}> = [
  {
    key: 'taskComposer',
    title: 'Новая задача',
    description: 'Компактная форма быстрого создания и редактирования.',
    audience: 'Полезно всем, кто часто добавляет задачи с главного экрана.',
  },
  {
    key: 'smartPlannerSummary',
    title: 'Краткий Smart Planner',
    description: 'Показывает главную задачу и состояние дня без большого блока.',
    audience: 'Полезно, если нужен лёгкий ориентир без перегруза.',
  },
  {
    key: 'smartPlanner',
    title: 'Полный Smart Planner',
    description: 'Даёт рекомендации, причины выбора и быстрые действия.',
    audience: 'Полезно, когда нужен подробный разбор приоритетов.',
  },
  {
    key: 'focusSession',
    title: 'Focus Session',
    description: 'Помогает начать работу по таймеру.',
    audience: 'Полезно, если сложно перейти от плана к действию.',
  },
  {
    key: 'dayFlow',
    title: 'Пульс дня',
    description: 'Показывает прогресс задач на сегодня.',
    audience: 'Полезно для ежедневного контроля темпа.',
  },
  {
    key: 'dashboardIllustration',
    title: 'Рабочий ритм',
    description: 'Визуально показывает состояние нагрузки.',
    audience: 'Полезно, если хочется быстро считать состояние дня.',
  },
  {
    key: 'focusPanel',
    title: 'Сегодня в фокусе',
    description: 'Даёт обзор дня и переходы к важным задачам.',
    audience: 'Полезно при большом количестве активных задач.',
  },
  {
    key: 'mobileCategoryChips',
    title: 'Быстрые категории на mobile',
    description: 'Показывает chips категорий над списком задач.',
    audience: 'Полезно для управления одной рукой с телефона.',
  },
];

const PRESET_META: Array<{ id: DashboardPresetId; label: string; description: string }> = [
  {
    id: 'minimal',
    label: 'Минимальный',
    description: 'Новая задача, фильтры, список и краткая подсказка Smart Planner.',
  },
  {
    id: 'balanced',
    label: 'Сбалансированный',
    description: 'Простой экран плюс Focus Session и Пульс дня.',
  },
  {
    id: 'focus',
    label: 'Фокус',
    description: 'Полный Smart Planner, фокус-сессия и быстрый обзор дня.',
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    description: 'Smart Planner, Пульс дня и Рабочий ритм.',
  },
  {
    id: 'full',
    label: 'Полный',
    description: 'Все доступные продуктивные функции.',
  },
];

export function DashboardWidgetSettings({
  widgets,
  onChange,
}: DashboardWidgetSettingsProps) {
  const [status, setStatus] = useState('');

  async function applyWidgets(nextWidgets: DashboardWidgets): Promise<void> {
    await onChange({ ...nextWidgets, setupCompleted: true });
    setStatus('Настройки главного экрана сохранены.');
  }

  return (
    <section className="account-section-card">
      <div className="account-section-heading">
        <h3>Персонализация главного экрана</h3>
        <p>Выберите только те функции, которые действительно помогают вам планировать.</p>
      </div>

      <div className="preset-card-grid">
        {PRESET_META.map((preset) => (
          <button
            type="button"
            className="preset-card"
            key={preset.id}
            onClick={() => void applyWidgets(DASHBOARD_PRESETS[preset.id])}
          >
            <strong>{preset.label}</strong>
            <span>{preset.description}</span>
          </button>
        ))}
      </div>

      <div className="feature-card-grid">
        {FEATURES.map((feature) => (
          <label key={feature.key} className="feature-toggle-card">
            <span>
              <strong>{feature.title}</strong>
              <em>{feature.description}</em>
              <small>{feature.audience}</small>
            </span>
            <input
              type="checkbox"
              checked={widgets[feature.key]}
              onChange={(event) =>
                void applyWidgets({
                  ...widgets,
                  [feature.key]: event.target.checked,
                })
              }
            />
          </label>
        ))}
      </div>

      {status && <p className="account-status">{status}</p>}
    </section>
  );
}
