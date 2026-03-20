import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useEntries } from './src/hooks/useEntries';
import { glassTokens, palette } from './src/screens/HomeScreen/HomeScreen.styles';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import FoldersScreen from './src/screens/FoldersScreen';
import type { TravelEntry, Folder } from './src/hooks/useEntries';

// ─── Add to Folder Modal ──────────────────────────────────────────────────────
const AddToFolderModal: React.FC<{
  visible:  boolean;
  entry:    TravelEntry | null;
  folders:  Folder[];
  onSelect: (folderId: string) => void;
  onClose:  () => void;
}> = ({ visible, entry, folders, onSelect, onClose }) => {
  const { resolvedScheme } = useTheme();
  const tokens = glassTokens[resolvedScheme];
  const colors = palette[resolvedScheme];
  if (!entry) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={atfStyles.backdrop}>
        <View style={[atfStyles.card, { borderColor: tokens.border }]}>
          <BlurView intensity={80} tint={tokens.tint} style={atfStyles.header}>
            <Text style={[atfStyles.title, { color: colors.label }]}>Add to Folder</Text>
            <Text style={[atfStyles.sub, { color: colors.label }]}>
              "{entry.title || entry.address.split(',')[0]}"
            </Text>
          </BlurView>

          {folders.map((folder, index) => {
            const alreadyIn = entry.folderIds.includes(folder.id);
            return (
              <View key={folder.id}>
                <View style={[atfStyles.divider, { backgroundColor: colors.separator }]} />
                <BlurView intensity={80} tint={tokens.tint}>
                  <TouchableOpacity
                    style={atfStyles.folderRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (!alreadyIn) { Haptics.selectionAsync(); onSelect(folder.id); }
                    }}
                  >
                    <Ionicons
                      name={folder.id === 'favorites' ? 'heart' : 'folder'}
                      size={20}
                      color={alreadyIn ? colors.tertiaryLabel : colors.accent}
                    />
                    <Text style={[atfStyles.folderName, { color: alreadyIn ? colors.tertiaryLabel : colors.label }]}>
                      {folder.name}
                    </Text>
                    {alreadyIn && <Ionicons name="checkmark" size={16} color={colors.tertiaryLabel} />}
                  </TouchableOpacity>
                </BlurView>
              </View>
            );
          })}

          <View style={[atfStyles.divider, { backgroundColor: colors.separator }]} />
          <BlurView intensity={80} tint={tokens.tint}>
            <TouchableOpacity style={atfStyles.cancelRow} onPress={onClose} activeOpacity={0.7}>
              <Text style={[atfStyles.cancelLabel, { color: colors.accent }]}>Cancel</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

const atfStyles = StyleSheet.create({
  backdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  card:       { width: '100%', borderRadius: 20, overflow: 'hidden', borderWidth: 0.5 },
  header:     { paddingTop: 20, paddingBottom: 12, paddingHorizontal: 20, alignItems: 'center' },
  title:      { fontSize: 17, fontWeight: '700', marginBottom: 4, letterSpacing: -0.3 },
  sub:        { fontSize: 13, opacity: 0.55, textAlign: 'center' },
  divider:    { height: 0.5 },
  folderRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, gap: 12 },
  folderName: { flex: 1, fontSize: 16, fontWeight: '400' },
  cancelRow:  { alignItems: 'center', paddingVertical: 16 },
  cancelLabel:{ fontSize: 17, fontWeight: '600' },
});

// ─── App Content (needs ThemeProvider above) ──────────────────────────────────
const AppContent: React.FC = () => {
  const {
    entries, folders,
    addEntry, deleteEntry, toggleFavorite,
    addEntryToFolder, createFolder, deleteFolder,
  } = useEntries();

  const [isLoggedIn,       setIsLoggedIn]       = useState(false);
  const [showAddEntry,     setShowAddEntry]     = useState(false);
  const [showSearch,       setShowSearch]       = useState(false);
  const [showFolders,      setShowFolders]      = useState(false);
  const [selectedEntry,    setSelectedEntry]    = useState<TravelEntry | null>(null);
  const [addToFolderEntry, setAddToFolderEntry] = useState<TravelEntry | null>(null);

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

  // ── Not logged in → show login ──────────────────────────────────────────────
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Home */}
      <HomeScreen
        entries={entries}
        folders={folders}
        onAddEntry={() => setShowAddEntry(true)}
        onSelectEntry={handleSelectEntry}
        onToggleFavorite={toggleFavorite}
        onAddToFolder={(entry) => setAddToFolderEntry(entry)}
        onSearchPress={() => setShowSearch(true)}
        onFoldersPress={() => setShowFolders(true)}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Search — absolute overlay, eliminates white flash */}
      {showSearch && (
        <View style={StyleSheet.absoluteFill}>
          <SearchScreen
            entries={entries}
            onSelectEntry={handleSelectEntry}
            onClose={() => setShowSearch(false)}
          />
        </View>
      )}

      {/* Add Entry */}
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

      {/* Entry Detail */}
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

      {/* Folders */}
      <Modal
        visible={showFolders}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFolders(false)}
      >
        <FoldersScreen
          folders={folders}
          entries={entries}
          onOpenFolder={() => {}}
          onCreateFolder={createFolder}
          onDeleteFolder={deleteFolder}
        />
      </Modal>

      {/* Add to Folder */}
      <AddToFolderModal
        visible={!!addToFolderEntry}
        entry={addToFolderEntry}
        folders={folders}
        onSelect={(folderId) => {
          if (addToFolderEntry) addEntryToFolder(addToFolderEntry.id, folderId);
          setAddToFolderEntry(null);
        }}
        onClose={() => setAddToFolderEntry(null)}
      />
    </View>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}