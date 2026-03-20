import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const COLUMN_GAP  = 12;
const COLUMNS     = 2;
export const FOLDER_CARD_WIDTH = (width - 32 - COLUMN_GAP) / COLUMNS;

export const foldersScreenStyles = StyleSheet.create({
  container:     { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },

  // ── Header ────────────────────────────────────────────────────────────────────
  headerWrapper: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },

  headerTop: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   4,
  },

  headerTitle: {
    fontSize:      34,
    fontWeight:    '700',
    letterSpacing: 0.37,
    fontFamily:    Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  headerSubtitle: {
    fontSize:      15,
    fontWeight:    '400',
    opacity:       0.55,
  },

  newFolderButton: {
    width:        36,
    height:       36,
    borderRadius: 18,
    overflow:     'hidden',
    borderWidth:  0.5,
  },

  newFolderBlur: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },

  // ── Folder Grid ───────────────────────────────────────────────────────────────
  folderGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           COLUMN_GAP,
    paddingTop:    8,
  },

  folderCard: {
    width:        FOLDER_CARD_WIDTH,
    borderRadius: 16,
    overflow:     'hidden',
    borderWidth:  0.5,
  },

  folderCardBlur: {
    padding: 16,
  },

  folderIconWrapper: {
    width:          52,
    height:         52,
    borderRadius:   14,
    overflow:       'hidden',
    marginBottom:   12,
    borderWidth:    0.5,
    alignItems:     'center',
    justifyContent: 'center',
  },

  folderThumbGrid: {
    width:         52,
    height:        52,
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           1,
  },

  // Thumbnail row container (shown at top of each folder card)
  folderThumbRow: {
    width:         '100%',
    height:        90,
    flexDirection: 'row',
    flexWrap:      'wrap',
    borderRadius:  10,
    overflow:      'hidden',
    marginBottom:  12,
  },

  // Full-size thumb when folder has exactly 1 entry
  folderSingleThumb: {
    width:        '100%',
    height:       90,
    borderRadius: 10,
    overflow:     'hidden',
  },

  folderThumb: {
    width:  25,
    height: 25,
  },

  folderThumbPlaceholder: {
    width:          25,
    height:         25,
    alignItems:     'center',
    justifyContent: 'center',
  },

  folderName: {
    fontSize:      15,
    fontWeight:    '600',
    letterSpacing: -0.2,
    marginBottom:  3,
  },

  folderCount: {
    fontSize:   13,
    fontWeight: '400',
    opacity:    0.55,
  },

  // ── New Folder Modal ──────────────────────────────────────────────────────────
  modalBackdrop: {
    flex:               1,
    backgroundColor:    'rgba(0,0,0,0.45)',
    alignItems:         'center',
    justifyContent:     'center',
    paddingHorizontal:  32,
  },

  modalCard: {
    width:        '100%',
    borderRadius: 20,
    overflow:     'hidden',
    borderWidth:  0.5,
  },

  modalBlur: {
    paddingTop:        24,
    paddingBottom:     8,
    paddingHorizontal: 20,
    alignItems:        'center',
  },

  modalTitle: {
    fontSize:      17,
    fontWeight:    '700',
    textAlign:     'center',
    marginBottom:  16,
    letterSpacing: -0.3,
  },

  modalInput: {
    width:        '100%',
    borderRadius: 12,
    overflow:     'hidden',
    borderWidth:  0.5,
    marginBottom: 20,
  },

  modalInputBlur: {
    paddingHorizontal: 14,
    paddingVertical:   13,
  },

  modalInputText: {
    fontSize:   16,
    fontWeight: '400',
  },

  modalDivider:         { height: 0.5, width: '100%' },
  modalActions:         { flexDirection: 'row', width: '100%' },
  modalAction:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  modalActionRow:       { flexDirection: 'row' },
  modalActionDiv:       { width: 0.5 },
  modalActionDivider:   { width: 0.5 },
  modalActionLabel:     { fontSize: 17, fontWeight: '400' },
  modalActionLabelBold: { fontSize: 17, fontWeight: '600' },
  modalActionBold:      { fontSize: 17, fontWeight: '600' },

  // ── Empty ─────────────────────────────────────────────────────────────────────
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle:     { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8, marginTop: 16 },
  emptyBody:      { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.50 },
});