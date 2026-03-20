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
  folderId?:  string;   // which folder the entry lives in (independent of isFavorite)
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

  // ── Load ──────────────────────────────────────────────────────────────────
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

  // ── Persist entries ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries)).catch(console.error);
  }, [entries, isLoaded]);

  // ── Persist folders ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)).catch(console.error);
  }, [folders, isLoaded]);

  // ── addEntry ───────────────────────────────────────────────────────────────
  const addEntry = useCallback((entry: TravelEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  // ── deleteEntry ────────────────────────────────────────────────────────────
  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ── toggleFavorite ─────────────────────────────────────────────────────────
  // Only flips isFavorite. Does NOT touch folderId — an entry can be in any
  // folder AND be a favourite at the same time (iOS Photos behaviour).
  const toggleFavorite = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, isFavorite: !e.isFavorite } : e,
      ),
    );
  }, []);

  // ── moveToFolder ───────────────────────────────────────────────────────────
  // Assigns (or clears) the folder for an entry. Never touches isFavorite.
  const moveToFolder = useCallback((entryId: string, folderId: string | undefined) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, folderId } : e,
      ),
    );
  }, []);

  // ── createFolder ───────────────────────────────────────────────────────────
  const createFolder = useCallback((name: string): Folder => {
    const folder: Folder = {
      id:        `folder_${Date.now()}`,
      name:      name.trim(),
      createdAt: Date.now(),
    };
    setFolders((prev) => [...prev, folder]);
    return folder;
  }, []);

  // ── deleteFolder ───────────────────────────────────────────────────────────
  const deleteFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    // Unassign entries that were in this folder; keep isFavorite untouched
    setEntries((prev) =>
      prev.map((e) =>
        e.folderId === folderId ? { ...e, folderId: undefined } : e,
      ),
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