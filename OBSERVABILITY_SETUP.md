# 🔭 Observability Setup Guide (Phase 2 - Optional)

⚠️ **IMPORTANT:** This is OPTIONAL setup for Phase 2 observability features.

**Phase 1 (validation + logging) works without this setup.**

Complete guide to set up monitoring, metrics, and alerting for CVMatch Match Analysis.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Installation](#installation)
5. [Grafana Setup](#grafana-setup)
6. [Alerting Setup](#alerting-setup)
7. [Rate Limiting Setup](#rate-limiting-setup)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Overview

This observability stack provides:

- **Distributed Tracing** with OpenTelemetry
- **Metrics Collection** with Prometheus
- **Visualization** with Grafana
- **Alerting** via Slack/Email
- **Rate Limiting** with Upstash Redis

## Prerequisites

### Required Accounts

1. **Grafana Cloud** (Free tier available)
   - Sign up: https://grafana.com/auth/sign-up/create-user
   - Free tier: 10k metrics, 50GB logs, 50GB traces

2. **Upstash Redis** (Free tier available)
   - Sign up: https://console.upstash.com/
   - Free tier: 10k requests/day, 256MB storage

3. **Slack** (for alerts)
   - Create webhook: https://api.slack.com/messaging/webhooks

## Environment Variables

Add these to your `.env.local` file:

```bash
# OpenTelemetry
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-grafana-instance.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic YOUR_BASE64_ENCODED_CREDENTIALS
PROMETHEUS_PORT=9464

# Rate Limiting
RATE_LIMIT_ENABLED=true
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Node.js Environment
NODE_ENV=production
```

### Getting Grafana Cloud Credentials

1. Go to Grafana Cloud → Settings → OTLP
2. Copy the endpoint URL
3. Generate a token
4. Base64 encode: `echo -n "instance_id:token" | base64`

### Getting Upstash Redis Credentials

1. Create a new Redis database in Upstash Console
2. Go to "REST API" section
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

## Installation

### 1. Install Dependencies

```bash
npm install @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-prometheus \
  @upstash/redis \
  @upstash/ratelimit
```

### 2. Enable Next.js Instrumentation

Ensure `next.config.js` has experimental instrumentation enabled:

```javascript
// next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true, // Required for instrumentation.ts
  },
  // ... other config
};
```

### 3. Restart Development Server

```bash
npm run dev
```

You should see:

```
🔭 OpenTelemetry SDK initialized
📊 Prometheus metrics available at http://localhost:9464/metrics
✅ Rate limiting initialized with Upstash Redis
```

## Grafana Setup

### 1. Import Dashboard

1. Log in to Grafana Cloud
2. Go to Dashboards → Import
3. Upload `dashboards/match-analysis-grafana.json`
4. Select Prometheus data source
5. Click "Import"

### 2. Configure Data Sources

#### Prometheus Data Source

1. Go to Configuration → Data Sources
2. Add Prometheus
3. URL: `http://localhost:9464` (or your Prometheus endpoint)
4. Save & Test

#### OTLP Traces Data Source

1. Go to Configuration → Data Sources
2. Add Tempo (or Jaeger)
3. Configure with Grafana Cloud Tempo endpoint
4. Save & Test

### 3. Verify Metrics

Navigate to your dashboard and verify:

- ✅ "Analyses/Min (Success)" shows data
- ✅ "Error Rate (%)" is visible
- ✅ "Analysis Duration" chart shows traces

## Alerting Setup

### 1. Configure Prometheus Alert Manager

Create `alertmanager.yml`:

```yaml
global:
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

route:
  receiver: 'slack-prod-alerts'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h

receivers:
  - name: 'slack-prod-alerts'
    slack_configs:
      - channel: '#prod-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: |
          {{ range .Alerts }}
          *Alert:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Severity:* {{ .Labels.severity }}
          {{ end }}
        send_resolved: true
```

### 2. Load Alert Rules

Copy `alerts/match-analysis-alerts.yml` to Prometheus config directory:

```bash
# Example Prometheus config
rule_files:
  - 'alerts/match-analysis-alerts.yml'
```

### 3. Create Slack Channel

1. Create `#prod-alerts` channel in Slack
2. Invite relevant team members
3. Test webhook:

```bash
curl -X POST YOUR_SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test alert from CVMatch"}'
```

## Rate Limiting Setup

### 1. Configure User Tiers

Update `lib/rate-limiting/match-analysis-limiter.ts` with your tier definitions:

```typescript
export const RATE_LIMITS = {
    free: { requests: 10, window: '24 h' },
    pro: { requests: 100, window: '24 h' },
    enterprise: { requests: 1000, window: '24 h' },
};
```

### 2. Add to API Route

Update `app/api/match/analyze/route.ts`:

```typescript
import { checkRateLimit } from '@/lib/rate-limiting/match-analysis-limiter';

export async function POST(req: Request) {
    const { userId } = await req.json();

    // Get user tier from database
    const userTier = await getUserTier(userId); // Implement this

    // Check rate limit
    const rateLimitResult = await checkRateLimit(userId, userTier);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Rate limit exceeded',
                limit: rateLimitResult.limit,
                remaining: rateLimitResult.remaining,
                retryAfter: rateLimitResult.retryAfter,
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                    'Retry-After': rateLimitResult.retryAfter?.toString() || '0',
                },
            }
        );
    }

    // Continue with analysis...
}
```

## Testing

### 1. Test OpenTelemetry

```bash
# Check Prometheus metrics endpoint
curl http://localhost:9464/metrics | grep match_analysis

# Expected output:
# match_analysis_total{status="success"} 42
# match_analysis_duration_ms_sum 125000
```

### 2. Test Rate Limiting

```typescript
// test/rate-limiting.test.ts
import { checkRateLimit } from '@/lib/rate-limiting/match-analysis-limiter';

async function testRateLimit() {
    const userId = 'test-user-123';

    // Make 11 requests (free tier limit = 10)
    for (let i = 0; i < 11; i++) {
        const result = await checkRateLimit(userId, 'free');
        console.log(`Request ${i + 1}:`, result);
    }

    // Expected: First 10 succeed, 11th fails with retryAfter
}

testRateLimit();
```

### 3. Test Alerting

Trigger an alert manually:

```bash
# Simulate high error rate
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/match/analyze \
    -H 'Content-Type: application/json' \
    -d '{"invalid": "data"}' # Will cause errors
  sleep 0.1
done

# Check Slack channel for alert
```

## Troubleshooting

### Metrics Not Showing in Grafana

1. Check OpenTelemetry is enabled:
   ```bash
   echo $OTEL_ENABLED  # Should print "true"
   ```

2. Verify Prometheus endpoint:
   ```bash
   curl http://localhost:9464/metrics
   ```

3. Check Grafana data source configuration

### Alerts Not Firing

1. Verify Prometheus is loading alert rules:
   ```bash
   curl http://localhost:9090/api/v1/rules | jq
   ```

2. Check AlertManager logs:
   ```bash
   docker logs alertmanager
   ```

3. Test Slack webhook manually

### Rate Limiting Not Working

1. Check Upstash Redis connection:
   ```bash
   curl https://YOUR_REDIS_INSTANCE.upstash.io \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. Verify environment variables are loaded:
   ```typescript
   console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL);
   ```

3. Check Redis logs in Upstash Console

## Monitoring Costs

### Grafana Cloud (Free Tier)

- **Traces:** 50GB/month
- **Metrics:** 10k active series
- **Logs:** 50GB/month

**Estimated usage (1000 analyses/day):**
- Traces: ~5GB/month ✅
- Metrics: ~100 active series ✅
- Logs: ~2GB/month ✅

**Result:** Free tier sufficient for small-medium traffic

### Upstash Redis (Free Tier)

- **Requests:** 10k/day
- **Storage:** 256MB

**Estimated usage (1000 analyses/day):**
- Requests: ~2000/day (2 per analysis) ✅
- Storage: ~5MB ✅

**Result:** Free tier sufficient

### Upgrade Recommendations

**When to upgrade Grafana Cloud ($49/month):**
- > 5000 analyses/day
- Need longer retention (>14 days)
- Want advanced features (SLOs, on-call)

**When to upgrade Upstash ($10/month):**
- > 5000 rate limit checks/day
- Need higher request throughput
- Want dedicated support

## Next Steps

1. ✅ Set up monitoring (you are here)
2. ⬜ Configure Slack alerts channel
3. ⬜ Define SLOs (Service Level Objectives)
4. ⬜ Create runbooks for common issues
5. ⬜ Train team on dashboard usage
6. ⬜ Set up synthetic monitoring (Pingdom/Checkly)

## Additional Resources

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Grafana Cloud Docs](https://grafana.com/docs/grafana-cloud/)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Prometheus Alert Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
