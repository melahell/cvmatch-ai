#!/bin/bash
# Tests automatisés pour validation staging
# Usage: bash scripts/test-staging.sh https://staging.cvcrush.fr

STAGING_URL=${1:-"http://localhost:3000"}

echo "🧪 Lancement des tests staging sur: $STAGING_URL"
echo "=================================================="

# Test 1: Sitemap accessible
echo ""
echo "✅ Test 1: Sitemap XML"
curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL/sitemap.xml" | grep -q "200" && echo "✓ sitemap.xml accessible" || echo "✗ sitemap.xml inaccessible"

# Test 2: Robots accessible
echo ""
echo "✅ Test 2: Robots.txt"
curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL/robots.txt" | grep -q "200" && echo "✓ robots.txt accessible" || echo "✗ robots.txt inaccessible"

# Test 3: Headers sécurité
echo ""
echo "✅ Test 3: Headers de sécurité"
curl -s -I "$STAGING_URL" > /tmp/headers.txt
grep -q "x-frame-options" /tmp/headers.txt && echo "✓ X-Frame-Options présent" || echo "✗ X-Frame-Options manquant"
grep -q "x-content-type-options" /tmp/headers.txt && echo "✓ X-Content-Type-Options présent" || echo "✗ X-Content-Type-Options manquant"
grep -q "referrer-policy" /tmp/headers.txt && echo "✓ Referrer-Policy présent" || echo "✗ Referrer-Policy manquant"

# Test 4: JSON-LD présent
echo ""
echo "✅ Test 4: JSON-LD Structured Data"
curl -s "$STAGING_URL" | grep -q "application/ld+json" && echo "✓ JSON-LD présent" || echo "✗ JSON-LD manquant"

# Test 5: Metadata Open Graph
echo ""
echo "✅ Test 5: Open Graph Metadata"
curl -s "$STAGING_URL" | grep -q "og:title" && echo "✓ og:title présent" || echo "✗ og:title manquant"
curl -s "$STAGING_URL" | grep -q "og:description" && echo "✓ og:description présent" || echo "✗ og:description manquant"

# Test 6: Skip link présent
echo ""
echo "✅ Test 6: Skip Link"
curl -s "$STAGING_URL/dashboard" 2>/dev/null | grep -q "Aller au contenu principal" && echo "✓ Skip link présent" || echo "✗ Skip link manquant (vérifier manuellement)"

echo ""
echo "=================================================="
echo "✅ Tests automatisés terminés"
echo ""
echo "⚠️  Tests manuels requis:"
echo "  - Navigation clavier (Tab)"
echo "  - Zoom mobile (pinch-to-zoom)"
echo "  - Lighthouse (>90)"
echo "  - Upload photo"
echo ""
echo "📖 Guide complet: PR_ET_TESTS.md"
