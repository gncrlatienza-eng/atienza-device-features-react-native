import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import HomeScreen, { TravelEntry } from './src/screens/HomeScreen';

export default function App() {
  const [entries, setEntries] = useState<TravelEntry[]>([]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HomeScreen
          entries={entries}
          onAddEntry={() => {}}
          onLogout={() => console.log('Logged out')}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}