#!/bin/bash
# Script pour nettoyer les console.log en production
# À exécuter : bash scripts/cleanup-console-logs.sh

echo "🧹 Nettoyage des console.log pour production..."

# Compter les occurrences
total=$(grep -r "console\.\(log\|warn\|debug\)" --include="*.ts" --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --exclude="logger.ts" \
  --exclude="error.tsx" \
  --exclude="global-error.tsx" \
  --exclude="ErrorBoundary.tsx" \
  . | wc -l)

echo "📊 Total trouvé : $total occurrences"

# Fichiers à nettoyer (exclure les fichiers de gestion d'erreur)
echo "📝 Fichiers critiques à nettoyer :"
grep -r "console\.\(log\|warn\|debug\)" --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --exclude="logger.ts" \
  --exclude="error.tsx" \
  --exclude="global-error.tsx" \
  --exclude="ErrorBoundary.tsx" \
  components/ app/dashboard/ | cut -d: -f1 | sort | uniq

echo ""
echo "⚠️  IMPORTANT : Ce script liste les fichiers. Le nettoyage manuel est recommandé."
echo "💡 Remplacer par : import { logger } from '@/lib/utils/logger'"
echo "💡 Puis utiliser : logger.debug(...) au lieu de console.log(...)"
