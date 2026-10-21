import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
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
 *   navigation?: { canGoBack?: () => boolean; goBack?: () => void };
 *   isLoggedIn?: boolean;
 *   onLogin?: (credentials: { username: string; password: string }) => boolean | void | Promise<boolean | void>;
 *   onBiometricLogin?: () => boolean | void | Promise<boolean | void>;
 *   onReturnToSession?: () => void;
 * }} props
 */
const LoginScreen = ({
	navigation,
	isLoggedIn = false,
	onLogin = null,
	onBiometricLogin = null,
	onReturnToSession = null,
}) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);
	const [biometricsAvailable, setBiometricsAvailable] = useState(false);
	const appState = useRef(AppState.currentState);
	const loggedIn = useRef(isLoggedIn);
	const returnCallback = useRef(onReturnToSession);

	useEffect(() => {
		loggedIn.current = isLoggedIn;
		returnCallback.current = onReturnToSession;
	}, [isLoggedIn, onReturnToSession]);

	const returnToSession = useCallback(() => {
		if (returnCallback.current) {
			returnCallback.current();
		} else if (navigation?.canGoBack?.()) {
			navigation.goBack();
		}
	}, [navigation]);

	useEffect(() => {
		let mounted = true;
		const checkBiometrics = async () => {
			try {
				const [hardware, enrolled] = await Promise.all([
					LocalAuthentication.hasHardwareAsync(),
					LocalAuthentication.isEnrolledAsync(),
				]);
				if (mounted) setBiometricsAvailable(hardware && enrolled);
			} catch {
				if (mounted) setBiometricsAvailable(false);
			}
		};
		checkBiometrics();
		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		if (isLoggedIn) returnToSession();
	}, [isLoggedIn, returnToSession]);

	useEffect(() => {
		const subscription = AppState.addEventListener('change', (nextState) => {
			const wasAway = /inactive|background/.test(appState.current);
			appState.current = nextState;
			if (wasAway && nextState === 'active' && loggedIn.current) {
				returnToSession();
			}
		});
		return () => subscription.remove();
	}, [returnToSession]);

	const submitLogin = async () => {
		if (!username.trim() || !password) {
			setError('Enter your username and password to continue.');
			return;
		}
		if (!onLogin) {
			setError('Sign-in is unavailable right now.');
			return;
		}

		setBusy(true);
		setError('');
		try {
			const result = await onLogin({ username: username.trim(), password });
			if (result === false) {
				setError('Username or password is incorrect.');
			} else {
				returnToSession();
			}
		} catch (loginError) {
			setError(loginError?.message || 'Unable to sign in. Please try again.');
		} finally {
			setBusy(false);
		}
	};

	const signInWithBiometrics = async () => {
		setBusy(true);
		setError('');
		try {
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: 'Sign in to Worqarium',
				cancelLabel: 'Cancel',
				disableDeviceFallback: false,
			});
			if (!result.success) return;

			if (onBiometricLogin) {
				const loginResult = await onBiometricLogin();
				if (loginResult === false) {
					setError('Biometric sign-in could not be completed.');
					return;
				}
			} else if (!loggedIn.current) {
				setError('Sign in with your username and password first.');
				return;
			}
			returnToSession();
		} catch {
			setError('Biometric sign-in is unavailable.');
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
						<Text style={styles.title}>Welcome back</Text>
						<Text style={styles.subtitle}>Sign in to continue to your workspace.</Text>

						<Text style={styles.label}>Username</Text>
						<TextInput
							style={styles.input}
							value={username}
							onChangeText={setUsername}
							placeholder="Enter your username"
							placeholderTextColor={COLORS.inkFaint}
							keyboardType="-address"
							autoCapitalize="none"
							autoCorrect={false}
							textContentType="username"
							accessibilityLabel="Username"
							editable={!busy}
						/>

						<Text style={styles.label}>Password</Text>
						<TextInput
							style={styles.input}
							value={password}
							onChangeText={setPassword}
							placeholder="Enter your password"
							placeholderTextColor={COLORS.inkFaint}
							secureTextEntry
							textContentType="password"
							accessibilityLabel="Password"
							editable={!busy}
							onSubmitEditing={submitLogin}
							returnKeyType="go"
						/>

						{!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}

						<TouchableOpacity
							style={[styles.primaryButton, busy && styles.disabledButton]}
							onPress={submitLogin}
							disabled={busy}
							accessibilityRole="button"
						>
							{busy ? <ActivityIndicator color={COLORS.pearl} /> : <Text style={styles.primaryButtonText}>Sign in</Text>}
						</TouchableOpacity>

						<View style={styles.registerPrompt}>
							<Text style={styles.registerPromptText}>Don't have an account? </Text>
							<TouchableOpacity
								onPress={() => navigation?.navigate('register')}
								disabled={busy}
								accessibilityRole="link"
								accessibilityLabel="Register here"
							>
								<Text style={styles.registerLink}>Create one</Text>
							</TouchableOpacity>
						</View>

						{biometricsAvailable && (
							<TouchableOpacity
								style={[styles.biometricButton, busy && styles.disabledButton]}
								onPress={signInWithBiometrics}
								disabled={busy}
								accessibilityRole="button"
								accessibilityLabel="Sign in with fingerprint"
								hitSlop={8}
							>
								<MaterialCommunityIcons name="fingerprint" size={28} color={COLORS.deepWater} />
							</TouchableOpacity>
						)}
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</WaterBackground>
	);
};

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
	brandMark: {
		width: 48,
		height: 48,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.coral,
		marginBottom: 20,
	},
	brandMarkText: { color: COLORS.pearl, fontFamily: FONTS.display, fontSize: 25 },
	title: { color: COLORS.ink, fontFamily: FONTS.heading, fontSize: 28, fontWeight: 'bold'},
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
	registerPrompt: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 18,
	},
	registerPromptText: { color: COLORS.inkSoft, fontFamily: FONTS.body, fontSize: 14 },
	registerLink: { color: COLORS.deepWater, fontFamily: FONTS.bodyBold, fontSize: 14, textDecorationLine: 'underline' },
	biometricButton: {
		width: 48,
		height: 48,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: COLORS.shallow,
		borderRadius: 24,
		backgroundColor: COLORS.foam,
		marginTop: 16,
		alignSelf: 'center',
	},
});

export default LoginScreen;
