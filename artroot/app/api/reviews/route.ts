import { NextRequest, NextResponse } from 'next/server';
import * as reviewService from '@/lib/services/reviewService';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

// GET reviews for artwork
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const artworkId = searchParams.get('artworkId');
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;

        if (!artworkId) {
            return NextResponse.json({ success: false, error: 'artworkId is required' }, { status: 400 });
        }

        const result = await reviewService.getReviewsByArtwork(parseInt(artworkId), page, limit);
        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('API', 'Failed to fetch reviews', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// POST create review
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { artworkId, rating, title, comment } = body;

        if (!artworkId || !rating) {
            return NextResponse.json({ success: false, error: 'artworkId and rating are required' }, { status: 400 });
        }

        const review = await reviewService.createReview({
            artworkId: parseInt(artworkId),
            reviewerId: parseInt(user.userId),
            rating: parseInt(rating),
            title,
            comment
        });

        return NextResponse.json({ success: true, message: 'Review submitted', data: review }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'ARTWORK_NOT_FOUND') {
            return NextResponse.json({ success: false, error: 'Artwork not found' }, { status: 404 });
        }
        logger.error('API', 'Failed to create review', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 });
    }
}
