import { type FormEvent, useEffect, useMemo, useState } from 'react';
import type { Category, Priority, Subtask, Task, TaskDraft } from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';
import { PlusIcon } from './Icons';
import { SubtaskEditor } from './SubtaskEditor';

interface TaskComposerProps {
  categories: Category[];
  editingTask: Task | null;
  initialDueDate: string;
  isOpen: boolean;
  onSubmit: (draft: TaskDraft) => void;
  onCancelEdit: () => void;
  onExpand: () => void;
  onCollapse: () => void;
}

const EMPTY_DRAFT: TaskDraft = {
  title: '',
  description: '',
  dueDate: '',
  dueTime: '',
  priority: 'medium',
  categoryId: UNCATEGORIZED_ID,
  subtasks: [],
};

const QUICK_TEMPLATES: Array<{
  label: string;
  title: string;
  priority: Priority;
}> = [
  { label: 'Учёба', title: 'Учёба', priority: 'medium' },
  { label: 'Работа', title: 'Работа', priority: 'high' },
  { label: 'Личное', title: 'Личное', priority: 'low' },
];

export function TaskComposer({
  categories,
  editingTask,
  initialDueDate,
  isOpen,
  onSubmit,
  onCancelEdit,
  onExpand,
  onCollapse,
}: TaskComposerProps) {
  const [draft, setDraft] = useState<TaskDraft>(EMPTY_DRAFT);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [showTitleError, setShowTitleError] = useState(false);
  const isEditing = Boolean(editingTask);

  useEffect(() => {
    if (!editingTask) {
      setDraft(EMPTY_DRAFT);
      setSubtaskTitle('');
      setShowTitleError(false);
      return;
    }

    setDraft({
      title: editingTask.title,
      description: editingTask.description,
      dueDate: editingTask.dueDate,
      dueTime: editingTask.dueTime,
      priority: editingTask.priority,
      categoryId: editingTask.categoryId,
      subtasks: editingTask.subtasks,
    });
  }, [editingTask]);

  useEffect(() => {
    if (editingTask || !initialDueDate) {
      return;
    }

    setDraft((current) =>
      isPristineDraft(current) ? { ...current, dueDate: initialDueDate } : current,
    );
  }, [editingTask, initialDueDate]);

  useEffect(() => {
    setDraft((current) =>
      categories.some((category) => category.id === current.categoryId)
        ? current
        : { ...current, categoryId: UNCATEGORIZED_ID },
    );
  }, [categories]);

  const canSubmit = useMemo(() => draft.title.trim().length > 0, [draft.title]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) {
      setShowTitleError(true);
      return;
    }

    onSubmit(draft);
    if (!isEditing) {
      setDraft(EMPTY_DRAFT);
      setSubtaskTitle('');
    }
  }

  function addSubtask(): void {
    const title = subtaskTitle.trim();
    if (!title) {
      return;
    }

    const subtask: Subtask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    setDraft((current) => ({
      ...current,
      subtasks: [...current.subtasks, subtask],
    }));
    setSubtaskTitle('');
  }

  function applyTemplate(template: (typeof QUICK_TEMPLATES)[number]): void {
    setDraft((current) => ({
      ...current,
      title: current.title || template.title,
      priority: template.priority,
    }));
  }

  function clearDueDate(): void {
    setDraft((current) => ({ ...current, dueDate: '', dueTime: '' }));
  }

  function handleCollapse(): void {
    setDraft(EMPTY_DRAFT);
    setSubtaskTitle('');
    setShowTitleError(false);
    onCollapse();
  }

  if (!isOpen && !isEditing) {
    return (
      <section className="composer-shell composer-collapsed">
        <button type="button" className="composer-trigger" onClick={onExpand}>
          <span>
            <PlusIcon size={18} />
          </span>
          <strong>Новая задача</strong>
          <small>Создать задачу, добавить дедлайн и подзадачи</small>
        </button>
      </section>
    );
  }

  return (
    <section className={`composer-shell ${isOpen ? 'is-open' : ''}`}>
      <div className="section-heading">
        <div>
          <p>{isEditing ? 'Редактирование' : 'Новая задача'}</p>
          <h2>{isEditing ? 'Обновить задачу' : 'Запланировать задачу'}</h2>
        </div>
        <div className="template-row">
          {QUICK_TEMPLATES.map((template) => (
            <button type="button" key={template.label} onClick={() => applyTemplate(template)}>
              {template.label}
            </button>
          ))}
        </div>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <label className="field field-wide">
          <span>Название</span>
          <input
            id="task-title"
            value={draft.title}
            onChange={(event) => {
              setDraft((current) => ({ ...current, title: event.target.value }));
              if (event.target.value.trim()) {
                setShowTitleError(false);
              }
            }}
            placeholder="Например, подготовить презентацию"
            required
            aria-invalid={showTitleError}
          />
          {showTitleError && <small className="field-error">Введите название задачи.</small>}
        </label>

        <label className="field field-wide">
          <span>Описание</span>
          <textarea
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Контекст, детали, ссылки на следующий шаг"
          />
        </label>

        <label className="field">
          <span>Дата дедлайна</span>
          <input
            type="date"
            value={draft.dueDate}
            onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
          />
        </label>

        <label className="field">
          <span>Время дедлайна</span>
          <input
            type="time"
            value={draft.dueTime}
            disabled={!draft.dueDate}
            onChange={(event) => setDraft((current) => ({ ...current, dueTime: event.target.value }))}
          />
        </label>

        {draft.dueDate && (
          <button type="button" className="text-button field-wide" onClick={clearDueDate}>
            Очистить дедлайн
          </button>
        )}

        <label className="field">
          <span>Приоритет</span>
          <select
            value={draft.priority}
            onChange={(event) =>
              setDraft((current) => ({ ...current, priority: event.target.value as Priority }))
            }
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </label>

        <label className="field">
          <span>Категория</span>
          <select
            value={draft.categoryId}
            onChange={(event) =>
              setDraft((current) => ({ ...current, categoryId: event.target.value }))
            }
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <SubtaskEditor
          subtasks={draft.subtasks}
          value={subtaskTitle}
          onValueChange={setSubtaskTitle}
          onAdd={addSubtask}
          onRemove={(subtaskId) =>
            setDraft((current) => ({
              ...current,
              subtasks: current.subtasks.filter((item) => item.id !== subtaskId),
            }))
          }
        />

        <div className="form-actions field-wide">
          {isEditing ? (
            <button type="button" className="secondary-button" onClick={onCancelEdit}>
              Отменить
            </button>
          ) : (
            <button type="button" className="secondary-button" onClick={handleCollapse}>
              Свернуть
            </button>
          )}
          <button type="submit" className="primary-button" disabled={!canSubmit}>
            {isEditing ? 'Сохранить изменения' : 'Создать задачу'}
          </button>
        </div>
      </form>
    </section>
  );
}

function isPristineDraft(draft: TaskDraft): boolean {
  return (
    draft.title === '' &&
    draft.description === '' &&
    draft.dueTime === '' &&
    draft.priority === 'medium' &&
    draft.categoryId === UNCATEGORIZED_ID &&
    draft.subtasks.length === 0
  );
}
