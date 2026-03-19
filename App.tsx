import React, { useState } from 'react';
import { Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import HomeScreen, { TravelEntry } from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';

export default function App() {
  const [entries,       setEntries]       = useState<(TravelEntry & { note?: string })[]>([]);
  const [showAddEntry,  setShowAddEntry]  = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<(TravelEntry & { note?: string }) | null>(null);

  const handleSave = (entry: TravelEntry & { note?: string }) => {
    setEntries((prev) => [entry, ...prev]);
    setShowAddEntry(false);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntry(null);
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HomeScreen
          entries={entries}
          onAddEntry={() => setShowAddEntry(true)}
          onSelectEntry={(entry) => setSelectedEntry(entry)}
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