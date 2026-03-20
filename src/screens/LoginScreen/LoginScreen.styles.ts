import { StyleSheet, Platform } from 'react-native';

export const loginStyles = StyleSheet.create({
  container: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 32,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────────
  logoWrapper: {
    width:          96,
    height:         96,
    borderRadius:   28,
    overflow:       'hidden',
    borderWidth:    0.5,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   24,
  },

  logoBlur: {
    flex:           1,
    width:          '100%',
    alignItems:     'center',
    justifyContent: 'center',
  },

  appName: {
    fontSize:      28,
    fontWeight:    '700',
    letterSpacing: 0.37,
    textAlign:     'center',
    marginBottom:  8,
    fontFamily:    Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  appTagline: {
    fontSize:      15,
    fontWeight:    '400',
    textAlign:     'center',
    opacity:       0.55,
    marginBottom:  48,
  },

  // ── Form Card ─────────────────────────────────────────────────────────────────
  formCard: {
    width:        '100%',
    borderRadius: 20,
    overflow:     'hidden',
    borderWidth:  0.5,
    marginBottom: 16,
  },

  formCardBlur: {
    paddingVertical: 4,
  },

  inputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingVertical:   14,
    gap:               12,
  },

  inputDivider: {
    height:           0.5,
    marginHorizontal: 16,
  },

  textInput: {
    flex:       1,
    fontSize:   16,
    fontWeight: '400',
  },

  // ── Error ─────────────────────────────────────────────────────────────────────
  errorRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    marginBottom:      16,
    paddingHorizontal: 4,
  },

  errorText: {
    fontSize:   13,
    fontWeight: '400',
  },

  // ── Login Button ──────────────────────────────────────────────────────────────
  loginButton: {
    width:        '100%',
    borderRadius: 100,
    overflow:     'hidden',
    borderWidth:  0.5,
  },

  loginButtonBlur: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 17,
  },

  loginButtonLabel: {
    fontSize:      17,
    fontWeight:    '600',
    letterSpacing: -0.4,
    color:         '#FFFFFF',
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    position:  'absolute',
    bottom:    32,
    alignSelf: 'center',
  },

  footerText: {
    fontSize:   12,
    fontWeight: '400',
    opacity:    0.35,
  },
});