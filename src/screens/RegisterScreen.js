import { useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaterBackground from '../components/aquarium/WaterBackground';
import { COLORS, FONTS } from '../constants/theme';

/**
 * @param {{
 *   navigation?: { navigate?: (screenName: string) => void; replace?: (screenName: string) => void };
 *   onRegister?: (details: { username: string; email: string; password: string }) => boolean | void | Promise<boolean | void>;
 * }} props
 */
export default function RegisterScreen({ navigation, onRegister = null }) {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);

	const submitRegistration = async () => {
		if (!username.trim() || !email.trim() || !password) {
			setError('Enter a username, email, and password to continue.');
			return;
		}
		if (!onRegister) {
			setError('Registration is unavailable right now.');
			return;
		}

		setBusy(true);
		setError('');
		try {
			const result = await onRegister({
				username: username.trim(),
				email: email.trim(),
				password,
			});
			if (result === false) {
				setError('Unable to create your account. Please try again.');
			} else {
				navigation?.replace?.('login');
			}
		} catch (registrationError) {
			setError(registrationError?.message || 'Unable to register. Please try again.');
		} finally {
			setBusy(false);
		}
	};

	return (
		<WaterBackground style={styles.root}>
			<SafeAreaView style={styles.safeArea}>
				<KeyboardAvoidingView
					style={styles.container}
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				>
					<View style={styles.card}>
						<Text style={styles.title}>Create your account</Text>
						<Text style={styles.subtitle}>Register to get started with Worqarium.</Text>

						<Text style={styles.label}>Username</Text>
						<TextInput
							style={styles.input}
							value={username}
							onChangeText={setUsername}
							placeholder="Choose a username"
							placeholderTextColor={COLORS.inkFaint}
							autoCapitalize="none"
							autoCorrect={false}
							textContentType="username"
							accessibilityLabel="Username"
							editable={!busy}
						/>

						<Text style={styles.label}>Email</Text>
						<TextInput
							style={styles.input}
							value={email}
							onChangeText={setEmail}
							placeholder="you@example.com"
							placeholderTextColor={COLORS.inkFaint}
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							textContentType="emailAddress"
							accessibilityLabel="Email"
							editable={!busy}
						/>

						<Text style={styles.label}>Password</Text>
						<TextInput
							style={styles.input}
							value={password}
							onChangeText={setPassword}
							placeholder="Create a password"
							placeholderTextColor={COLORS.inkFaint}
							secureTextEntry
							textContentType="newPassword"
							accessibilityLabel="Password"
							editable={!busy}
							onSubmitEditing={submitRegistration}
							returnKeyType="go"
						/>

						{!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}

						<TouchableOpacity
							style={[styles.primaryButton, busy && styles.disabledButton]}
							onPress={submitRegistration}
							disabled={busy}
							accessibilityRole="button"
						>
							{busy
								? <ActivityIndicator color={COLORS.pearl} />
								: <Text style={styles.primaryButtonText}>Register</Text>}
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</WaterBackground>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	safeArea: { flex: 1, backgroundColor: 'transparent' },
	container: { flex: 1, justifyContent: 'center', padding: 24 },
	card: {
		width: '100%',
		maxWidth: 440,
		alignSelf: 'center',
		padding: 28,
		borderRadius: 24,
		backgroundColor: COLORS.pearl,
		borderWidth: 1,
		borderColor: COLORS.glassEdge,
	},
	title: { color: COLORS.ink, fontFamily: FONTS.heading, fontSize: 28 },
	subtitle: { color: COLORS.inkSoft, fontFamily: FONTS.body, fontSize: 15, marginTop: 8, marginBottom: 28 },
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
		marginBottom: 18,
	},
	error: { color: COLORS.coralDeep, fontFamily: FONTS.body, fontSize: 13, marginBottom: 14 },
	primaryButton: {
		height: 50,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.deepWater,
		marginTop: 4,
	},
	disabledButton: { opacity: 0.65 },
	primaryButtonText: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 16 },
});
