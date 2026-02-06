import { NextRequest, NextResponse } from 'next/server';
import * as artistService from '@/lib/services/artistService';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;
        const tribe = searchParams.get('tribe') || undefined;
        let isVerified: boolean | undefined = true;
        if (searchParams.has('isVerified')) {
            if (searchParams.get('isVerified') === 'true') isVerified = true;
            else if (searchParams.get('isVerified') === 'false') isVerified = false;
            else isVerified = undefined;
        }

        const result = await artistService.getArtists({
            page,
            limit,
            tribe,
            isVerified
        });

        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('API', 'Failed to fetch artists', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch artists' }, { status: 500 });
    }
}
