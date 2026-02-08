import { query } from '../db';
import { logger } from '../logger';

export interface ChatMessage {
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_name?: string;
    message: string;
    is_read: boolean;
    created_at: Date;
}

export interface Conversation {
    id: number;
    user_id: number;
    user_name?: string;
    admin_id?: number;
    last_message: string;
    last_message_at: Date;
    status: 'open' | 'closed';
    created_at: Date;
    updated_at: Date;
    unread_count?: number;
}

// Ensure a conversation exists for a user
export async function getOrCreateConversation(userId: number) {
    try {
        // Find existing
        const existing = await query<Conversation>(
            'SELECT * FROM chat_conversations WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length > 0) {
            return existing.rows[0];
        }

        // Create new
        const result = await query<Conversation>(
            'INSERT INTO chat_conversations (user_id) VALUES ($1) RETURNING *',
            [userId]
        );

        return result.rows[0];
    } catch (error: any) {
        logger.error('CHAT', 'Failed to get/create conversation', { userId, error: error.message });
        throw error;
    }
}

// Send a message
export async function sendMessage(conversationId: number, senderId: number, message: string) {
    try {
        const result = await query<ChatMessage>(
            'INSERT INTO chat_messages (conversation_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *',
            [conversationId, senderId, message]
        );

        // Update conversation last message
        await query(
            'UPDATE chat_conversations SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [message, conversationId]
        );

        return result.rows[0];
    } catch (error: any) {
        logger.error('CHAT', 'Failed to send message', { conversationId, senderId, error: error.message });
        throw error;
    }
}

// Get messages for a conversation
export async function getMessages(conversationId: number, limit: number = 50) {
    try {
        const result = await query<ChatMessage>(`
            SELECT m.*, u.name as sender_name
            FROM chat_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = $1
            ORDER BY m.created_at ASC
            LIMIT $2
        `, [conversationId, limit]);

        return result.rows;
    } catch (error: any) {
        logger.error('CHAT', 'Failed to fetch messages', { conversationId, error: error.message });
        throw error;
    }
}

// Get all conversations (for admin)
export async function getConversations() {
    try {
        const result = await query<Conversation>(`
            SELECT c.*, u.name as user_name,
                   (SELECT COUNT(*) FROM chat_messages m WHERE m.conversation_id = c.id AND m.is_read = false AND m.sender_id != c.admin_id) as unread_count
            FROM chat_conversations c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.last_message_at DESC
        `);

        return result.rows;
    } catch (error: any) {
        logger.error('CHAT', 'Failed to fetch conversations', { error: error.message });
        throw error;
    }
}

// Mark messages as read
export async function markAsRead(conversationId: number, userId: number) {
    try {
        await query(
            'UPDATE chat_messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false',
            [conversationId, userId]
        );
    } catch (error: any) {
        logger.error('CHAT', 'Failed to mark messages as read', { conversationId, userId, error: error.message });
        throw error;
    }
}
