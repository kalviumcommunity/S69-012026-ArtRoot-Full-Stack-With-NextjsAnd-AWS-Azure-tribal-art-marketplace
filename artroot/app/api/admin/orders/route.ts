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
                o.id, o.order_number, o.created_at, o.status, o.total_price,
                u.name as buyer_name, u.email as buyer_email,
                art.title as artwork_title, art.image_url,
                a.user_id as artist_user_id,
                au.name as artist_name
            FROM orders o
            JOIN users u ON o.buyer_id = u.id
            JOIN artworks art ON o.artwork_id = art.id
            JOIN artists a ON o.artist_id = a.id
            JOIN users au ON a.user_id = au.id
            ORDER BY o.created_at DESC
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
        const { orderId, status } = body;

        // valid statuses: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
        await query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
