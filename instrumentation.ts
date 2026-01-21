/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js 13.2+ before the app starts
 * Perfect for initializing OpenTelemetry SDK
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Only initialize in Node.js runtime (not Edge)
        await import('./lib/telemetry/instrumentation');
    }
}
