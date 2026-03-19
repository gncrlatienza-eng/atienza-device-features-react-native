import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

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

export const entryDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  heroImage: {
    width,
    height: height * 0.50,
  },

  heroPlaceholder: {
    width,
    height: height * 0.50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Top Bar ───────────────────────────────────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },

  topBarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 0.5,
    ...createShadow('#000', 0.15, 8, 2),
  },

  topBarBlur: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Content Card ──────────────────────────────────────────────────────────────
  contentCard: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderBottomWidth: 0,
  },

  contentBlur: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  addressTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  metaText: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.1,
  },

  divider: {
    height: 0.5,
    marginVertical: 20,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.45,
    marginBottom: 8,
  },

  noteText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },

  emptyNote: {
    fontSize: 15,
    fontStyle: 'italic',
    opacity: 0.40,
  },

  // ── Delete Button ─────────────────────────────────────────────────────────────
  deleteWrapper: {
    marginTop: 32,
    marginBottom: 8,
    borderRadius: 100,
    overflow: 'hidden',
    ...createShadow('#FF3B30', 0.15, 12, 4),
  },

  deleteBlur: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 8,
  },

  deleteLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },

  // ── Confirmation Modal ────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  modalCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    ...createShadow('#000', 0.25, 32, 12),
  },

  modalBlur: {
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  modalBody: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.60,
    marginBottom: 24,
  },

  modalDivider: {
    height: 0.5,
    width: '100%',
  },

  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
  },

  modalAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },

  modalActionDivider: {
    width: 0.5,
  },

  modalActionLabel: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.2,
  },

  modalActionLabelBold: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});