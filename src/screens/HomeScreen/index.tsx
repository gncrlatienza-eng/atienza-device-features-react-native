import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  UIManager,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import {
  homeScreenStyles,
  sharedStyles,
  glassTokens,
  palette,
  ColorScheme,
} from './HomeScreen.styles';

// ─── Enable LayoutAnimation on Android ────────────────────────────────────────
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TravelEntry {
  id: string;
  imageUri: string;
  address: string;
  timestamp: number;
}

interface HomeScreenProps {
  entries: TravelEntry[];
  onAddEntry: () => void;
}

// ─── EntryCard ────────────────────────────────────────────────────────────────
interface EntryCardProps {
  item: TravelEntry;
  scheme: ColorScheme;
}

const EntryCard: React.FC<EntryCardProps> = ({ item, scheme }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const tokens = glassTokens[scheme];

  const handlePressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  return (
    <Animated.View
      style={[
        sharedStyles.glassCard,
        { transform: [{ scale }], borderColor: tokens.border },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={StyleSheet.absoluteFill}
      >
        {/* Full-bleed image */}
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={sharedStyles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              sharedStyles.cardImage,
              {
                backgroundColor: scheme === 'dark' ? '#2C2C2E' : '#E5E5EA',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Text style={{ fontSize: 48 }}>🗺️</Text>
          </View>
        )}

        {/* Liquid Glass footer */}
        <BlurView
          intensity={60}
          tint={scheme}
          style={[
            sharedStyles.cardBlurOverlay,
            { borderTopColor: tokens.border },
          ]}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: tokens.overlay },
            ]}
          />
          <Text style={sharedStyles.cardAddressText} numberOfLines={1}>
            📍 {item.address}
          </Text>
          <Text style={sharedStyles.cardDateText}>
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  scheme: ColorScheme;
}

const EmptyState: React.FC<EmptyStateProps> = ({ scheme }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  return (
    <View style={homeScreenStyles.emptyContainer}>
      <BlurView
        intensity={50}
        tint={scheme}
        style={[
          homeScreenStyles.emptyIconWrapper,
          { borderColor: tokens.border },
        ]}
      >
        <Text style={{ fontSize: 40 }}>🗺️</Text>
      </BlurView>

      <Text style={[homeScreenStyles.emptyTitle, { color: colors.label }]}>
        No Memories Yet
      </Text>
      <Text style={[homeScreenStyles.emptyBody, { color: colors.label }]}>
        Tap the button below to capture your first travel memory with a photo and location.
      </Text>
    </View>
  );
};

// ─── FloatingActionButton ─────────────────────────────────────────────────────
interface FloatingActionButtonProps {
  onPress: () => void;
  scheme: ColorScheme;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress, scheme }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const tokens = glassTokens[scheme];
  const accentColor = scheme === 'dark' ? 'rgba(10,132,255,0.75)' : 'rgba(0,122,255,0.85)';

  const handlePressIn = () =>
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
    onPress();
  };

  return (
    <Animated.View
      style={[
        homeScreenStyles.fabWrapper,
        {
          transform: [{ scale }],
          borderColor: tokens.border,
          backgroundColor: accentColor,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <BlurView intensity={30} tint={scheme} style={homeScreenStyles.fabInner}>
          <Text style={{ fontSize: 20, color: '#FFFFFF' }}>＋</Text>
          <Text style={homeScreenStyles.fabLabel}>Add Travel Memory</Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────
const HomeScreen: React.FC<HomeScreenProps> = ({ entries, onAddEntry }) => {
  const colorScheme = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = palette[scheme];
  const tokens = glassTokens[scheme];

  return (
    <View style={[homeScreenStyles.container, { backgroundColor: colors.systemBackground }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* Glass Header */}
      <BlurView
        intensity={80}
        tint={scheme}
        style={[homeScreenStyles.header, { borderBottomColor: tokens.border }]}
      >
        <Text style={[homeScreenStyles.headerTitle, { color: colors.label }]}>
          ✈️ Travel Diary
        </Text>
        <Text style={[homeScreenStyles.headerSubtitle, { color: colors.label }]}>
          {entries.length} {entries.length === 1 ? 'memory' : 'memories'} captured
        </Text>
      </BlurView>

      {/* Entry List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={homeScreenStyles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState scheme={scheme} />}
        renderItem={({ item }) => <EntryCard item={item} scheme={scheme} />}
      />

      {/* FAB */}
      <FloatingActionButton onPress={onAddEntry} scheme={scheme} />
    </View>
  );
};

export default HomeScreen;