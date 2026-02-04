import { NextRequest, NextResponse } from 'next/server';
import * as orderService from '@/lib/services/orderService';
import * as artistService from '@/lib/services/artistService';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;

        const artistProfile = await artistService.getArtistByUserId(parseInt(user.userId));
        if (!artistProfile) {
            return NextResponse.json({ success: false, error: 'Artist profile not found' }, { status: 403 });
        }

        const result = await orderService.getOrdersByArtist(artistProfile.id, page, limit);
        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('API', 'Failed to fetch artist orders', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
}
