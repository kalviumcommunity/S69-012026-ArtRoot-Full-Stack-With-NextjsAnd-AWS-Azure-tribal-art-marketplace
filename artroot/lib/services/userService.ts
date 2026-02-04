import { query } from '../db';
import { logger } from '../logger';

export interface User {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    role: 'admin' | 'artist' | 'viewer';
    is_active: boolean;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
}

// Get user by email
export async function getUserByEmail(email: string) {
    try {
        const result = await query<User>(`
            SELECT * FROM users
            WHERE email = $1 AND is_active = true
            LIMIT 1
        `, [email]);

        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch user by email', { email, error: error.message });
        throw error;
    }
}

// Get user by ID
export async function getUserById(userId: number) {
    try {
        const result = await query<User>(`
            SELECT id, email, name, role, is_active, email_verified, created_at, updated_at, last_login_at
            FROM users
            WHERE id = $1
        `, [userId]);

        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch user by ID', { userId, error: error.message });
        throw error;
    }
}

// Create new user
export async function createUser(data: {
    email: string;
    password_hash: string;
    name: string;
    role?: 'admin' | 'artist' | 'viewer';
}) {
    try {
        const role = data.role || 'viewer';

        const result = await query<User>(`
            INSERT INTO users (email, password_hash, name, role, is_active, email_verified)
            VALUES ($1, $2, $3, $4, true, false)
            RETURNING id, email, name, role, created_at
        `, [data.email, data.password_hash, data.name, role]);

        logger.info('DATABASE', 'User created successfully', { userId: result.rows[0].id, email: data.email });
        return result.rows[0];
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to create user', { email: data.email, error: error.message });
        throw error;
    }
}

// Update user
export async function updateUser(userId: number, data: Partial<{
    name: string;
    email: string;
    role: string;
    is_active: boolean;
}>) {
    try {
        const updateFields: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (data.name) {
            updateFields.push(`name = $${paramIndex}`);
            params.push(data.name);
            paramIndex++;
        }
        if (data.email) {
            updateFields.push(`email = $${paramIndex}`);
            params.push(data.email);
            paramIndex++;
        }
        if (data.role) {
            updateFields.push(`role = $${paramIndex}`);
            params.push(data.role);
            paramIndex++;
        }
        if (data.is_active !== undefined) {
            updateFields.push(`is_active = $${paramIndex}`);
            params.push(data.is_active);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return null;
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(userId);

        const result = await query<User>(`
            UPDATE users
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id, email, name, role, is_active, created_at, updated_at
        `, params);

        logger.info('DATABASE', 'User updated successfully', { userId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to update user', { userId, error: error.message });
        throw error;
    }
}

// Update last login
export async function updateLastLogin(userId: number) {
    try {
        await query(`
            UPDATE users
            SET last_login_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [userId]);

        logger.info('DATABASE', 'Last login updated', { userId });
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to update last login', { userId, error: error.message });
        throw error;
    }
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
    try {
        const result = await query<{ exists: boolean }>(`
            SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists
        `, [email]);

        return result.rows[0]?.exists || false;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to check email existence', { email, error: error.message });
        throw error;
    }
}

// Get all users (admin)
export async function getAllUsers(page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const countResult = await query<{ total: string }>(`
            SELECT COUNT(*) as total FROM users
        `);
        const total = parseInt(countResult.rows[0]?.total || '0');

        const result = await query<User>(`
            SELECT id, email, name, role, is_active, email_verified, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        return {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: result.rows
        };
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch all users', { error: error.message });
        throw error;
    }
}

// Get artists only
export async function getArtists(page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const countResult = await query<{ total: string }>(`
            SELECT COUNT(*) as total FROM users WHERE role = 'artist'
        `);
        const total = parseInt(countResult.rows[0]?.total || '0');

        const result = await query<User>(`
            SELECT id, email, name, role, is_active, email_verified, created_at, updated_at
            FROM users
            WHERE role = 'artist'
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        return {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: result.rows
        };
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch artists', { error: error.message });
        throw error;
    }
}

// Deactivate user
export async function deactivateUser(userId: number) {
    try {
        const result = await query<User>(`
            UPDATE users
            SET is_active = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, email, name, role, is_active
        `, [userId]);

        logger.info('DATABASE', 'User deactivated', { userId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to deactivate user', { userId, error: error.message });
        throw error;
    }
}

// Verify email
export async function verifyEmail(userId: number) {
    try {
        const result = await query<User>(`
            UPDATE users
            SET email_verified = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, email, email_verified
        `, [userId]);

        logger.info('DATABASE', 'Email verified', { userId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to verify email', { userId, error: error.message });
        throw error;
    }
}

// Delete user permanently
export async function deleteUser(userId: number) {
    try {
        const result = await query<User>(`
            DELETE FROM users
            WHERE id = $1
            RETURNING id, email, name
        `, [userId]);

        logger.info('DATABASE', 'User deleted permanently', { userId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to delete user', { userId, error: error.message });
        throw error;
    }
}
// Save OTP to user record
export async function saveOTP(email: string, otp: string) {
    try {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        await query(`
            UPDATE users
            SET otp_code = $1,
                otp_expires_at = $2
            WHERE email = $3
        `, [otp, expiresAt, email]);

        logger.info('DATABASE', 'OTP saved for user', { email });
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to save OTP', { email, error: error.message });
        throw error;
    }
}

// Verify OTP
export async function verifyOTP(email: string, otp: string) {
    try {
        const result = await query<User>(`
            SELECT id, email, name, role, otp_code, otp_expires_at
            FROM users
            WHERE email = $1 AND is_active = true
            LIMIT 1
        `, [email]);

        const user = result.rows[0];
        if (!user) return null;

        const storedOTP = (user as any).otp_code;
        const expiresAt = new Date((user as any).otp_expires_at);

        if (storedOTP === otp && expiresAt > new Date()) {
            // Clear OTP after successful verification
            await query(`
                UPDATE users
                SET otp_code = NULL,
                    otp_expires_at = NULL,
                    last_login_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [user.id]);

            logger.info('DATABASE', 'OTP verified successfully', { email });
            return user;
        }

        logger.warn('DATABASE', 'Invalid or expired OTP', { email });
        return null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to verify OTP', { email, error: error.message });
        throw error;
    }
}
