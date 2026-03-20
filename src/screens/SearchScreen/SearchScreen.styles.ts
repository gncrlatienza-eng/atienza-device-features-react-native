import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const GRID_COLUMNS   = 3;
export const GRID_GAP       = 2;
export const GRID_ITEM_SIZE = (width - (GRID_COLUMNS + 1) * GRID_GAP) / GRID_COLUMNS;

export const searchScreenStyles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 16,
    paddingBottom:     12,
    borderBottomWidth: 0.5,
  },

  headerTop: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingTop:     16,
    marginBottom:   12,
  },

  headerTitle: {
    fontSize:      34,
    fontWeight:    '700',
    letterSpacing: 0.37,
    fontFamily:    Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  doneButton: {
    paddingHorizontal: 16,
    paddingVertical:    8,
    borderRadius:      20,
    overflow:          'hidden',
    borderWidth:        0.5,
  },

  doneLabel: {
    fontSize:      15,
    fontWeight:    '600',
    letterSpacing: -0.3,
  },

  // ── Search Input ──────────────────────────────────────────────────────────────
  searchBarWrapper: {
    flexDirection:     'row',
    alignItems:        'center',
    borderRadius:      12,
    overflow:          'hidden',
    borderWidth:       0.5,
    paddingHorizontal: 12,
    paddingVertical:   10,
    gap:               8,
  },

  searchInput: {
    flex:       1,
    fontSize:   17,
    fontWeight: '400',
  },

  // ── Suggestion Card ───────────────────────────────────────────────────────────
  suggestionCard: {
    marginHorizontal: 16,
    marginTop:        16,
    borderRadius:     16,
    overflow:         'hidden',
    borderWidth:      0.5,
  },

  suggestionBlur: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       12,
    gap:           12,
  },

  suggestionThumbGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    width:         72,
    height:        72,
    borderRadius:  10,
    overflow:      'hidden',
    gap:           1,
  },

  suggestionThumb:            { width: 35, height: 35 },
  suggestionThumbPlaceholder: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  suggestionInfo:             { flex: 1 },

  suggestionTitle: {
    fontSize:      15,
    fontWeight:    '600',
    letterSpacing: -0.2,
    marginBottom:  3,
  },

  suggestionSub: {
    fontSize:   13,
    fontWeight: '400',
    opacity:    0.55,
  },

  // ── Section Header ────────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingTop:        20,
    paddingBottom:      8,
  },

  sectionTitle: {
    fontSize:      20,
    fontWeight:    '700',
    letterSpacing: 0.35,
  },

  // ── Results Count ─────────────────────────────────────────────────────────────
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical:    8,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
  },

  resultsCountLabel: {
    fontSize:   14,
    fontWeight: '400',
    opacity:    0.55,
  },

  // ── Grid ──────────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           GRID_GAP,
    paddingLeft:   GRID_GAP,
  },

  gridItem: {
    width:  GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
  },

  gridImage:       { width: '100%', height: '100%' },

  gridPlaceholder: {
    width:          '100%',
    height:         '100%',
    alignItems:     'center',
    justifyContent: 'center',
  },

  // ── Empty State ───────────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems:        'center',
    paddingTop:        60,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize:      18,
    fontWeight:    '600',
    textAlign:     'center',
    marginBottom:  8,
    letterSpacing: 0.2,
  },

  emptyBody: {
    fontSize:   14,
    textAlign:  'center',
    lineHeight: 20,
    opacity:    0.50,
  },
});