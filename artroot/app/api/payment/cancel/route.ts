import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { query } from '@/lib/db';
import { cancelOrder } from '@/lib/services/orderService';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const txnid = formData.get('txnid') as string;
        const orderId = formData.get('udf1') as string;

        // Update payment transaction
        await query(`
            UPDATE payment_transactions
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE transaction_id = $1
        `, [txnid]);

        // Restock inventory and cancel order
        if (orderId) {
            try {
                await cancelOrder(parseInt(orderId));
                logger.info('API', 'Order restocked after payment cancellation', { orderId, txnid });
            } catch (err: any) {
                logger.error('API', 'Failed to restock order after cancellation', { orderId, error: err.message });
            }
        }

        logger.info('API', 'Payment cancelled by user', { txnid, orderId });

        return NextResponse.redirect(new URL(`/checkout?cancelled=true`, req.url));

    } catch (error: any) {
        logger.error('API', 'Payment cancel callback processing failed', { error: error.message });
        return NextResponse.redirect(new URL('/checkout?error=processing_failed', req.url));
    }
}
