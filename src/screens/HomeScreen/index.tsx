import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
import type { TravelEntry, Folder } from '../../hooks/useEntries';

export type { TravelEntry };

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface HomeScreenProps {
  entries:            TravelEntry[];
  folders:            Folder[];
  onAddEntry:         () => void;
  onSelectEntry:      (entry: TravelEntry) => void;
  onToggleFavorite:   (id: string) => void;
  onMoveToFolder:     (entryId: string, folderId: string | undefined) => void;
  onSearchPress:      () => void;
  onFoldersPress:     () => void;
  onLogout:           () => void;
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

// ─── Component: ContextMenu ───────────────────────────────────────────────────
const ContextMenu: React.FC<{
  entry:           TravelEntry;
  scheme:          ColorScheme;
  onClose:         () => void;
  onFavorite:      () => void;
  onAddToFolder:   () => void;
  onDelete:        () => void;
}> = ({ entry, scheme, onClose, onFavorite, onAddToFolder, onDelete }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  const items = [
    {
      label:   entry.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon:    entry.isFavorite ? 'heart-dislike-outline' : 'heart-outline',
      color:   entry.isFavorite ? colors.destructive : colors.label,
      onPress: onFavorite,
    },
    {
      label:   'Add to Folder',
      icon:    'folder-outline',
      color:   colors.label,
      onPress: onAddToFolder,
    },
    {
      label:   'Delete Memory',
      icon:    'trash-outline',
      color:   colors.destructive,
      onPress: onDelete,
    },
  ];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={ctxStyles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[ctxStyles.menu, { borderColor: tokens.border }]}>
              <BlurView intensity={80} tint={tokens.tint} style={ctxStyles.menuBlur}>
                {items.map((item, index) => (
                  <View key={item.label}>
                    <TouchableOpacity
                      style={ctxStyles.menuItem}
                      activeOpacity={0.7}
                      onPress={() => { onClose(); item.onPress(); }}
                    >
                      <Text style={[ctxStyles.menuLabel, { color: item.color }]}>
                        {item.label}
                      </Text>
                      <Ionicons name={item.icon as any} size={18} color={item.color} />
                    </TouchableOpacity>
                    {index < items.length - 1 && (
                      <View style={[ctxStyles.menuDivider, { backgroundColor: colors.separator }]} />
                    )}
                  </View>
                ))}
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const ctxStyles = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', paddingBottom: 48, paddingHorizontal: 16 },
  menu:        { borderRadius: 16, overflow: 'hidden', borderWidth: 0.5 },
  menuBlur:    { paddingVertical: 4 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 15 },
  menuLabel:   { fontSize: 16, fontWeight: '400', letterSpacing: -0.2 },
  menuDivider: { height: 0.5, marginHorizontal: 16 },
});

// ─── Component: ConfirmModal ──────────────────────────────────────────────────
const ConfirmModal: React.FC<{
  visible:   boolean;
  title:     string;
  body:      string;
  iconName:  string;
  iconColor: string;
  iconBg:    string;
  confirmLabel: string;
  confirmColor: string;
  scheme:    ColorScheme;
  onConfirm: () => void;
  onCancel:  () => void;
}> = ({ visible, title, body, iconName, iconColor, iconBg, confirmLabel, confirmColor, scheme, onConfirm, onCancel }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={confirmStyles.backdrop}>
        <View style={[confirmStyles.card, { borderColor: tokens.border }]}>
          <BlurView intensity={80} tint={tokens.tint} style={confirmStyles.blurTop}>
            <BlurView intensity={40} tint={tokens.tint} style={[confirmStyles.icon, { borderColor: iconColor + '50', backgroundColor: iconBg }]}>
              <Ionicons name={iconName as any} size={24} color={iconColor} />
            </BlurView>
            <Text style={[confirmStyles.title, { color: colors.label }]}>{title}</Text>
            <Text style={[confirmStyles.body,  { color: colors.label }]}>{body}</Text>
          </BlurView>
          <View style={[confirmStyles.divider, { backgroundColor: colors.separator }]} />
          <BlurView intensity={80} tint={tokens.tint} style={confirmStyles.actions}>
            <TouchableOpacity style={confirmStyles.action} onPress={onCancel} activeOpacity={0.7}>
              <Text style={[confirmStyles.actionLabel, { color: colors.tertiaryLabel }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={[confirmStyles.actionDivider, { backgroundColor: colors.separator }]} />
            <TouchableOpacity
              style={confirmStyles.action}
              activeOpacity={0.7}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onConfirm(); }}
            >
              <Text style={[confirmStyles.actionLabelBold, { color: confirmColor }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

const confirmStyles = StyleSheet.create({
  backdrop:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  card:             { width: '100%', borderRadius: 20, overflow: 'hidden', borderWidth: 0.5 },
  blurTop:          { paddingTop: 28, paddingBottom: 8, paddingHorizontal: 20, alignItems: 'center' },
  icon:             { width: 56, height: 56, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:            { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 },
  body:             { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.60, marginBottom: 24 },
  divider:          { height: 0.5 },
  actions:          { flexDirection: 'row' },
  action:           { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  actionDivider:    { width: 0.5 },
  actionLabel:      { fontSize: 17, fontWeight: '400' },
  actionLabelBold:  { fontSize: 17, fontWeight: '600' },
});

// ─── Component: EntryCard ─────────────────────────────────────────────────────
const EntryCard: React.FC<{
  item:          TravelEntry;
  scheme:        ColorScheme;
  onPress:       () => void;
  onMenuPress:   () => void;
}> = ({ item, scheme, onPress, onMenuPress }) => {
  const { scale, onPressIn, onPressOut } = usePressAnimation(0.97);
  const tokens = glassTokens[scheme];

  return (
    <Animated.View style={[S.entryCard, { transform: [{ scale }], borderColor: tokens.border }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={() => onPressOut(onPress)}
        style={StyleSheet.absoluteFill}
      >
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={S.entryImage} resizeMode="cover" />
        ) : (
          <View style={[S.entryPlaceholder, { backgroundColor: scheme === 'dark' ? '#1C1C1E' : '#E5E5EA' }]}>
            <Ionicons name="image-outline" size={52} color={scheme === 'dark' ? '#3A3A3C' : '#C7C7CC'} />
          </View>
        )}

        <BlurView intensity={50} tint={tokens.tint} style={[S.entryOverlay, { borderTopColor: tokens.border }]}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tokens.overlay }]} />
          <Text style={S.entryTitle} numberOfLines={1}>
            {item.title || item.address.split(',')[0]}
          </Text>
          <View style={S.entryAddressRow}>
            <Ionicons name="location" size={12} color="rgba(255,255,255,0.75)" />
            <Text style={S.entryAddress} numberOfLines={1}>{item.address}</Text>
          </View>
          <Text style={S.entryDate}>
            {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </BlurView>
      </TouchableOpacity>

      {/* 3-dot menu button — top left */}
      <TouchableOpacity style={S.menuButton} onPress={onMenuPress} activeOpacity={0.8}>
        <BlurView intensity={60} tint="dark" style={[S.menuBlur, { borderColor: 'rgba(255,255,255,0.20)' }]}>
          <Ionicons name="ellipsis-horizontal" size={16} color="rgba(255,255,255,0.90)" />
        </BlurView>
      </TouchableOpacity>

      {/* Heart indicator top right */}
      {item.isFavorite && (
        <View style={S.favoriteBadge}>
          <Ionicons name="heart" size={13} color="#FF453A" />
        </View>
      )}
    </Animated.View>
  );
};

// ─── Component: EmptyState ────────────────────────────────────────────────────
const EmptyState: React.FC<{ scheme: ColorScheme; isFavorites?: boolean }> = ({ scheme, isFavorites }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  return (
    <View style={S.emptyContainer}>
      <BlurView intensity={50} tint={tokens.tint} style={[S.emptyIconWrapper, { borderColor: tokens.border }]}>
        <View style={S.emptyIconBlur}>
          <Ionicons name={isFavorites ? 'heart-outline' : 'map-outline'} size={64} color={colors.tertiaryLabel} />
        </View>
      </BlurView>
      <Text style={[S.emptyTitle, { color: colors.label }]}>
        {isFavorites ? 'No Favorites Yet' : 'No Memories Yet'}
      </Text>
      <Text style={[S.emptyBody, { color: colors.label }]}>
        {isFavorites
          ? 'Tap ··· on any memory and select Add to Favorites.'
          : 'Start your travel diary by adding your first memory below.'}
      </Text>
    </View>
  );
};

// ─── Component: CTAButton ─────────────────────────────────────────────────────
const CTAButton: React.FC<{
  label: string; scheme: ColorScheme; isPrimary?: boolean; onPress: () => void;
}> = ({ label, scheme, isPrimary = false, onPress }) => {
  const { scale, onPressIn, onPressOut } = usePressAnimation(0.96);
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];
  const bg = isPrimary
    ? scheme === 'dark' ? 'rgba(10,132,255,0.25)' : 'rgba(0,122,255,0.12)'
    : scheme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';

  return (
    <Animated.View style={[S.ctaWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPressOut(onPress); }}
      >
        <BlurView intensity={80} tint={tokens.tint} style={[S.ctaBlur, { backgroundColor: bg }]}>
          <Text style={[S.ctaLabel, { color: isPrimary ? colors.accent : colors.label }]}>{label}</Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
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
    Animated.spring(translateX, { toValue: isDark ? 0 : 18, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
    toggleTheme();
  };

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
      <View style={[S.toggleTrack, { backgroundColor: isDark ? colors.accent : 'rgba(120,120,128,0.32)' }]}>
        <Animated.View style={[S.toggleThumb, { transform: [{ translateX }] }]} />
      </View>
    </TouchableOpacity>
  );
};

// ─── Component: ProfileDropdown ───────────────────────────────────────────────
const ProfileDropdown: React.FC<{
  scheme: ColorScheme; onClose: () => void; onLogout: () => void;
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
            <Ionicons name={scheme === 'dark' ? 'moon' : 'sunny'} size={18} color={colors.secondaryLabel} />
            <Text style={[S.dropdownThemeLabel, { color: colors.label }]}>Dark Mode</Text>
            <ThemeToggle scheme={scheme} />
          </View>
          <View style={[S.dropdownSeparator, { backgroundColor: colors.separator }]} />
          <TouchableOpacity
            style={S.dropdownItem}
            activeOpacity={0.7}
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onClose(); onLogout(); }}
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
const FloatingCapsuleNav: React.FC<{
  activeTab:     NavTab;
  scheme:        ColorScheme;
  bottomInset:   number;
  onTabPress:    (tab: NavTab) => void;
  onAddPress:    () => void;
  onSearchPress: () => void;
}> = ({ activeTab, scheme, bottomInset, onTabPress, onAddPress, onSearchPress }) => {
  const tokens    = glassTokens[scheme];
  const colors    = palette[scheme];
  const navBottom = bottomInset > 0 ? bottomInset - 8 : 12;
  const { scale: plusScale, onPressIn: plusIn, onPressOut: plusOut } = usePressAnimation(0.92);

  const NavButton: React.FC<{
    tab: NavTab; iconName: keyof typeof Ionicons.glyphMap; iconNameActive: keyof typeof Ionicons.glyphMap; label: string;
  }> = ({ tab, iconName, iconNameActive, label }) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={S.navItemWrapper}
        activeOpacity={0.7}
        onPress={() => { Haptics.selectionAsync(); onTabPress(tab); }}
      >
        <BlurView intensity={isActive ? 35 : 0} tint={tokens.tint} style={S.navIconButton}>
          <Ionicons name={isActive ? iconNameActive : iconName} size={20} color={isActive ? colors.accent : colors.tertiaryLabel} />
        </BlurView>
        <Text style={[S.navLabel, { color: isActive ? colors.accent : colors.tertiaryLabel }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[S.navWrapper, { borderColor: tokens.navBorder, bottom: navBottom }]}>
      <BlurView intensity={40} tint={tokens.tint} style={S.navBlur}>
        <NavButton tab="home"      iconName="home-outline"  iconNameActive="home"  label="Home"      />
        <NavButton tab="favorites" iconName="heart-outline" iconNameActive="heart" label="Favorites" />

        <TouchableOpacity
          style={S.navItemWrapper}
          activeOpacity={0.7}
          onPressIn={plusIn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); plusOut(onAddPress); }}
        >
          <Animated.View style={[S.plusButton, { transform: [{ scale: plusScale }], borderColor: tokens.border }]}>
            <BlurView intensity={50} tint={tokens.tint} style={S.plusBlur}>
              <Ionicons name="add" size={20} color={colors.label} />
            </BlurView>
          </Animated.View>
          <Text style={[S.navLabel, { color: colors.tertiaryLabel }]}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={S.navItemWrapper}
          activeOpacity={0.7}
          onPress={() => { Haptics.selectionAsync(); onSearchPress(); }}
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
  entries, folders, onAddEntry, onSelectEntry, onToggleFavorite,
  onMoveToFolder, onSearchPress, onFoldersPress, onLogout,
}) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();

  const [activeTab,      setActiveTab]      = useState<NavTab>('home');
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [contextEntry,   setContextEntry]   = useState<TravelEntry | null>(null);
  const [confirmFav,     setConfirmFav]     = useState<TravelEntry | null>(null);

  const displayedEntries = activeTab === 'favorites'
    ? entries.filter((e) => e.isFavorite)
    : entries;

  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={S.headerWrapper}>
          <View style={S.headerTop}>
            <Text style={[S.headerTitle, { color: colors.label }]}>
              {activeTab === 'favorites' ? 'Favorites' : 'Travel Diary'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => { Haptics.selectionAsync(); setShowDropdown((p) => !p); }}
            >
              <View style={S.avatarButton}>
                <Text style={[S.avatarInitials, { color: colors.accent }]}>GA</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={[S.headerSubtitle, { color: colors.secondaryLabel }]}>
            {activeTab === 'favorites'
              ? `${entries.filter((e) => e.isFavorite).length} favorite ${entries.filter((e) => e.isFavorite).length === 1 ? 'memory' : 'memories'}`
              : entries.length === 0 ? 'Start your journey' : `${entries.length} ${entries.length === 1 ? 'memory' : 'memories'} captured`}
          </Text>
        </View>

        {/* Content */}
        {displayedEntries.length === 0 ? (
          <>
            <EmptyState scheme={scheme} isFavorites={activeTab === 'favorites'} />
            {activeTab === 'home' && (
              <CTAButton label="Add Your First Memory" scheme={scheme} isPrimary onPress={onAddEntry} />
            )}
          </>
        ) : (
          <>
            <Text style={[S.sectionTitle, { color: colors.label }]}>
              {activeTab === 'favorites' ? 'Your Favorites' : 'Memories'}
            </Text>
            {displayedEntries.map((item) => (
              <EntryCard
                key={item.id}
                item={item}
                scheme={scheme}
                onPress={() => onSelectEntry(item)}
                onMenuPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setContextEntry(item); }}
              />
            ))}
            {activeTab === 'home' && (
              <CTAButton label="Add New Memory" scheme={scheme} onPress={onAddEntry} />
            )}
          </>
        )}
      </ScrollView>

      {/* Profile Dropdown */}
      {showDropdown && (
        <ProfileDropdown scheme={scheme} onClose={() => setShowDropdown(false)} onLogout={onLogout} />
      )}

      {/* Context Menu */}
      {contextEntry && (
        <ContextMenu
          entry={contextEntry}
          scheme={scheme}
          onClose={() => setContextEntry(null)}
          onFavorite={() => setConfirmFav(contextEntry)}
          onAddToFolder={() => { onMoveToFolder(contextEntry.id, undefined); setContextEntry(null); }}
          onDelete={() => setContextEntry(null)}
        />
      )}

      {/* Confirm Favorite */}
      <ConfirmModal
        visible={!!confirmFav}
        title={confirmFav?.isFavorite ? 'Remove from Favorites?' : 'Add to Favorites?'}
        body={confirmFav?.isFavorite
          ? 'This memory will be removed from your Favorites.'
          : 'This memory will appear in your Favorites tab.'}
        iconName={confirmFav?.isFavorite ? 'heart-dislike' : 'heart'}
        iconColor={confirmFav?.isFavorite ? palette[scheme].destructive : '#FF9500'}
        iconBg={confirmFav?.isFavorite ? 'rgba(255,59,48,0.10)' : 'rgba(255,149,0,0.10)'}
        confirmLabel={confirmFav?.isFavorite ? 'Remove' : 'Add'}
        confirmColor={confirmFav?.isFavorite ? palette[scheme].destructive : '#FF9500'}
        scheme={scheme}
        onCancel={() => setConfirmFav(null)}
        onConfirm={() => { if (confirmFav) onToggleFavorite(confirmFav.id); setConfirmFav(null); }}
      />

      {/* Floating Nav */}
      <FloatingCapsuleNav
        activeTab={activeTab}
        scheme={scheme}
        bottomInset={insets.bottom}
        onTabPress={setActiveTab}
        onAddPress={onAddEntry}
        onSearchPress={onSearchPress}
      />
    </View>
  );
};

export default HomeScreen;