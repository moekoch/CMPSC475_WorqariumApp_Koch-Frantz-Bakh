import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, } from 'react-native';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { COLORS, FONTS } from '../constants/theme';
import { api, clearToken } from '../lib/api';
import { disconnectSocket } from '../lib/socket';

// options for online status picker
const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'friends', label: 'Friends' },
  { value: 'nobody', label: 'No one' },
];

// button used on card and popups
function Button({ label, onPress, variant = 'primary', busy = false, grow = false }) {
  const buttonStyle = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    danger: styles.btnDanger,
    dangerOutline: styles.btnDangerOutline,
  }[variant];

  const textStyle = {
    primary: styles.btnTextLight,
    secondary: styles.btnTextDark,
    danger: styles.btnTextLight,
    dangerOutline: styles.btnTextDanger,
  }[variant];

  // spinner color shows on button background
  const spinnerColor = variant === 'primary' || variant === 'danger' ? COLORS.pearl : COLORS.ink;

  return (
    <Pressable
      style={[styles.btn, buttonStyle, grow && styles.btnGrow, busy && styles.btnBusy]}
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: busy }}
    >
      {busy ? <ActivityIndicator color={spinnerColor} /> : <Text style={textStyle}>{label}</Text>}
    </Pressable>
  );
}

// labeled password input
function PasswordField({ label, value, onChangeText, textContentType }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType={textContentType}
        accessibilityLabel={label}
      />
    </View>
  );
}

// popup covers screen
function Popup({ visible, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* keep popup above keyboard */}
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.popup}>{children}</View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function SettingsScreen({ navigation }) {
  // notifications on or off
  const [notifications, setNotifications] = useState(true);

  // who can see when user is online
  const [visibility, setVisibility] = useState('friends');

  // which popup is open
  const [popup, setPopup] = useState(null);

  // password form fields and message underneath
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // password typed in delete popup and message underneath
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // true while waiting for server
  const [busy, setBusy] = useState(false);

  // close any popup and clear everything typed
  const closePopup = () => {
    setPopup(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setDeletePassword('');
    setDeleteError('');
  };

  // forget login token, leave live session, go back to login
  const leaveApp = async () => {
    await clearToken();
    disconnectSocket();
    closePopup();
    navigation?.replace?.('login');
  };

  // check password form then save
  const handlePasswordSubmit = async () => {
    // every field must be filled in
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Fill in all three fields.');
      return;
    }

    // new password must be long enough
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    // both new password fields must match
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setBusy(true);
    setPasswordError('');
    try {
      // server checks current password and saves new one
      await api('/api/users/me/password', {
        method: 'PATCH',
        body: { currentPassword, newPassword },
      });

      // close popup
      closePopup();
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setBusy(false);
    }
  };

  // delete user account
  const handleDelete = async () => {
    // password needed to prove account owner
    if (!deletePassword) {
      setDeleteError('Enter your password to delete your account.');
      return;
    }

    setBusy(true);
    setDeleteError('');
    try {
      // server deletes account the token belongs to
      await api('/api/users/me', { method: 'DELETE', body: { password: deletePassword } });

      // account is gone, forget token and go to login
      await leaveApp();
    } catch (error) {
      // keep popup open to show error
      setDeleteError(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <WaterBackground style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text accessibilityRole="header" style={styles.title}>Settings</Text>

        {/* card that holds all settings */}
        <View style={styles.card}>
          {/* notifications section */}
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <Text style={styles.description}>
                {notifications ? 'You will get notifications.' : 'Notifications are off.'}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.skylight, true: COLORS.deepWater }}
              thumbColor={COLORS.pearl}
              accessibilityLabel="Notifications"
            />
          </View>

          {/* online status three-way choice */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who can see when you’re online</Text>
            <View style={styles.segmented} accessibilityRole="radiogroup">
              {VISIBILITY_OPTIONS.map((option) => {
                const selected = visibility === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.segment, selected && styles.segmentSelected]}
                    onPress={() => setVisibility(option.value)}
                    accessibilityLabel={`Online visibility: ${option.label}`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* account section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Button label="Change password" variant="secondary" onPress={() => setPopup('password')} />
            <Button label="Log out" variant="secondary" onPress={() => setPopup('logout')} />
            <Button label="Delete account" variant="dangerOutline" onPress={() => setPopup('delete')} />
          </View>
        </View>
      </ScrollView>

      {/* change password popup */}
      <Popup visible={popup === 'password'} onClose={closePopup}>
        <Text style={styles.popupTitle}>Change password</Text>
        <PasswordField
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          textContentType="password"
        />
        <PasswordField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          textContentType="newPassword"
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          textContentType="newPassword"
        />

        {/* only show error when there is one */}
        {!!passwordError && (
          <Text accessibilityRole="alert" style={styles.error}>
            {passwordError}
          </Text>
        )}

        {/* close without saving or save */}
        <View style={styles.popupActions}>
          <Button label="Cancel" variant="secondary" onPress={closePopup} grow />
          <Button label="Save password" onPress={handlePasswordSubmit} busy={busy} grow />
        </View>
      </Popup>

      {/* log out popup */}
      <Popup visible={popup === 'logout'} onClose={closePopup}>
        <Text style={styles.popupTitle}>Log out?</Text>
        <Text style={styles.popupText}>You'll need to log in again to get back in.</Text>
        <View style={styles.popupActions}>
          <Button label="Cancel" variant="secondary" onPress={closePopup} grow />
          <Button label="Log out" onPress={leaveApp} grow />
        </View>
      </Popup>

      {/* delete account popup */}
      <Popup visible={popup === 'delete'} onClose={closePopup}>
        <Text style={styles.popupTitle}>Delete your account?</Text>
        <Text style={styles.popupText}>This permanently deletes your account and can't be undone.</Text>
        <PasswordField
          label="Enter your password to confirm"
          value={deletePassword}
          onChangeText={setDeletePassword}
          textContentType="password"
        />

        {/* only show error when there is one */}
        {!!deleteError && (
          <Text accessibilityRole="alert" style={styles.error}>
            {deleteError}
          </Text>
        )}

        {/* keep account or confirm delete */}
        <View style={styles.popupActions}>
          <Button label="Cancel" variant="secondary" onPress={closePopup} grow />
          <Button label="Delete account" variant="danger" onPress={handleDelete} busy={busy} grow />
        </View>
      </Popup>

      <WorqariumNav active="Settings" navigation={navigation} />
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 90,
  },
  title: {
    color: COLORS.pearl,
    fontFamily: FONTS.heading,
    fontSize: 30,
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,36,70,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  card: {
    backgroundColor: COLORS.pearl,
    borderColor: COLORS.glassEdge,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    gap: 28,
    shadowColor: '#002446',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },

  // sections
  section: { gap: 12 },
  sectionTitle: { color: COLORS.ink, fontFamily: FONTS.bodyBold, fontSize: 16 },
  description: { color: COLORS.inkSoft, fontFamily: FONTS.body, fontSize: 13, marginTop: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  switchText: { flex: 1 },

  // three-way choice
  segmented: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.foam,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  segmentSelected: { backgroundColor: COLORS.deepWater },
  segmentText: { color: COLORS.ink, fontFamily: FONTS.body, fontSize: 14 },
  segmentTextSelected: { color: COLORS.pearl, fontFamily: FONTS.bodyBold },

  // buttons
  btn: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnGrow: { flex: 1 },
  btnBusy: { opacity: 0.65 },
  btnPrimary: { backgroundColor: COLORS.deepWater },
  btnSecondary: { borderWidth: 1.5, borderColor: COLORS.deepWater },
  btnDanger: { backgroundColor: COLORS.coralDeep },
  btnDangerOutline: { borderWidth: 1.5, borderColor: COLORS.coralDeep },
  btnTextLight: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 16 },
  btnTextDark: { color: COLORS.ink, fontFamily: FONTS.bodyBold, fontSize: 16 },
  btnTextDanger: { color: COLORS.coralDeep, fontFamily: FONTS.bodyBold, fontSize: 16 },

  // popups
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: COLORS.pearl,
    borderRadius: 24,
    padding: 24,
    gap: 14,
  },
  popupTitle: {
    color: COLORS.ink,
    fontFamily: FONTS.heading,
    fontSize: 22,
    textAlign: 'center',
  },
  popupText: {
    color: COLORS.inkSoft,
    fontFamily: FONTS.body,
    fontSize: 15,
    textAlign: 'center',
  },
  popupActions: { flexDirection: 'row', gap: 12, marginTop: 6 },

  // password inputs
  label: { color: COLORS.ink, fontFamily: FONTS.bodyBold, fontSize: 14, marginBottom: 8 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.skylight,
    borderRadius: 10,
    backgroundColor: COLORS.foam,
    color: COLORS.ink,
    paddingHorizontal: 14,
    fontFamily: FONTS.body,
    fontSize: 15,
  },
  error: { color: COLORS.coralDeep, fontFamily: FONTS.body, fontSize: 13 },
});