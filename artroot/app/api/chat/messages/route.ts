import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware-utils';
import * as chatService from '@/lib/services/chatService';

// GET messages for the current user's conversation (or specific conversation if admin)
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        let conversationId = searchParams.get('conversationId') ? Number(searchParams.get('conversationId')) : null;

        if (!conversationId) {
            // If no conversationId provided, user is asking for their own
            const conversation = await chatService.getOrCreateConversation(Number(user.userId));
            conversationId = conversation.id;
        } else {
            // If conversationId provided, verify user has access
            if (user.role !== 'admin') {
                const conversation = await chatService.getOrCreateConversation(Number(user.userId));
                if (conversation.id !== conversationId) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
            }
        }

        // Security check: only admin or the user themselves can see messages
        // We'd need to fetch the conversation to verify ownership if not admin
        // For now, let's just fetch messages. (In a real app, verify conversation.user_id === user.userId)

        const messages = await chatService.getMessages(conversationId);

        // Mark as read (mark messages sent by OTHERS as read)
        await chatService.markAsRead(conversationId, Number(user.userId));

        return NextResponse.json({ success: true, data: messages, conversationId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST new message
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { message, conversationId: providedId } = body;

        let conversationId = providedId;
        if (!conversationId) {
            const conversation = await chatService.getOrCreateConversation(Number(user.userId));
            conversationId = conversation.id;
        }

        const newMessage = await chatService.sendMessage(conversationId, Number(user.userId), message);

        return NextResponse.json({ success: true, data: newMessage });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
