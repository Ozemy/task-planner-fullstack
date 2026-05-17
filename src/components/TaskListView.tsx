import type { Category, FilterId, Task } from '../types/planner';
import { TaskCard } from './TaskCard';

interface TaskListViewProps {
  tasks: Task[];
  categories: Category[];
  filterId: FilterId;
  categoryId: string;
  searchTerm: string;
  onEdit: (task: Task) => void;
  onFocusTask: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskListView(props: TaskListViewProps) {
  const { tasks, categories, filterId, categoryId, searchTerm } = props;

  if (tasks.length === 0) {
    const emptyState = getEmptyStateCopy(filterId, categoryId, searchTerm);
    return (
      <section className="empty-state">
        <strong>{emptyState.title}</strong>
        <span>{emptyState.description}</span>
      </section>
    );
  }

  return (
    <section className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          category={categories.find((category) => category.id === task.categoryId)}
          {...props}
        />
      ))}
    </section>
  );
}

function getEmptyStateCopy(
  filterId: FilterId,
  categoryId: string,
  searchTerm: string,
): { title: string; description: string } {
  if (searchTerm.trim()) {
    return {
      title: 'Поиск ничего не нашёл',
      description: 'Измените запрос или сбросьте фильтры, чтобы увидеть больше задач.',
    };
  }

  if (categoryId !== 'all' && filterId === 'all') {
    return {
      title: 'В этой категории пока нет задач',
      description: 'Создайте новую задачу или выберите другую категорию.',
    };
  }

  switch (filterId) {
    case 'active':
      return {
        title: 'Нет активных задач',
        description: 'Новые задачи появятся здесь после создания.',
      };
    case 'completed':
      return {
        title: 'Нет выполненных задач',
        description: 'Отмеченные завершённые задачи будут собираться здесь.',
      };
    case 'overdue':
      return {
        title: 'Нет просроченных задач',
        description: 'Хороший знак: все дедлайны сейчас под контролем.',
      };
    case 'today':
      return {
        title: 'Нет задач на сегодня',
        description: 'Можно запланировать новую задачу или проверить ближайшие дедлайны.',
      };
    case 'week':
      return {
        title: 'Нет задач на этой неделе',
        description: 'На текущую неделю пока ничего не запланировано.',
      };
    case 'high':
      return {
        title: 'Нет задач с высоким приоритетом',
        description: 'Высокоприоритетные задачи появятся здесь после назначения.',
      };
    case 'all':
    default:
      return {
        title: 'Задач пока нет',
        description: 'Создайте первую задачу, чтобы начать планирование.',
      };
  }
}
