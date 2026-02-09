import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Create chat_conversations table
        await query(`
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                admin_id INTEGER REFERENCES users(id),
                last_message TEXT,
                last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create chat_messages table
        await query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
                sender_id INTEGER REFERENCES users(id),
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        return NextResponse.json({ success: true, message: 'Chat tables created or already exist' });
    } catch (error: any) {
        console.error('Migration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
