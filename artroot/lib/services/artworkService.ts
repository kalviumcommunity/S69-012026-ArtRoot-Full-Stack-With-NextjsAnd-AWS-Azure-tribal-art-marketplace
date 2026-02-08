import { query } from '../db';
import { logger } from '../logger';

export interface Artwork {
    id: number;
    artist_id: number;
    title: string;
    description: string;
    price: number;
    tribe: string;
    medium: string;
    size: string;
    is_available: boolean;
    is_verified: boolean;
    stock_quantity: number;
    image_url: string;
    additional_images: string[];
    created_at: Date;
    updated_at: Date;
}

export interface ArtworkWithArtist extends Artwork {
    artist_name: string;
    artist_profile_image?: string;
}

// Get all artworks with filters
export async function getArtworks(filters: {
    page?: number;
    limit?: number;
    tribe?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    isVerified?: boolean;
    artistId?: number;
}) {
    try {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const offset = (page - 1) * limit;

        const whereConditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        // Build WHERE clause dynamically
        // Default to verified and available artworks unless specified otherwise (e.g., in admin panel)
        // If isVerified is explicitly passed as undefined, we assume we want only verified ones for public view.
        // However, the caller might be admin wanting to see all.
        // Let's rely on the caller passing the correct flag, BUT for the public gallery (where this is mostly used),
        // we should enforce verification.

        // Strategy: If isVerified is undefined, check if we should default it.
        // Ideally, the public API endpoint should force it.
        // Here we just build the query based on what's passed.

        if (filters.tribe) {
            whereConditions.push(`ar.tribe = $${paramIndex}`);
            params.push(filters.tribe);
            paramIndex++;
        }

        if (filters.minPrice !== undefined) {
            whereConditions.push(`ar.price >= $${paramIndex}`);
            params.push(filters.minPrice);
            paramIndex++;
        }

        if (filters.maxPrice !== undefined) {
            whereConditions.push(`ar.price <= $${paramIndex}`);
            params.push(filters.maxPrice);
            paramIndex++;
        }

        if (filters.isAvailable !== undefined) {
            whereConditions.push(`ar.is_available = $${paramIndex}`);
            params.push(filters.isAvailable);
            paramIndex++;
        }

        if (filters.isVerified !== undefined) {
            whereConditions.push(`ar.is_verified = $${paramIndex}`);
            params.push(filters.isVerified);
            paramIndex++;

            if (filters.isVerified === true) {
                whereConditions.push(`a.is_verified = true`);
            }
        }

        if (filters.artistId !== undefined) {
            whereConditions.push(`ar.artist_id = $${paramIndex}`);
            params.push(filters.artistId);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Count total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM artworks ar
            JOIN artists a ON ar.artist_id = a.id
            ${whereClause}
        `;
        const countResult = await query<{ total: string }>(countQuery, params);
        const total = parseInt(countResult.rows[0]?.total || '0');

        // Fetch paginated data
        params.push(limit, offset);
        const dataQuery = `
            SELECT 
                ar.id, ar.artist_id, ar.title, ar.description, ar.price,
                ar.tribe, ar.medium, ar.size, ar.is_available, ar.is_verified,
                ar.stock_quantity, ar.image_url, ar.additional_images, ar.created_at, ar.updated_at,
                u.name as artist_name, a.profile_image_url as artist_profile_image
            FROM artworks ar
            JOIN artists a ON ar.artist_id = a.id
            JOIN users u ON a.user_id = u.id
            ${whereClause}
            ORDER BY ar.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const result = await query<ArtworkWithArtist>(dataQuery, params);

        return {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: result.rows
        };
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch artworks', { error: error.message });
        throw error;
    }
}

// Get single artwork by ID
export async function getArtworkById(artworkId: number) {
    try {
        const result = await query<ArtworkWithArtist>(`
            SELECT 
                ar.id, ar.artist_id, ar.title, ar.description, ar.price,
                ar.tribe, ar.medium, ar.size, ar.is_available, ar.is_verified,
                ar.stock_quantity, ar.image_url, ar.additional_images, ar.created_at, ar.updated_at,
                u.name as artist_name, a.profile_image_url as artist_profile_image
            FROM artworks ar
            JOIN artists a ON ar.artist_id = a.id
            JOIN users u ON a.user_id = u.id
            WHERE ar.id = $1
        `, [artworkId]);

        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch artwork', { artworkId, error: error.message });
        throw error;
    }
}

// Create new artwork
export async function createArtwork(data: {
    artistId: number;
    title: string;
    description: string;
    price: number;
    tribe: string;
    medium: string;
    size: string;
    imageUrl?: string;
    additionalImages?: string[];
    stockQuantity?: number;
}) {
    try {
        const result = await query<Artwork>(`
            INSERT INTO artworks (
                artist_id, title, description, price, tribe, medium, size, 
                image_url, additional_images, stock_quantity, is_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
            RETURNING *
        `, [
            data.artistId,
            data.title,
            data.description,
            data.price,
            data.tribe,
            data.medium,
            data.size,
            data.imageUrl || null,
            data.additionalImages ? JSON.stringify(data.additionalImages) : '[]',
            data.stockQuantity || 1
        ]);

        logger.info('DATABASE', 'Artwork created successfully', { artworkId: result.rows[0].id });
        return result.rows[0];
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to create artwork', { error: error.message });
        throw error;
    }
}

// Update artwork
export async function updateArtwork(artworkId: number, data: Partial<{
    title: string;
    description: string;
    price: number;
    tribe: string;
    medium: string;
    size: string;
    isAvailable: boolean;
    imageUrl: string;
    additionalImages: string[];
    stockQuantity: number;
}>) {
    try {
        const updateFields: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (data.title) {
            updateFields.push(`title = $${paramIndex}`);
            params.push(data.title);
            paramIndex++;
        }
        if (data.description) {
            updateFields.push(`description = $${paramIndex}`);
            params.push(data.description);
            paramIndex++;
        }
        if (data.price !== undefined) {
            updateFields.push(`price = $${paramIndex}`);
            params.push(data.price);
            paramIndex++;
        }
        if (data.tribe) {
            updateFields.push(`tribe = $${paramIndex}`);
            params.push(data.tribe);
            paramIndex++;
        }
        if (data.medium) {
            updateFields.push(`medium = $${paramIndex}`);
            params.push(data.medium);
            paramIndex++;
        }
        if (data.size) {
            updateFields.push(`size = $${paramIndex}`);
            params.push(data.size);
            paramIndex++;
        }
        if (data.isAvailable !== undefined) {
            updateFields.push(`is_available = $${paramIndex}`);
            params.push(data.isAvailable);
            paramIndex++;
        }
        if (data.imageUrl) {
            updateFields.push(`image_url = $${paramIndex}`);
            params.push(data.imageUrl);
            paramIndex++;
        }
        if (data.additionalImages) {
            updateFields.push(`additional_images = $${paramIndex}`);
            params.push(JSON.stringify(data.additionalImages));
            paramIndex++;
        }
        if (data.stockQuantity !== undefined) {
            updateFields.push(`stock_quantity = $${paramIndex}`);
            params.push(data.stockQuantity);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return null;
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(artworkId);

        const result = await query<Artwork>(`
            UPDATE artworks
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `, params);

        logger.info('DATABASE', 'Artwork updated successfully', { artworkId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to update artwork', { artworkId, error: error.message });
        throw error;
    }
}

// Delete artwork
export async function deleteArtwork(artworkId: number) {
    try {
        const result = await query(`
            DELETE FROM artworks
            WHERE id = $1
            RETURNING id
        `, [artworkId]);

        logger.info('DATABASE', 'Artwork deleted successfully', { artworkId });
        return result.rows.length > 0;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to delete artwork', { artworkId, error: error.message });
        throw error;
    }
}

// Get artworks by artist
export async function getArtworksByArtist(artistId: number, page: number = 1, limit: number = 10) {
    try {
        const offset = (page - 1) * limit;

        const countResult = await query<{ total: string }>(`
            SELECT COUNT(*) as total FROM artworks WHERE artist_id = $1
        `, [artistId]);
        const total = parseInt(countResult.rows[0]?.total || '0');

        const result = await query<Artwork>(`
            SELECT * FROM artworks
            WHERE artist_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `, [artistId, limit, offset]);

        return {
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: result.rows
        };
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to fetch artworks by artist', { artistId, error: error.message });
        throw error;
    }
}

// Verify artwork (admin only)
export async function verifyArtwork(artworkId: number) {
    try {
        const result = await query<Artwork>(`
            UPDATE artworks
            SET is_verified = true,
                verification_date = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [artworkId]);

        logger.info('DATABASE', 'Artwork verified', { artworkId });
        return result.rows[0] || null;
    } catch (error: any) {
        logger.error('DATABASE', 'Failed to verify artwork', { artworkId, error: error.message });
        throw error;
    }
}
