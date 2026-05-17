import type { DashboardWidgets } from '../types/account';
import {
  DASHBOARD_PRESETS,
  type DashboardPresetId,
} from '../storage/dashboardWidgetsStorage';

interface DashboardSetupPromptProps {
  onChoosePreset: (widgets: DashboardWidgets) => Promise<void>;
  onOpenPersonalization: () => void;
}

const FEATURES = [
  ['Умный планировщик', 'Помогает выбрать главные задачи дня.'],
  ['Фокус-сессия', 'Помогает начать работу по таймеру.'],
  ['Пульс дня', 'Показывает прогресс задач на сегодня.'],
  ['Рабочий ритм', 'Визуально показывает состояние нагрузки.'],
  ['Сегодня в фокусе', 'Даёт быстрый обзор дня и переходы к важным задачам.'],
];

export function DashboardSetupPrompt({
  onChoosePreset,
  onOpenPersonalization,
}: DashboardSetupPromptProps) {
  function applyPreset(id: DashboardPresetId): void {
    void onChoosePreset(DASHBOARD_PRESETS[id]);
  }

  return (
    <section className="dashboard-setup-prompt" aria-label="Настройка главного экрана">
      <div>
        <p>Персонализация</p>
        <h2>Хотите усилить планировщик?</h2>
        <span>
          Можно добавить умные рекомендации, фокус-сессии и пульс дня. Выберите только то, что
          вам полезно.
        </span>
      </div>

      <div className="dashboard-setup-features">
        {FEATURES.map(([title, description]) => (
          <article key={title}>
            <strong>{title}</strong>
            <span>{description}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-setup-actions">
        <button type="button" className="secondary-button" onClick={onOpenPersonalization}>
          Настроить
        </button>
        <button type="button" className="secondary-button" onClick={() => applyPreset('minimal')}>
          Оставить простой вид
        </button>
        <button type="button" className="primary-button" onClick={() => applyPreset('balanced')}>
          Включить рекомендуемый набор
        </button>
      </div>
    </section>
  );
}
