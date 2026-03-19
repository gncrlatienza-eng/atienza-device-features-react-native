import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// ─── Layout Constants ──────────────────────────────────────────────────────────
export const CARD_WIDTH = width - 32;
export const CARD_HEIGHT = 220;
export const BORDER_RADIUS = 24;
export const FAB_BOTTOM_OFFSET = 40;

// ─── Design Tokens: Glass ─────────────────────────────────────────────────────
export const glassTokens = {
  light: {
    background: 'rgba(255, 255, 255, 0.45)',
    border: 'rgba(255, 255, 255, 0.60)',
    shadow: 'rgba(0, 0, 0, 0.08)',
    overlay: 'rgba(255, 255, 255, 0.18)',
  },
  dark: {
    background: 'rgba(30, 30, 40, 0.55)',
    border: 'rgba(255, 255, 255, 0.12)',
    shadow: 'rgba(0, 0, 0, 0.35)',
    overlay: 'rgba(0, 0, 0, 0.35)',
  },
} as const;

// ─── Design Tokens: Color Palette ─────────────────────────────────────────────
export const palette = {
  light: {
    systemBackground: '#F2F2F7',
    secondaryBackground: '#FFFFFF',
    label: '#000000',
    secondaryLabel: '#3C3C43',
    tertiaryLabel: '#8E8E93',
    accent: '#007AFF',
    separator: 'rgba(60, 60, 67, 0.12)',
  },
  dark: {
    systemBackground: '#000000',
    secondaryBackground: '#1C1C1E',
    label: '#FFFFFF',
    secondaryLabel: '#EBEBF5',
    tertiaryLabel: '#8E8E93',
    accent: '#0A84FF',
    separator: 'rgba(84, 84, 88, 0.65)',
  },
} as const;

export type ColorScheme = keyof typeof palette;

// ─── Shared Component Styles ──────────────────────────────────────────────────
export const sharedStyles = StyleSheet.create({
  glassCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    marginBottom: 16,
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  cardBlurOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  cardAddressText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },

  cardDateText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
});

// ─── HomeScreen Styles ────────────────────────────────────────────────────────
export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.08,
    marginTop: 2,
    opacity: 0.6,
  },

  listContent: {
    paddingTop: 16,
    paddingBottom: 130,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },

  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.35,
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyBody: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.55,
  },

  fabWrapper: {
    position: 'absolute',
    bottom: FAB_BOTTOM_OFFSET,
    left: 24,
    right: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },

  fabLabel: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
});