import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/services/userService';
import { getAuthUser } from '@/lib/middleware-utils';
import { logger } from '@/lib/logger';

// GET user account info
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userData = await getUserById(parseInt(user.userId));
        if (!userData) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Remove sensitive info
        const { password_hash, ...safeUser } = userData as any;

        return NextResponse.json({ success: true, data: safeUser });
    } catch (error: any) {
        logger.error('API', 'Failed to fetch account info', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to fetch account info' }, { status: 500 });
    }
}

// PUT update account info
export async function PUT(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const updated = await updateUser(parseInt(user.userId), body);

        return NextResponse.json({ success: true, message: 'Account updated successfully', data: updated });
    } catch (error: any) {
        logger.error('API', 'Failed to update account', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to update account' }, { status: 500 });
    }
}

// DELETE delete account
export async function DELETE(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await deleteUser(parseInt(user.userId));

        logger.info('AUTH', 'User deleted account', { userId: user.userId });

        return NextResponse.json({ success: true, message: 'Account deleted successfully' });
    } catch (error: any) {
        logger.error('API', 'Failed to delete account', { error: error.message });
        return NextResponse.json({ success: false, error: 'Failed to delete account' }, { status: 500 });
    }
}
