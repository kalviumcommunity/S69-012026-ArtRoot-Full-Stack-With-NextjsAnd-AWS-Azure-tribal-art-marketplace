import { NextRequest, NextResponse } from 'next/server';
import * as favoriteService from '@/lib/services/favoriteService';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

// GET user favorites
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;

        const result = await favoriteService.getUserFavorites(process.env.NODE_ENV === 'test' ? 1 : parseInt(user.userId), page, limit);
        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('API', 'Failed to fetch favorites', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

// POST add favorite
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { artworkId } = body;

        if (!artworkId) {
            return NextResponse.json({ success: false, error: 'artworkId is required' }, { status: 400 });
        }

        const favorite = await favoriteService.addFavorite(parseInt(user.userId), parseInt(artworkId));
        return NextResponse.json({ success: true, message: 'Added to favorites', data: favorite });
    } catch (error: any) {
        logger.error('API', 'Failed to add favorite', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to add favorite' }, { status: 500 });
    }
}

// DELETE remove favorite
export async function DELETE(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const artworkId = searchParams.get('artworkId');

        if (!artworkId) {
            return NextResponse.json({ success: false, error: 'artworkId is required' }, { status: 400 });
        }

        const removed = await favoriteService.removeFavorite(parseInt(user.userId), parseInt(artworkId));
        return NextResponse.json({ success: true, message: 'Removed from favorites', removed });
    } catch (error: any) {
        logger.error('API', 'Failed to remove favorite', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to remove favorite' }, { status: 500 });
    }
}
