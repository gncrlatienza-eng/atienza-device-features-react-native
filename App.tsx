import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';

interface TravelEntry {
  id: string;
  address: string;
  timestamp: number;
}

export default function App() {
  const [entries] = useState<TravelEntry[]>([]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✈️ Travel Diary</Text>
        <Text style={styles.subtitle}>Your journey, your story</Text>
      </View>

      {/* List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>Tap the button below to add your first travel memory.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardAddress}>{item.address}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
        )}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+ Add Entry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 4,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  cardDate: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 4,
  },
  fab: {
    margin: 16,
    backgroundColor: '#667eea',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});