import type { FilterId, SortId, ViewMode } from '../types/planner';
import { SearchIcon } from './Icons';
import { getSortOptionsForViewMode } from '../utils/task';

interface TaskFiltersProps {
  filterId: FilterId;
  categoryId: string;
  categoryName?: string;
  viewMode: ViewMode;
  searchTerm: string;
  sortBy: SortId;
  onSearchChange: (value: string) => void;
  onSortChange: (sortBy: SortId) => void;
  onReset: () => void;
}

const FILTER_LABELS: Record<FilterId, string> = {
  all: 'Все задачи',
  active: 'Активные',
  completed: 'Выполненные',
  overdue: 'Просроченные',
  today: 'Сегодня',
  week: 'На этой неделе',
  high: 'Высокий приоритет',
};

const SORT_LABELS: Record<SortId, string> = {
  dueDate: 'По дедлайну',
  priority: 'По приоритету',
  createdAt: 'По дате создания',
  updatedAt: 'По дате изменения',
  title: 'По названию',
  time: 'По времени',
};

const SORT_CAPTIONS: Record<ViewMode, string> = {
  list: 'Сортировка списка',
  board: 'Сортировка карточек',
  week: 'Сортировка задач внутри дня',
  calendar: 'Сортировка задач внутри дня',
};

export function TaskFilters({
  filterId,
  categoryId,
  categoryName,
  viewMode,
  searchTerm,
  sortBy,
  onSearchChange,
  onSortChange,
  onReset,
}: TaskFiltersProps) {
  const normalizedSearch = searchTerm.trim();
  const hasActiveFilters =
    filterId !== 'all' || categoryId !== 'all' || normalizedSearch.length > 0;
  const sortOptions = getSortOptionsForViewMode(viewMode);

  return (
    <div className="task-filter-stack">
      <div className="task-filters">
        <label className="search-field">
          <span className="sr-only">Поиск</span>
          <SearchIcon size={18} />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по названию и описанию"
            aria-label="Поиск по названию и описанию"
          />
        </label>

        <label className="select-field">
          <span>{SORT_CAPTIONS[viewMode]}</span>
          <select value={sortBy} onChange={(event) => onSortChange(event.target.value as SortId)}>
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasActiveFilters && (
        <div className="filter-summary" aria-live="polite">
          <div>
            <span>Активно:</span>
            {filterId !== 'all' && <strong>{FILTER_LABELS[filterId]}</strong>}
            {categoryId !== 'all' && <strong>{categoryName ?? 'Категория'}</strong>}
            {normalizedSearch && <strong>Поиск: "{normalizedSearch}"</strong>}
          </div>
          <button type="button" className="secondary-button" onClick={onReset}>
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}
