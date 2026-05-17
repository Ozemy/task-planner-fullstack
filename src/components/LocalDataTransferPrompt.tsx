import type { PlannerState } from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';

interface LocalDataTransferPromptProps {
  guestState: PlannerState;
  isImporting: boolean;
  onImport: () => void;
  onExport: () => void;
  onKeepLocal: () => void;
  onLater: () => void;
}

export function LocalDataTransferPrompt({
  guestState,
  isImporting,
  onImport,
  onExport,
  onKeepLocal,
  onLater,
}: LocalDataTransferPromptProps) {
  const completed = guestState.tasks.filter((task) => task.status === 'completed').length;
  const overdue = guestState.tasks.filter((task) => task.status === 'overdue').length;
  const categories = guestState.categories.filter(
    (category) => category.id !== UNCATEGORIZED_ID,
  ).length;

  return (
    <section className="local-transfer-prompt" aria-label="Перенос локальных данных">
      <div>
        <p>Локальные данные найдены</p>
        <h2>Перенести гостевые задачи в аккаунт?</h2>
      </div>

      <div className="local-transfer-summary">
        <span>{guestState.tasks.length} задач</span>
        <span>{categories} категорий</span>
        <span>{completed} выполнено</span>
        <span>{overdue} просрочено</span>
      </div>

      <div className="local-transfer-actions">
        <button type="button" className="primary-button" disabled={isImporting} onClick={onImport}>
          {isImporting ? 'Переносим...' : 'Перенести в аккаунт'}
        </button>
        <button type="button" className="secondary-button" onClick={onExport}>
          Скачать JSON
        </button>
        <button type="button" className="secondary-button" onClick={onKeepLocal}>
          Оставить локально
        </button>
        <button type="button" className="secondary-button" onClick={onLater}>
          Позже
        </button>
      </div>
    </section>
  );
}
