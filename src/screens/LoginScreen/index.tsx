import React, { useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { glassTokens, palette, ColorScheme } from '../HomeScreen/HomeScreen.styles';
import { loginStyles as S } from './LoginScreen.styles';

// ─── Credentials ──────────────────────────────────────────────────────────────
const VALID_USERNAME = 'Gian Atienza';
const VALID_PASSWORD = 'traveldiaryapp';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginScreenProps {
  onLogin: () => void;
}

// ─── Hook: Press Animation ────────────────────────────────────────────────────
const usePressAnimation = (toValue = 0.97) => {
  const scale  = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => ({ toValue: to, useNativeDriver: true, speed: 20, bounciness: 5 });
  const onPressIn  = () => Animated.spring(scale, spring(toValue)).start();
  const onPressOut = (cb?: () => void) => Animated.spring(scale, spring(1)).start(() => cb?.());
  return { scale, onPressIn, onPressOut };
};

// ─── Screen: LoginScreen ──────────────────────────────────────────────────────
const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { resolvedScheme } = useTheme();

  // ── null-safe scheme — defaults to 'light' if context hasn't resolved yet ──
  const scheme: ColorScheme = resolvedScheme ?? 'light';
  const colors              = palette[scheme];
  const tokens              = glassTokens[scheme];
  const insets              = useSafeAreaInsets();

  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [isLoading,    setIsLoading]    = useState(false);

  const { scale, onPressIn, onPressOut } = usePressAnimation(0.97);
  const passwordRef = useRef<TextInput>(null);

  // ── Shake animation for wrong credentials ──────────────────────────────────
  const shakeX = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:   8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:   0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Please enter both username and password.');
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (
      trimmedUser.toLowerCase() !== VALID_USERNAME.toLowerCase() ||
      trimmedPass !== VALID_PASSWORD
    ) {
      setError('Incorrect username or password.');
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPassword('');
      return;
    }

    setError('');
    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 400);
  };

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
            <Ionicons name="airplane" size={44} color={colors.accent} />
          </View>
        </BlurView>

        <Text style={[S.appName, { color: colors.label }]}>Travel Diary</Text>
        <Text style={[S.appTagline, { color: colors.label }]}>
          Sign in to access your memories
        </Text>

        {/* Form card */}
        <Animated.View
          style={[
            S.formCard,
            { borderColor: tokens.border, transform: [{ translateX: shakeX }] },
          ]}
        >
          <BlurView intensity={60} tint={tokens.tint} style={S.formCardBlur}>
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
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View style={[S.inputDivider, { backgroundColor: colors.separator }]} />

            {/* Password */}
            <View style={S.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.tertiaryLabel} />
              <TextInput
                ref={passwordRef}
                style={[S.textInput, { color: colors.label }]}
                placeholder="Password"
                placeholderTextColor={colors.tertiaryLabel}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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

        {/* Error message */}
        {error !== '' && (
          <View style={S.errorRow}>
            <Ionicons name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[S.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        {/* Login button */}
        <Animated.View
          style={[
            S.loginButton,
            {
              transform: [{ scale }],
              borderColor: tokens.border,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            disabled={isLoading}
            onPressIn={onPressIn}
            onPressOut={() => onPressOut(handleLogin)}
          >
            <BlurView
              intensity={80}
              tint={tokens.tint}
              style={[S.loginButtonBlur, { backgroundColor: colors.accent }]}
            >
              <Text style={S.loginButtonLabel}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[S.footer, { bottom: insets.bottom + 24 }]}>
        <Text style={[S.footerText, { color: colors.label }]}>
          Travel Diary © 2025
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;