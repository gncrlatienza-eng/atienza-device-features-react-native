import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { palette, glassTokens } from '../screens/HomeScreen/HomeScreen.styles';
import type { ActiveScreen } from '../types/navigation';

interface GlobalNavProps {
  activeScreen:   ActiveScreen;
  onHomePress:    () => void;
  onFoldersPress: () => void;
  onAddPress:     () => void;
  onSearchPress:  () => void;
}

const GlobalNav: React.FC<GlobalNavProps> = ({
  activeScreen, onHomePress, onFoldersPress, onAddPress, onSearchPress,
}) => {
  const { resolvedScheme } = useTheme();
  const scheme             = resolvedScheme ?? 'dark';
  const tokens             = glassTokens[scheme];
  const colors             = palette[scheme];
  const insets             = useSafeAreaInsets();
  const navBottom          = insets.bottom > 0 ? insets.bottom - 8 : 12;

  const homeActive    = activeScreen === 'home';
  const foldersActive = activeScreen === 'folders' || activeScreen === 'folderView';
  const searchActive  = activeScreen === 'search';

  return (
    <View style={[S.wrapper, { borderColor: tokens.navBorder, bottom: navBottom }]}>
      <BlurView intensity={40} tint={tokens.tint} style={S.blur}>

        {/* Home */}
        <TouchableOpacity style={S.item} activeOpacity={0.7}
          onPress={() => { Haptics.selectionAsync(); onHomePress(); }}
        >
          <BlurView intensity={homeActive ? 35 : 0} tint={tokens.tint} style={S.iconBtn}>
            <Ionicons
              name={homeActive ? 'home' : 'home-outline'}
              size={20}
              color={homeActive ? colors.accent : colors.tertiaryLabel}
            />
          </BlurView>
          <Text style={[S.label, { color: homeActive ? colors.accent : colors.tertiaryLabel }]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Folders */}
        <TouchableOpacity style={S.item} activeOpacity={0.7}
          onPress={() => { Haptics.selectionAsync(); onFoldersPress(); }}
        >
          <BlurView intensity={foldersActive ? 35 : 0} tint={tokens.tint} style={S.iconBtn}>
            <Ionicons
              name={foldersActive ? 'folder' : 'folder-outline'}
              size={20}
              color={foldersActive ? colors.accent : colors.tertiaryLabel}
            />
          </BlurView>
          <Text style={[S.label, { color: foldersActive ? colors.accent : colors.tertiaryLabel }]}>
            Folders
          </Text>
        </TouchableOpacity>

        {/* Add */}
        <TouchableOpacity style={S.item} activeOpacity={0.7}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onAddPress(); }}
        >
          <View style={[S.plusBtn, { borderColor: tokens.border }]}>
            <BlurView intensity={50} tint={tokens.tint} style={S.plusBlur}>
              <Ionicons name="add" size={20} color={colors.label} />
            </BlurView>
          </View>
          <Text style={[S.label, { color: colors.tertiaryLabel }]}>Add</Text>
        </TouchableOpacity>

        {/* Search */}
        <TouchableOpacity style={S.item} activeOpacity={0.7}
          onPress={() => { Haptics.selectionAsync(); onSearchPress(); }}
        >
          <BlurView intensity={searchActive ? 35 : 0} tint={tokens.tint} style={S.iconBtn}>
            <Ionicons
              name="search"
              size={20}
              color={searchActive ? colors.accent : colors.tertiaryLabel}
            />
          </BlurView>
          <Text style={[S.label, { color: searchActive ? colors.accent : colors.tertiaryLabel }]}>
            Search
          </Text>
        </TouchableOpacity>

      </BlurView>
    </View>
  );
};

const S = StyleSheet.create({
  wrapper:  { position: 'absolute', left: 16, right: 16, borderRadius: 28, overflow: 'hidden', borderWidth: 0.5, zIndex: 9999 },
  blur:     { flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 10, paddingHorizontal: 8 },
  item:     { flex: 1, alignItems: 'center', gap: 4 },
  iconBtn:  { width: 44, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  label:    { fontSize: 10, fontWeight: '500', letterSpacing: 0.2 },
  plusBtn:  { width: 44, height: 36, borderRadius: 12, overflow: 'hidden', borderWidth: 0.5 },
  plusBlur: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default GlobalNav;