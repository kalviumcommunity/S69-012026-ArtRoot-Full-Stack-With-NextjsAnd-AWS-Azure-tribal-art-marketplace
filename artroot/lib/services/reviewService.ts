import { query } from '../db';
import { logger } from '../logger';

export interface Review {
    id: number;
    artwork_id: number;
    reviewer_id: number;
    artist_id: number;
    rating: number;
    title?: string;
    comment?: string;
    is_verified_purchase: boolean;
    helpful_count: number;
    created_at: Date;
    updated_at: Date;
}

export interface ReviewWithUser extends Review {
    reviewer_name: string;
}

export async function createReview(data: {
    artworkId: number;
    reviewerId: number;
    rating: number;
    title?: string;
    comment?: string;
}) {
    try {
        const artworkResult = await query<{ id: number; artist_id: number }>(
            `SELECT id, artist_id FROM artworks WHERE id = $1`,
            [data.artworkId]
        );

        const artwork = artworkResult.rows[0];
        if (!artwork) {
            throw new Error('ARTWORK_NOT_FOUND');
        }

        const purchaseResult = await query<{ exists: boolean }>(
            `SELECT EXISTS(
                SELECT 1 FROM orders
                WHERE buyer_id = $1 AND artwork_id = $2
                  AND status IN ('confirmed', 'shipped', 'delivered')
            ) as exists`,
            [data.reviewerId, data.artworkId]
        );

        const isVerifiedPurchase = purchaseResult.rows[0]?.exists || false;

        const result = await query<Review>(
            `INSERT INTO reviews (
                artwork_id, reviewer_id, artist_id, rating, title, comment, is_verified_purchase
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                data.artworkId,
                data.reviewerId,
                artwork.artist_id,
                data.rating,
                data.title || null,
                data.comment || null,
                isVerifiedPurchase
            ]
        );

        logger.info('DATABASE', 'Review created', { reviewId: result.rows[0].id });
        return result.rows[0];
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to create review', { error: error.message });
        throw error;
    }
}

export async function getReviewsByArtwork(artworkId: number, page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const countResult = await query<{ total: string }>(
            `SELECT COUNT(*) as total FROM reviews WHERE artwork_id = $1`,
            [artworkId]
        );
        const total = parseInt(countResult.rows[0]?.total || '0');

        const result = await query<ReviewWithUser>(
            `SELECT r.*, u.name as reviewer_name
             FROM reviews r
             JOIN users u ON r.reviewer_id = u.id
             WHERE r.artwork_id = $1
             ORDER BY r.created_at DESC
             LIMIT $2 OFFSET $3`,
            [artworkId, limit, offset]
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
        logger.error('DATABASE', 'Failed to fetch reviews', { artworkId, error: error.message });
        throw error;
    }
}

export async function getReviewById(reviewId: number) {
    try {
        const result = await query<Review>(
            `SELECT * FROM reviews WHERE id = $1`,
            [reviewId]
        );

        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch review by id', { reviewId, error: error.message });
        throw error;
    }
}

export async function updateReview(reviewId: number, reviewerId: number, data: Partial<{
    rating: number;
    title: string;
    comment: string;
}>) {
    try {
        const updateFields: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (data.rating !== undefined) {
            updateFields.push(`rating = $${paramIndex}`);
            params.push(data.rating);
            paramIndex++;
        }
        if (data.title !== undefined) {
            updateFields.push(`title = $${paramIndex}`);
            params.push(data.title);
            paramIndex++;
        }
        if (data.comment !== undefined) {
            updateFields.push(`comment = $${paramIndex}`);
            params.push(data.comment);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return null;
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(reviewId, reviewerId);

        const result = await query<Review>(
            `UPDATE reviews
             SET ${updateFields.join(', ')}
             WHERE id = $${paramIndex} AND reviewer_id = $${paramIndex + 1}
             RETURNING *`,
            params
        );

        logger.info('DATABASE', 'Review updated', { reviewId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to update review', { reviewId, error: error.message });
        throw error;
    }
}

export async function deleteReview(reviewId: number, reviewerId: number) {
    try {
        const result = await query(
            `DELETE FROM reviews WHERE id = $1 AND reviewer_id = $2 RETURNING id`,
            [reviewId, reviewerId]
        );

        logger.info('DATABASE', 'Review deleted', { reviewId });
        return result.rows.length > 0;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to delete review', { reviewId, error: error.message });
        throw error;
    }
}
