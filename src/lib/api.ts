import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Expo knows computer's address to use with server's port
function getDefaultApiUrl() {
    const host = Constants.expoConfig?.hostUri?.split(':')[0];
    return host ? `http://${host}:3000` : 'http://localhost:3000';
}

// server address
export const API_URL = getDefaultApiUrl();

// login token
const TOKEN_KEY = 'token';

// SecureStore is native-only; browser localStorage is not encrypted.
export const getToken = async () => {
    if (Platform.OS === 'web') return globalThis.localStorage.getItem(TOKEN_KEY);
    return SecureStore.getItemAsync(TOKEN_KEY);
};

export const setToken = async (token: string) => {
    if (Platform.OS === 'web') {
        globalThis.localStorage.setItem(TOKEN_KEY, token);
        return;
    }

    return SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const clearToken = async () => {
    if (Platform.OS === 'web') {
        globalThis.localStorage.removeItem(TOKEN_KEY);
        return;
    }

    return SecureStore.deleteItemAsync(TOKEN_KEY);
};

// call backend with token attached
export async function api(
    path: string,
    { method = 'GET', body }: { method?: string; body?: unknown } = {}
) {
    const headers: Record<string, string> = {};

    // send token so server knows who's asking
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    // don't crash if response has no body
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // forget token if expired or account gone
        if (data.code === 'UNAUTHENTICATED') await clearToken();

        const error: Error & { status?: number } = new Error(data.error || 'Something went wrong.');
        error.status = response.status;
        throw error;
    }

    return data;
}