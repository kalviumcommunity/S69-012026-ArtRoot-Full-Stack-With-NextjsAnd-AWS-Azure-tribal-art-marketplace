import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Role } from '../config/roles';
import { logger } from './logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const SALT_ROUNDS = 10;

// Shared Zod validation schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generates a JWT token with user info and role
 * @param userId - Unique user identifier
 * @param email - User email
 * @param role - User role (admin | artist | viewer)
 * @returns Signed JWT token
 */
export function generateToken(userId: string, email: string, role: Role = 'viewer'): string {
    logger.info('AUTH', `Generating token for user ${userId} with role ${role}`);
    return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies JWT token and returns decoded payload
 * Returns null if token is invalid or expired
 */
export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
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

/**
 * Middleware to authenticate requests using JWT tokens
 * Attaches user info to req.user if valid token is provided
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        logger.warn('AUTH', 'No token provided', { path: req.path });
        return res.status(401).json({
            success: false,
            error: 'Access token required',
            code: 'TOKEN_REQUIRED'
        });
    }

    const decoded = verifyToken(token) as JWTPayload | null;

    if (!decoded) {
        logger.warn('AUTH', 'Invalid or expired token', { path: req.path });
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token',
            code: 'TOKEN_INVALID'
        });
    }

    // Attach user info to request
    (req as any).user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
    };

    logger.info('AUTH', `User authenticated: ${decoded.email} (${decoded.role})`, { path: req.path });
    next();
}
