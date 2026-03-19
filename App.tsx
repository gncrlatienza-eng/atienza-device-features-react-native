import React, { useState } from 'react';
import { Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import HomeScreen, { TravelEntry } from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';

export default function App() {
  const [entries,      setEntries]      = useState<TravelEntry[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);

  const handleSave = (entry: TravelEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setShowAddEntry(false);
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HomeScreen
          entries={entries}
          onAddEntry={() => setShowAddEntry(true)}
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
      </ThemeProvider>
    </SafeAreaProvider>
  );
}