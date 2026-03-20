import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TravelEntry {
  id:         string;
  imageUri:   string;
  address:    string;
  title:      string;
  note?:      string;
  timestamp:  number;
  isFavorite: boolean;
  folderId?:  string;
}

export interface Folder {
  id:        string;
  name:      string;
  createdAt: number;
  isSystem?: boolean;
}

const ENTRIES_KEY = '@travel_diary_entries';
const FOLDERS_KEY = '@travel_diary_folders';

export const FAVORITES_FOLDER_ID = 'system_favorites';

export const DEFAULT_FOLDERS: Folder[] = [
  { id: FAVORITES_FOLDER_ID, name: 'Favorites', createdAt: 0, isSystem: true },
];

// ─── Hook: useEntries ─────────────────────────────────────────────────────────
export const useEntries = () => {
  const [entries,  setEntries]  = useState<TravelEntry[]>([]);
  const [folders,  setFolders]  = useState<Folder[]>(DEFAULT_FOLDERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [storedEntries, storedFolders] = await Promise.all([
          AsyncStorage.getItem(ENTRIES_KEY),
          AsyncStorage.getItem(FOLDERS_KEY),
        ]);
        if (storedEntries) setEntries(JSON.parse(storedEntries));
        if (storedFolders) {
          const parsed: Folder[] = JSON.parse(storedFolders);
          const hasSystem = parsed.some((f) => f.id === FAVORITES_FOLDER_ID);
          setFolders(hasSystem ? parsed : [...DEFAULT_FOLDERS, ...parsed]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  // ── Persist entries ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)).catch(console.error);
  }, [entries, isLoaded]);

  // ── Persist folders ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)).catch(console.error);
  }, [folders, isLoaded]);

  // ── Entry Actions ───────────────────────────────────────────────────────────
  const addEntry = useCallback((entry: TravelEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const nowFavorite = !e.isFavorite;
        return {
          ...e,
          isFavorite: nowFavorite,
          folderId:   nowFavorite
            ? FAVORITES_FOLDER_ID
            : e.folderId === FAVORITES_FOLDER_ID
              ? undefined
              : e.folderId,
        };
      }),
    );
  }, []);

  const moveToFolder = useCallback((entryId: string, folderId: string | undefined) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== entryId) return e;
        const isFavorite = folderId === FAVORITES_FOLDER_ID ? true : e.isFavorite;
        return { ...e, folderId, isFavorite };
      }),
    );
  }, []);

  const createFolder = useCallback((name: string): Folder => {
    const folder: Folder = {
      id:        `folder_${Date.now()}`,
      name:      name.trim(),
      createdAt: Date.now(),
    };
    setFolders((prev) => [...prev, folder]);
    return folder;
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setEntries((prev) =>
      prev.map((e) => (e.folderId === folderId ? { ...e, folderId: undefined } : e)),
    );
  }, []);

  return {
    entries,
    folders,
    isLoaded,
    addEntry,
    deleteEntry,
    toggleFavorite,
    moveToFolder,
    createFolder,
    deleteFolder,
  };
};