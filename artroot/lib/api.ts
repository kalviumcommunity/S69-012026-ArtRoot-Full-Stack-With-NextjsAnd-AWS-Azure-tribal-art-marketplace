export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    LOGIN: `/auth/login`,
    SIGNUP: `/auth/signup`,
    ARTWORKS: `/artworks`,
};
