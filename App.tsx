import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useEntries } from './src/hooks/useEntries';
import { FAVORITES_FOLDER_ID } from './src/hooks/useEntries';
import { palette, glassTokens } from './src/screens/HomeScreen/HomeScreen.styles';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import FoldersScreen from './src/screens/FoldersScreen';
import SearchScreen from './src/screens/SearchScreen';
import type { TravelEntry, Folder } from './src/hooks/useEntries';

// ─── FolderViewScreen ─────────────────────────────────────────────────────────
// A clean screen that shows entries for a specific folder with a back button.
const FolderViewScreen: React.FC<{
  folder:           Folder;
  entries:          TravelEntry[];
  onSelectEntry:    (entry: TravelEntry) => void;
  onToggleFavorite: (id: string) => void;
  onClose:          () => void;
}> = ({ folder, entries, onSelectEntry, onToggleFavorite, onClose }) => {
  const { resolvedScheme } = useTheme();
  const scheme             = resolvedScheme ?? 'dark';
  const colors             = palette[scheme];
  const tokens             = glassTokens[scheme];
  const insets             = useSafeAreaInsets();

  // Favorites folder shows entries where isFavorite=true, others use folderId
  const folderEntries = folder.id === FAVORITES_FOLDER_ID
    ? entries.filter((e) => e.isFavorite)
    : entries.filter((e) => e.folderId === folder.id);

  return (
    <View style={[fvStyles.container, { backgroundColor: colors.systemBackground }]}>
      {/* Header */}
      <View style={[fvStyles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={fvStyles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.accent} />
          <Text style={[fvStyles.backLabel, { color: colors.accent }]}>Folders</Text>
        </TouchableOpacity>
        <Text style={[fvStyles.title, { color: colors.label }]} numberOfLines={1}>
          {folder.name}
        </Text>
        <View style={fvStyles.backBtn} />
      </View>

      <Text style={[fvStyles.subtitle, { color: colors.secondaryLabel }]}>
        {folderEntries.length} {folderEntries.length === 1 ? 'memory' : 'memories'}
      </Text>

      {folderEntries.length === 0 ? (
        <View style={fvStyles.empty}>
          <Ionicons
            name={folder.id === FAVORITES_FOLDER_ID ? 'heart-outline' : 'folder-open-outline'}
            size={64}
            color={colors.tertiaryLabel}
          />
          <Text style={[fvStyles.emptyTitle, { color: colors.label }]}>
            {folder.id === FAVORITES_FOLDER_ID ? 'No Favorites Yet' : 'This folder is empty'}
          </Text>
          <Text style={[fvStyles.emptyBody, { color: colors.secondaryLabel }]}>
            {folder.id === FAVORITES_FOLDER_ID
              ? 'Tap ··· on any memory and select Add to Favorites.'
              : 'Tap ··· on any memory and select Add to Folder.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[fvStyles.list, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {folderEntries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={[fvStyles.entryRow, { borderBottomColor: colors.separator }]}
              activeOpacity={0.75}
              onPress={() => { Haptics.selectionAsync(); onSelectEntry(entry); }}
            >
              {/* Thumbnail */}
              <View style={[fvStyles.thumb, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
                {entry.imageUri ? (
                  <View style={StyleSheet.absoluteFill}>
                    <View style={{ flex: 1, overflow: 'hidden', borderRadius: 10 }}>
                      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <Text>{/* React Native Image below */}</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Ionicons name="image-outline" size={24} color={colors.tertiaryLabel} />
                )}
                {entry.imageUri && (
                  <View style={StyleSheet.absoluteFill}>
                    {/* Using require-style import isn't possible here; uri is fine */}
                    <View style={{ flex: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }}>
                      <View style={{ flex: 1 }}>
                        {/* Inline image */}
                        {React.createElement(require('react-native').Image, {
                          source: { uri: entry.imageUri },
                          style: { width: '100%', height: '100%' },
                          resizeMode: 'cover',
                        })}
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={fvStyles.entryInfo}>
                <Text style={[fvStyles.entryTitle, { color: colors.label }]} numberOfLines={1}>
                  {entry.title || entry.address.split(',')[0]}
                </Text>
                <Text style={[fvStyles.entryAddress, { color: colors.secondaryLabel }]} numberOfLines={1}>
                  {entry.address}
                </Text>
                <Text style={[fvStyles.entryDate, { color: colors.tertiaryLabel }]}>
                  {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>

              {/* Favorite indicator */}
              {entry.isFavorite && (
                <Ionicons name="heart" size={16} color="#FF453A" style={{ marginLeft: 8 }} />
              )}

              <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const fvStyles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backBtn:      { flexDirection: 'row', alignItems: 'center', minWidth: 80 },
  backLabel:    { fontSize: 17, fontWeight: '400', marginLeft: 2 },
  title:        { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  subtitle:     { fontSize: 13, paddingHorizontal: 20, marginBottom: 12, opacity: 0.6 },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle:   { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptyBody:    { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.6 },
  list:         { paddingHorizontal: 16 },
  entryRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  thumb:        { width: 56, height: 56, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  entryInfo:    { flex: 1 },
  entryTitle:   { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  entryAddress: { fontSize: 13, marginBottom: 2 },
  entryDate:    { fontSize: 12 },
});

// ─── Main App ─────────────────────────────────────────────────────────────────
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

          {/* Search overlay */}
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

        {/* Folder View Sheet — proper screen with back button */}
        <Modal
          visible={!!openFolder}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setOpenFolder(null)}
        >
          {openFolder && (
            <FolderViewScreen
              folder={openFolder}
              entries={entries}
              onSelectEntry={(entry) => {
                setOpenFolder(null);
                handleSelectEntry(entry);
              }}
              onToggleFavorite={toggleFavorite}
              onClose={() => setOpenFolder(null)}
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