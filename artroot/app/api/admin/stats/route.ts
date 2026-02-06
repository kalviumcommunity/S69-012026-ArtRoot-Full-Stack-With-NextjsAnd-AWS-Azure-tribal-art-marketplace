import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware-utils';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        // Parallelize queries for dashboard stats
        const [usersRes, artistsRes, artworksRes, ordersRes, revenueRes] = await Promise.all([
            query('SELECT count(*) FROM users'),
            query('SELECT count(*) FROM artists'),
            query('SELECT count(*) FROM artworks'),
            query('SELECT count(*) FROM orders'),
            query('SELECT SUM(total_price) as total FROM orders WHERE status = $1', ['delivered'])
        ]);

        const stats = {
            totalUsers: parseInt(usersRes.rows[0].count),
            totalArtists: parseInt(artistsRes.rows[0].count),
            totalArtworks: parseInt(artworksRes.rows[0].count),
            totalOrders: parseInt(ordersRes.rows[0].count),
            totalRevenue: parseFloat(revenueRes.rows[0].total || '0')
        };

        return NextResponse.json({ success: true, data: stats });
    } catch (error: any) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
