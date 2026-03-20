import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { searchScreenStyles as S, GRID_ITEM_SIZE } from './SearchScreen.styles';
import type { TravelEntry, Folder } from '../../hooks/useEntries';
import { FAVORITES_FOLDER_ID } from '../../hooks/useEntries';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SearchScreenProps {
  entries:        TravelEntry[];
  folders:        Folder[];
  onSelectEntry:  (entry: TravelEntry) => void;
  onOpenFolder:   (folder: Folder) => void;
  onClose:        () => void;
}

// ─── Component: SuggestionCard ────────────────────────────────────────────────
const SuggestionCard: React.FC<{
  entries: TravelEntry[];
  scheme:  ColorScheme;
}> = ({ entries, scheme }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];
  const thumbs = entries.slice(0, 4);

  return (
    <BlurView intensity={50} tint={tokens.tint} style={[S.suggestionCard, { borderColor: tokens.border }]}>
      <View style={S.suggestionBlur}>
        <View style={S.suggestionThumbGrid}>
          {thumbs.map((entry, i) =>
            entry.imageUri ? (
              <Image key={i} source={{ uri: entry.imageUri }} style={S.suggestionThumb} resizeMode="cover" />
            ) : (
              <View key={i} style={[S.suggestionThumbPlaceholder, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
                <Ionicons name="image-outline" size={14} color={colors.tertiaryLabel} />
              </View>
            ),
          )}
        </View>
        <View style={S.suggestionInfo}>
          <Text style={[S.suggestionTitle, { color: colors.label }]}>All Memories</Text>
          <Text style={[S.suggestionSub, { color: colors.label }]}>
            Album · {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.tertiaryLabel} />
      </View>
    </BlurView>
  );
};

// ─── Component: FolderRow ─────────────────────────────────────────────────────
const FolderRow: React.FC<{
  folder:   Folder;
  entries:  TravelEntry[];
  scheme:   ColorScheme;
  onPress:  () => void;
}> = ({ folder, entries, scheme, onPress }) => {
  const colors = palette[scheme];

  const count = folder.id === FAVORITES_FOLDER_ID
    ? entries.filter((e) => e.isFavorite).length
    : entries.filter((e) => e.folderId === folder.id).length;

  const thumb = folder.id === FAVORITES_FOLDER_ID
    ? entries.find((e) => e.isFavorite && e.imageUri)
    : entries.find((e) => e.folderId === folder.id && e.imageUri);

  return (
    <TouchableOpacity
      style={[srStyles.folderRow, { borderBottomColor: colors.separator }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Thumbnail */}
      <View style={[srStyles.folderThumb, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
        {thumb?.imageUri ? (
          <Image source={{ uri: thumb.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Ionicons
            name={folder.id === FAVORITES_FOLDER_ID ? 'heart' : 'folder'}
            size={22}
            color={folder.id === FAVORITES_FOLDER_ID ? '#FF453A' : colors.tertiaryLabel}
          />
        )}
      </View>

      <View style={srStyles.folderInfo}>
        <Text style={[srStyles.folderName, { color: colors.label }]}>{folder.name}</Text>
        <Text style={[srStyles.folderCount, { color: colors.secondaryLabel }]}>
          {count} {count === 1 ? 'memory' : 'memories'}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
    </TouchableOpacity>
  );
};

// ─── Component: GridItem ──────────────────────────────────────────────────────
const GridItem: React.FC<{
  item:    TravelEntry;
  scheme:  ColorScheme;
  onPress: () => void;
}> = ({ item, scheme, onPress }) => {
  const scale  = useRef(new Animated.Value(1)).current;
  const colors = palette[scheme];

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <Animated.View style={[S.gridItem, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={() => { onPressOut(); onPress(); }}
        style={StyleSheet.absoluteFill}
      >
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={S.gridImage} resizeMode="cover" />
        ) : (
          <View style={[S.gridPlaceholder, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
            <Ionicons name="image-outline" size={28} color={colors.tertiaryLabel} />
          </View>
        )}
        {item.isFavorite && (
          <View style={{ position: 'absolute', bottom: 4, right: 4 }}>
            <Ionicons name="heart" size={14} color="#FF453A" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Component: EntryRow (list style for entry results) ───────────────────────
const EntryRow: React.FC<{
  entry:   TravelEntry;
  scheme:  ColorScheme;
  onPress: () => void;
}> = ({ entry, scheme, onPress }) => {
  const colors = palette[scheme];
  return (
    <TouchableOpacity
      style={[srStyles.entryRow, { borderBottomColor: colors.separator }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[srStyles.entryThumb, { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}>
        {entry.imageUri
          ? <Image source={{ uri: entry.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <Ionicons name="image-outline" size={20} color={colors.tertiaryLabel} />}
      </View>
      <View style={srStyles.entryInfo}>
        <Text style={[srStyles.entryTitle, { color: colors.label }]} numberOfLines={1}>
          {entry.title || entry.address.split(',')[0]}
        </Text>
        <Text style={[srStyles.entryAddress, { color: colors.secondaryLabel }]} numberOfLines={1}>
          {entry.address}
        </Text>
      </View>
      {entry.isFavorite && <Ionicons name="heart" size={14} color="#FF453A" style={{ marginRight: 6 }} />}
      <Ionicons name="chevron-forward" size={16} color={colors.tertiaryLabel} />
    </TouchableOpacity>
  );
};

const srStyles = StyleSheet.create({
  folderRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  folderThumb:  { width: 48, height: 48, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  folderInfo:   { flex: 1 },
  folderName:   { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  folderCount:  { fontSize: 13 },
  entryRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  entryThumb:   { width: 48, height: 48, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  entryInfo:    { flex: 1 },
  entryTitle:   { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  entryAddress: { fontSize: 13 },
});

// ─── Screen: SearchScreen ─────────────────────────────────────────────────────
const SearchScreen: React.FC<SearchScreenProps> = ({ entries, folders, onSelectEntry, onOpenFolder, onClose }) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();

  const [query,     setQuery]     = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef                  = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  const slideY  = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY,  { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Haptics.selectionAsync();
    Animated.parallel([
      Animated.spring(slideY,  { toValue: 40, useNativeDriver: true, speed: 20, bounciness: 0 }),
      Animated.timing(opacity, { toValue: 0,  duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  // Filter entries by title or address
  const entryResults: TravelEntry[] = isSearching
    ? entries.filter(
        (e) => e.title.toLowerCase().includes(q) || e.address.toLowerCase().includes(q),
      )
    : [];

  // Filter folders by name
  const folderResults: Folder[] = isSearching
    ? folders.filter((f) => f.name.toLowerCase().includes(q))
    : [];

  const totalResults = entryResults.length + folderResults.length;

  return (
    <Animated.View style={[S.container, { backgroundColor: colors.systemBackground, transform: [{ translateY: slideY }], opacity }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* ── Header ── */}
      <BlurView
        intensity={80}
        tint={tokens.tint}
        style={[S.header, { paddingTop: insets.top + 8, borderBottomColor: tokens.border }]}
      >
        <View style={S.headerTop}>
          <Text style={[S.headerTitle, { color: colors.label }]}>Search</Text>
          <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
            <BlurView intensity={50} tint={tokens.tint} style={[S.doneButton, { borderColor: tokens.border }]}>
              <Text style={[S.doneLabel, { color: colors.accent }]}>Done</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <BlurView
          intensity={40}
          tint={tokens.tint}
          style={[
            S.searchBarWrapper,
            {
              borderColor:     isFocused ? colors.accent : tokens.border,
              backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.tertiaryLabel} />
          <TextInput
            ref={inputRef}
            style={[S.searchInput, { color: colors.label }]}
            placeholder="Memories, folders, places..."
            placeholderTextColor={colors.tertiaryLabel}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.tertiaryLabel} />
            </TouchableOpacity>
          )}
        </BlurView>
      </BlurView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Not searching: show suggested + all folders ── */}
        {!isSearching && (
          <>
            {entries.length > 0 && (
              <>
                <View style={S.sectionHeader}>
                  <Text style={[S.sectionTitle, { color: colors.label }]}>Suggested</Text>
                </View>
                <SuggestionCard entries={entries} scheme={scheme} />
              </>
            )}

            {folders.length > 0 && (
              <>
                <View style={S.sectionHeader}>
                  <Text style={[S.sectionTitle, { color: colors.label }]}>Folders</Text>
                </View>
                {folders.map((folder) => (
                  <FolderRow
                    key={folder.id}
                    folder={folder}
                    entries={entries}
                    scheme={scheme}
                    onPress={() => { Haptics.selectionAsync(); onOpenFolder(folder); }}
                  />
                ))}
              </>
            )}

            {entries.length === 0 && (
              <View style={S.emptyContainer}>
                <Ionicons name="search" size={48} color={colors.tertiaryLabel} style={{ marginBottom: 16, opacity: 0.5 }} />
                <Text style={[S.emptyTitle, { color: colors.label }]}>No Memories Yet</Text>
                <Text style={[S.emptyBody, { color: colors.label }]}>
                  Add some travel memories and they'll appear here.
                </Text>
              </View>
            )}
          </>
        )}

        {/* ── Searching: show matching folders then matching entries ── */}
        {isSearching && (
          totalResults === 0 ? (
            <View style={S.emptyContainer}>
              <Ionicons name="search" size={48} color={colors.tertiaryLabel} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Text style={[S.emptyTitle, { color: colors.label }]}>No Results</Text>
              <Text style={[S.emptyBody, { color: colors.label }]}>
                Nothing matched "{query}".{'\n'}Try a different title, place, or folder name.
              </Text>
            </View>
          ) : (
            <>
              <View style={S.resultsCount}>
                <Text style={[S.resultsCountLabel, { color: colors.label }]}>
                  {totalResults} {totalResults === 1 ? 'Result' : 'Results'}
                </Text>
              </View>

              {/* Folder results */}
              {folderResults.length > 0 && (
                <>
                  <View style={S.sectionHeader}>
                    <Text style={[S.sectionTitle, { color: colors.label }]}>Folders</Text>
                  </View>
                  {folderResults.map((folder) => (
                    <FolderRow
                      key={folder.id}
                      folder={folder}
                      entries={entries}
                      scheme={scheme}
                      onPress={() => { Haptics.selectionAsync(); handleClose(); onOpenFolder(folder); }}
                    />
                  ))}
                </>
              )}

              {/* Entry results */}
              {entryResults.length > 0 && (
                <>
                  <View style={S.sectionHeader}>
                    <Text style={[S.sectionTitle, { color: colors.label }]}>Memories</Text>
                  </View>
                  {entryResults.map((entry) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      scheme={scheme}
                      onPress={() => { Haptics.selectionAsync(); onSelectEntry(entry); }}
                    />
                  ))}
                </>
              )}
            </>
          )
        )}
      </ScrollView>
    </Animated.View>
  );
};

export default SearchScreen;