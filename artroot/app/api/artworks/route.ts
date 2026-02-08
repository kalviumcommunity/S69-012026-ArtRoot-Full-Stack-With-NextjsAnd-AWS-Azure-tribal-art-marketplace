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
        // Default isVerified to true for public gallery unless explicitly set to 'false' or 'all' (e.g. by admin)
        // Since we don't have an 'all' param logic here yet, let's assume if it's undefined, it means TRUE for public safety.
        // Admin endpoints usually go through /api/admin/artworks or pass specific flags.
        // Accessing main gallery should only show verified items.

        // Wait, if we set it to true by default, then 'undefined' becomes 'true'.
        let isVerified: boolean | undefined = true;

        if (searchParams.has('isVerified')) {
            if (searchParams.get('isVerified') === 'true') isVerified = true;
            else if (searchParams.get('isVerified') === 'false') isVerified = false;
            else isVerified = undefined; // e.g. 'all' or empty - show everything
        } else {
            // Default to VERIFIED ONLY for safety
            isVerified = true;
        }
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
        const { title, description, price, tribe, medium, size, imageUrl, additionalImages, stockQuantity } = body;

        if (!title || !price || !tribe) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Get artist ID from user ID
        const artist = await artistService.getArtistByUserId(Number(user.userId));
        if (!artist) {
            return NextResponse.json({ success: false, error: 'Artist profile not found' }, { status: 404 });
        }

        if (!artist.is_verified) {
            return NextResponse.json({
                success: false,
                error: 'Your artist profile is pending verification. You can upload artworks once an administrator verifies your account.'
            }, { status: 403 });
        }

        const artwork = await artworkService.createArtwork({
            artistId: artist.id,
            title,
            description,
            price: Number(price),
            tribe,
            medium,
            size,
            imageUrl,
            additionalImages,
            stockQuantity: Number(stockQuantity) || 1
        });

        return NextResponse.json({ success: true, message: 'Artwork created successfully', data: artwork }, { status: 201 });
    } catch (error: any) {
        logger.error('API', 'Failed to create artwork', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to create artwork' }, { status: 500 });
    }
}
