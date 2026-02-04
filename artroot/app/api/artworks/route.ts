import { NextRequest, NextResponse } from 'next/server';
import * as artworkService from '@/lib/services/artworkService';
import * as artistService from '@/lib/services/artistService';
import { getAuthUser, checkPermission } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

// GET all artworks
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tribe = searchParams.get('tribe') || undefined;
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
        const isAvailable = searchParams.get('isAvailable') === 'true' ? true :
            searchParams.get('isAvailable') === 'false' ? false : undefined;
        const isVerified = searchParams.get('isVerified') === 'true' ? true :
            searchParams.get('isVerified') === 'false' ? false : undefined;
        const artistId = searchParams.get('artistId') ? Number(searchParams.get('artistId')) : undefined;
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 12;

        const result = await artworkService.getArtworks({
            tribe,
            minPrice,
            maxPrice,
            isAvailable,
            isVerified,
            artistId,
            page,
            limit
        });

        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('API', 'Failed to fetch artworks', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch artworks' }, { status: 500 });
    }
}

// POST create artwork
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || !checkPermission(user, 'create')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, price, tribe, medium, size, imageUrl } = body;

        if (!title || !price || !tribe) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Get artist ID from user ID
        const artist = await artistService.getArtistByUserId(Number(user.userId));
        if (!artist) {
            return NextResponse.json({ success: false, error: 'Artist profile not found' }, { status: 404 });
        }

        const artwork = await artworkService.createArtwork({
            artistId: artist.id,
            title,
            description,
            price: Number(price),
            tribe,
            medium,
            size,
            imageUrl
        });

        return NextResponse.json({ success: true, message: 'Artwork created successfully', data: artwork }, { status: 201 });
    } catch (error: any) {
        logger.error('API', 'Failed to create artwork', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to create artwork' }, { status: 500 });
    }
}
