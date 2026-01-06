import { create } from 'zustand';
import type { UserPreferences, Sentiment, TimeRange, Category, CustomList } from '@minfeed/shared';
import { generateId } from '@minfeed/shared';
import { dataApi } from '@/lib/data-api';

interface SettingsState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadPreferences: () => Promise<void>;
  addBlockedWord: (word: string) => Promise<void>;
  removeBlockedWord: (word: string) => Promise<void>;
  clearBlockedWords: () => Promise<void>;
  setArticlesPerPage: (size: number) => Promise<void>;
  setSentimentFilters: (filters: Sentiment[]) => Promise<void>;
  setTimeRange: (range: TimeRange) => Promise<void>;

  // Category exclusions
  addExcludedCategory: (category: Category) => Promise<void>;
  removeExcludedCategory: (category: Category) => Promise<void>;

  // Custom lists
  createCustomList: (name: string, categories: Category[]) => Promise<void>;
  updateCustomList: (id: string, updates: { name?: string; categories?: Category[] }) => Promise<void>;
  deleteCustomList: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  preferences: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadPreferences: async () => {
    set({ isLoading: true, error: null });
    try {
      const prefs = await dataApi.getPreferences();
      set({ preferences: prefs, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load preferences',
        isLoading: false,
      });
    }
  },

  addBlockedWord: async (word: string) => {
    const { preferences } = get();
    if (!preferences) return;

    const normalizedWord = word.toLowerCase().trim();
    if (preferences.blockedWords.includes(normalizedWord)) return;

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        blockedWords: [...preferences.blockedWords, normalizedWord],
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  removeBlockedWord: async (word: string) => {
    const { preferences } = get();
    if (!preferences) return;

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        blockedWords: preferences.blockedWords.filter((w) => w !== word),
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  clearBlockedWords: async () => {
    const { preferences } = get();
    if (!preferences) return;

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        blockedWords: [],
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  setArticlesPerPage: async (size: number) => {
    const { preferences } = get();
    if (!preferences) return;

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        articlesPerPage: size,
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  setSentimentFilters: async (filters: Sentiment[]) => {
    const { preferences } = get();
    if (!preferences) return;

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        sentimentFilters: filters,
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  setTimeRange: async (range: TimeRange) => {
    const { preferences } = get();
    if (!preferences) return;

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        timeRange: range,
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  addExcludedCategory: async (category: Category) => {
    const { preferences } = get();
    if (!preferences) return;

    const currentExcluded = preferences.excludedCategories ?? [];
    if (currentExcluded.includes(category)) return;

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        excludedCategories: [...currentExcluded, category],
        customLists: preferences.customLists ?? [],
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  removeExcludedCategory: async (category: Category) => {
    const { preferences } = get();
    if (!preferences) return;

    const currentExcluded = preferences.excludedCategories ?? [];

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        excludedCategories: currentExcluded.filter((c) => c !== category),
        customLists: preferences.customLists ?? [],
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  createCustomList: async (name: string, categories: Category[]) => {
    const { preferences } = get();
    if (!preferences) return;

    const currentLists = preferences.customLists ?? [];
    const now = new Date().toISOString();
    const newList: CustomList = {
      id: generateId(),
      name,
      categories,
      createdAt: now,
      updatedAt: now,
    };

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        excludedCategories: preferences.excludedCategories ?? [],
        customLists: [...currentLists, newList],
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  updateCustomList: async (id: string, updates: { name?: string; categories?: Category[] }) => {
    const { preferences } = get();
    if (!preferences) return;

    const currentLists = preferences.customLists ?? [];
    const listIndex = currentLists.findIndex((l) => l.id === id);
    if (listIndex === -1) return;

    const updatedLists = [...currentLists];
    updatedLists[listIndex] = {
      ...updatedLists[listIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        excludedCategories: preferences.excludedCategories ?? [],
        customLists: updatedLists,
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },

  deleteCustomList: async (id: string) => {
    const { preferences } = get();
    if (!preferences) return;

    const currentLists = preferences.customLists ?? [];

    set({ isSaving: true });
    try {
      const updated = await dataApi.putPreferences({
        ...preferences,
        excludedCategories: preferences.excludedCategories ?? [],
        customLists: currentLists.filter((l) => l.id !== id),
      });
      set({ preferences: updated, isSaving: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save',
        isSaving: false,
      });
    }
  },
}));
