import express from 'express';
import { authenticateToken } from '../utils/auth';
import { requirePermission, requireOwnershipOrAdmin } from '../middleware/rbac';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock database
let artworks = [
    {
        id: 1,
        title: 'Village Harvest',
        artistId: 1,
        artistName: 'Ramesh Kumar',
        price: 5000,
        tribe: 'Warli',
        medium: 'Acrylic on Canvas',
        size: '24x36 inches',
        description: 'Traditional Warli painting depicting the harvest season',
        verified: true,
        available: true
    },
    {
        id: 2,
        title: 'Sacred Tree',
        artistId: 1,
        artistName: 'Ramesh Kumar',
        price: 7500,
        tribe: 'Warli',
        medium: 'Natural pigments on cloth',
        size: '30x40 inches',
        description: 'A sacred tree representing the connection between earth and sky',
        verified: true,
        available: true
    },
    {
        id: 3,
        title: 'Wedding Ceremony',
        artistId: 2,
        artistName: 'Maya Devi',
        price: 6500,
        tribe: 'Madhubani',
        medium: 'Natural dyes on paper',
        size: '18x24 inches',
        description: 'Vibrant Madhubani art showing traditional wedding rituals',
        verified: true,
        available: false
    },
];

router.get('/', (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const artistId = req.query.artistId;
        const tribe = req.query.tribe as string;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const available = req.query.available;

        let filteredArtworks = [...artworks];

        if (artistId) {
            filteredArtworks = filteredArtworks.filter(
                artwork => artwork.artistId === parseInt(artistId as string)
            );
        }

        if (tribe) {
            filteredArtworks = filteredArtworks.filter(
                artwork => artwork.tribe.toLowerCase() === tribe.toLowerCase()
            );
        }

        if (minPrice) {
            filteredArtworks = filteredArtworks.filter(
                artwork => artwork.price >= parseInt(minPrice as string)
            );
        }

        if (maxPrice) {
            filteredArtworks = filteredArtworks.filter(
                artwork => artwork.price <= parseInt(maxPrice as string)
            );
        }

        if (available !== undefined) {
            const isAvailable = available === 'true';
            filteredArtworks = filteredArtworks.filter(artwork => artwork.available === isAvailable);
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedArtworks = filteredArtworks.slice(startIndex, endIndex);

        res.json({
            success: true,
            page,
            limit,
            total: filteredArtworks.length,
            totalPages: Math.ceil(filteredArtworks.length / limit),
            data: paginatedArtworks,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch artworks' });
    }
});

router.post('/', authenticateToken, requirePermission('create'), (req, res) => {
    try {
        const data = req.body;

        if (!data.title || !data.price || !data.tribe || !data.medium) {
            res.status(400).json({ success: false, error: 'Missing required fields' });
            return;
        }

        // Use authenticated user's ID as artistId
        const artistId = parseInt(req.user!.userId);

        const newArtwork = {
            id: artworks.length + 1,
            title: data.title,
            artistId: artistId,
            artistName: data.artistName || req.user!.email,
            price: data.price,
            tribe: data.tribe,
            medium: data.medium,
            size: data.size || 'Not specified',
            description: data.description || '',
            verified: req.user!.role === 'admin' ? true : (data.verified || false),
            available: data.available !== undefined ? data.available : true,
        };

        artworks.push(newArtwork);

        logger.info('API', `Artwork created: ${newArtwork.title} by user ${req.user!.userId}`);

        res.status(201).json({ success: true, message: 'Artwork created successfully', data: newArtwork });
    } catch (error) {
        logger.error('API', 'Failed to create artwork', { error });
        res.status(500).json({ success: false, error: 'Failed to create artwork' });
    }
});

// GET single artwork by ID
router.get('/:id', (req, res) => {
    try {
        const artwork = artworks.find(a => a.id === parseInt(req.params.id));
        
        if (!artwork) {
            return res.status(404).json({ success: false, error: 'Artwork not found' });
        }

        res.json({ success: true, data: artwork });
    } catch (error) {
        logger.error('API', 'Failed to fetch artwork', { error });
        res.status(500).json({ success: false, error: 'Failed to fetch artwork' });
    }
});

// UPDATE artwork - requires authentication and ownership or admin role
router.put('/:id', 
    authenticateToken, 
    requirePermission('update'),
    requireOwnershipOrAdmin((req) => {
        const artwork = artworks.find(a => a.id === parseInt(req.params.id));
        return artwork ? artwork.artistId.toString() : '';
    }),
    (req, res) => {
        try {
            const artworkIndex = artworks.findIndex(a => a.id === parseInt(req.params.id));
            
            if (artworkIndex === -1) {
                return res.status(404).json({ success: false, error: 'Artwork not found' });
            }

            const data = req.body;
            const existingArtwork = artworks[artworkIndex];

            // Update artwork
            artworks[artworkIndex] = {
                ...existingArtwork,
                title: data.title || existingArtwork.title,
                price: data.price || existingArtwork.price,
                tribe: data.tribe || existingArtwork.tribe,
                medium: data.medium || existingArtwork.medium,
                size: data.size || existingArtwork.size,
                description: data.description || existingArtwork.description,
                available: data.available !== undefined ? data.available : existingArtwork.available,
                // Only admin can change verified status
                verified: req.user!.role === 'admin' && data.verified !== undefined ? data.verified : existingArtwork.verified,
            };

            logger.info('API', `Artwork updated: ${artworks[artworkIndex].title} by user ${req.user!.userId}`);

            res.json({ success: true, message: 'Artwork updated successfully', data: artworks[artworkIndex] });
        } catch (error) {
            logger.error('API', 'Failed to update artwork', { error });
            res.status(500).json({ success: false, error: 'Failed to update artwork' });
        }
    }
);

// DELETE artwork - requires authentication and ownership or admin role
router.delete('/:id',
    authenticateToken,
    requirePermission('delete'),
    requireOwnershipOrAdmin((req) => {
        const artwork = artworks.find(a => a.id === parseInt(req.params.id));
        return artwork ? artwork.artistId.toString() : '';
    }),
    (req, res) => {
        try {
            const artworkIndex = artworks.findIndex(a => a.id === parseInt(req.params.id));
            
            if (artworkIndex === -1) {
                return res.status(404).json({ success: false, error: 'Artwork not found' });
            }

            const deletedArtwork = artworks[artworkIndex];
            artworks.splice(artworkIndex, 1);

            logger.info('API', `Artwork deleted: ${deletedArtwork.title} by user ${req.user!.userId}`);

            res.json({ success: true, message: 'Artwork deleted successfully', data: deletedArtwork });
        } catch (error) {
            logger.error('API', 'Failed to delete artwork', { error });
            res.status(500).json({ success: false, error: 'Failed to delete artwork' });
        }
    }
);

export default router;
