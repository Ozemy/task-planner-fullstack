import type { Subtask } from '../types/planner';
import { PlusIcon, TrashIcon } from './Icons';

interface SubtaskEditorProps {
  subtasks: Subtask[];
  value: string;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (subtaskId: string) => void;
}

export function SubtaskEditor({
  subtasks,
  value,
  onValueChange,
  onAdd,
  onRemove,
}: SubtaskEditorProps) {
  return (
    <div className="field field-wide subtasks-editor">
      <span>Подзадачи</span>
      <div className="inline-editor">
        <input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Добавить подзадачу"
          aria-label="Название новой подзадачи"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onAdd();
            }
          }}
        />
        <button type="button" onClick={onAdd} title="Добавить подзадачу" aria-label="Добавить подзадачу">
          <PlusIcon size={18} />
        </button>
      </div>
      {subtasks.length > 0 && (
        <ul>
          {subtasks.map((subtask) => (
            <li key={subtask.id}>
              <span>{subtask.title}</span>
              <button
                type="button"
                onClick={() => onRemove(subtask.id)}
                title="Удалить подзадачу"
                aria-label={`Удалить подзадачу ${subtask.title}`}
              >
                <TrashIcon size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
