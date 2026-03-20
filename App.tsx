import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { useEntries } from './src/hooks/useEntries';

// ── Screens ───────────────────────────────────────────────────────────────────
import LoginScreen       from './src/screens/LoginScreen';
import HomeScreen        from './src/screens/HomeScreen';
import AddEntryScreen    from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import FoldersScreen     from './src/screens/FoldersScreen';
import FolderViewScreen  from './src/screens/FolderViewScreen';
import SearchScreen      from './src/screens/SearchScreen';

// ── Shared components ─────────────────────────────────────────────────────────
import GlobalNav          from './src/components/GlobalNav';
import ConfirmLogoutModal from './src/components/ConfirmLogoutModal';

// ── Types ─────────────────────────────────────────────────────────────────────
import type { TravelEntry, Folder } from './src/hooks/useEntries';
import type { ActiveScreen }        from './src/types/navigation';

// ─── Root ─────────────────────────────────────────────────────────────────────
function Root() {
  const {
    entries, folders,
    addEntry, deleteEntry, toggleFavorite, moveToFolder, createFolder, deleteFolder,
  } = useEntries();

  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [activeScreen,  setActiveScreen]  = useState<ActiveScreen>('home');
  const [showAddEntry,  setShowAddEntry]  = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TravelEntry | null>(null);
  const [openFolder,    setOpenFolder]    = useState<Folder | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goHome       = ()           => { setActiveScreen('home');       setOpenFolder(null); };
  const goFolders    = ()           => { setActiveScreen('folders');    setOpenFolder(null); };
  const goSearch     = ()           => { setActiveScreen('search'); };
  const goFolderView = (f: Folder)  => { setOpenFolder(f);              setActiveScreen('folderView'); };
  const backToFolders = ()          => { setOpenFolder(null);           setActiveScreen('folders'); };

  // ── Entry handlers ────────────────────────────────────────────────────────
  const handleSelectEntry = (entry: TravelEntry) => setSelectedEntry(entry);
  const handleCloseDetail = ()                    => setSelectedEntry(null);
  const handleSave        = (entry: TravelEntry)  => { addEntry(entry); setShowAddEntry(false); };
  const handleDelete      = (id: string)          => { deleteEntry(id); setSelectedEntry(null); };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveScreen('home');
    setShowAddEntry(false);
    setSelectedEntry(null);
    setOpenFolder(null);
    setConfirmLogout(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <View style={S.root}>

      {/* Layer 0 — Home */}
      <HomeScreen
        entries={entries}
        folders={folders}
        onAddEntry={() => setShowAddEntry(true)}
        onSelectEntry={handleSelectEntry}
        onToggleFavorite={toggleFavorite}
        onMoveToFolder={moveToFolder}
        onDeleteEntry={deleteEntry}
        onLogout={() => setConfirmLogout(true)}
      />

      {/* Layer 1 — Search */}
      {activeScreen === 'search' && (
        <View style={StyleSheet.absoluteFill}>
          <SearchScreen
            entries={entries}
            folders={folders}
            onSelectEntry={handleSelectEntry}
            onOpenFolder={goFolderView}
            onClose={goHome}
          />
        </View>
      )}

      {/* Layer 2 — Folders list */}
      {activeScreen === 'folders' && (
        <View style={StyleSheet.absoluteFill}>
          <FoldersScreen
            entries={entries}
            folders={folders}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            onOpenFolder={goFolderView}
            onClose={goHome}
          />
        </View>
      )}

      {/* Layer 3 — Single folder contents */}
      {activeScreen === 'folderView' && openFolder && (
        <View style={StyleSheet.absoluteFill}>
          <FolderViewScreen
            folder={openFolder}
            entries={entries}
            onSelectEntry={handleSelectEntry}
            onBackToFolders={backToFolders}
          />
        </View>
      )}

      {/* Layer 4 — Entry detail */}
      {selectedEntry && (
        <View style={StyleSheet.absoluteFill}>
          <EntryDetailScreen
            entry={selectedEntry}
            onClose={handleCloseDetail}
            onDelete={handleDelete}
          />
        </View>
      )}

      {/* Always on top */}
      <GlobalNav
        activeScreen={activeScreen}
        onHomePress={goHome}
        onFoldersPress={goFolders}
        onAddPress={() => setShowAddEntry(true)}
        onSearchPress={goSearch}
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

      <ConfirmLogoutModal
        visible={confirmLogout}
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />

    </View>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const S = StyleSheet.create({ root: { flex: 1 } });