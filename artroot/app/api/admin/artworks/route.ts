import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware-utils';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const result = await query(`
            SELECT 
                art.*,
                u.name as artist_name,
                a.tribe
            FROM artworks art
            JOIN artists a ON art.artist_id = a.id
            JOIN users u ON a.user_id = u.id
            ORDER BY art.created_at DESC
        `);

        return NextResponse.json({ success: true, data: result.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { artworkId, isVerified } = body;

        await query('UPDATE artworks SET is_verified = $1, verification_date = CURRENT_TIMESTAMP WHERE id = $2', [isVerified, artworkId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
