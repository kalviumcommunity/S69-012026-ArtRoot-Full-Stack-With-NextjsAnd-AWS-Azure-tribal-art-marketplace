import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        await query('SELECT 1');
        return NextResponse.json({
            status: 'healthy',
            message: 'ArtRoot Next.js API and database are connected'
        });
    } catch (error: any) {
        logger.error('API', 'Health check failed', { error: error.message });
        return NextResponse.json({
            status: 'unhealthy',
            message: 'Database connection failed'
        }, { status: 503 });
    }
}
