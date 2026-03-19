import React, { useState } from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import HomeScreen, { TravelEntry } from './src/screens/HomeScreen';

export default function App() {
  const [entries, setEntries] = useState<TravelEntry[]>([]);

  return (
    <ThemeProvider>
      <HomeScreen
        entries={entries}
        onAddEntry={() => {}}
        onLogout={() => console.log('Logged out')}
      />
    </ThemeProvider>
  );
}