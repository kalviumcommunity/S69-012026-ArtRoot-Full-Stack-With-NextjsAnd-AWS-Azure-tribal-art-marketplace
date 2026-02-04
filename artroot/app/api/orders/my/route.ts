import { NextRequest, NextResponse } from 'next/server';
import * as orderService from '@/lib/services/orderService';
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

        const result = await orderService.getOrdersByBuyer(parseInt(user.userId), page, limit);
        return NextResponse.json(result);
    } catch (error: any) {
        logger.error('API', 'Failed to fetch buyer orders', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
}
