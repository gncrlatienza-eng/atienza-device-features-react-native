import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// ─── Layout Constants ─────────────────────────────────────────────────────────
export const CARD_WIDTH  = (width - 48) / 2;
export const CARD_HEIGHT = 180;
export const BORDER_RADIUS = 18;

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const glassTokens = {
  light: {
    background:    'rgba(255, 255, 255, 0.45)',
    border:        'rgba(255, 255, 255, 0.70)',
    overlay:       'rgba(255, 255, 255, 0.20)',
    navBackground: 'rgba(240, 240, 245, 0.55)',
    navBorder:     'rgba(200, 200, 210, 0.50)',
    tint:          'light' as const,
  },
  dark: {
    background:    'rgba(28, 28, 32, 0.60)',
    border:        'rgba(255, 255, 255, 0.10)',
    overlay:       'rgba(0, 0, 0, 0.28)',
    navBackground: 'rgba(30, 30, 35, 0.55)',
    navBorder:     'rgba(255, 255, 255, 0.12)',
    tint:          'dark' as const,
  },
} as const;

export const palette = {
  light: {
    systemBackground:    '#F2F2F7',
    secondaryBackground: '#FFFFFF',
    label:               '#000000',
    secondaryLabel:      '#3C3C43',
    tertiaryLabel:       '#8E8E93',
    accent:              '#007AFF',
    destructive:         '#FF3B30',
    separator:           'rgba(60, 60, 67, 0.10)',
  },
  dark: {
    systemBackground:    '#000000',
    secondaryBackground: '#1C1C1E',
    label:               '#FFFFFF',
    secondaryLabel:      '#EBEBF5',
    tertiaryLabel:       '#8E8E93',
    accent:              '#0A84FF',
    destructive:         '#FF453A',
    separator:           'rgba(84, 84, 88, 0.55)',
  },
} as const;

export type ColorScheme = keyof typeof palette;

// ─── Platform Shadow Helper ───────────────────────────────────────────────────
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

// ─── Shared Styles ────────────────────────────────────────────────────────────
export const sharedStyles = StyleSheet.create({
  thumbCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...createShadow(),
  },

  thumbImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  thumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  thumbTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  thumbDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
});

// ─── HomeScreen Styles ────────────────────────────────────────────────────────
export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 160,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  headerWrapper: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  headerSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.08,
    marginBottom: 20,
  },

  // Liquid Glass Avatar — 44×44
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow('#000', 0.08, 8, 2),
  },

  avatarInitials: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Profile Dropdown ──────────────────────────────────────────────────────────
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  dropdownWrapper: {
    position: 'absolute',
    top: 112,
    right: 20,
    width: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    zIndex: 20,
    ...createShadow('#000', 0.20, 24, 8),
  },

  dropdownBlur: {
    paddingVertical: 8,
  },

  dropdownThemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },

  dropdownThemeLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },

  dropdownItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },

  dropdownSeparator: {
    height: 0.5,
    marginHorizontal: 16,
  },

  // Minimalistic toggle pill
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    ...createShadow('#000', 0.20, 4, 2),
  },

  // ── Sections ──────────────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.35,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 20,
  },

  // ── Banner Card ───────────────────────────────────────────────────────────────
  bannerCard: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...createShadow('#000', 0.12, 16, 6),
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  bannerDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.70)',
    marginTop: 3,
  },

  // ── Thumbnail Grid ────────────────────────────────────────────────────────────
  thumbRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },

  // ── CTA Button ────────────────────────────────────────────────────────────────
  ctaWrapper: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 100,
    overflow: 'hidden',
    ...createShadow('#000', 0.10, 10, 4),
  },

  ctaBlur: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
  },

  ctaLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
  },

  // ── Empty State ───────────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },

  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 34,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 0.5,
  },

  emptyIconBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  emptyBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.50,
    marginBottom: 32,
  },

  // ── Search Bar ────────────────────────────────────────────────────────────────
  searchWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },

  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
  },

  // ── Floating Capsule Nav ──────────────────────────────────────────────────────
  navWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 0.5,
    ...createShadow('#000', 0.18, 24, 8),
  },

  navBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },

  navItemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  navIconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },

  plusButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginHorizontal: 4,
    borderWidth: 0.5,
  },

  plusBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchIconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});