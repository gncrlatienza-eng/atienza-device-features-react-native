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
}

const STORAGE_KEY = '@travel_diary_entries';

// ─── Hook: useEntries ─────────────────────────────────────────────────────────
export const useEntries = () => {
  const [entries,  setEntries]  = useState<TravelEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Load from storage on mount ──────────────────────────────────────────────
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setEntries(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load entries:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadEntries();
  }, []);

  // ── Persist whenever entries change ────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const saveEntries = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch (error) {
        console.error('Failed to save entries:', error);
      }
    };
    saveEntries();
  }, [entries, isLoaded]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const addEntry = useCallback((entry: TravelEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e)),
    );
  }, []);

  return { entries, isLoaded, addEntry, deleteEntry, toggleFavorite };
};