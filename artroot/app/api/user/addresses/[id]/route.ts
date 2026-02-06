import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware-utils';
import { query } from '@/lib/db';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership and delete
        const result = await query(
            'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, user.userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Address not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('Error deleting address:', error);
        return NextResponse.json(
            { error: 'Failed to delete address' },
            { status: 500 }
        );
    }
}
