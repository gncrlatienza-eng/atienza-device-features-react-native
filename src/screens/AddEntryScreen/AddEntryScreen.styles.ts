import { StyleSheet, Dimensions, Platform } from 'react-native';

const { height } = Dimensions.get('window');

export const createShadow = (
  color   = '#000',
  opacity = 0.10,
  radius  = 12,
  offsetY = 4,
) =>
  Platform.select({
    ios:     { shadowColor: color, shadowOffset: { width: 0, height: offsetY }, shadowOpacity: opacity, shadowRadius: radius },
    android: { elevation: Math.round(radius / 2) },
  });

export const addEntryStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  // ── Drag Handle ───────────────────────────────────────────────────────────────
  handleWrapper: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },

  headerButton: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.2,
  },

  // ── Image Picker ──────────────────────────────────────────────────────────────
  imagePickerWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: height * 0.32,
    borderWidth: 0.5,
    ...createShadow('#000', 0.10, 16, 4),
  },

  imagePickerBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  imagePickerLabel: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },

  capturedImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },

  retakeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
  },

  retakeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },

  retakeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ── Section Cards ─────────────────────────────────────────────────────────────
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
  },

  sectionCardBlur: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  sectionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.1,
  },

  sectionValue: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.1,
    opacity: 0.55,
    marginTop: 6,
    lineHeight: 18,
  },

  sectionDivider: {
    height: 0.5,
    marginVertical: 2,
  },

  // ── Note Input ────────────────────────────────────────────────────────────────
  noteInput: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // ── Save Button ───────────────────────────────────────────────────────────────
  saveWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },

  saveBlur: {
    borderRadius: 100,
    overflow: 'hidden',
    ...createShadow('#007AFF', 0.30, 16, 6),
  },

  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 100,
  },

  saveLabel: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
});