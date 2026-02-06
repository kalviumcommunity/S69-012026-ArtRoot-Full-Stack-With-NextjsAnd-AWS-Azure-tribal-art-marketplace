import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { query } from '@/lib/db';

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

        logger.info('API', 'Payment cancelled by user', { txnid, orderId });

        return NextResponse.redirect(new URL(`/checkout?cancelled=true`, req.url));

    } catch (error: any) {
        logger.error('API', 'Payment cancel callback processing failed', { error: error.message });
        return NextResponse.redirect(new URL('/checkout?error=processing_failed', req.url));
    }
}
