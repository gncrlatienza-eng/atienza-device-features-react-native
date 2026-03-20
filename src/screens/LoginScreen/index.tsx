import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { loginStyles as S } from './LoginScreen.styles';

// ─── Credentials ──────────────────────────────────────────────────────────────
const VALID_USERNAME = 'Gian Atienza';
const VALID_PASSWORD = 'travel2025';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginScreenProps {
  onLogin: () => void;
}

// ─── Hook: Press Animation ────────────────────────────────────────────────────
const usePressAnimation = (toValue = 0.96) => {
  const scale  = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => ({ toValue: to, useNativeDriver: true, speed: 20, bounciness: 5 });
  const onPressIn  = () => Animated.spring(scale, spring(toValue)).start();
  const onPressOut = (cb?: () => void) => Animated.spring(scale, spring(1)).start(() => cb?.());
  return { scale, onPressIn, onPressOut };
};

// ─── Screen: LoginScreen ──────────────────────────────────────────────────────
const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { resolvedScheme }  = useTheme();
  const scheme: ColorScheme = resolvedScheme;
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];

  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [shake,        setShake]        = useState(false);

  const { scale, onPressIn, onPressOut } = usePressAnimation(0.97);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60,  useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    if (username.trim() === VALID_USERNAME && password === VALID_PASSWORD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setError('');
      onLogin();
    } else {
      setError('Incorrect username or password.');
      triggerShake();
    }
  };

  const canSubmit = username.trim().length > 0 && password.length > 0;

  return (
    <View style={[S.container, { backgroundColor: colors.systemBackground }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        style={{ width: '100%', alignItems: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo */}
        <BlurView
          intensity={50}
          tint={tokens.tint}
          style={[S.logoWrapper, { borderColor: tokens.border }]}
        >
          <View style={S.logoBlur}>
            <Ionicons name="airplane" size={40} color={colors.accent} />
          </View>
        </BlurView>

        <Text style={[S.appName, { color: colors.label }]}>Travel Diary</Text>
        <Text style={[S.appTagline, { color: colors.label }]}>
          Your journey, your story.
        </Text>

        {/* Form card */}
        <Animated.View
          style={[
            S.formCard,
            {
              borderColor: error ? colors.destructive : tokens.border,
              transform:   [{ translateX: shakeAnim }],
              width:       '100%',
            },
          ]}
        >
          <BlurView intensity={60} tint={tokens.tint} style={S.formBlur}>
            {/* Username */}
            <View style={S.inputRow}>
              <Ionicons name="person-outline" size={18} color={colors.tertiaryLabel} />
              <TextInput
                style={[S.textInput, { color: colors.label }]}
                placeholder="Username"
                placeholderTextColor={colors.tertiaryLabel}
                value={username}
                onChangeText={(t) => { setUsername(t); setError(''); }}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={[S.inputDivider, { backgroundColor: colors.separator }]} />

            {/* Password */}
            <View style={S.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.tertiaryLabel} />
              <TextInput
                style={[S.textInput, { color: colors.label }]}
                placeholder="Password"
                placeholderTextColor={colors.tertiaryLabel}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.tertiaryLabel}
                />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>

        {/* Error */}
        {error !== '' && (
          <Text style={[S.errorText, { color: colors.destructive }]}>{error}</Text>
        )}

        {/* Login button */}
        <Animated.View
          style={[
            S.loginButton,
            {
              transform:       [{ scale }],
              borderColor:     tokens.border,
              opacity:         canSubmit ? 1 : 0.45,
              width:           '100%',
              marginTop:       error ? 12 : 16,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            disabled={!canSubmit}
            onPressIn={onPressIn}
            onPressOut={() => onPressOut(handleLogin)}
          >
            <BlurView
              intensity={80}
              tint={tokens.tint}
              style={[S.loginBlur, { backgroundColor: colors.accent }]}
            >
              <Text style={S.loginLabel}>Sign In</Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        {/* Hint */}
        <Text style={[S.hintText, { color: colors.label }]}>
          Username: Gian Atienza · Password: travel2025
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;