#!/usr/bin/env node

/**
 * SCRIPT DE VÉRIFICATION DU DESIGN SYSTEM CV CRUSH
 *
 * Ce script scanne tout le code pour détecter les violations du design system:
 * - Couleurs hardcodées (#hex, rgb(), rgba())
 * - Ombres inline (shadow-[...])
 * - Classes Tailwind obsolètes (bg-blue-*, text-blue-*, etc.)
 * - Espacements arbitraires ([...px])
 *
 * Usage:
 *   node scripts/verify-design-system.js
 *   npm run verify:design
 *
 * Exit codes:
 *   0 = Aucune violation trouvée
 *   1 = Violations détectées
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Dossiers à scanner
  directories: ['components', 'app'],

  // Extensions de fichiers à vérifier
  extensions: ['.tsx', '.ts', '.jsx', '.js'],

  // Dossiers à ignorer
  ignoreDirs: ['node_modules', '.next', 'dist', 'build', '.git'],

  // Patterns interdits
  forbiddenPatterns: [
    {
      pattern: /#[0-9a-f]{3,6}/gi,
      message: 'Couleur hexadécimale hardcodée détectée. Utilisez les tokens (ex: text-neon-purple)',
      severity: 'error',
      exceptions: [
        'design-tokens.ts', // Les tokens eux-mêmes
        'tailwind.config.ts', // Config Tailwind
        'globals.css', // Styles globaux
        'themes.ts', // Theme configuration data for CV templates
        'Logo.tsx', // Brand logo with specific neon colors
        'login/page.tsx', // Google Logo (official brand colors)
      ],
    },
    {
      pattern: /rgb\s*\(/gi,
      message: 'Couleur RGB hardcodée détectée. Utilisez les tokens',
      severity: 'error',
      exceptions: ['design-tokens.ts', 'globals.css'],
    },
    {
      pattern: /rgba\s*\(/gi,
      message: 'Couleur RGBA hardcodée détectée. Utilisez les tokens avec opacity',
      severity: 'error',
      exceptions: ['design-tokens.ts', 'globals.css', 'Logo.tsx', 'ContextualLoader.tsx'],
    },
    {
      pattern: /shadow-\[/g,
      message: 'Ombre inline détectée. Utilisez shadow-level-1 à shadow-level-5',
      severity: 'error',
    },
    {
      pattern: /\[(\d+)px\]/g,
      message: 'Espacement arbitraire détecté. Utilisez spacing-*',
      severity: 'warning',
      exceptions: ['Logo.tsx', 'DashboardLayout.tsx'], // Cas spéciaux
    },
    {
      pattern: /(bg|text|border)-blue-[0-9]/g,
      message: 'Classe Tailwind bleue obsolète. Utilisez neon-* ou semantic-*',
      severity: 'warning',
    },
    {
      pattern: /style=\{\{[^}]*color:/gi,
      message: 'Style inline avec couleur détecté. Utilisez className avec tokens',
      severity: 'error',
      exceptions: [
        'CreativeTemplate.tsx', // Inline styles reference COLORS object (design tokens) - required for PDF rendering
        'TechTemplate.tsx', // Inline styles reference COLORS object (design tokens) - required for PDF rendering
      ],
    },
    {
      pattern: /style=\{\{[^}]*boxShadow:/gi,
      message: 'Style inline avec boxShadow détecté. Utilisez shadow-level-*',
      severity: 'error',
      exceptions: [
        'CreativeTemplate.tsx', // Inline boxShadow references COLORS object (design tokens) - required for PDF rendering
      ],
    },
  ],
};

// Statistiques
const stats = {
  filesScanned: 0,
  violations: {
    error: [],
    warning: [],
  },
};

/**
 * Scanner un fichier pour détecter les violations
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);

  CONFIG.forbiddenPatterns.forEach((rule) => {
    // Vérifier si le fichier est dans les exceptions (check both filename and relative path)
    if (rule.exceptions && rule.exceptions.some(exc => fileName.includes(exc) || relativePath.includes(exc))) {
      return;
    }

    const matches = content.matchAll(rule.pattern);

    for (const match of matches) {
      const lineNumber = getLineNumber(content, match.index);
      const lineContent = getLineContent(content, match.index);

      const violation = {
        file: relativePath,
        line: lineNumber,
        column: getColumnNumber(content, match.index),
        match: match[0],
        message: rule.message,
        context: lineContent.trim(),
        severity: rule.severity,
      };

      stats.violations[rule.severity].push(violation);
    }
  });

  stats.filesScanned++;
}

/**
 * Scanner un répertoire récursivement
 */
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    // Ignorer les dossiers exclus
    if (entry.isDirectory()) {
      if (!CONFIG.ignoreDirs.includes(entry.name) && !entry.name.startsWith('.')) {
        scanDirectory(fullPath);
      }
      return;
    }

    // Scanner uniquement les fichiers avec les bonnes extensions
    if (CONFIG.extensions.some(ext => entry.name.endsWith(ext))) {
      scanFile(fullPath);
    }
  });
}

/**
 * Obtenir le numéro de ligne d'un index dans le contenu
 */
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

/**
 * Obtenir le numéro de colonne d'un index dans le contenu
 */
function getColumnNumber(content, index) {
  const lines = content.substring(0, index).split('\n');
  return lines[lines.length - 1].length + 1;
}

/**
 * Obtenir le contenu de la ligne contenant l'index
 */
function getLineContent(content, index) {
  const lines = content.split('\n');
  const lineNumber = getLineNumber(content, index);
  return lines[lineNumber - 1] || '';
}

/**
 * Formater et afficher les résultats
 */
function displayResults() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       VÉRIFICATION DU DESIGN SYSTEM CV CRUSH                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`📁 Fichiers scannés: ${stats.filesScanned}`);
  console.log(`❌ Erreurs: ${stats.violations.error.length}`);
  console.log(`⚠️  Avertissements: ${stats.violations.warning.length}\n`);

  // Afficher les erreurs
  if (stats.violations.error.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ ERREURS (bloquantes)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    stats.violations.error.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.file}:${violation.line}:${violation.column}`);
      console.log(`   └─ ${violation.message}`);
      console.log(`   └─ Trouvé: "${violation.match}"`);
      console.log(`   └─ Contexte: ${violation.context.substring(0, 80)}${violation.context.length > 80 ? '...' : ''}`);
      console.log('');
    });
  }

  // Afficher les avertissements
  if (stats.violations.warning.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  AVERTISSEMENTS (à corriger)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    stats.violations.warning.slice(0, 10).forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.file}:${violation.line}:${violation.column}`);
      console.log(`   └─ ${violation.message}`);
      console.log(`   └─ Trouvé: "${violation.match}"`);
      console.log('');
    });

    if (stats.violations.warning.length > 10) {
      console.log(`   ... et ${stats.violations.warning.length - 10} autres avertissements\n`);
    }
  }

  // Résumé final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (stats.violations.error.length === 0 && stats.violations.warning.length === 0) {
    console.log('✅ SUCCÈS: Aucune violation détectée!');
    console.log('   Le code suit parfaitement le design system.');
  } else if (stats.violations.error.length === 0) {
    console.log('✅ SUCCÈS: Aucune erreur bloquante.');
    console.log(`⚠️  ${stats.violations.warning.length} avertissement(s) à corriger.`);
  } else {
    console.log('❌ ÉCHEC: Des violations bloquantes ont été détectées.');
    console.log('   Corrigez les erreurs avant de continuer.');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Guide de correction
  if (stats.violations.error.length > 0 || stats.violations.warning.length > 0) {
    console.log('📖 GUIDE DE CORRECTION:\n');
    console.log('  Couleurs hardcodées:');
    console.log('    ❌ className="text-[#a855f7]"');
    console.log('    ✅ className="text-neon-purple"\n');
    console.log('  Ombres inline:');
    console.log('    ❌ className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]"');
    console.log('    ✅ className="shadow-level-2"\n');
    console.log('  Styles inline:');
    console.log('    ❌ style={{ color: "#a855f7" }}');
    console.log('    ✅ className="text-neon-purple"\n');
    console.log('  📚 Documentation complète: PLAN-REFACTORISATION-DESIGN-SYSTEM.md\n');
  }
}

/**
 * Fonction principale
 */
function main() {
  console.log('🔍 Démarrage de la vérification du design system...\n');

  // Scanner chaque répertoire configuré
  CONFIG.directories.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`📂 Scan de ${dir}/...`);
      scanDirectory(fullPath);
    } else {
      console.warn(`⚠️  Répertoire introuvable: ${dir}/`);
    }
  });

  // Afficher les résultats
  displayResults();

  // Exit avec le code approprié
  if (stats.violations.error.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Exécuter le script
main();
