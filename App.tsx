import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useEntries, FAVORITES_FOLDER_ID } from './src/hooks/useEntries';
import { palette, glassTokens } from './src/screens/HomeScreen/HomeScreen.styles';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import FoldersScreen from './src/screens/FoldersScreen';
import SearchScreen from './src/screens/SearchScreen';
import type { TravelEntry, Folder } from './src/hooks/useEntries';

// ─── FolderViewScreen ─────────────────────────────────────────────────────────
// Rendered as an absoluteFill overlay — avoids the Modal white-flash on dismiss.
const FolderViewScreen: React.FC<{
  folder:        Folder;
  entries:       TravelEntry[];
  onSelectEntry: (entry: TravelEntry) => void;
  onClose:       () => void;
}> = ({ folder, entries, onSelectEntry, onClose }) => {
  const { resolvedScheme } = useTheme();
  const scheme             = resolvedScheme ?? 'dark';
  const colors             = palette[scheme];
  const insets             = useSafeAreaInsets();

  const folderEntries = folder.id === FAVORITES_FOLDER_ID
    ? entries.filter((e) => e.isFavorite)
    : entries.filter((e) => e.folderId === folder.id);

  return (
    <View style={[fvStyles.container, { backgroundColor: colors.systemBackground }]}>

      {/* ── Navigation bar (matches screenshot style) ── */}
      <View style={[fvStyles.navBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); onClose(); }} activeOpacity={0.7} style={fvStyles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.accent} />
          <Text style={[fvStyles.backLabel, { color: colors.accent }]}>Folders</Text>
        </TouchableOpacity>

        <Text style={[fvStyles.navTitle, { color: colors.label }]} numberOfLines={1}>
          {folder.name}
        </Text>

        {/* Spacer to balance the back button */}
        <View style={fvStyles.navRight} />
      </View>

      {/* ── Large title + count ── */}
      <View style={fvStyles.titleBlock}>
        <Text style={[fvStyles.largeTitle, { color: colors.label }]}>{folder.name}</Text>
        <Text style={[fvStyles.countLabel, { color: colors.secondaryLabel }]}>
          {folderEntries.length} {folderEntries.length === 1 ? 'memory' : 'memories'}
        </Text>
      </View>

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
              ? 'Tap ··· on any memory and choose Add to Favorites.'
              : 'Tap ··· on any memory and choose Add to Folder.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
        >
          {folderEntries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={[fvStyles.row, { borderBottomColor: colors.separator }]}
              activeOpacity={0.7}
              onPress={() => { Haptics.selectionAsync(); onSelectEntry(entry); }}
            >
              {/* Thumbnail */}
              <View style={[fvStyles.thumb, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
                {entry.imageUri
                  ? <Image source={{ uri: entry.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  : <Ionicons name="image-outline" size={22} color={colors.tertiaryLabel} />}
              </View>

              {/* Info */}
              <View style={fvStyles.info}>
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

              {entry.isFavorite && (
                <Ionicons name="heart" size={16} color="#FF453A" style={{ marginRight: 6 }} />
              )}
              <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const fvStyles = StyleSheet.create({
  container:   { flex: 1 },

  // Nav bar (small title row)
  navBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 4 },
  backBtn:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, minWidth: 90 },
  backLabel:   { fontSize: 17, fontWeight: '400', marginLeft: 2 },
  navTitle:    { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  navRight:    { minWidth: 90 },

  // Large title block below nav bar
  titleBlock:  { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  largeTitle:  { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  countLabel:  { fontSize: 15, marginTop: 2, opacity: 0.6 },

  // Empty state
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle:  { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptyBody:   { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.6 },

  // Entry rows
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  thumb:       { width: 56, height: 56, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  info:        { flex: 1 },
  entryTitle:  { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  entryAddress:{ fontSize: 13, marginBottom: 2 },
  entryDate:   { fontSize: 12 },
});

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const {
    entries, folders, addEntry, deleteEntry,
    toggleFavorite, moveToFolder, createFolder, deleteFolder,
  } = useEntries();

  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [showAddEntry,  setShowAddEntry]  = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [showFolders,   setShowFolders]   = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TravelEntry | null>(null);
  const [openFolder,    setOpenFolder]    = useState<Folder | null>(null);

  const handleSave = (entry: TravelEntry) => { addEntry(entry); setShowAddEntry(false); };
  const handleDelete = (id: string) => { deleteEntry(id); setSelectedEntry(null); };

  const handleSelectEntry = (entry: TravelEntry) => {
    setShowSearch(false);
    setOpenFolder(null);
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

          {/* ── Base: HomeScreen ── */}
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

          {/* ── Overlay: Search (no Modal = no white flash) ── */}
          {showSearch && (
            <View style={StyleSheet.absoluteFill}>
              <SearchScreen
                entries={entries}
                folders={folders}
                onSelectEntry={handleSelectEntry}
                onOpenFolder={(folder) => {
                  setShowSearch(false);
                  setOpenFolder(folder);
                }}
                onClose={() => setShowSearch(false)}
              />
            </View>
          )}

          {/* ── Overlay: Folders list ── */}
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

          {/* ── Overlay: Folder contents (NO Modal = no white flash on back) ── */}
          {openFolder && (
            <View style={StyleSheet.absoluteFill}>
              <FolderViewScreen
                folder={openFolder}
                entries={entries}
                onSelectEntry={handleSelectEntry}
                onClose={() => setOpenFolder(null)}
              />
            </View>
          )}

        </View>

        {/* Add Entry — pageSheet is fine here (opening, not closing causes the flash) */}
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

      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });