/**
 * Logger utility for CVMatch AI
 * Automatically filters debug logs in production while keeping errors/warnings
 */

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

/**
 * Centralized logging utility that filters logs based on environment
 * - Debug logs only appear in development
 * - Info/Warn/Error logs appear in all environments
 */
export const logger = {
    /**
     * Debug-level logging (development only)
     * Use for detailed diagnostic information
     */
    debug: (...args: any[]) => {
        if (isDev) {
            console.log('[DEBUG]', ...args);
        }
    },

    /**
     * Info-level logging (all environments)
     * Use for general informational messages
     */
    info: (...args: any[]) => {
        console.log('[INFO]', ...args);
    },

    /**
     * Warning-level logging (all environments)
     * Use for potentially harmful situations
     */
    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args);
    },

    /**
     * Error-level logging (all environments)
     * Use for error events that might still allow the app to continue
     */
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
    },

    /**
     * Success-level logging (development only)
     * Use for successful operations during debugging
     */
    success: (...args: any[]) => {
        if (isDev) {
            console.log('[✓ SUCCESS]', ...args);
        }
    },
};
