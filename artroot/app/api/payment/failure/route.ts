import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const txnid = formData.get('txnid') as string;
        const status = formData.get('status') as string;
        const orderId = formData.get('udf1') as string;
        const error_Message = formData.get('error_Message') as string;

        // Update payment transaction
        await query(`
            UPDATE payment_transactions
            SET status = 'failed', error_message = $1, updated_at = CURRENT_TIMESTAMP
            WHERE transaction_id = $2
        `, [error_Message || 'Payment failed', txnid]);

        logger.warn('API', 'Payment failed', { txnid, orderId, error: error_Message });

        return NextResponse.redirect(new URL(`/checkout/failure?txnid=${txnid}&error=${encodeURIComponent(error_Message || 'Payment failed')}`, req.url));

    } catch (error: any) {
        logger.error('API', 'Payment failure callback processing failed', { error: error.message });
        return NextResponse.redirect(new URL('/checkout/failure?error=processing_failed', req.url));
    }
}
