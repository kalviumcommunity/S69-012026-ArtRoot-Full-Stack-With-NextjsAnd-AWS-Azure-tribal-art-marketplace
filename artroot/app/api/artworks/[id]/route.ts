import { NextRequest, NextResponse } from 'next/server';
import * as artworkService from '@/lib/services/artworkService';
import * as artistService from '@/lib/services/artistService';
import { getAuthUser, checkPermission, isOwner } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

// GET single artwork
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params;
        const id = Number(idParam);
        const artwork = await artworkService.getArtworkById(id);

        if (!artwork) {
            return NextResponse.json({ success: false, error: 'Artwork not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: artwork });
    } catch (error: any) {
        logger.error('API', 'Failed to fetch artwork', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch artwork' }, { status: 500 });
    }
}

// PUT update artwork
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: idParam } = await params;
        const id = Number(idParam);
        const artwork = await artworkService.getArtworkById(id);

        if (!artwork) {
            return NextResponse.json({ success: false, error: 'Artwork not found' }, { status: 404 });
        }

        // Check ownership
        const artist = await artistService.getArtistById(artwork.artist_id);
        if (!artist || !isOwner(user, artist.user_id)) {
            return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
        }

        const body = await req.json();
        const updated = await artworkService.updateArtwork(id, body);

        return NextResponse.json({ success: true, message: 'Artwork updated successfully', data: updated });
    } catch (error: any) {
        logger.error('API', 'Failed to update artwork', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to update artwork' }, { status: 500 });
    }
}

// DELETE artwork
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        if (!user || !checkPermission(user, 'delete')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { id: idParam } = await params;
        const id = Number(idParam);
        const artwork = await artworkService.getArtworkById(id);

        if (!artwork) {
            return NextResponse.json({ success: false, error: 'Artwork not found' }, { status: 404 });
        }

        // Check ownership
        const artist = await artistService.getArtistById(artwork.artist_id);
        if (!artist || !isOwner(user, artist.user_id)) {
            return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
        }

        await artworkService.deleteArtwork(id);

        return NextResponse.json({ success: true, message: 'Artwork deleted successfully' });
    } catch (error: any) {
        logger.error('API', 'Failed to delete artwork', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to delete artwork' }, { status: 500 });
    }
}
