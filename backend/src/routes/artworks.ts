import express from 'express';

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

router.post('/', (req, res) => {
    try {
        const data = req.body;

        if (!data.title || !data.artistId || !data.price || !data.tribe || !data.medium) {
            res.status(400).json({ success: false, error: 'Missing required fields' });
            return;
        }

        const newArtwork = {
            id: artworks.length + 1,
            title: data.title,
            artistId: data.artistId,
            artistName: data.artistName || 'Unknown Artist',
            price: data.price,
            tribe: data.tribe,
            medium: data.medium,
            size: data.size || 'Not specified',
            description: data.description || '',
            verified: data.verified || false,
            available: data.available !== undefined ? data.available : true,
        };

        artworks.push(newArtwork);

        res.status(201).json({ success: true, message: 'Artwork created successfully', data: newArtwork });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create artwork' });
    }
});

export default router;
