import React, { useState } from 'react';
import { Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { useEntries } from './src/hooks/useEntries';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import type { TravelEntry } from './src/hooks/useEntries';

export default function App() {
  const { entries, addEntry, deleteEntry, toggleFavorite } = useEntries();
  const [showAddEntry,  setShowAddEntry]  = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TravelEntry | null>(null);

  const handleSave = (entry: TravelEntry) => {
    addEntry(entry);
    setShowAddEntry(false);
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setSelectedEntry(null);
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HomeScreen
          entries={entries}
          onAddEntry={() => setShowAddEntry(true)}
          onSelectEntry={(entry) => setSelectedEntry(entry)}
          onToggleFavorite={toggleFavorite}
          onLogout={() => console.log('Logged out')}
        />

        <Modal
          visible={showAddEntry}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddEntry(false)}
        >
          <AddEntryScreen
            onSave={handleSave}
            onCancel={() => setShowAddEntry(false)}
          />
        </Modal>

        <Modal
          visible={!!selectedEntry}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedEntry(null)}
        >
          {selectedEntry && (
            <EntryDetailScreen
              entry={selectedEntry}
              onClose={() => setSelectedEntry(null)}
              onDelete={handleDelete}
            />
          )}
        </Modal>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}