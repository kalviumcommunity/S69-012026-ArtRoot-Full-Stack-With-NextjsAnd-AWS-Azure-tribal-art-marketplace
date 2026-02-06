import { query } from '../db';
import { logger } from '../logger';

export interface Artist {
    id: number;
    user_id: number;
    tribe: string;
    location?: string;
    biography?: string;
    profile_image_url?: string;
    is_verified: boolean;
    verification_date?: Date;
    specialties?: string;
    years_active?: number;
    created_at: Date;
    updated_at: Date;
}

export interface ArtistProfile extends Artist {
    name: string;
    email: string;
    total_artworks: number;
    available_artworks: number;
    average_rating: number;
    review_count: number;
    total_sales: number;
}

// Get artist by ID
export async function getArtistById(artistId: number) {
    try {
        const result = await query<ArtistProfile>(`
            SELECT 
                a.id, a.user_id, a.tribe, a.location, a.biography, 
                a.profile_image_url, a.is_verified, a.verification_date,
                a.specialties, a.years_active, a.created_at, a.updated_at,
                u.name, u.email,
                COUNT(DISTINCT CASE WHEN ar.is_verified = TRUE AND ar.is_available = TRUE THEN ar.id END) as total_artworks,
                COUNT(DISTINCT CASE WHEN ar.is_available = TRUE THEN ar.id END) as available_artworks,
                ROUND(AVG(COALESCE(r.rating, 0))::numeric, 2) as average_rating,
                COUNT(DISTINCT r.id) as review_count,
                COALESCE(SUM(CASE WHEN o.status IN ('delivered', 'shipped', 'confirmed') THEN o.total_price ELSE 0 END), 0) as total_sales
            FROM artists a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN artworks ar ON a.id = ar.artist_id
            LEFT JOIN reviews r ON a.id = r.artist_id
            LEFT JOIN orders o ON a.id = o.artist_id
            WHERE a.id = $1
            GROUP BY a.id, u.id
        `, [artistId]);

        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch artist', { artistId, error: error.message });
        throw error;
    }
}

// Get artist by user ID
export async function getArtistByUserId(userId: number) {
    try {
        const result = await query<Artist>(`
            SELECT * FROM artists
            WHERE user_id = $1
            LIMIT 1
        `, [userId]);

        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch artist by user ID', { userId, error: error.message });
        throw error;
    }
}

// Create artist profile
export async function createArtistProfile(data: {
    userId: number;
    tribe: string;
    location?: string;
    biography?: string;
    specialties?: string;
    yearsActive?: number;
}) {
    try {
        const result = await query<Artist>(`
            INSERT INTO artists (user_id, tribe, location, biography, specialties, years_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            data.userId,
            data.tribe,
            data.location || null,
            data.biography || null,
            data.specialties || null,
            data.yearsActive || null
        ]);

        logger.info('DATABASE', 'Artist profile created', { userId: data.userId });
        return result.rows[0];
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to create artist profile', {
            userId: data.userId,
            error: error.message
        });
        throw error;
    }
}

// Update artist profile
export async function updateArtistProfile(artistId: number, data: Partial<{
    tribe: string;
    location: string;
    biography: string;
    profileImageUrl: string;
    specialties: string;
    yearsActive: number;
}>) {
    try {
        const updateFields: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (data.tribe) {
            updateFields.push(`tribe = $${paramIndex}`);
            params.push(data.tribe);
            paramIndex++;
        }
        if (data.location) {
            updateFields.push(`location = $${paramIndex}`);
            params.push(data.location);
            paramIndex++;
        }
        if (data.biography) {
            updateFields.push(`biography = $${paramIndex}`);
            params.push(data.biography);
            paramIndex++;
        }
        if (data.profileImageUrl) {
            updateFields.push(`profile_image_url = $${paramIndex}`);
            params.push(data.profileImageUrl);
            paramIndex++;
        }
        if (data.specialties) {
            updateFields.push(`specialties = $${paramIndex}`);
            params.push(data.specialties);
            paramIndex++;
        }
        if (data.yearsActive !== undefined) {
            updateFields.push(`years_active = $${paramIndex}`);
            params.push(data.yearsActive);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return null;
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(artistId);

        const result = await query<Artist>(`
            UPDATE artists
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `, params);

        logger.info('DATABASE', 'Artist profile updated', { artistId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to update artist profile', { artistId, error: error.message });
        throw error;
    }
}

// Get all artists with filters
export async function getArtists(filters: {
    page?: number;
    limit?: number;
    tribe?: string;
    isVerified?: boolean;
}) {
    try {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const offset = (page - 1) * limit;

        const whereConditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.tribe) {
            whereConditions.push(`a.tribe = $${paramIndex}`);
            params.push(filters.tribe);
            paramIndex++;
        }

        if (filters.isVerified !== undefined) {
            whereConditions.push(`a.is_verified = $${paramIndex}`);
            params.push(filters.isVerified);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Count total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM artists a
            ${whereClause}
        `;
        const countResult = await query<{ total: string }>(countQuery, params);
        const total = parseInt(countResult.rows[0]?.total || '0');

        // Fetch paginated data
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                a.id, a.user_id, a.tribe, a.location, a.biography,
                a.is_verified, a.specialties, a.years_active, a.created_at,
                u.name,
                COUNT(DISTINCT CASE WHEN ar.is_verified = TRUE AND ar.is_available = TRUE THEN ar.id END) as total_artworks,
                ROUND(AVG(COALESCE(r.rating, 0))::numeric, 2) as average_rating,
                COUNT(DISTINCT r.id) as review_count
            FROM artists a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN artworks ar ON a.id = ar.artist_id
            LEFT JOIN reviews r ON a.id = r.artist_id
            ${whereClause}
            GROUP BY a.id, u.id
            ORDER BY a.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const result = await query<any>(dataQuery, params);

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

// Verify artist (admin only)
export async function verifyArtist(artistId: number) {
    try {
        const result = await query<Artist>(`
            UPDATE artists
            SET is_verified = true,
                verification_date = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [artistId]);

        logger.info('DATABASE', 'Artist verified', { artistId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to verify artist', { artistId, error: error.message });
        throw error;
    }
}

// Get top artists by sales
export async function getTopArtistsBySales(limit: number = 10) {
    try {
        const result = await query<any>(`
            SELECT 
                a.id, u.name, a.tribe,
                COUNT(DISTINCT o.id) as total_orders,
                ROUND(SUM(o.total_price)::numeric, 2) as total_revenue,
                ROUND(AVG(r.rating)::numeric, 2) as average_rating
            FROM artists a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN orders o ON a.id = o.artist_id AND o.status IN ('delivered', 'confirmed', 'shipped')
            LEFT JOIN reviews r ON a.id = r.artist_id
            WHERE a.is_verified = true
            GROUP BY a.id, u.name, a.tribe
            ORDER BY total_revenue DESC
            LIMIT $1
        `, [limit]);

        return result.rows;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch top artists', { error: error.message });
        throw error;
    }
}

// Get artists by tribe
export async function getArtistsByTribe(tribe: string, page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const countResult = await query<{ total: string }>(`
            SELECT COUNT(*) as total FROM artists WHERE tribe = $1 AND is_verified = true
        `, [tribe]);
        const total = parseInt(countResult.rows[0]?.total || '0');

        const result = await query<ArtistProfile>(`
            SELECT 
                a.id, a.user_id, a.tribe, a.location, a.biography,
                u.name, u.email,
                COUNT(DISTINCT CASE WHEN ar.is_verified = TRUE AND ar.is_available = TRUE THEN ar.id END) as total_artworks,
                ROUND(AVG(COALESCE(r.rating, 0))::numeric, 2) as average_rating
            FROM artists a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN artworks ar ON a.id = ar.artist_id
            LEFT JOIN reviews r ON a.id = r.artist_id
            WHERE a.tribe = $1 AND a.is_verified = true
            GROUP BY a.id, u.id
            ORDER BY average_rating DESC
            LIMIT $2 OFFSET $3
        `, [tribe, limit, offset]);

        return {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: result.rows
        };
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch artists by tribe', { tribe, error: error.message });
        throw error;
    }
}
