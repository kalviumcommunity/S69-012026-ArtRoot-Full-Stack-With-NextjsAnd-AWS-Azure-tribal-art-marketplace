import { NextRequest, NextResponse } from 'next/server';
import * as orderService from '@/lib/services/orderService';
import * as artistService from '@/lib/services/artistService';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

// GET specific order
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const id = Number((await params).id);
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
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const id = Number((await params).id);
        const order = await orderService.getOrderById(id);

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Authorization check: User must be buyer, artist, or admin
        let canCancel = false;
        const userId = parseInt(user.userId);

        console.log(`[DEBUG] Cancel attempt - UserID: ${userId}, Role: ${user.role}, OrderID: ${id}`);
        console.log(`[DEBUG] Order details - BuyerID: ${order.buyer_id}, ArtistID: ${order.artist_id}`);

        if (user.role === 'admin') {
            canCancel = true;
        } else {
            if (order.buyer_id == userId) {
                console.log('[DEBUG] Match found: User is the buyer');
                canCancel = true;
            } else {
                const artistProfile = await artistService.getArtistByUserId(userId);
                console.log(`[DEBUG] Artist profile check - Found ID: ${artistProfile?.id}`);
                if (artistProfile && artistProfile.id == order.artist_id) {
                    console.log('[DEBUG] Match found: User is the artist');
                    canCancel = true;
                }
            }
        }

        if (!canCancel) {
            console.log('[DEBUG] Access denied: No match found');
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        const updated = await orderService.cancelOrder(id);
        return NextResponse.json({ success: true, message: 'Order cancelled successfully', data: updated });
    } catch (error: any) {
        if (error.message === 'ORDER_ALREADY_PROCESSED') {
            return NextResponse.json({ success: false, error: 'Cannot cancel order that has already been shipped or delivered' }, { status: 400 });
        }
        logger.error('API', 'Failed to cancel order', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to cancel order' }, { status: 500 });
    }
}
