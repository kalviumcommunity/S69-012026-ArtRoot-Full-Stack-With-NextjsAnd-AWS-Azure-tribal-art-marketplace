import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        // Create payment_transactions table
        await query(`
            CREATE TABLE IF NOT EXISTS payment_transactions (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                transaction_id VARCHAR(255) UNIQUE NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'initiated',
                payment_gateway VARCHAR(50) NOT NULL DEFAULT 'payu',
                payu_payment_id VARCHAR(255),
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create index on transaction_id for faster lookups
        await query(`
            CREATE INDEX IF NOT EXISTS idx_payment_transactions_txn_id 
            ON payment_transactions(transaction_id);
        `);

        // Create index on order_id
        await query(`
            CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id 
            ON payment_transactions(order_id);
        `);

        // Add payment_status column to orders table if it doesn't exist
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='orders' AND column_name='payment_status'
                ) THEN
                    ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
                END IF;
            END $$;
        `);

        logger.info('DATABASE', 'Payment tables migration completed successfully');

        return NextResponse.json({
            success: true,
            message: 'Payment tables created successfully'
        });

    } catch (error: any) {
        logger.error('DATABASE', 'Payment tables migration failed', { error: error.message });
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
