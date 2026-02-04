import { z } from 'zod';
import { Role } from './rbac';

// Shared Zod validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['artist', 'viewer']).optional(),
});

/**
 * Decodes JWT token without verification (client-side only)
 * For actual verification, the backend should validate the token
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    // Simple base64 decode of JWT payload (not secure verification)
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (_) {
    return null;
  }
}

/**
 * Type definition for decoded JWT payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

// Get user session from localStorage
export function getUserSession(): JWTPayload | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  return decodeToken(token);
}

// Save user session to localStorage
export function saveUserSession(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

// Clear user session
export function clearUserSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}