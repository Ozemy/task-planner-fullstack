interface OnboardingProps {
  onCreateFirstTask: () => void;
  onLoadDemoData: () => void;
}

export function Onboarding({ onCreateFirstTask, onLoadDemoData }: OnboardingProps) {
  return (
    <section className="onboarding" aria-label="Первый запуск">
      <div>
        <p>Первый запуск</p>
        <h2>Соберите свой рабочий ритм</h2>
        <span>
          Создайте первую задачу, заведите категории для проектов или импортируйте готовый JSON-файл.
        </span>
      </div>
      <div className="onboarding-actions">
        <button type="button" className="primary-button" onClick={onCreateFirstTask}>
          Создать первую задачу
        </button>
        <button type="button" className="secondary-button" onClick={onLoadDemoData}>
          Загрузить демо-данные
        </button>
      </div>
    </section>
  );
}
