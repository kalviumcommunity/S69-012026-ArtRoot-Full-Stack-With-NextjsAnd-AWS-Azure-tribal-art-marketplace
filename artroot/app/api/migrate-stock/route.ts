import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        // Add stock_quantity column to artworks table
        await query(`
            ALTER TABLE artworks 
            ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 1;
        `);

        // Update existing artworks to have stock for testing
        await query(`
            UPDATE artworks 
            SET stock_quantity = 10, is_available = true;
        `);

        logger.info('DATABASE', 'Migration: Added stock_quantity to artworks');

        return NextResponse.json({
            success: true,
            message: 'Migration completed: Added stock_quantity column'
        });
    } catch (error: any) {
        logger.error('DATABASE', 'Migration failed', { error: error.message });
        return NextResponse.json({
            success: false,
            error: 'Migration failed: ' + error.message
        }, { status: 500 });
    }
}
