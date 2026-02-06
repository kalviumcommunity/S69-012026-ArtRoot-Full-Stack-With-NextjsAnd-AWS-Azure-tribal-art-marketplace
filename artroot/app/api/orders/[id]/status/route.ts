import { NextRequest, NextResponse } from 'next/server';
import * as orderService from '@/lib/services/orderService';
import * as artistService from '@/lib/services/artistService';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

const validStatuses: orderService.OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// PUT update order status
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
        const body = await req.json();
        const { status, trackingNumber } = body;

        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        const order = await orderService.getOrderById(id);
        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Only admin or the artist can update order status
        if (user.role !== 'admin') {
            const artistProfile = await artistService.getArtistByUserId(parseInt(user.userId));
            if (!artistProfile || artistProfile.id !== order.artist_id) {
                return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
            }
        }

        const updated = await orderService.updateOrderStatus(id, status, trackingNumber);

        return NextResponse.json({ success: true, message: 'Order status updated', data: updated });
    } catch (error: any) {
        logger.error('API', 'Failed to update order status', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
    }
}
