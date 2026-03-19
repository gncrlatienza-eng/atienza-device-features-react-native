import React, { useState } from 'react';
import HomeScreen, { TravelEntry } from './src/screens/HomeScreen';

export default function App() {
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  return <HomeScreen entries={entries} onAddEntry={() => {}} />;
}