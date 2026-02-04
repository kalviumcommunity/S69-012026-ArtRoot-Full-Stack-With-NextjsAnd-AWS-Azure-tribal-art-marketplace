import { NextRequest, NextResponse } from 'next/server';
import * as orderService from '@/lib/services/orderService';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { artworkId, quantity, deliveryAddress, notes } = body;

        if (!artworkId) {
            return NextResponse.json({ success: false, error: 'artworkId is required' }, { status: 400 });
        }

        const order = await orderService.createOrder({
            buyerId: parseInt(user.userId),
            artworkId: parseInt(artworkId),
            quantity: quantity ? parseInt(quantity) : undefined,
            deliveryAddress,
            notes
        });

        logger.info('API', 'Order created', { orderId: order.id, userId: user.userId });

        return NextResponse.json({ success: true, message: 'Order created successfully', data: order }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'ARTWORK_NOT_FOUND') {
            return NextResponse.json({ success: false, error: 'Artwork not found' }, { status: 404 });
        }
        if (error.message === 'ARTWORK_NOT_AVAILABLE') {
            return NextResponse.json({ success: false, error: 'Artwork is not available' }, { status: 409 });
        }
        logger.error('API', 'Failed to create order', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }
}
