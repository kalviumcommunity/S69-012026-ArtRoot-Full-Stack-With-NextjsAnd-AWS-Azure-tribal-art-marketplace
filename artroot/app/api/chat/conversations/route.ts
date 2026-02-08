import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware-utils';
import * as chatService from '@/lib/services/chatService';

// GET all conversations (Admin only)
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const conversations = await chatService.getConversations();
        return NextResponse.json({ success: true, data: conversations });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
