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
  folderIds:  string[];
}

export interface Folder {
  id:        string;
  name:      string;
  createdAt: number;
  isDefault: boolean;
}

const ENTRIES_KEY = '@travel_diary_entries';
const FOLDERS_KEY = '@travel_diary_folders';

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'favorites', name: 'Favorites', createdAt: 0, isDefault: true },
];

// ─── Hook: useEntries ─────────────────────────────────────────────────────────
export const useEntries = () => {
  const [entries,  setEntries]  = useState<TravelEntry[]>([]);
  const [folders,  setFolders]  = useState<Folder[]>(DEFAULT_FOLDERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Load from storage ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [storedEntries, storedFolders] = await Promise.all([
          AsyncStorage.getItem(ENTRIES_KEY),
          AsyncStorage.getItem(FOLDERS_KEY),
        ]);
        if (storedEntries) setEntries(JSON.parse(storedEntries));
        if (storedFolders) setFolders(JSON.parse(storedFolders));
      } catch (err) {
        console.error('Failed to load data:', err);
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
        const folderIds   = nowFavorite
          ? Array.from(new Set([...e.folderIds, 'favorites']))
          : e.folderIds.filter((fid) => fid !== 'favorites');
        return { ...e, isFavorite: nowFavorite, folderIds };
      }),
    );
  }, []);

  const addEntryToFolder = useCallback((entryId: string, folderId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, folderIds: Array.from(new Set([...e.folderIds, folderId])) }
          : e,
      ),
    );
  }, []);

  const removeEntryFromFolder = useCallback((entryId: string, folderId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, folderIds: e.folderIds.filter((fid) => fid !== folderId) }
          : e,
      ),
    );
  }, []);

  // ── Folder Actions ──────────────────────────────────────────────────────────
  const createFolder = useCallback((name: string): Folder => {
    const folder: Folder = {
      id:        `folder_${Date.now()}`,
      name:      name.trim(),
      createdAt: Date.now(),
      isDefault: false,
    };
    setFolders((prev) => [...prev, folder]);
    return folder;
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    if (folderId === 'favorites') return; // cannot delete default
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setEntries((prev) =>
      prev.map((e) => ({ ...e, folderIds: e.folderIds.filter((fid) => fid !== folderId) })),
    );
  }, []);

  return {
    entries,
    folders,
    isLoaded,
    addEntry,
    deleteEntry,
    toggleFavorite,
    addEntryToFolder,
    removeEntryFromFolder,
    createFolder,
    deleteFolder,
  };
};