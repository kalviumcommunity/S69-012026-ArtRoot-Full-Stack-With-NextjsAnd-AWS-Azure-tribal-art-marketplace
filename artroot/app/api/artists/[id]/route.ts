import { NextRequest, NextResponse } from 'next/server';
import { getArtistById } from '@/lib/services/artistService';
import { logger } from '@/lib/logger';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Correct type for dynamic params in Next.js 15+
) {
    const params = await context.params;
    const artistId = parseInt(params.id);

    if (isNaN(artistId)) {
        return NextResponse.json(
            { success: false, error: 'Invalid artist ID' },
            { status: 400 }
        );
    }

    try {
        const artist = await getArtistById(artistId);

        if (!artist) {
            return NextResponse.json(
                { success: false, error: 'Artist not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: artist
        });
    } catch (error: any) {
        logger.error('API', 'Failed to fetch artist details', { artistId, error: error.message });
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
