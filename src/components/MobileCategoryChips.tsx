import type { Category } from '../types/planner';

interface MobileCategoryChipsProps {
  categories: Category[];
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
}

export function MobileCategoryChips({
  categories,
  categoryId,
  onCategoryChange,
}: MobileCategoryChipsProps) {
  return (
    <section className="mobile-category-nav" aria-label="Быстрый выбор категории">
      <p>Категории</p>
      <div className="category-chip-list">
        <button
          type="button"
          className={categoryId === 'all' ? 'is-active' : ''}
          onClick={() => onCategoryChange('all')}
          aria-pressed={categoryId === 'all'}
        >
          Все
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={categoryId === category.id ? 'is-active' : ''}
            onClick={() => onCategoryChange(category.id)}
            aria-pressed={categoryId === category.id}
          >
            <span style={{ backgroundColor: category.color }} aria-hidden="true" />
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
}
