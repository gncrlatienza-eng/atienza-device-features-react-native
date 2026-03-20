import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { addEntryStyles as S } from './AddEntryScreen.styles';
import { ConfirmSaveModal } from '../EntryDetailScreen';
import type { TravelEntry } from '../../hooks/useEntries';

// ─── Notifications handler ────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  false,   // we play sound ourselves via expo-av
    shouldSetBadge:   false,
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface AddEntryScreenProps {
  onSave:   (entry: TravelEntry) => void;
  onCancel: () => void;
}

type LocationStatus = 'idle' | 'fetching' | 'success' | 'error';

// ─── Hook: Press Animation ────────────────────────────────────────────────────
const usePressAnimation = (toValue = 0.96) => {
  const scale  = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => ({ toValue: to, useNativeDriver: true, speed: 20, bounciness: 5 });
  const onPressIn  = () => Animated.spring(scale, spring(toValue)).start();
  const onPressOut = (cb?: () => void) => Animated.spring(scale, spring(1)).start(() => cb?.());
  return { scale, onPressIn, onPressOut };
};

// ─── Helper: play a success sound using expo-av ───────────────────────────────
async function playSuccessSound() {
  try {
    // Set audio mode so sound plays even when device is on silent
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS:  true,
      allowsRecordingIOS:    false,
      staysActiveInBackground: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      // Built-in system sound via URI — works without bundling an asset file
      { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
      { shouldPlay: true, volume: 1.0 },
    );

    // Unload after it finishes to free memory
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // Sound is non-critical — fail silently, haptic still fires
  }
}

// ─── Screen: AddEntryScreen ───────────────────────────────────────────────────
const AddEntryScreen: React.FC<AddEntryScreenProps> = ({ onSave, onCancel }) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();

  const [imageUri,       setImageUri]       = useState<string | null>(null);
  const [title,          setTitle]          = useState('');
  const [address,        setAddress]        = useState('');
  const [note,           setNote]           = useState('');
  const [showCamera,     setShowCamera]     = useState(false);
  const [facing,         setFacing]         = useState<CameraType>('back');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [showSaveModal,  setShowSaveModal]  = useState(false);

  const cameraRef                         = useRef<CameraView>(null);
  const [cameraPermission, requestCamera] = useCameraPermissions();
  const { scale, onPressIn, onPressOut }  = usePressAnimation(0.97);

  // Request notification permission early so it doesn't interrupt the save flow
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Clear state on unmount
  useEffect(() => {
    return () => {
      setImageUri(null);
      setTitle('');
      setAddress('');
      setNote('');
      setLocationStatus('idle');
    };
  }, []);

  // ── Reverse geocode ───────────────────────────────────────────────────────
  const fetchLocation = useCallback(async () => {
    setLocationStatus('fetching');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('error');
        setAddress('Location permission denied');
        return;
      }
      const coords   = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [result] = await Location.reverseGeocodeAsync({
        latitude:  coords.coords.latitude,
        longitude: coords.coords.longitude,
      });
      if (result) {
        const parts = [result.name, result.city, result.region, result.country].filter(Boolean);
        setAddress(parts.join(', '));
        setLocationStatus('success');
      } else {
        setAddress('Unknown location');
        setLocationStatus('error');
      }
    } catch {
      setLocationStatus('error');
      setAddress('Could not fetch location');
    }
  }, []);

  const handleImageSelected = useCallback((uri: string) => {
    setImageUri(uri);
    fetchLocation();
  }, [fetchLocation]);

  // ── Camera ────────────────────────────────────────────────────────────────
  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCamera();
      if (!granted) {
        Alert.alert('Camera Access', 'Please allow camera access in Settings to take photos.');
        return;
      }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) { handleImageSelected(photo.uri); setShowCamera(false); }
    } catch { setShowCamera(false); }
  };

  const toggleFacing = () => {
    Haptics.selectionAsync();
    setFacing((p) => (p === 'back' ? 'front' : 'back'));
  };

  // ── Gallery picker ────────────────────────────────────────────────────────
  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photo Library', 'Please allow photo library access in Settings.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      handleImageSelected(result.assets[0].uri);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera',        onPress: handleOpenCamera      },
      { text: 'Photo Library', onPress: handlePickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleConfirmSave = async () => {
    if (!imageUri) return;

    const entry: TravelEntry = {
      id:         Date.now().toString(),
      imageUri,
      title:      title.trim() || address.split(',')[0] || 'Untitled',
      address:    address || 'Unknown location',
      timestamp:  Date.now(),
      note,
      isFavorite: false,
    };

    // 1. Play sound (expo-av — reliable, plays on silent mode)
    playSuccessSound();

    // 2. Strong haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 3. Show notification banner (visual only, sound handled above)
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✈️ Memory Saved!',
          body:  `"${entry.title}" has been added to your Travel Diary.`,
        },
        trigger: null,
      });
    }

    onSave(entry);
  };

  const canSave = !!imageUri && locationStatus !== 'fetching';

  // ── Camera View ───────────────────────────────────────────────────────────
  if (showCamera) {
    return (
      <View style={[S.container, { backgroundColor: '#000' }]}>
        <StatusBar style="light" />
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'space-between', paddingBottom: insets.bottom + 24 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
            <TouchableOpacity onPress={() => setShowCamera(false)} activeOpacity={0.8}>
              <BlurView intensity={60} tint="dark" style={cameraStyles.controlButton}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFacing} activeOpacity={0.8}>
              <BlurView intensity={60} tint="dark" style={cameraStyles.controlButton}>
                <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={handleCapture} activeOpacity={0.8}>
              <View style={cameraStyles.shutterOuter}>
                <View style={cameraStyles.shutterInner} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── Main Sheet ────────────────────────────────────────────────────────────
  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={S.handleWrapper}>
          <View style={[S.handle, { backgroundColor: colors.tertiaryLabel, opacity: 0.4 }]} />
        </View>

        <View style={S.header}>
          <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
            <Text style={[S.headerButton, { color: colors.accent }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[S.headerTitle, { color: colors.label }]}>New Memory</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={[S.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image picker */}
          <TouchableOpacity onPress={handleAddPhoto} activeOpacity={0.9}>
            <BlurView intensity={50} tint={tokens.tint} style={[S.imagePickerWrapper, { borderColor: tokens.border }]}>
              {imageUri ? (
                <>
                  <Image source={{ uri: imageUri }} style={S.capturedImage} resizeMode="cover" />
                  <BlurView intensity={60} tint="dark" style={[S.retakeOverlay, { borderColor: 'rgba(255,255,255,0.25)' }]}>
                    <View style={S.retakeBlur}>
                      <Ionicons name="camera" size={13} color="#FFFFFF" />
                      <Text style={S.retakeLabel}>Change Photo</Text>
                    </View>
                  </BlurView>
                </>
              ) : (
                <View style={S.imagePickerBlur}>
                  <Ionicons name="camera" size={36} color={colors.tertiaryLabel} />
                  <Text style={[S.imagePickerLabel, { color: colors.tertiaryLabel }]}>Tap to add a photo</Text>
                  <Text style={[S.imagePickerSub,   { color: colors.tertiaryLabel }]}>Camera or Photo Library</Text>
                </View>
              )}
            </BlurView>
          </TouchableOpacity>

          {/* Title input */}
          <BlurView intensity={50} tint={tokens.tint} style={[S.sectionCard, { borderColor: tokens.border }]}>
            <View style={S.sectionCardBlur}>
              <View style={S.sectionRow}>
                <Ionicons name="pencil" size={18} color={colors.tertiaryLabel} />
                <TextInput
                  style={[S.titleInput, { color: colors.label }]}
                  placeholder="Entry title (optional)"
                  placeholderTextColor={colors.tertiaryLabel}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={60}
                  returnKeyType="done"
                />
              </View>
            </View>
          </BlurView>

          {/* Location card */}
          <BlurView intensity={50} tint={tokens.tint} style={[S.sectionCard, { borderColor: tokens.border }]}>
            <View style={S.sectionCardBlur}>
              <View style={S.sectionRow}>
                <Ionicons
                  name="location"
                  size={18}
                  color={locationStatus === 'success' ? colors.accent : colors.tertiaryLabel}
                />
                <Text style={[S.sectionLabel, { color: colors.label }]}>Location</Text>
                {locationStatus === 'fetching' ? (
                  <ActivityIndicator size="small" color={colors.tertiaryLabel} />
                ) : (
                  <TouchableOpacity onPress={fetchLocation} activeOpacity={0.7}>
                    <Ionicons name="refresh" size={16} color={colors.tertiaryLabel} />
                  </TouchableOpacity>
                )}
              </View>
              {address !== '' && (
                <Text style={[S.sectionValue, { color: colors.label }]}>{address}</Text>
              )}
              {locationStatus === 'idle' && address === '' && (
                <Text style={[S.sectionValue, { color: colors.tertiaryLabel }]}>
                  Location will be fetched after adding a photo.
                </Text>
              )}
            </View>
          </BlurView>

          {/* Note input */}
          <BlurView intensity={50} tint={tokens.tint} style={[S.sectionCard, { borderColor: tokens.border }]}>
            <View style={S.sectionCardBlur}>
              <View style={S.sectionRow}>
                <Ionicons name="create-outline" size={18} color={colors.tertiaryLabel} />
                <Text style={[S.sectionLabel, { color: colors.label }]}>Note</Text>
              </View>
              <View style={[S.sectionDivider, { backgroundColor: colors.separator, marginTop: 10 }]} />
              <TextInput
                style={[S.noteInput, { color: colors.label, marginTop: 10 }]}
                placeholder="Write something about this memory..."
                placeholderTextColor={colors.tertiaryLabel}
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={300}
              />
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={[S.saveWrapper, {
        paddingBottom:   insets.bottom + 12,
        borderTopColor:  tokens.border,
        backgroundColor: colors.systemBackground,
      }]}>
        <Animated.View style={[S.saveBlur, { transform: [{ scale }], opacity: canSave ? 1 : 0.4 }]}>
          <TouchableOpacity
            style={[S.saveButton, { backgroundColor: colors.accent }]}
            activeOpacity={0.9}
            disabled={!canSave}
            onPressIn={onPressIn}
            onPressOut={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPressOut(() => setShowSaveModal(true));
            }}
          >
            <Text style={S.saveLabel}>Save Memory</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ConfirmSaveModal
        visible={showSaveModal}
        scheme={scheme}
        onCancel={() => setShowSaveModal(false)}
        onConfirm={() => { setShowSaveModal(false); handleConfirmSave(); }}
      />
    </View>
  );
};

const cameraStyles = StyleSheet.create({
  controlButton: {
    width: 38, height: 38, borderRadius: 19, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  shutterOuter: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
});

export default AddEntryScreen;