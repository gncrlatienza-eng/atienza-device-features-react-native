import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { palette } from '../HomeScreen/HomeScreen.styles';
import { FAVORITES_FOLDER_ID } from '../../hooks/useEntries';
import type { TravelEntry, Folder } from '../../hooks/useEntries';

interface FolderViewScreenProps {
  folder:          Folder;
  entries:         TravelEntry[];
  onSelectEntry:   (entry: TravelEntry) => void;
  onBackToFolders: () => void;
}

const FolderViewScreen: React.FC<FolderViewScreenProps> = ({
  folder, entries, onSelectEntry, onBackToFolders,
}) => {
  const { resolvedScheme } = useTheme();
  const scheme             = resolvedScheme ?? 'dark';
  const colors             = palette[scheme];
  const insets             = useSafeAreaInsets();

  const folderEntries = folder.id === FAVORITES_FOLDER_ID
    ? entries.filter((e) => e.isFavorite)
    : entries.filter((e) => e.folderId === folder.id);

  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>

      {/* Nav bar */}
      <View style={[S.navBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); onBackToFolders(); }}
          activeOpacity={0.7}
          style={S.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={colors.accent} />
          <Text style={[S.backLabel, { color: colors.accent }]}>Folders</Text>
        </TouchableOpacity>
        <Text style={[S.navTitle, { color: colors.label }]} numberOfLines={1}>
          {folder.name}
        </Text>
        <View style={S.navRight} />
      </View>

      {/* Large title + count */}
      <View style={S.titleBlock}>
        <Text style={[S.largeTitle, { color: colors.label }]}>{folder.name}</Text>
        <Text style={[S.countLabel, { color: colors.secondaryLabel }]}>
          {folderEntries.length} {folderEntries.length === 1 ? 'memory' : 'memories'}
        </Text>
      </View>

      {folderEntries.length === 0 ? (
        <View style={S.empty}>
          <Ionicons
            name={folder.id === FAVORITES_FOLDER_ID ? 'heart-outline' : 'folder-open-outline'}
            size={64}
            color={colors.tertiaryLabel}
          />
          <Text style={[S.emptyTitle, { color: colors.label }]}>
            {folder.id === FAVORITES_FOLDER_ID ? 'No Favorites Yet' : 'This folder is empty'}
          </Text>
          <Text style={[S.emptyBody, { color: colors.secondaryLabel }]}>
            {folder.id === FAVORITES_FOLDER_ID
              ? 'Tap ··· on any memory and choose Add to Favorites.'
              : 'Tap ··· on any memory and choose Add to Folder.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {folderEntries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={[S.row, { borderBottomColor: colors.separator }]}
              activeOpacity={0.7}
              onPress={() => { Haptics.selectionAsync(); onSelectEntry(entry); }}
            >
              <View style={[S.thumb, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
                {entry.imageUri
                  ? <Image source={{ uri: entry.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  : <Ionicons name="image-outline" size={22} color={colors.tertiaryLabel} />}
              </View>

              <View style={S.info}>
                <Text style={[S.entryTitle,   { color: colors.label }]}          numberOfLines={1}>
                  {entry.title || entry.address.split(',')[0]}
                </Text>
                <Text style={[S.entryAddress, { color: colors.secondaryLabel }]} numberOfLines={1}>
                  {entry.address}
                </Text>
                <Text style={[S.entryDate,    { color: colors.tertiaryLabel }]}>
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
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

const S = StyleSheet.create({
  container:    { flex: 1 },
  navBar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 4 },
  backBtn:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, minWidth: 90 },
  backLabel:    { fontSize: 17, fontWeight: '400', marginLeft: 2 },
  navTitle:     { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  navRight:     { minWidth: 90 },
  titleBlock:   { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  largeTitle:   { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  countLabel:   { fontSize: 15, marginTop: 2, opacity: 0.6 },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle:   { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptyBody:    { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.6 },
  row:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  thumb:        { width: 56, height: 56, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  info:         { flex: 1 },
  entryTitle:   { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  entryAddress: { fontSize: 13, marginBottom: 2 },
  entryDate:    { fontSize: 12 },
});

export default FolderViewScreen;