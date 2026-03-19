import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { addEntryStyles as S } from './AddEntryScreen.styles';
import type { TravelEntry } from '../HomeScreen';

// ─── Notifications Setup ──────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
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
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (to: number) => ({
    toValue:         to,
    useNativeDriver: true,
    speed:           20,
    bounciness:      5,
  });

  const onPressIn  = () => Animated.spring(scale, spring(toValue)).start();
  const onPressOut = (cb?: () => void) =>
    Animated.spring(scale, spring(1)).start(() => cb?.());

  return { scale, onPressIn, onPressOut };
};

// ─── Screen: AddEntryScreen ───────────────────────────────────────────────────
const AddEntryScreen: React.FC<AddEntryScreenProps> = ({ onSave, onCancel }) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();

  // ── State ──────────────────────────────────────────────────────────────────
  const [imageUri,        setImageUri]        = useState<string | null>(null);
  const [address,         setAddress]         = useState('');
  const [note,            setNote]            = useState('');
  const [showCamera,      setShowCamera]      = useState(false);
  const [locationStatus,  setLocationStatus]  = useState<LocationStatus>('idle');
  const [isSaving,        setIsSaving]        = useState(false);

  const cameraRef                           = useRef<CameraView>(null);
  const [cameraPermission, requestCamera]   = useCameraPermissions();
  const { scale, onPressIn, onPressOut }    = usePressAnimation(0.97);

  // ── Clear state on unmount (back without saving) ───────────────────────────
  useEffect(() => {
    return () => {
      setImageUri(null);
      setAddress('');
      setNote('');
      setLocationStatus('idle');
    };
  }, []);

  // ── Request location permission + fetch on mount ───────────────────────────
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = useCallback(async () => {
    setLocationStatus('fetching');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('error');
        setAddress('Location permission denied');
        return;
      }

      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [result] = await Location.reverseGeocodeAsync({
        latitude:  coords.coords.latitude,
        longitude: coords.coords.longitude,
      });

      if (result) {
        const parts = [
          result.name,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
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

  // ── Camera ─────────────────────────────────────────────────────────────────
  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCamera();
      if (!granted) return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setImageUri(photo.uri);
        setShowCamera(false);
      }
    } catch {
      setShowCamera(false);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!imageUri) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);

    const entry: TravelEntry = {
      id:        Date.now().toString(),
      imageUri,
      address:   address || 'Unknown location',
      timestamp: Date.now(),
    };

    // Request notification permission + schedule
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✈️ Memory Saved!',
          body:  `Your memory at ${entry.address} has been added to your diary.`,
        },
        trigger: null, // fire immediately
      });
    }

    setIsSaving(false);
    onSave(entry);
  };

  const canSave = !!imageUri && locationStatus !== 'fetching';

  // ── Camera View ────────────────────────────────────────────────────────────
  if (showCamera) {
    return (
      <View style={[S.container, { backgroundColor: '#000' }]}>
        <StatusBar style="light" />
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

        {/* Camera controls overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { justifyContent: 'space-between', paddingBottom: insets.bottom + 24 },
          ]}
        >
          {/* Close */}
          <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={() => setShowCamera(false)}
              activeOpacity={0.8}
            >
              <BlurView
                intensity={60}
                tint="dark"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,0.25)',
                }}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Shutter button */}
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={handleCapture} activeOpacity={0.8}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ── Main Sheet ─────────────────────────────────────────────────────────────
  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Drag handle */}
        <View style={S.handleWrapper}>
          <View style={[S.handle, { backgroundColor: colors.tertiaryLabel, opacity: 0.4 }]} />
        </View>

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
            <Text style={[S.headerButton, { color: colors.accent }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[S.headerTitle, { color: colors.label }]}>New Memory</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            S.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Picker / Camera */}
          <TouchableOpacity
            onPress={imageUri ? () => setImageUri(null) : handleOpenCamera}
            activeOpacity={0.9}
          >
            <BlurView
              intensity={50}
              tint={tokens.tint}
              style={[S.imagePickerWrapper, { borderColor: tokens.border }]}
            >
              {imageUri ? (
                <>
                  <Image source={{ uri: imageUri }} style={S.capturedImage} resizeMode="cover" />

                  {/* Retake button over image */}
                  <BlurView
                    intensity={60}
                    tint="dark"
                    style={[S.retakeOverlay, { borderColor: 'rgba(255,255,255,0.25)' }]}
                  >
                    <View style={S.retakeBlur}>
                      <Ionicons name="camera" size={13} color="#FFFFFF" />
                      <Text style={S.retakeLabel}>Retake</Text>
                    </View>
                  </BlurView>
                </>
              ) : (
                <View style={S.imagePickerBlur}>
                  <Ionicons name="camera" size={36} color={colors.tertiaryLabel} />
                  <Text style={[S.imagePickerLabel, { color: colors.tertiaryLabel }]}>
                    Tap to capture a photo
                  </Text>
                </View>
              )}
            </BlurView>
          </TouchableOpacity>

          {/* Location card */}
          <BlurView
            intensity={50}
            tint={tokens.tint}
            style={[S.sectionCard, { borderColor: tokens.border }]}
          >
            <View style={S.sectionCardBlur}>
              <View style={S.sectionRow}>
                <Ionicons
                  name="location"
                  size={18}
                  color={
                    locationStatus === 'success'
                      ? colors.accent
                      : colors.tertiaryLabel
                  }
                />
                <Text style={[S.sectionLabel, { color: colors.label }]}>
                  Location
                </Text>
                {locationStatus === 'fetching' ? (
                  <ActivityIndicator size="small" color={colors.tertiaryLabel} />
                ) : (
                  <TouchableOpacity onPress={fetchLocation} activeOpacity={0.7}>
                    <Ionicons
                      name="refresh"
                      size={16}
                      color={colors.tertiaryLabel}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {address !== '' && (
                <Text style={[S.sectionValue, { color: colors.label }]}>
                  {address}
                </Text>
              )}
            </View>
          </BlurView>

          {/* Note input card */}
          <BlurView
            intensity={50}
            tint={tokens.tint}
            style={[S.sectionCard, { borderColor: tokens.border }]}
          >
            <View style={S.sectionCardBlur}>
              <View style={S.sectionRow}>
                <Ionicons name="pencil" size={18} color={colors.tertiaryLabel} />
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
      <View
        style={[
          S.saveWrapper,
          {
            paddingBottom: insets.bottom + 12,
            borderTopColor: tokens.border,
            backgroundColor: colors.systemBackground,
          },
        ]}
      >
        <Animated.View style={[S.saveBlur, { transform: [{ scale }], opacity: canSave ? 1 : 0.4 }]}>
          <TouchableOpacity
            style={[S.saveButton, { backgroundColor: colors.accent }]}
            activeOpacity={0.9}
            disabled={!canSave || isSaving}
            onPressIn={onPressIn}
            onPressOut={() => onPressOut(handleSave)}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={S.saveLabel}>Save Memory</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default AddEntryScreen;