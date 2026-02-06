import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PAYU_CONFIG } from '@/lib/payu-config';
import { logger } from '@/lib/logger';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Extract PayU response parameters
        const txnid = formData.get('txnid') as string;
        const amount = formData.get('amount') as string;
        const productinfo = formData.get('productinfo') as string;
        const firstname = formData.get('firstname') as string;
        const email = formData.get('email') as string;
        const status = formData.get('status') as string;
        const payuMoneyId = formData.get('mihpayid') as string;
        const hash = formData.get('hash') as string;
        const orderId = formData.get('udf1') as string;
        const userId = formData.get('udf2') as string;

        // Verify hash
        const reverseHashString = `${PAYU_CONFIG.MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_CONFIG.MERCHANT_KEY}`;
        const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

        if (calculatedHash !== hash) {
            logger.error('API', 'Hash verification failed', { txnid });
            return NextResponse.redirect(new URL(`/checkout/failure?error=invalid_hash`, req.url));
        }

        // Update payment transaction
        await query(`
            UPDATE payment_transactions
            SET status = $1, payu_payment_id = $2, updated_at = CURRENT_TIMESTAMP
            WHERE transaction_id = $3
        `, [status.toLowerCase(), payuMoneyId, txnid]);

        if (status === 'success') {
            // Update order status to confirmed
            await query(`
                UPDATE orders
                SET status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [parseInt(orderId)]);

            logger.info('API', 'Payment successful', { txnid, orderId, amount });

            // Redirect to success page
            return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}&txnid=${txnid}`, req.url));
        } else {
            logger.warn('API', 'Payment not successful', { txnid, status });
            return NextResponse.redirect(new URL(`/checkout/failure?txnid=${txnid}&status=${status}`, req.url));
        }

    } catch (error: any) {
        logger.error('API', 'Payment callback processing failed', { error: error.message });
        return NextResponse.redirect(new URL('/checkout/failure?error=processing_failed', req.url));
    }
}
