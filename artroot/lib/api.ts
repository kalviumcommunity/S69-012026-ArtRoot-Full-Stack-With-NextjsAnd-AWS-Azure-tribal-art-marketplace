export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
    LOGIN: `/auth/login`,
    SIGNUP: `/auth/signup`,
    ARTWORKS: `/artworks`,
};

/**
 * Fetch with Authorization header (CLIENT-SIDE)
 */
export async function fetchWithAuth(
    endpoint: string,
    options: RequestInit & { token?: string } = {}
) {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        // Try getting token from localStorage if not provided
        const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (localToken) {
            headers['Authorization'] = `Bearer ${localToken}`;
        }
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    return fetch(url, {
        ...fetchOptions,
        headers,
    });
}
