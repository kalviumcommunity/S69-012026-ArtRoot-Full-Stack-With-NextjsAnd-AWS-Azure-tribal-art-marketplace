import { NextRequest, NextResponse } from 'next/server';
import * as orderService from '@/lib/services/orderService';
import * as artistService from '@/lib/services/artistService';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

// GET specific order
export async function GET(
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
        const order = await orderService.getOrderById(id);

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Authorization check: User must be buyer, artist, or admin
        if (user.role !== 'admin') {
            const userId = parseInt(user.userId);
            if (order.buyer_id !== userId) {
                const artistProfile = await artistService.getArtistByUserId(userId);
                if (!artistProfile || artistProfile.id !== order.artist_id) {
                    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
                }
            }
        }

        return NextResponse.json({ success: true, data: order });
    } catch (error: any) {
        logger.error('API', 'Failed to fetch order', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
    }
}
// DELETE cancel order
export async function DELETE(
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
        const order = await orderService.getOrderById(id);

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Authorization check: User must be buyer, artist, or admin
        const userId = parseInt(user.userId);
        let canCancel = false;

        logger.info('API', 'Cancel attempt', {
            userId,
            userRole: user.role,
            orderId: id,
            buyerId: order.buyer_id,
            artistId: order.artist_id
        });

        // Debug logging
        console.log('=== CANCEL ORDER DEBUG ===');
        console.log('User ID:', userId, '(type:', typeof userId, ')');
        console.log('Buyer ID:', order.buyer_id, '(type:', typeof order.buyer_id, ')');
        console.log('Match?:', order.buyer_id === userId);
        console.log('========================');

        // Admin can cancel any order
        if (user.role === 'admin') {
            canCancel = true;
            logger.info('API', 'Admin access granted');
        }
        // Buyer can cancel their own order
        else if (Number(order.buyer_id) === userId) {
            canCancel = true;
            logger.info('API', 'Buyer access granted');
        }
        // Artist can cancel orders for their artworks
        else {
            try {
                const artistProfile = await artistService.getArtistByUserId(userId);
                if (artistProfile && artistProfile.id === order.artist_id) {
                    canCancel = true;
                    logger.info('API', 'Artist access granted');
                }
            } catch (error) {
                logger.warn('API', 'Artist profile check failed', { error });
            }
        }

        if (!canCancel) {
            logger.warn('API', 'Access denied', { userId, orderId: id });
            return NextResponse.json({
                success: false,
                error: 'Access denied. You can only cancel your own orders.'
            }, { status: 403 });
        }

        const updated = await orderService.cancelOrder(id);
        logger.info('API', 'Order cancelled successfully', { orderId: id });
        return NextResponse.json({ success: true, message: 'Order cancelled successfully', data: updated });
    } catch (error: any) {
        if (error.message === 'ORDER_ALREADY_PROCESSED') {
            return NextResponse.json({ success: false, error: 'Cannot cancel order that has already been shipped or delivered' }, { status: 400 });
        }
        logger.error('API', 'Failed to cancel order', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to cancel order' }, { status: 500 });
    }
}

// PATCH update order status
export async function PATCH(
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
        const order = await orderService.getOrderById(id);

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Authorization check: User must be artist or admin
        if (user.role !== 'admin') {
            const userId = parseInt(user.userId);
            const artistProfile = await artistService.getArtistByUserId(userId);
            if (!artistProfile || artistProfile.id !== order.artist_id) {
                return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
            }
        }

        const body = await req.json();
        const { status, trackingNumber } = body;

        if (!status) {
            return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
        }

        const updated = await orderService.updateOrderStatus(id, status, trackingNumber);
        return NextResponse.json({ success: true, message: 'Order status updated', data: updated });
    } catch (error: any) {
        logger.error('API', 'Failed to update order status', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
    }
}
