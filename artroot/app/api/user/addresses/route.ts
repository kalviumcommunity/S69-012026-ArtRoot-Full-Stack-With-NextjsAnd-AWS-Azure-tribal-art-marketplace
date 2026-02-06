import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware-utils';
import pool, { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await query(
            'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [user.userId]
        );

        return NextResponse.json({ data: result.rows });
    } catch (error: any) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch addresses' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, address_line, city, state, pincode, phone, is_default } = body;

        // Validation
        if (!name || !address_line || !city || !pincode || !phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // If initializing as default, unset other defaults
            if (is_default) {
                await client.query(
                    'UPDATE addresses SET is_default = FALSE WHERE user_id = $1',
                    [user.userId]
                );
            }

            // Check if this is the first address
            const countRes = await client.query(
                'SELECT count(*) FROM addresses WHERE user_id = $1',
                [user.userId]
            );
            const isFirst = parseInt(countRes.rows[0].count) === 0;
            const finalDefault = is_default || isFirst;

            const insertQuery = `
                INSERT INTO addresses (user_id, name, address_line, city, state, pincode, phone, is_default)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const res = await client.query(insertQuery, [
                user.userId,
                name,
                address_line,
                city,
                state,
                pincode,
                phone,
                finalDefault
            ]);

            await client.query('COMMIT');
            return NextResponse.json({ data: res.rows[0] }, { status: 201 });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error saving address:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save address' },
            { status: 500 }
        );
    }
}
