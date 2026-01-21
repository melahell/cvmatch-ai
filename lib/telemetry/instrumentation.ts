/**
 * OpenTelemetry SDK Initialization
 *
 * This file should be imported at the very beginning of your application
 * For Next.js, add to: instrumentation.ts at project root (Next.js 13.2+)
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Check if telemetry is enabled
const TELEMETRY_ENABLED = process.env.OTEL_ENABLED === 'true';
const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT || '9464', 10);

let sdk: NodeSDK | null = null;

if (TELEMETRY_ENABLED) {
    // Create resource with service information
    const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'cvmatch-api',
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    });

    // Configure trace exporter (OTLP for Grafana/Jaeger)
    const traceExporter = new OTLPTraceExporter({
        url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
        headers: {},
    });

    // Configure Prometheus metrics exporter
    const prometheusExporter = new PrometheusExporter(
        {
            port: PROMETHEUS_PORT,
            endpoint: '/metrics',
        },
        () => {
            console.log(`📊 Prometheus metrics available at http://localhost:${PROMETHEUS_PORT}/metrics`);
        }
    );

    // Initialize SDK
    sdk = new NodeSDK({
        resource,
        traceExporter,
        metricReader: prometheusExporter,
        instrumentations: [
            getNodeAutoInstrumentations({
                // Customize auto-instrumentation
                '@opentelemetry/instrumentation-http': {
                    ignoreIncomingPaths: ['/health', '/metrics', '/_next/static'],
                },
                '@opentelemetry/instrumentation-fs': {
                    enabled: false, // Disable filesystem instrumentation (too noisy)
                },
            }),
        ],
    });

    sdk.start();
    console.log('🔭 OpenTelemetry SDK initialized');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        try {
            await sdk?.shutdown();
            console.log('🔭 OpenTelemetry SDK shut down successfully');
        } catch (error) {
            console.error('Error shutting down OpenTelemetry SDK', error);
        } finally {
            process.exit(0);
        }
    });
} else {
    console.log('⚠️  OpenTelemetry disabled (set OTEL_ENABLED=true to enable)');
}

export default sdk;
