import { StyleSheet, Platform } from 'react-native';

export const loginStyles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────────
  logoWrapper: {
    width:        88,
    height:       88,
    borderRadius: 26,
    overflow:     'hidden',
    borderWidth:  0.5,
    marginBottom: 24,
    alignItems:   'center',
    justifyContent: 'center',
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
    marginBottom:  6,
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

  formBlur: {
    paddingHorizontal: 20,
    paddingVertical:   6,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingVertical: 14,
    gap: 12,
  },

  inputDivider: {
    height:           0.5,
    marginHorizontal: 0,
  },

  textInput: {
    flex:          1,
    fontSize:      16,
    fontWeight:    '400',
    letterSpacing: -0.1,
  },

  // ── Login Button ──────────────────────────────────────────────────────────────
  loginButton: {
    width:        '100%',
    borderRadius: 100,
    overflow:     'hidden',
    borderWidth:  0.5,
  },

  loginBlur: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 17,
  },

  loginLabel: {
    fontSize:      17,
    fontWeight:    '600',
    letterSpacing: -0.4,
    color:         '#FFFFFF',
  },

  // ── Error ─────────────────────────────────────────────────────────────────────
  errorText: {
    fontSize:   13,
    fontWeight: '400',
    textAlign:  'center',
    marginTop:  12,
  },

  // ── Credentials hint ─────────────────────────────────────────────────────────
  hintText: {
    fontSize:   12,
    fontWeight: '400',
    textAlign:  'center',
    opacity:    0.40,
    marginTop:  24,
  },
});