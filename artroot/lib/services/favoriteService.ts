import { query } from '../db';
import { logger } from '../logger';

export interface Favorite {
    id: number;
    user_id: number;
    artwork_id: number;
    created_at: Date;
}

export interface FavoriteWithArtwork extends Favorite {
    title: string;
    price: number;
    tribe: string;
    image_url?: string;
    artist_name: string;
}

export async function addFavorite(userId: number, artworkId: number) {
    try {
        const result = await query<Favorite>(
            `INSERT INTO favorites (user_id, artwork_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, artwork_id) DO NOTHING
             RETURNING *`,
            [userId, artworkId]
        );

        if (result.rows[0]) {
            logger.info('DATABASE', 'Favorite added', { userId, artworkId });
            return result.rows[0];
        }

        const existing = await query<Favorite>(
            `SELECT * FROM favorites WHERE user_id = $1 AND artwork_id = $2`,
            [userId, artworkId]
        );

        return existing.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to add favorite', { userId, artworkId, error: error.message });
        throw error;
    }
}

export async function removeFavorite(userId: number, artworkId: number) {
    try {
        const result = await query(
            `DELETE FROM favorites WHERE user_id = $1 AND artwork_id = $2 RETURNING id`,
            [userId, artworkId]
        );

        logger.info('DATABASE', 'Favorite removed', { userId, artworkId });
        return result.rows.length > 0;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to remove favorite', { userId, artworkId, error: error.message });
        throw error;
    }
}

export async function getUserFavorites(userId: number, page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const countResult = await query<{ total: string }>(
            `SELECT COUNT(*) as total FROM favorites WHERE user_id = $1`,
            [userId]
        );
        const total = parseInt(countResult.rows[0]?.total || '0');

        const result = await query<FavoriteWithArtwork>(
            `SELECT f.*, ar.title, ar.price, ar.tribe, ar.image_url, u.name as artist_name
             FROM favorites f
             JOIN artworks ar ON f.artwork_id = ar.id
             JOIN artists a ON ar.artist_id = a.id
             JOIN users u ON a.user_id = u.id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: result.rows
        };
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch favorites', { userId, error: error.message });
        throw error;
    }
}

export async function isFavorited(userId: number, artworkId: number): Promise<boolean> {
    try {
        const result = await query<{ exists: boolean }>(
            `SELECT EXISTS(SELECT 1 FROM favorites WHERE user_id = $1 AND artwork_id = $2) as exists`,
            [userId, artworkId]
        );

        return result.rows[0]?.exists || false;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to check favorite', { userId, artworkId, error: error.message });
        throw error;
    }
}
