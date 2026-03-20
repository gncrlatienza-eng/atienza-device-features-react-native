import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { useEntries } from './src/hooks/useEntries';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import FoldersScreen from './src/screens/FoldersScreen';
import SearchScreen from './src/screens/SearchScreen';
import type { TravelEntry, Folder } from './src/hooks/useEntries';

export default function App() {
  const {
    entries,
    folders,
    addEntry,
    deleteEntry,
    toggleFavorite,
    moveToFolder,
    createFolder,
    deleteFolder,
  } = useEntries();

  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [showAddEntry,  setShowAddEntry]  = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [showFolders,   setShowFolders]   = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TravelEntry | null>(null);
  const [openFolder,    setOpenFolder]    = useState<Folder | null>(null);

  const handleSave = (entry: TravelEntry) => {
    addEntry(entry);
    setShowAddEntry(false);
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setSelectedEntry(null);
  };

  const handleSelectEntry = (entry: TravelEntry) => {
    setShowSearch(false);
    setSelectedEntry(entry);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowSearch(false);
    setShowFolders(false);
    setShowAddEntry(false);
    setSelectedEntry(null);
    setOpenFolder(null);
  };

  // ── Login gate ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <LoginScreen onLogin={() => setIsLoggedIn(true)} />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={styles.root}>
          {/* Main home */}
          <HomeScreen
            entries={entries}
            folders={folders}
            onAddEntry={() => setShowAddEntry(true)}
            onSelectEntry={handleSelectEntry}
            onToggleFavorite={toggleFavorite}
            onMoveToFolder={moveToFolder}
            onSearchPress={() => setShowSearch(true)}
            onFoldersPress={() => setShowFolders(true)}
            onLogout={handleLogout}
          />

          {/* Search overlay — no Modal to avoid white flash */}
          {showSearch && (
            <View style={StyleSheet.absoluteFill}>
              <SearchScreen
                entries={entries}
                onSelectEntry={handleSelectEntry}
                onClose={() => setShowSearch(false)}
              />
            </View>
          )}

          {/* Folders overlay */}
          {showFolders && (
            <View style={StyleSheet.absoluteFill}>
              <FoldersScreen
                entries={entries}
                folders={folders}
                onCreateFolder={createFolder}
                onDeleteFolder={deleteFolder}
                onOpenFolder={(folder) => {
                  setOpenFolder(folder);
                  setShowFolders(false);
                }}
                onClose={() => setShowFolders(false)}
              />
            </View>
          )}
        </View>

        {/* Add Entry Sheet */}
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

        {/* Entry Detail Sheet */}
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

        {/* Folder contents sheet */}
        <Modal
          visible={!!openFolder}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setOpenFolder(null)}
        >
          {openFolder && (
            <HomeScreen
              entries={entries.filter((e) => e.folderId === openFolder.id)}
              folders={folders}
              onAddEntry={() => {}}
              onSelectEntry={handleSelectEntry}
              onToggleFavorite={toggleFavorite}
              onMoveToFolder={moveToFolder}
              onSearchPress={() => {}}
              onFoldersPress={() => {}}
              onLogout={handleLogout}
            />
          )}
        </Modal>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});