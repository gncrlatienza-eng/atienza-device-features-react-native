import React, { useRef, useState } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { entryDetailStyles as S } from './EntryDetailScreen.styles';
import type { TravelEntry } from '../HomeScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EntryDetailScreenProps {
  entry:    TravelEntry & { note?: string };
  onClose:  () => void;
  onDelete: (id: string) => void;
}

// ─── Hook: Press Animation ────────────────────────────────────────────────────
const usePressAnimation = (toValue = 0.96) => {
  const scale  = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => ({ toValue: to, useNativeDriver: true, speed: 20, bounciness: 5 });
  const onPressIn  = () => Animated.spring(scale, spring(toValue)).start();
  const onPressOut = (cb?: () => void) => Animated.spring(scale, spring(1)).start(() => cb?.());
  return { scale, onPressIn, onPressOut };
};

// ─── Component: ConfirmDeleteModal ────────────────────────────────────────────
const ConfirmDeleteModal: React.FC<{
  visible:   boolean;
  scheme:    ColorScheme;
  onConfirm: () => void;
  onCancel:  () => void;
}> = ({ visible, scheme, onConfirm, onCancel }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={S.modalBackdrop}>
        <View style={[S.modalCard, { borderColor: tokens.border }]}>
          <BlurView intensity={80} tint={tokens.tint} style={S.modalBlur}>
            <BlurView
              intensity={40}
              tint={tokens.tint}
              style={[S.modalIcon, { borderColor: 'rgba(255,59,48,0.30)', backgroundColor: 'rgba(255,59,48,0.10)' }]}
            >
              <Ionicons name="trash" size={24} color={colors.destructive} />
            </BlurView>
            <Text style={[S.modalTitle, { color: colors.label }]}>Delete Memory?</Text>
            <Text style={[S.modalBody, { color: colors.label }]}>
              This memory will be permanently removed. This action cannot be undone.
            </Text>
          </BlurView>

          <View style={[S.modalDivider, { backgroundColor: colors.separator }]} />

          <BlurView intensity={80} tint={tokens.tint} style={S.modalActionRow}>
            <TouchableOpacity style={S.modalAction} onPress={onCancel} activeOpacity={0.7}>
              <Text style={[S.modalActionLabel, { color: colors.accent }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={[S.modalActionDivider, { backgroundColor: colors.separator }]} />
            <TouchableOpacity
              style={S.modalAction}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                onConfirm();
              }}
            >
              <Text style={[S.modalActionLabelBold, { color: colors.destructive }]}>Delete</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Component: ConfirmSaveModal (exported for AddEntryScreen) ────────────────
export const ConfirmSaveModal: React.FC<{
  visible:   boolean;
  scheme:    ColorScheme;
  onConfirm: () => void;
  onCancel:  () => void;
}> = ({ visible, scheme, onConfirm, onCancel }) => {
  const tokens = glassTokens[scheme];
  const colors = palette[scheme];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={S.modalBackdrop}>
        <View style={[S.modalCard, { borderColor: tokens.border }]}>
          <BlurView intensity={80} tint={tokens.tint} style={S.modalBlur}>
            <BlurView
              intensity={40}
              tint={tokens.tint}
              style={[S.modalIcon, { borderColor: 'rgba(0,122,255,0.30)', backgroundColor: 'rgba(0,122,255,0.10)' }]}
            >
              <Ionicons name="checkmark" size={24} color={colors.accent} />
            </BlurView>
            <Text style={[S.modalTitle, { color: colors.label }]}>Save Memory?</Text>
            <Text style={[S.modalBody, { color: colors.label }]}>
              This photo and location will be saved to your Travel Diary.
            </Text>
          </BlurView>

          <View style={[S.modalDivider, { backgroundColor: colors.separator }]} />

          <BlurView intensity={80} tint={tokens.tint} style={S.modalActionRow}>
            <TouchableOpacity style={S.modalAction} onPress={onCancel} activeOpacity={0.7}>
              <Text style={[S.modalActionLabel, { color: colors.tertiaryLabel }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={[S.modalActionDivider, { backgroundColor: colors.separator }]} />
            <TouchableOpacity
              style={S.modalAction}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onConfirm();
              }}
            >
              <Text style={[S.modalActionLabelBold, { color: colors.accent }]}>Save</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Screen: EntryDetailScreen ────────────────────────────────────────────────
const EntryDetailScreen: React.FC<EntryDetailScreenProps> = ({ entry, onClose, onDelete }) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { scale, onPressIn, onPressOut }      = usePressAnimation(0.97);

  const formattedDate = new Date(entry.timestamp).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const formattedTime = new Date(entry.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>
      <StatusBar style="light" />

      {/* Hero Image */}
      {entry.imageUri ? (
        <Image source={{ uri: entry.imageUri }} style={S.heroImage} resizeMode="cover" />
      ) : (
        <View style={[S.heroPlaceholder, { backgroundColor: scheme === 'dark' ? '#1C1C1E' : '#E5E5EA' }]}>
          <Ionicons name="image-outline" size={64} color={scheme === 'dark' ? '#3A3A3C' : '#C7C7CC'} />
        </View>
      )}

      {/* Top bar */}
      <View style={[S.topBar, { paddingTop: insets.top + 8 }]}>
        <BlurView intensity={60} tint="dark" style={[S.topBarButton, { borderColor: 'rgba(255,255,255,0.20)' }]}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={S.topBarBlur}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </BlurView>

        <BlurView intensity={60} tint="dark" style={[S.topBarButton, { borderColor: 'rgba(255,255,255,0.20)' }]}>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowDeleteModal(true); }}
            activeOpacity={0.8}
            style={S.topBarBlur}
          >
            <Ionicons name="trash-outline" size={18} color="#FF453A" />
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Content card */}
      <View style={[S.contentCard, { borderColor: tokens.border, backgroundColor: colors.systemBackground }]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={S.contentBlur}>
            <View style={[S.handle, { backgroundColor: colors.tertiaryLabel, opacity: 0.35 }]} />

            <Text style={[S.addressTitle, { color: colors.label }]} numberOfLines={2}>
              {entry.address}
            </Text>

            <View style={S.metaRow}>
              <Ionicons name="calendar-outline" size={15} color={colors.tertiaryLabel} />
              <Text style={[S.metaText, { color: colors.secondaryLabel }]}>{formattedDate}</Text>
            </View>

            <View style={S.metaRow}>
              <Ionicons name="time-outline" size={15} color={colors.tertiaryLabel} />
              <Text style={[S.metaText, { color: colors.secondaryLabel }]}>{formattedTime}</Text>
            </View>

            <View style={[S.divider, { backgroundColor: colors.separator }]} />

            <Text style={[S.sectionLabel, { color: colors.label }]}>Note</Text>
            {entry.note ? (
              <Text style={[S.noteText, { color: colors.label }]}>{entry.note}</Text>
            ) : (
              <Text style={[S.emptyNote, { color: colors.label }]}>No note added.</Text>
            )}

            {/* Delete button */}
            <Animated.View style={[S.deleteWrapper, { transform: [{ scale }] }]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={() => onPressOut(() => setShowDeleteModal(true))}
              >
                <BlurView
                  intensity={60}
                  tint={tokens.tint}
                  style={[S.deleteBlur, { backgroundColor: 'rgba(255,59,48,0.10)' }]}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                  <Text style={[S.deleteLabel, { color: colors.destructive }]}>Delete Memory</Text>
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </View>

      <ConfirmDeleteModal
        visible={showDeleteModal}
        scheme={scheme}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => { setShowDeleteModal(false); onDelete(entry.id); }}
      />
    </View>
  );
};

export default EntryDetailScreen;