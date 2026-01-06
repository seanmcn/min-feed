import { CategoryFilter } from './CategoryFilter';
import { ListFilter } from './ListFilter';
import { Category } from '@/types/article';
import type { CustomList } from '@minfeed/shared';
import type { ViewMode } from '@/store/feedStore';
import { Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  categoryFilters: Category[];
  onCategoryToggle: (category: Category) => void;
  excludedCategories: Category[];
  customLists: CustomList[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeListId: string | null;
  onListSelect: (listId: string | null) => void;
  isAuthenticated: boolean;
}

export function FilterBar({
  categoryFilters,
  onCategoryToggle,
  excludedCategories,
  customLists,
  viewMode,
  onViewModeChange,
  activeListId,
  onListSelect,
  isAuthenticated,
}: FilterBarProps) {
  const hasLists = customLists.length > 0;
  const showViewToggle = isAuthenticated && hasLists;

  return (
    <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-[73px] z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          {/* View mode toggle - only show if user has lists */}
          {showViewToggle && (
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 shrink-0">
              <button
                onClick={() => onViewModeChange('categories')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'categories'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
                title="Categories"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('lists')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'lists'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
                title="Lists"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter content */}
          <div className="flex-1">
            {viewMode === 'categories' ? (
              <CategoryFilter
                activeCategories={categoryFilters}
                onToggle={onCategoryToggle}
                excludedCategories={excludedCategories}
              />
            ) : (
              <ListFilter
                lists={customLists}
                activeListId={activeListId}
                onSelect={onListSelect}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
