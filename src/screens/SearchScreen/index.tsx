import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { searchScreenStyles as S, GRID_ITEM_SIZE, GRID_GAP, GRID_COLUMNS } from './SearchScreen.styles';
import type { TravelEntry } from '../../hooks/useEntries';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SearchScreenProps {
  entries:       TravelEntry[];
  onSelectEntry: (entry: TravelEntry) => void;
  onClose:       () => void;
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
    <BlurView
      intensity={50}
      tint={tokens.tint}
      style={[S.suggestionCard, { borderColor: tokens.border }]}
    >
      <View style={S.suggestionBlur}>
        {/* 2×2 thumb grid */}
        <View style={S.suggestionThumbGrid}>
          {thumbs.map((entry, i) =>
            entry.imageUri ? (
              <Image
                key={i}
                source={{ uri: entry.imageUri }}
                style={S.suggestionThumb}
                resizeMode="cover"
              />
            ) : (
              <View
                key={i}
                style={[
                  S.suggestionThumbPlaceholder,
                  { backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA' },
                ]}
              >
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

// ─── Screen: SearchScreen ─────────────────────────────────────────────────────
const SearchScreen: React.FC<SearchScreenProps> = ({ entries, onSelectEntry, onClose }) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();

  const [query,     setQuery]     = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef                  = useRef<TextInput>(null);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  // Slide-up + fade-in animation
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
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const isSearching = query.trim().length > 0;

  const results = isSearching
    ? entries.filter(
        (e) =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.address.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <Animated.View
      style={[
        S.container,
        { backgroundColor: colors.systemBackground, transform: [{ translateY: slideY }], opacity },
      ]}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <BlurView
        intensity={80}
        tint={tokens.tint}
        style={[S.header, { paddingTop: insets.top + 8, borderBottomColor: tokens.border }]}
      >
        <View style={S.headerTop}>
          <Text style={[S.headerTitle, { color: colors.label }]}>Search</Text>
          <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
            <BlurView
              intensity={50}
              tint={tokens.tint}
              style={[S.doneButton, { borderColor: tokens.border }]}
            >
              <Text style={[S.doneLabel, { color: colors.accent }]}>Done</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Search input */}
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
            placeholder="Search your memories..."
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
        {/* Suggested section — shown when not searching */}
        {!isSearching && entries.length > 0 && (
          <>
            <View style={S.sectionHeader}>
              <Text style={[S.sectionTitle, { color: colors.label }]}>Suggested</Text>
            </View>
            <SuggestionCard entries={entries} scheme={scheme} />
          </>
        )}

        {/* Empty prompt — no entries at all */}
        {!isSearching && entries.length === 0 && (
          <View style={S.emptyContainer}>
            <Ionicons
              name="search"
              size={48}
              color={colors.tertiaryLabel}
              style={{ marginBottom: 16, opacity: 0.5 }}
            />
            <Text style={[S.emptyTitle, { color: colors.label }]}>No Memories to Search</Text>
            <Text style={[S.emptyBody, { color: colors.label }]}>
              Add some travel memories first and they'll appear here.
            </Text>
          </View>
        )}

        {/* Search results */}
        {isSearching && (
          results.length > 0 ? (
            <>
              <View style={S.resultsCount}>
                <Text style={[S.resultsCountLabel, { color: colors.label }]}>
                  {results.length} {results.length === 1 ? 'Result' : 'Results'}
                </Text>
              </View>

              <View style={S.grid}>
                {results.map((item) => (
                  <GridItem
                    key={item.id}
                    item={item}
                    scheme={scheme}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onSelectEntry(item);
                    }}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={S.emptyContainer}>
              <Ionicons
                name="search"
                size={48}
                color={colors.tertiaryLabel}
                style={{ marginBottom: 16, opacity: 0.5 }}
              />
              <Text style={[S.emptyTitle, { color: colors.label }]}>No Results</Text>
              <Text style={[S.emptyBody, { color: colors.label }]}>
                No memories found for "{query}".{'\n'}Try a different location or title.
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </Animated.View>
  );
};

export default SearchScreen;