import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PAYU_CONFIG } from '@/lib/payu-config';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, amount, productInfo, firstName, email, phone } = body;

        if (!orderId || !amount || !productInfo || !firstName || !email || !phone) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Generate transaction ID
        const txnid = `TXN${Date.now()}${Math.random().toString(36).substring(7)}`;

        // Defined UDFs
        const udf1 = orderId.toString();
        const udf2 = user.userId.toString();

        // Create hash for PayU
        // Hash format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
        // Note: udf1-udf5 are specific, udf6-udf10 are empty in this implementation
        const hashString = `${PAYU_CONFIG.MERCHANT_KEY}|${txnid}|${amount}|${productInfo}|${firstName}|${email}|${udf1}|${udf2}|||||||||${PAYU_CONFIG.MERCHANT_SALT}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        // Store payment initiation in database
        await query(`
            INSERT INTO payment_transactions (
                order_id, transaction_id, user_id, amount, status, payment_gateway, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        `, [orderId, txnid, parseInt(user.userId), amount, 'initiated', 'payu']);

        // Prepare PayU payment parameters
        const paymentParams = {
            key: PAYU_CONFIG.MERCHANT_KEY,
            txnid: txnid,
            amount: amount.toString(),
            productinfo: productInfo,
            firstname: firstName,
            email: email,
            phone: phone,
            surl: PAYU_CONFIG.SUCCESS_URL,
            furl: PAYU_CONFIG.FAILURE_URL,
            curl: PAYU_CONFIG.CANCEL_URL,
            hash: hash,
            udf1: udf1, // Store order ID in UDF1 for reference
            udf2: udf2,
            udf3: '',
            udf4: '',
            udf5: '',
        };

        logger.info('API', 'Payment initiated', {
            txnid,
            orderId,
            amount,
            env: PAYU_CONFIG.ENVIRONMENT,
            url: PAYU_CONFIG.PAYMENT_URL
        });

        return NextResponse.json({
            success: true,
            data: {
                paymentUrl: PAYU_CONFIG.PAYMENT_URL,
                paymentParams,
                txnid
            }
        });

    } catch (error: any) {
        logger.error('API', 'Payment initiation failed', { error: error.message });
        return NextResponse.json({
            success: false,
            error: 'Failed to initiate payment'
        }, { status: 500 });
    }
}
