import { type FormEvent, useState } from 'react';
import type { Category, FilterId } from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';
import { PlusIcon, TrashIcon } from './Icons';

interface SidebarProps {
  categories: Category[];
  filterId: FilterId;
  categoryId: string;
  onFilterChange: (filterId: FilterId) => void;
  onCategoryChange: (categoryId: string) => void;
  onCreateCategory: (name: string) => void;
  onRemoveCategory: (categoryId: string) => void;
}

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'Все задачи' },
  { id: 'active', label: 'Активные' },
  { id: 'completed', label: 'Выполненные' },
  { id: 'overdue', label: 'Просроченные' },
  { id: 'today', label: 'Сегодня' },
  { id: 'week', label: 'На этой неделе' },
  { id: 'high', label: 'Высокий приоритет' },
];

export function Sidebar({
  categories,
  filterId,
  categoryId,
  onFilterChange,
  onCategoryChange,
  onCreateCategory,
  onRemoveCategory,
}: SidebarProps) {
  const [categoryName, setCategoryName] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onCreateCategory(categoryName);
    setCategoryName('');
  }

  return (
    <aside className="sidebar">
      <section>
        <h2>Фильтры</h2>
        <div className="nav-list">
          {FILTERS.map((filter) => (
            <button
              type="button"
              key={filter.id}
              className={filterId === filter.id ? 'is-active' : ''}
              onClick={() => onFilterChange(filter.id)}
              aria-pressed={filterId === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Категории</h2>
        <div className="nav-list category-list">
          <button
            type="button"
            className={categoryId === 'all' ? 'is-active' : ''}
            onClick={() => onCategoryChange('all')}
            aria-pressed={categoryId === 'all'}
          >
            Все категории
          </button>
          {categories.map((category) => (
            <div key={category.id} className="category-row">
              <button
                type="button"
                className={categoryId === category.id ? 'is-active' : ''}
                onClick={() => onCategoryChange(category.id)}
                aria-pressed={categoryId === category.id}
              >
                <span style={{ backgroundColor: category.color }} />
                {category.name}
              </button>
              {category.id !== UNCATEGORIZED_ID && (
                <button
                  type="button"
                  className="category-delete"
                  aria-label={`Удалить категорию ${category.name}`}
                  title={`Удалить категорию ${category.name}`}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Удалить категорию "${category.name}"? Задачи будут перенесены в "Без категории".`,
                      )
                    ) {
                      onRemoveCategory(category.id);
                    }
                  }}
                >
                  <TrashIcon size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <form className="category-form" onSubmit={handleSubmit}>
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Новая категория"
            aria-label="Название новой категории"
          />
          <button type="submit" title="Создать категорию" aria-label="Создать категорию">
            <PlusIcon size={18} />
          </button>
        </form>
      </section>
    </aside>
  );
}
