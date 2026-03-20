import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { foldersScreenStyles as S, FOLDER_CARD_WIDTH } from './FoldersScreen.styles';
import type { TravelEntry, Folder } from '../../hooks/useEntries';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FoldersScreenProps {
  folders:       Folder[];
  entries:       TravelEntry[];
  onOpenFolder:  (folder: Folder) => void;
  onCreateFolder:(name: string) => void;
  onDeleteFolder:(id: string) => void;
}

// ─── Component: FolderCard ────────────────────────────────────────────────────
const FolderCard: React.FC<{
  folder:  Folder;
  entries: TravelEntry[];
  scheme:  ColorScheme;
  onPress: () => void;
}> = ({ folder, entries, scheme, onPress }) => {
  const tokens       = glassTokens[scheme];
  const colors       = palette[scheme];
  const thumbEntries = entries.slice(0, 4);
  const count        = entries.length;

  const iconColor = folder.id === 'favorites' ? '#FF9500' : colors.accent;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView
        intensity={50}
        tint={tokens.tint}
        style={[S.folderCard, { borderColor: tokens.border }]}
      >
        <View style={S.folderCardBlur}>
          {/* Folder icon or thumbnail grid */}
          <BlurView
            intensity={40}
            tint={tokens.tint}
            style={[
              S.folderIconWrapper,
              {
                borderColor:     folder.id === 'favorites' ? 'rgba(255,149,0,0.30)' : tokens.border,
                backgroundColor: folder.id === 'favorites' ? 'rgba(255,149,0,0.10)' : 'transparent',
              },
            ]}
          >
            {thumbEntries.length > 0 ? (
              <View style={S.folderThumbGrid}>
                {thumbEntries.map((e, i) =>
                  e.imageUri ? (
                    <Image key={i} source={{ uri: e.imageUri }} style={S.folderThumb} resizeMode="cover" />
                  ) : (
                    <View key={i} style={[S.folderThumbPlaceholder, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
                      <Ionicons name="image-outline" size={10} color={colors.tertiaryLabel} />
                    </View>
                  ),
                )}
              </View>
            ) : (
              <Ionicons
                name={folder.id === 'favorites' ? 'heart' : 'folder'}
                size={24}
                color={iconColor}
              />
            )}
          </BlurView>

          <Text style={[S.folderName, { color: colors.label }]} numberOfLines={1}>
            {folder.name}
          </Text>
          <Text style={[S.folderCount, { color: colors.label }]}>
            {count} {count === 1 ? 'memory' : 'memories'}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

// ─── Component: NewFolderModal ────────────────────────────────────────────────
const NewFolderModal: React.FC<{
  visible:   boolean;
  scheme:    ColorScheme;
  onCreate:  (name: string) => void;
  onCancel:  () => void;
}> = ({ visible, scheme, onCreate, onCancel }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCreate(name.trim());
    setName('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={S.modalBackdrop}>
        <View style={[S.modalCard, { borderColor: tokens.border }]}>
          <BlurView intensity={80} tint={tokens.tint} style={S.modalBlur}>
            <Text style={[S.modalTitle, { color: colors.label }]}>New Folder</Text>
            <BlurView
              intensity={40}
              tint={tokens.tint}
              style={[S.modalInput, { borderColor: tokens.border }]}
            >
              <TextInput
                style={[S.modalInputBlur, S.modalInputText, { color: colors.label }]}
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
          </BlurView>

          <View style={[S.modalDivider, { backgroundColor: colors.separator }]} />

          <BlurView intensity={80} tint={tokens.tint} style={S.modalActions}>
            <TouchableOpacity
              style={S.modalAction}
              onPress={() => { setName(''); onCancel(); }}
              activeOpacity={0.7}
            >
              <Text style={[S.modalActionLabel, { color: colors.tertiaryLabel }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={[S.modalActionDivider, { backgroundColor: colors.separator }]} />
            <TouchableOpacity
              style={S.modalAction}
              onPress={handleCreate}
              activeOpacity={0.7}
            >
              <Text style={[S.modalActionBold, { color: name.trim() ? colors.accent : colors.tertiaryLabel }]}>
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
  folders,
  entries,
  onOpenFolder,
  onCreateFolder,
  onDeleteFolder,
}) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();
  const [showNewFolder, setShowNewFolder] = useState(false);

  const entriesInFolder = (folderId: string) =>
    entries.filter((e) => e.folderIds.includes(folderId));

  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>
      <ScrollView
        contentContainerStyle={[S.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={S.headerWrapper}>
          <View style={S.headerTop}>
            <Text style={[S.headerTitle, { color: colors.label }]}>Folders</Text>
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); setShowNewFolder(true); }}
              activeOpacity={0.8}
            >
              <BlurView
                intensity={50}
                tint={tokens.tint}
                style={[S.newFolderButton, { borderColor: tokens.border }]}
              >
                <View style={S.newFolderBlur}>
                  <Ionicons name="add" size={20} color={colors.accent} />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
          <Text style={[S.headerSubtitle, { color: colors.label }]}>
            {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
          </Text>
        </View>

        {/* Folder grid */}
        {folders.length === 0 ? (
          <View style={S.emptyContainer}>
            <Ionicons name="folder-outline" size={52} color={colors.tertiaryLabel} />
            <Text style={[S.emptyTitle, { color: colors.label }]}>No Folders Yet</Text>
            <Text style={[S.emptyBody, { color: colors.label }]}>
              Tap + to create your first folder and organise your memories.
            </Text>
          </View>
        ) : (
          <View style={S.folderGrid}>
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                entries={entriesInFolder(folder.id)}
                scheme={scheme}
                onPress={() => { Haptics.selectionAsync(); onOpenFolder(folder); }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <NewFolderModal
        visible={showNewFolder}
        scheme={scheme}
        onCreate={(name) => { onCreateFolder(name); setShowNewFolder(false); }}
        onCancel={() => setShowNewFolder(false)}
      />
    </View>
  );
};

export default FoldersScreen;