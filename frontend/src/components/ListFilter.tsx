import { cn } from '@/lib/utils';
import type { CustomList } from '@minfeed/shared';
import { List, Layers } from 'lucide-react';

interface ListFilterProps {
  lists: CustomList[];
  activeListId: string | null;
  onSelect: (listId: string | null) => void;
}

export function ListFilter({ lists, activeListId, onSelect }: ListFilterProps) {
  if (lists.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <List className="w-4 h-4" />
        <span>No custom lists yet. Create one in Settings.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* "All" option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm transition-all',
          activeListId === null
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50'
        )}
      >
        <Layers className="w-4 h-4" />
        All
      </button>

      {/* Custom lists */}
      {lists.map((list) => (
        <button
          key={list.id}
          onClick={() => onSelect(list.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm transition-all',
            activeListId === list.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50'
          )}
        >
          <List className="w-4 h-4" />
          {list.name}
          <span className="text-xs opacity-70">({list.categories.length})</span>
        </button>
      ))}
    </div>
  );
}
