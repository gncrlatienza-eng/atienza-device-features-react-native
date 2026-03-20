import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { palette, glassTokens } from '../screens/HomeScreen/HomeScreen.styles';

interface ConfirmLogoutModalProps {
  visible:   boolean;
  onConfirm: () => void;
  onCancel:  () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
  visible, onConfirm, onCancel,
}) => {
  const { resolvedScheme } = useTheme();
  const scheme             = resolvedScheme ?? 'dark';
  const tokens             = glassTokens[scheme];
  const colors             = palette[scheme];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={S.backdrop}>
        <View style={[S.card, { borderColor: tokens.border }]}>

          <BlurView intensity={80} tint={tokens.tint} style={S.top}>
            <BlurView
              intensity={40}
              tint={tokens.tint}
              style={[S.icon, { borderColor: colors.destructive + '50', backgroundColor: 'rgba(255,59,48,0.10)' }]}
            >
              <Ionicons name="log-out-outline" size={26} color={colors.destructive} />
            </BlurView>
            <Text style={[S.title, { color: colors.label }]}>Log Out?</Text>
            <Text style={[S.body,  { color: colors.label }]}>
              You'll need to log in again to access your memories.
            </Text>
          </BlurView>

          <View style={[S.divider, { backgroundColor: colors.separator }]} />

          <BlurView intensity={80} tint={tokens.tint} style={S.actions}>
            <TouchableOpacity style={S.action} onPress={onCancel} activeOpacity={0.7}>
              <Text style={[S.cancelLabel, { color: colors.tertiaryLabel }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={[S.actionDiv, { backgroundColor: colors.separator }]} />
            <TouchableOpacity
              style={S.action}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                onConfirm();
              }}
            >
              <Text style={[S.confirmLabel, { color: colors.destructive }]}>Log Out</Text>
            </TouchableOpacity>
          </BlurView>

        </View>
      </View>
    </Modal>
  );
};

const S = StyleSheet.create({
  backdrop:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.50)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  card:         { width: '100%', borderRadius: 20, overflow: 'hidden', borderWidth: 0.5 },
  top:          { paddingTop: 28, paddingBottom: 16, paddingHorizontal: 20, alignItems: 'center' },
  icon:         { width: 56, height: 56, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:        { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 },
  body:         { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.60, marginBottom: 8 },
  divider:      { height: 0.5 },
  actions:      { flexDirection: 'row' },
  action:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  actionDiv:    { width: 0.5 },
  cancelLabel:  { fontSize: 17, fontWeight: '400' },
  confirmLabel: { fontSize: 17, fontWeight: '600' },
});

export default ConfirmLogoutModal;