#!/bin/bash
# Script pour fixer les problèmes de contraste de couleurs WCAG AA
# Remplace text-slate-400 et text-slate-500 par text-slate-600 (meilleur contraste)

echo "🎨 Correction des contrastes de couleurs pour WCAG AA..."

# Compteurs
count_400=0
count_500=0

# Remplacer text-slate-400 par text-slate-600
echo "📝 Remplacement de text-slate-400 par text-slate-600..."
files_400=$(grep -rl "text-slate-400" app/ components/ 2>/dev/null || true)
if [ -n "$files_400" ]; then
  for file in $files_400; do
    sed -i 's/text-slate-400/text-slate-600/g' "$file"
    count_400=$((count_400 + 1))
    echo "  ✓ $file"
  done
  echo "  Total: $count_400 fichiers modifiés"
else
  echo "  Aucun fichier trouvé avec text-slate-400"
fi

echo ""

# Remplacer text-slate-500 par text-slate-600 (plus sûr pour le contraste)
echo "📝 Remplacement de text-slate-500 par text-slate-600..."
files_500=$(grep -rl "text-slate-500" app/ components/ 2>/dev/null || true)
if [ -n "$files_500" ]; then
  for file in $files_500; do
    sed -i 's/text-slate-500/text-slate-600/g' "$file"
    count_500=$((count_500 + 1))
    echo "  ✓ $file"
  done
  echo "  Total: $count_500 fichiers modifiés"
else
  echo "  Aucun fichier trouvé avec text-slate-500"
fi

echo ""
echo "✅ Correction terminée !"
echo "📊 Statistiques:"
echo "   - Fichiers text-slate-400 modifiés: $count_400"
echo "   - Fichiers text-slate-500 modifiés: $count_500"
echo ""
echo "⚠️  Veuillez vérifier visuellement que les contrastes sont corrects."
echo "🔍 Utilisez l'extension axe DevTools pour valider WCAG AA."
