import { Pool, QueryResult, QueryResultRow } from 'pg';
import { logger } from './logger';

declare global {
    var pgPool: Pool | undefined;
}

const pool = global.pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 10000,
    ssl: {
        rejectUnauthorized: false,
    }
});

if (process.env.NODE_ENV !== 'production') {
    global.pgPool = pool;
}

pool.on('error', (err: Error) => {
    logger.error('DATABASE', 'Unexpected error on idle client', { error: err.message });
});

// Generic query function
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
        const result = await pool.query<T>(text, params);
        const duration = Date.now() - start;

        if (duration > 1000) {
            logger.warn('DATABASE', `Slow query detected (${duration}ms)`, { query: text.substring(0, 100) });
        }

        return result;
    } catch (error: any) {
        logger.error('DATABASE', 'Query error', {
            error: error.message,
            query: text.substring(0, 100),
            params
        });
        throw error;
    }
}

// Transaction support
export async function transaction(callback: (client: any) => Promise<void>) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await callback(client);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export default pool;
