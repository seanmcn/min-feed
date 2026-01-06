import { useState } from 'react';
import {
  ArrowLeft,
  X,
  Plus,
  Filter,
  Trash2,
  Loader2,
  LayoutGrid,
  Layers,
  EyeOff,
  List,
  Edit2,
  Globe,
  Cpu,
  Code,
  FlaskConical,
  Briefcase,
  MapPin,
  Heart,
  Trophy,
  Gamepad2,
  Film,
  Laugh,
  Landmark,
  MoreHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Header } from '@/components/Header';
import { useSettingsStore } from '@/store/settingsStore';
import { useFeedStore } from '@/store/feedStore';
import type { Category, CustomList } from '@minfeed/shared';
import { cn } from '@/lib/utils';

const PAGE_SIZE_OPTIONS = [12, 18, 24, 30, 36, 42, 48] as const;

// All categories with their display info
const ALL_CATEGORIES: { value: Category; label: string; icon: typeof Globe }[] = [
  { value: 'world', label: 'World', icon: Globe },
  { value: 'politics', label: 'Politics', icon: Landmark },
  { value: 'local', label: 'Local', icon: MapPin },
  { value: 'tech', label: 'Tech', icon: Cpu },
  { value: 'programming', label: 'Programming', icon: Code },
  { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { value: 'science', label: 'Science', icon: FlaskConical },
  { value: 'health', label: 'Health', icon: Heart },
  { value: 'business', label: 'Business', icon: Briefcase },
  { value: 'entertainment', label: 'Entertainment', icon: Film },
  { value: 'humor', label: 'Humor', icon: Laugh },
  { value: 'sports', label: 'Sports', icon: Trophy },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

interface SettingsProps {
  signOut: () => void;
}

export function Settings({ signOut }: SettingsProps) {
  const [inputValue, setInputValue] = useState('');
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<CustomList | null>(null);
  const [listName, setListName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const {
    preferences,
    isLoading,
    isSaving,
    addBlockedWord,
    removeBlockedWord,
    clearBlockedWords,
    setArticlesPerPage,
    addExcludedCategory,
    removeExcludedCategory,
    createCustomList,
    updateCustomList,
    deleteCustomList,
  } = useSettingsStore();

  const { collapseDuplicates, setCollapseDuplicates } = useFeedStore();

  const blockedWords = preferences?.blockedWords ?? [];
  const articlesPerPage = preferences?.articlesPerPage ?? 12;
  const excludedCategories = preferences?.excludedCategories ?? [];
  const customLists = preferences?.customLists ?? [];

  const handleToggleExclusion = async (category: Category) => {
    if (excludedCategories.includes(category)) {
      await removeExcludedCategory(category);
    } else {
      await addExcludedCategory(category);
    }
  };

  const openCreateListDialog = () => {
    setEditingList(null);
    setListName('');
    setSelectedCategories([]);
    setListDialogOpen(true);
  };

  const openEditListDialog = (list: CustomList) => {
    setEditingList(list);
    setListName(list.name);
    setSelectedCategories([...list.categories]);
    setListDialogOpen(true);
  };

  const handleSaveList = async () => {
    if (!listName.trim() || selectedCategories.length === 0) return;

    if (editingList) {
      await updateCustomList(editingList.id, {
        name: listName.trim(),
        categories: selectedCategories,
      });
    } else {
      await createCustomList(listName.trim(), selectedCategories);
    }
    setListDialogOpen(false);
  };

  const handleDeleteList = async (id: string) => {
    await deleteCustomList(id);
  };

  const toggleCategoryInList = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleAdd = async () => {
    if (inputValue.trim() && !blockedWords.includes(inputValue.toLowerCase().trim())) {
      await addBlockedWord(inputValue.toLowerCase().trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header signOut={signOut} isAuthenticated />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header signOut={signOut} isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display text-sm">Back to feed</span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your blocked words and preferences
          </p>
        </div>

        <div className="card-gradient border border-border/50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Blocked Words
            </h2>
            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          <p className="text-muted-foreground text-sm mb-6">
            Stories containing these words will be hidden from your feed.
            This is useful for filtering out topics you don't want to see.
          </p>

          <div className="flex gap-2 mb-6">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a word to block..."
              className="bg-secondary/50 border-border font-display text-sm"
              disabled={isSaving}
            />
            <Button onClick={handleAdd} className="shrink-0" disabled={isSaving}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {blockedWords.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-display">
                  {blockedWords.length} word{blockedWords.length !== 1 ? 's' : ''} blocked
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearBlockedWords}
                  disabled={isSaving}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {blockedWords.map((word) => (
                  <span
                    key={word}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-sm font-display text-foreground"
                  >
                    {word}
                    <button
                      onClick={() => removeBlockedWord(word)}
                      disabled={isSaving}
                      className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground text-sm">
                No blocked words yet. Add words above to filter your feed.
              </p>
            </div>
          )}
        </div>

        <div className="card-gradient border border-border/50 rounded-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Display Settings
            </h2>
            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          <p className="text-muted-foreground text-sm mb-6">
            Customize how your feed is displayed.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-display text-sm text-foreground">
                Articles Per Page
              </label>
              <Select
                value={articlesPerPage.toString()}
                onValueChange={(value) => setArticlesPerPage(parseInt(value, 10))}
                disabled={isSaving}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="font-display text-sm text-foreground">
                    Collapse Duplicates
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Show only one article per story group
                  </p>
                </div>
              </div>
              <Switch
                checked={collapseDuplicates}
                onCheckedChange={setCollapseDuplicates}
              />
            </div>
          </div>
        </div>

        {/* Category Exclusions Section */}
        <div className="card-gradient border border-border/50 rounded-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <EyeOff className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Hidden Categories
            </h2>
            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          <p className="text-muted-foreground text-sm mb-6">
            Categories you exclude will be completely hidden from your feed and category bar.
          </p>

          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const isExcluded = excludedCategories.includes(cat.value);
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleToggleExclusion(cat.value)}
                  disabled={isSaving}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-display transition-colors disabled:opacity-50',
                    isExcluded
                      ? 'bg-destructive/10 border border-destructive/30 text-muted-foreground line-through'
                      : 'bg-secondary/50 border border-border hover:bg-secondary text-foreground'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isExcluded ? 'opacity-50' : '')} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {excludedCategories.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              {excludedCategories.length} categor{excludedCategories.length === 1 ? 'y' : 'ies'} hidden
            </p>
          )}
        </div>

        {/* Custom Lists Section */}
        <div className="card-gradient border border-border/50 rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Custom Lists
              </h2>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
            <Button onClick={openCreateListDialog} size="sm" disabled={isSaving}>
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </div>

          <p className="text-muted-foreground text-sm mb-6">
            Create custom category bundles to quickly filter your feed.
          </p>

          {customLists.length > 0 ? (
            <div className="space-y-3">
              {customLists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 border border-border/50 rounded-lg"
                >
                  <div>
                    <h3 className="font-display text-sm font-medium text-foreground">
                      {list.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {list.categories.length} categor{list.categories.length === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditListDialog(list)}
                      disabled={isSaving}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteList(list.id)}
                      disabled={isSaving}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <List className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground text-sm">
                No custom lists yet. Create one to bundle categories together.
              </p>
            </div>
          )}
        </div>

        {/* List Create/Edit Dialog */}
        <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingList ? 'Edit List' : 'Create List'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="font-display text-sm text-foreground block mb-2">
                  List Name
                </label>
                <Input
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="e.g., Tech News"
                  className="bg-secondary/50 border-border font-display text-sm"
                />
              </div>

              <div>
                <label className="font-display text-sm text-foreground block mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.filter(
                    (cat) => !excludedCategories.includes(cat.value)
                  ).map((cat) => {
                    const isSelected = selectedCategories.includes(cat.value);
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => toggleCategoryInList(cat.value)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-display transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary/50 border border-border hover:bg-secondary text-foreground'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setListDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveList}
                disabled={!listName.trim() || selectedCategories.length === 0 || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingList ? 'Save Changes' : 'Create List'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default Settings;
