const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

async function initChat() {
    try {
        console.log('Initializing Chat Tables...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                last_message TEXT,
                last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
                sender_id INTEGER NOT NULL REFERENCES users(id),
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Chat tables created successfully.');
    } catch (err) {
        console.error('Error initializing chat tables:', err);
    } finally {
        await pool.end();
    }
}

initChat();
