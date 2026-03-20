import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { foldersScreenStyles as S } from './FoldersScreen.styles';
import type { TravelEntry, Folder } from '../../hooks/useEntries';
import { FAVORITES_FOLDER_ID } from '../../hooks/useEntries';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FoldersScreenProps {
  entries:        TravelEntry[];
  folders:        Folder[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onOpenFolder:   (folder: Folder) => void;
  onClose:        () => void;
}

// ─── Component: FolderCard ────────────────────────────────────────────────────
const FolderCard: React.FC<{
  folder:       Folder;
  entries:      TravelEntry[];
  scheme:       ColorScheme;
  onPress:      () => void;
  onLongPress?: () => void;
}> = ({ folder, entries, scheme, onPress, onLongPress }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  // Favorites folder counts isFavorite entries; others count by folderId
  const folderEntries = folder.id === FAVORITES_FOLDER_ID
    ? entries.filter((e) => e.isFavorite)
    : entries.filter((e) => e.folderId === folder.id);

  const thumbs = folderEntries.slice(0, 4);

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.82}>
      <BlurView intensity={50} tint={tokens.tint} style={[S.folderCard, { borderColor: tokens.border }]}>
        <View style={S.folderCardBlur}>

          {/* Thumbnail area */}
          <View style={[S.folderThumbRow, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
            {folderEntries.length === 0 ? (
              // Empty folder — show icon centred
              <View style={S.folderSingleThumb}>
                <Ionicons
                  name={folder.id === FAVORITES_FOLDER_ID ? 'heart' : 'folder'}
                  size={36}
                  color={folder.id === FAVORITES_FOLDER_ID ? '#FF453A' : colors.tertiaryLabel}
                />
              </View>
            ) : folderEntries.length === 1 ? (
              // Single entry
              folderEntries[0].imageUri ? (
                <Image source={{ uri: folderEntries[0].imageUri }} style={S.folderSingleThumb} resizeMode="cover" />
              ) : (
                <View style={S.folderSingleThumb}>
                  <Ionicons name="image-outline" size={32} color={colors.tertiaryLabel} />
                </View>
              )
            ) : (
              // 2-4 entries — 2×2 grid
              thumbs.map((entry, i) =>
                entry.imageUri ? (
                  <Image key={i} source={{ uri: entry.imageUri }} style={S.folderThumb} resizeMode="cover" />
                ) : (
                  <View
                    key={i}
                    style={[S.folderThumbPlaceholder, { backgroundColor: scheme === 'dark' ? '#3A3A3C' : '#D1D1D6' }]}
                  >
                    <Ionicons name="image-outline" size={16} color={colors.tertiaryLabel} />
                  </View>
                ),
              )
            )}
          </View>

          <Text style={[S.folderName, { color: colors.label }]} numberOfLines={1}>
            {folder.name}
          </Text>
          <Text style={[S.folderCount, { color: colors.secondaryLabel }]}>
            {folderEntries.length} {folderEntries.length === 1 ? 'memory' : 'memories'}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

// ─── Component: NewFolderModal ────────────────────────────────────────────────
const NewFolderModal: React.FC<{
  visible:  boolean;
  scheme:   ColorScheme;
  onCreate: (name: string) => void;
  onCancel: () => void;
}> = ({ visible, scheme, onCreate, onCancel }) => {
  const tokens        = glassTokens[scheme];
  const colors        = palette[scheme];
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={S.modalBackdrop}>
        <View style={[S.modalCard, { borderColor: tokens.border }]}>
          <BlurView intensity={80} tint={tokens.tint} style={S.modalBlur}>
            <Text style={[S.modalTitle, { color: colors.label }]}>New Folder</Text>
            <TextInput
              style={[
                S.modalInput,
                {
                  color:           colors.label,
                  borderColor:     tokens.border,
                  backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                },
              ]}
              placeholder="Folder name"
              placeholderTextColor={colors.tertiaryLabel}
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
          </BlurView>

          <View style={[S.modalDivider, { backgroundColor: colors.separator }]} />

          <BlurView intensity={80} tint={tokens.tint} style={S.modalActionRow}>
            <TouchableOpacity style={S.modalAction} onPress={() => { setName(''); onCancel(); }} activeOpacity={0.7}>
              <Text style={[S.modalActionLabel, { color: colors.tertiaryLabel }]}>Cancel</Text>
            </TouchableOpacity>

            <View style={[S.modalActionDiv, { backgroundColor: colors.separator }]} />

            <TouchableOpacity
              style={S.modalAction}
              activeOpacity={0.7}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleCreate(); }}
            >
              <Text style={[S.modalActionLabelBold, { color: name.trim() ? colors.accent : colors.tertiaryLabel }]}>
                Create
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Screen: FoldersScreen ────────────────────────────────────────────────────
const FoldersScreen: React.FC<FoldersScreenProps> = ({
  entries, folders, onCreateFolder, onDeleteFolder, onOpenFolder, onClose,
}) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme ?? 'light';
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();

  const [showNewFolder,  setShowNewFolder]  = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>
      <ScrollView
        contentContainerStyle={[S.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[S.headerWrapper, { paddingTop: insets.top + 8 }]}>

          {/* Top row: back arrow left, + button right */}
          <View style={S.headerTop}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={S.headerBackBtn}>
              <Ionicons name="chevron-back" size={26} color={colors.accent} />
              <Text style={[S.headerBackLabel, { color: colors.accent }]}>Back</Text>
            </TouchableOpacity>

            {/* New folder button */}
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); setShowNewFolder(true); }}
              activeOpacity={0.8}
              style={S.newFolderButton}
            >
              <BlurView intensity={50} tint={tokens.tint} style={[S.newFolderBlur, { borderColor: tokens.border }]}>
                <Ionicons name="add" size={22} color={colors.accent} />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Large title below */}
          <Text style={[S.headerTitle, { color: colors.label }]}>Folders</Text>
        </View>

        {/* ── Folder Grid ── */}
        <View style={S.folderGrid}>
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              entries={entries}
              scheme={scheme}
              onPress={() => { Haptics.selectionAsync(); onOpenFolder(folder); }}
              onLongPress={
                folder.isSystem ? undefined : () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setFolderToDelete(folder);
                }
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* New Folder Modal */}
      <NewFolderModal
        visible={showNewFolder}
        scheme={scheme}
        onCreate={(name) => { onCreateFolder(name); setShowNewFolder(false); }}
        onCancel={() => setShowNewFolder(false)}
      />

      {/* Delete Confirmation */}
      <Modal
        visible={!!folderToDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setFolderToDelete(null)}
      >
        <View style={S.modalBackdrop}>
          <View style={[S.modalCard, { borderColor: tokens.border }]}>
            <BlurView intensity={80} tint={tokens.tint} style={S.modalBlur}>
              <Text style={[S.modalTitle, { color: colors.label }]}>Delete Folder?</Text>
              <Text style={{ fontSize: 14, textAlign: 'center', opacity: 0.6, color: colors.label, marginBottom: 20 }}>
                "{folderToDelete?.name}" will be deleted. Memories inside will not be deleted.
              </Text>
            </BlurView>

            <View style={[S.modalDivider, { backgroundColor: colors.separator }]} />

            <BlurView intensity={80} tint={tokens.tint} style={S.modalActionRow}>
              <TouchableOpacity style={S.modalAction} onPress={() => setFolderToDelete(null)} activeOpacity={0.7}>
                <Text style={[S.modalActionLabel, { color: colors.accent }]}>Cancel</Text>
              </TouchableOpacity>

              <View style={[S.modalActionDiv, { backgroundColor: colors.separator }]} />

              <TouchableOpacity
                style={S.modalAction}
                activeOpacity={0.7}
                onPress={() => {
                  if (folderToDelete) { onDeleteFolder(folderToDelete.id); setFolderToDelete(null); }
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }}
              >
                <Text style={[S.modalActionLabelBold, { color: colors.destructive }]}>Delete</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FoldersScreen;