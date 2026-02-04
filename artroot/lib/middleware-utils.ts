import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './auth-server';
import { logger } from './logger';
import { Role, Permission, hasPermission } from './roles';

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) return null;

    const decoded = verifyToken(token) as JWTPayload | null;
    return decoded;
}

export function checkPermission(user: JWTPayload | null, permission: Permission): boolean {
    if (!user) return false;
    return hasPermission(user.role, permission);
}

export function isOwner(user: JWTPayload | null, resourceOwnerId: string | number): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.userId === resourceOwnerId.toString();
}
