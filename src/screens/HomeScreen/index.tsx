import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import {
  ColorScheme,
  glassTokens,
  homeScreenStyles as S,
  palette,
} from './HomeScreen.styles';

// ─── Android LayoutAnimation ──────────────────────────────────────────────────
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TravelEntry {
  id:        string;
  imageUri:  string;
  address:   string;
  timestamp: number;
  note?:     string;
}

interface HomeScreenProps {
  entries:       TravelEntry[];
  onAddEntry:    () => void;
  onSelectEntry: (entry: TravelEntry) => void;
  onLogout?:     () => void;
}

type NavTab = 'home' | 'favorites';

// ─── Hook: Press Animation ────────────────────────────────────────────────────
const usePressAnimation = (toValue = 0.96) => {
  const scale  = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => ({ toValue: to, useNativeDriver: true, speed: 20, bounciness: 5 });
  const onPressIn  = () => Animated.spring(scale, spring(toValue)).start();
  const onPressOut = (cb?: () => void) => Animated.spring(scale, spring(1)).start(() => cb?.());
  return { scale, onPressIn, onPressOut };
};

// ─── Component: ImagePlaceholder ─────────────────────────────────────────────
const ImagePlaceholder: React.FC<{ scheme: ColorScheme; size?: number }> = ({
  scheme,
  size = 52,
}) => (
  <View
    style={[
      StyleSheet.absoluteFill,
      {
        backgroundColor: scheme === 'dark' ? '#1C1C1E' : '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
      },
    ]}
  >
    <Ionicons
      name="image-outline"
      size={size}
      color={scheme === 'dark' ? '#3A3A3C' : '#C7C7CC'}
    />
  </View>
);

// ─── Component: EntryCard ─────────────────────────────────────────────────────
const EntryCard: React.FC<{
  item:    TravelEntry;
  scheme:  ColorScheme;
  onPress: () => void;
}> = ({ item, scheme, onPress }) => {
  const { scale, onPressIn, onPressOut } = usePressAnimation(0.97);
  const tokens = glassTokens[scheme];
  const title  = item.address.split(',')[0] ?? item.address;

  return (
    <Animated.View
      style={[S.entryCard, { transform: [{ scale }], borderColor: tokens.border }]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={() => onPressOut(onPress)}
        style={StyleSheet.absoluteFill}
      >
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={S.entryImage} resizeMode="cover" />
        ) : (
          <ImagePlaceholder scheme={scheme} />
        )}

        <BlurView
          intensity={50}
          tint={tokens.tint}
          style={[S.entryOverlay, { borderTopColor: tokens.border }]}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tokens.overlay }]} />
          <Text style={S.entryTitle} numberOfLines={1}>{title}</Text>
          <View style={S.entryAddressRow}>
            <Ionicons name="location" size={12} color="rgba(255,255,255,0.75)" />
            <Text style={S.entryAddress} numberOfLines={1}>{item.address}</Text>
          </View>
          <Text style={S.entryDate}>
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'long',
              day:   'numeric',
              year:  'numeric',
            })}
          </Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Component: EmptyState ────────────────────────────────────────────────────
const EmptyState: React.FC<{ scheme: ColorScheme }> = ({ scheme }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  return (
    <View style={S.emptyContainer}>
      <BlurView
        intensity={50}
        tint={tokens.tint}
        style={[S.emptyIconWrapper, { borderColor: tokens.border }]}
      >
        <View style={S.emptyIconBlur}>
          <Ionicons name="map-outline" size={64} color={colors.tertiaryLabel} />
        </View>
      </BlurView>
      <Text style={[S.emptyTitle, { color: colors.label }]}>No Memories Yet</Text>
      <Text style={[S.emptyBody, { color: colors.label }]}>
        Start your travel diary by adding your first memory below.
      </Text>
    </View>
  );
};

// ─── Component: CTAButton ─────────────────────────────────────────────────────
const CTAButton: React.FC<{
  label:      string;
  scheme:     ColorScheme;
  isPrimary?: boolean;
  onPress:    () => void;
}> = ({ label, scheme, isPrimary = false, onPress }) => {
  const { scale, onPressIn, onPressOut } = usePressAnimation(0.96);
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  const background = isPrimary
    ? scheme === 'dark' ? 'rgba(10, 132, 255, 0.25)' : 'rgba(0, 122, 255, 0.12)'
    : scheme === 'dark' ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <Animated.View style={[S.ctaWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPressOut(onPress);
        }}
      >
        <BlurView
          intensity={80}
          tint={tokens.tint}
          style={[S.ctaBlur, { backgroundColor: background }]}
        >
          <Text style={[S.ctaLabel, { color: isPrimary ? colors.accent : colors.label }]}>
            {label}
          </Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Component: SearchBar ─────────────────────────────────────────────────────
const SearchBar: React.FC<{
  scheme:   ColorScheme;
  value:    string;
  onChange: (text: string) => void;
}> = ({ scheme, value, onChange }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  return (
    <BlurView
      intensity={60}
      tint={tokens.tint}
      style={[S.searchWrapper, { borderColor: tokens.border }]}
    >
      <View style={S.searchBlur}>
        <Ionicons name="search" size={16} color={colors.tertiaryLabel} />
        <TextInput
          style={[S.searchInput, { color: colors.label }]}
          placeholder="Search memories..."
          placeholderTextColor={colors.tertiaryLabel}
          value={value}
          onChangeText={onChange}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={16} color={colors.tertiaryLabel} />
          </TouchableOpacity>
        )}
      </View>
    </BlurView>
  );
};

// ─── Component: ThemeToggle ───────────────────────────────────────────────────
const ThemeToggle: React.FC<{ scheme: ColorScheme }> = ({ scheme }) => {
  const { resolvedScheme, toggleTheme } = useTheme();
  const isDark     = resolvedScheme === 'dark';
  const colors     = palette[scheme];
  const translateX = useRef(new Animated.Value(isDark ? 18 : 0)).current;

  const handleToggle = () => {
    Haptics.selectionAsync();
    Animated.spring(translateX, {
      toValue:         isDark ? 0 : 18,
      useNativeDriver: true,
      speed:           20,
      bounciness:      6,
    }).start();
    toggleTheme();
  };

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
      <View
        style={[
          S.toggleTrack,
          { backgroundColor: isDark ? colors.accent : 'rgba(120, 120, 128, 0.32)' },
        ]}
      >
        <Animated.View style={[S.toggleThumb, { transform: [{ translateX }] }]} />
      </View>
    </TouchableOpacity>
  );
};

// ─── Component: ProfileDropdown ───────────────────────────────────────────────
const ProfileDropdown: React.FC<{
  scheme:    ColorScheme;
  onClose:   () => void;
  onLogout?: () => void;
}> = ({ scheme, onClose, onLogout }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={S.dropdownBackdrop} />
      </TouchableWithoutFeedback>

      <View style={[S.dropdownWrapper, { borderColor: tokens.border }]}>
        <BlurView intensity={80} tint={tokens.tint} style={S.dropdownBlur}>
          <View style={S.dropdownThemeRow}>
            <Ionicons
              name={scheme === 'dark' ? 'moon' : 'sunny'}
              size={18}
              color={colors.secondaryLabel}
            />
            <Text style={[S.dropdownThemeLabel, { color: colors.label }]}>Dark Mode</Text>
            <ThemeToggle scheme={scheme} />
          </View>

          <View style={[S.dropdownSeparator, { backgroundColor: colors.separator }]} />

          <TouchableOpacity
            style={S.dropdownItem}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onClose();
              onLogout?.();
            }}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
            <Text style={[S.dropdownItemLabel, { color: colors.destructive }]}>Log Out</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </>
  );
};

// ─── Component: FloatingCapsuleNav ────────────────────────────────────────────
interface FloatingCapsuleNavProps {
  activeTab:     NavTab;
  scheme:        ColorScheme;
  bottomInset:   number;
  onTabPress:    (tab: NavTab) => void;
  onAddPress:    () => void;
  onSearchPress: () => void;
}

const FloatingCapsuleNav: React.FC<FloatingCapsuleNavProps> = ({
  activeTab,
  scheme,
  bottomInset,
  onTabPress,
  onAddPress,
  onSearchPress,
}) => {
  const tokens  = glassTokens[scheme];
  const colors  = palette[scheme];
  const navBottom = bottomInset > 0 ? bottomInset - 8 : 12;
  const { scale: plusScale, onPressIn: plusIn, onPressOut: plusOut } = usePressAnimation(0.92);

  const NavButton: React.FC<{
    tab:            NavTab;
    iconName:       keyof typeof Ionicons.glyphMap;
    iconNameActive: keyof typeof Ionicons.glyphMap;
    label:          string;
  }> = ({ tab, iconName, iconNameActive, label }) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={S.navItemWrapper}
        activeOpacity={0.7}
        onPress={() => {
          Haptics.selectionAsync();
          onTabPress(tab);
        }}
      >
        <BlurView intensity={isActive ? 35 : 0} tint={tokens.tint} style={S.navIconButton}>
          <Ionicons
            name={isActive ? iconNameActive : iconName}
            size={20}
            color={isActive ? colors.accent : colors.tertiaryLabel}
          />
        </BlurView>
        <Text style={[S.navLabel, { color: isActive ? colors.accent : colors.tertiaryLabel }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[S.navWrapper, { borderColor: tokens.navBorder, bottom: navBottom }]}>
      <BlurView intensity={40} tint={tokens.tint} style={S.navBlur}>
        <NavButton tab="home"      iconName="home-outline"  iconNameActive="home"  label="Home"      />
        <NavButton tab="favorites" iconName="heart-outline" iconNameActive="heart" label="Favorites" />

        {/* Add Button */}
        <TouchableOpacity
          style={S.navItemWrapper}
          activeOpacity={0.7}
          onPressIn={plusIn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            plusOut(onAddPress);
          }}
        >
          <Animated.View
            style={[S.plusButton, { transform: [{ scale: plusScale }], borderColor: tokens.border }]}
          >
            <BlurView intensity={50} tint={tokens.tint} style={S.plusBlur}>
              <Ionicons name="add" size={20} color={colors.label} />
            </BlurView>
          </Animated.View>
          <Text style={[S.navLabel, { color: colors.tertiaryLabel }]}>Add</Text>
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          style={S.navItemWrapper}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            onSearchPress();
          }}
        >
          <View style={S.searchNavButton}>
            <Ionicons name="search" size={20} color={colors.tertiaryLabel} />
          </View>
          <Text style={[S.navLabel, { color: colors.tertiaryLabel }]}>Search</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

// ─── Screen: HomeScreen ───────────────────────────────────────────────────────
const HomeScreen: React.FC<HomeScreenProps> = ({
  entries,
  onAddEntry,
  onSelectEntry,
  onLogout,
}) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();

  const [activeTab,    setActiveTab]    = useState<NavTab>('home');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [showSearch,   setShowSearch]   = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredEntries = searchQuery.trim()
    ? entries.filter((e) =>
        e.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : entries;

  const handleSearchToggle = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) setSearchQuery('');
  };

  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={S.headerWrapper}>
          <View style={S.headerTop}>
            <Text style={[S.headerTitle, { color: colors.label }]}>Travel Diary</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.selectionAsync();
                setShowDropdown((prev) => !prev);
              }}
            >
              <View style={S.avatarButton}>
                <Text style={[S.avatarInitials, { color: colors.accent }]}>GA</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={[S.headerSubtitle, { color: colors.secondaryLabel }]}>
            {entries.length === 0
              ? 'Start your journey'
              : `${entries.length} ${entries.length === 1 ? 'memory' : 'memories'} captured`}
          </Text>
        </View>

        {showSearch && (
          <SearchBar scheme={scheme} value={searchQuery} onChange={setSearchQuery} />
        )}

        {filteredEntries.length === 0 ? (
          <>
            <EmptyState scheme={scheme} />
            <CTAButton
              label="Add Your First Memory"
              scheme={scheme}
              isPrimary
              onPress={onAddEntry}
            />
          </>
        ) : (
          <>
            <Text style={[S.sectionTitle, { color: colors.label }]}>Memories</Text>
            {filteredEntries.map((item) => (
              <EntryCard
                key={item.id}
                item={item}
                scheme={scheme}
                onPress={() => onSelectEntry(item)}
              />
            ))}
            <CTAButton label="Add New Memory" scheme={scheme} onPress={onAddEntry} />
          </>
        )}
      </ScrollView>

      {showDropdown && (
        <ProfileDropdown
          scheme={scheme}
          onClose={() => setShowDropdown(false)}
          onLogout={onLogout}
        />
      )}

      <FloatingCapsuleNav
        activeTab={activeTab}
        scheme={scheme}
        bottomInset={insets.bottom}
        onTabPress={setActiveTab}
        onAddPress={onAddEntry}
        onSearchPress={handleSearchToggle}
      />
    </View>
  );
};

export default HomeScreen;