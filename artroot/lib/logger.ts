// Centralized logging utility for audit trails

export interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
    category: 'AUTH' | 'RBAC' | 'API' | 'DATABASE' | 'MIGRATION' | 'BREVO' | 'CHAT';
    message: string;
    metadata?: Record<string, any>;
}

class Logger {
    private logs: LogEntry[] = [];

    log(level: LogEntry['level'], category: LogEntry['category'], message: string, metadata?: Record<string, any>) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            category,
            message,
            metadata
        };

        this.logs.push(entry);

        // Console output with color coding (server-side only)
        if (typeof window === 'undefined') {
            const colors = {
                INFO: '\x1b[36m',    // Cyan
                WARN: '\x1b[33m',    // Yellow
                ERROR: '\x1b[31m',   // Red
                SECURITY: '\x1b[35m' // Magenta
            };
            const reset = '\x1b[0m';
            console.log(`${colors[level]}[${level}]${reset} [${category}] ${entry.timestamp} - ${message}`, metadata || '');
        } else {
            console.log(`[${level}] [${category}] ${entry.timestamp} - ${message}`, metadata || '');
        }
    }

    info(category: LogEntry['category'], message: string, metadata?: Record<string, any>) {
        this.log('INFO', category, message, metadata);
    }

    warn(category: LogEntry['category'], message: string, metadata?: Record<string, any>) {
        this.log('WARN', category, message, metadata);
    }

    error(category: LogEntry['category'], message: string, metadata?: Record<string, any>) {
        this.log('ERROR', category, message, metadata);
    }

    security(category: LogEntry['category'], message: string, metadata?: Record<string, any>) {
        this.log('SECURITY', category, message, metadata);
    }

    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    getRecentLogs(count: number = 50): LogEntry[] {
        return this.logs.slice(-count);
    }
}

export const logger = new Logger();
