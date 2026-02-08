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
            SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
                   a.id as artist_id, a.is_verified, a.tribe, a.biography, a.location
            FROM users u
            LEFT JOIN artists a ON u.id = a.user_id
            ORDER BY u.created_at DESC
        `);

        return NextResponse.json({ success: true, data: result.rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Toggle verify/active status
export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { targetUserId, action, value } = body;
        // action: 'verify_artist' | 'toggle_active'

        if (action === 'verify_artist') {
            await query('UPDATE artists SET is_verified = $1 WHERE user_id = $2', [value, targetUserId]);
        } else if (action === 'toggle_active') {
            await query('UPDATE users SET is_active = $1 WHERE id = $2', [value, targetUserId]);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
