import * as SecureStore from 'expo-secure-store';

// server address
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// login token
const TOKEN_KEY = 'token';

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

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