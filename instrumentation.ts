/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js 13.2+ before the app starts
 *
 * Phase 2 OpenTelemetry instrumentation has been removed to avoid build errors
 * with missing npm packages. To enable full observability, install OpenTelemetry
 * packages first (see PHASE_2_IMPORTANT_README.md).
 *
 * Phase 1 (validation + logging) works without this.
 */

export async function register() {
    // Intentionally empty - Phase 2 instrumentation disabled
    // Phase 1 features (validation, logging) work without this
    console.log('✅ CVMatch instrumentation hook loaded (Phase 1 only)');
}
