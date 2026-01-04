import { CategoryFilter } from './CategoryFilter';
import { Category } from '@/types/article';

interface FilterBarProps {
  categoryFilters: Category[];
  onCategoryToggle: (category: Category) => void;
}

export function FilterBar({
  categoryFilters,
  onCategoryToggle,
}: FilterBarProps) {
  return (
    <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-[73px] z-40">
      <div className="container mx-auto px-4 py-4">
        <CategoryFilter
          activeCategories={categoryFilters}
          onToggle={onCategoryToggle}
        />
      </div>
    </div>
  );
}
