/**
 * SCRIPT DE CALIBRATION DES CONTENT UNITS
 *
 * Ce script génère des PDFs de test avec différentes valeurs unit_to_mm
 * pour calibrer empiriquement la correspondance entre units et millimètres réels.
 *
 * Usage:
 *   node scripts/calibrate-units.js
 *
 * Output:
 *   calibration/test_3.5mm.pdf
 *   calibration/test_3.8mm.pdf
 *   calibration/test_4.0mm.pdf (valeur par défaut actuelle)
 *   calibration/test_4.2mm.pdf
 *   calibration/test_4.5mm.pdf
 *
 * Instructions:
 * 1. Exécuter ce script
 * 2. Mesurer physiquement les hauteurs sur les PDFs générés
 * 3. Ajuster CONTENT_UNITS_REFERENCE avec les valeurs mesurées
 */

import fs from "fs";
import path from "path";
import { generateAdaptiveCV } from "../lib/cv/adaptive-algorithm";
import { getTheme } from "../lib/cv/theme-configs";
import { juniorProfile, seniorProfile } from "../lib/cv/__tests__/fixtures";

// Valeurs à tester
const TEST_VALUES = [3.5, 3.8, 4.0, 4.2, 4.5];

// Contenu standardisé pour mesure précise
const CALIBRATION_PROFILE = {
  ...juniorProfile,
  experiences: [
    // Exactement 1 expérience detailed pour mesure
    {
      ...juniorProfile.experiences[0],
      realisations: [
        { description: "Ligne 1 de réalisation pour test de hauteur", impact_score: 80 },
        { description: "Ligne 2 de réalisation pour test de hauteur", impact_score: 80 },
        { description: "Ligne 3 de réalisation pour test de hauteur", impact_score: 80 },
        { description: "Ligne 4 de réalisation pour test de hauteur", impact_score: 80 },
        { description: "Ligne 5 de réalisation pour test de hauteur", impact_score: 80 }
      ]
    }
  ]
};

async function calibrateUnits() {
  console.log("🔬 Calibration des Content Units\n");

  // Créer dossier output
  const outputDir = path.join(process.cwd(), "calibration");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const unitToMm of TEST_VALUES) {
    console.log(`📏 Test avec unit_to_mm = ${unitToMm}mm...`);

    // Générer CV adapté
    const adaptedContent = generateAdaptiveCV(
      CALIBRATION_PROFILE,
      null,
      "classic",
      {}
    );

    // Créer configuration de thème modifiée
    const theme = getTheme("classic");
    const modifiedTheme = {
      ...theme,
      visual_config: {
        ...theme.visual_config,
        unit_to_mm: unitToMm
      }
    };

    // Générer HTML avec cette config
    const html = generateCalibrationHTML(adaptedContent, modifiedTheme);

    // Sauvegarder HTML pour inspection
    const htmlPath = path.join(outputDir, `test_${unitToMm}mm.html`);
    fs.writeFileSync(htmlPath, html);

    console.log(`   ✅ HTML généré: ${htmlPath}`);

    // TODO: Générer PDF avec Puppeteer (si disponible)
    // const pdfPath = path.join(outputDir, `test_${unitToMm}mm.pdf`);
    // await generatePDF(html, pdfPath);
  }

  // Générer rapport de calibration
  const report = generateCalibrationReport();
  const reportPath = path.join(outputDir, "CALIBRATION_REPORT.md");
  fs.writeFileSync(reportPath, report);

  console.log("\n✅ Calibration terminée!");
  console.log(`📊 Rapport: ${reportPath}`);
  console.log("\n📝 Instructions:");
  console.log("1. Ouvrir les fichiers HTML dans un navigateur");
  console.log("2. Imprimer en PDF (Ctrl+P → Sauvegarder en PDF)");
  console.log("3. Mesurer physiquement les hauteurs avec une règle:");
  console.log("   - Header (devrait être ~48mm avec unit=12 × 4mm)");
  console.log("   - Experience detailed (devrait être ~88mm avec unit=22 × 4mm)");
  console.log("4. Ajuster CONTENT_UNITS_REFERENCE si écarts > 10%");
}

/**
 * Générer HTML de calibration avec mesures visuelles
 */
function generateCalibrationHTML(adaptedContent: any, theme: any): string {
  const { unit_to_mm } = theme.visual_config;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Calibration ${unit_to_mm}mm</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      margin: 0 auto;
      background: white;
      position: relative;
    }

    .calibration-header {
      background: #f0f0f0;
      padding: 10mm;
      margin-bottom: 5mm;
      border: 2px solid #333;
    }

    .calibration-header h1 {
      font-size: 18pt;
      margin-bottom: 5mm;
    }

    .calibration-info {
      font-size: 11pt;
      line-height: 1.6;
    }

    /* Mesures visuelles */
    .measurement-box {
      border: 2px solid red;
      margin: 5mm 0;
      padding: 3mm;
      position: relative;
    }

    .measurement-label {
      position: absolute;
      right: -50mm;
      top: 0;
      width: 45mm;
      background: #ffeb3b;
      padding: 2mm;
      font-size: 9pt;
      font-weight: bold;
    }

    /* Header */
    .cv-header {
      height: calc(${adaptedContent.sections.header.units_used} * ${unit_to_mm}mm);
      border-bottom: 2px solid #3498DB;
      padding-bottom: 3mm;
      margin-bottom: 3mm;
    }

    .cv-header h1 {
      font-size: 24pt;
      margin-bottom: 2mm;
    }

    .cv-header .title {
      font-size: 14pt;
      color: #7F8C8D;
    }

    /* Experience */
    .experience-item {
      height: calc(${adaptedContent.sections.experiences[0].units_used} * ${unit_to_mm}mm);
      margin-bottom: 5mm;
      border: 1px solid #ddd;
      padding: 3mm;
    }

    .experience-item h3 {
      font-size: 12pt;
      margin-bottom: 2mm;
    }

    .experience-item .company-dates {
      font-size: 9pt;
      color: #666;
      margin-bottom: 2mm;
    }

    .experience-item ul {
      list-style: none;
      padding-left: 5mm;
    }

    .experience-item li {
      position: relative;
      margin-bottom: 1.5mm;
      line-height: 1.3;
    }

    .experience-item li::before {
      content: "▸";
      color: #3498DB;
      position: absolute;
      left: -5mm;
      font-weight: bold;
    }

    /* Ruler */
    .ruler {
      position: absolute;
      right: 5mm;
      top: 15mm;
      width: 20mm;
      height: 250mm;
      border-left: 2px solid #000;
    }

    .ruler-mark {
      position: absolute;
      left: -5mm;
      width: 10mm;
      border-top: 1px solid #000;
      font-size: 7pt;
    }

    @media print {
      .page {
        margin: 0;
        page-break-after: always;
      }

      .measurement-label {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Info Calibration -->
    <div class="calibration-header">
      <h1>🔬 CALIBRATION CONTENT UNITS</h1>
      <div class="calibration-info">
        <strong>Valeur testée:</strong> 1 unit = ${unit_to_mm}mm<br>
        <strong>Date:</strong> ${new Date().toISOString()}<br>
        <strong>Instructions:</strong><br>
        1. Imprimer cette page en PDF (Ctrl+P → PDF)<br>
        2. Mesurer physiquement avec une règle<br>
        3. Comparer avec valeurs théoriques ci-dessous
      </div>
    </div>

    <!-- Header Measurement -->
    <div class="measurement-box">
      <div class="measurement-label">
        Header: ${adaptedContent.sections.header.units_used} units<br>
        = ${(adaptedContent.sections.header.units_used * unit_to_mm).toFixed(1)}mm théorique<br>
        <span style="color: red;">Mesurer ici ↓</span>
      </div>
      <div class="cv-header">
        <h1>${adaptedContent.sections.header.content.nom} ${adaptedContent.sections.header.content.prenom}</h1>
        <div class="title">${adaptedContent.sections.header.content.titre}</div>
      </div>
    </div>

    <!-- Experience Measurement -->
    <div class="measurement-box">
      <div class="measurement-label">
        Experience (${adaptedContent.sections.experiences[0].format}): ${adaptedContent.sections.experiences[0].units_used} units<br>
        = ${(adaptedContent.sections.experiences[0].units_used * unit_to_mm).toFixed(1)}mm théorique<br>
        <span style="color: red;">Mesurer ici ↓</span>
      </div>
      <div class="experience-item">
        <h3>${adaptedContent.sections.experiences[0].content.position}</h3>
        <div class="company-dates">
          ${adaptedContent.sections.experiences[0].content.company} | ${adaptedContent.sections.experiences[0].content.dates}
        </div>
        ${adaptedContent.sections.experiences[0].content.context ? `<p>${adaptedContent.sections.experiences[0].content.context}</p>` : ''}
        <ul>
          ${adaptedContent.sections.experiences[0].content.achievements.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- Ruler for reference -->
    <div class="ruler">
      ${Array.from({ length: 25 }, (_, i) => i * 10).map(mm => `
        <div class="ruler-mark" style="top: ${mm}mm;">
          ${mm}mm
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Générer rapport de calibration
 */
function generateCalibrationReport(): string {
  return `# 📏 RAPPORT DE CALIBRATION - CONTENT UNITS

**Date:** ${new Date().toISOString()}

## Objectif

Calibrer empiriquement la correspondance entre **units** (unité abstraite) et **millimètres réels** sur un PDF A4.

## Valeur Actuelle

\`\`\`
1 UNIT = 4.0mm (défaut)
Page A4 = 297mm ≈ 200 UNITS utilisables
\`\`\`

## Valeurs Testées

| unit_to_mm | Header (12 units) | Experience Detailed (22 units) | Total Page (200 units) |
|------------|-------------------|--------------------------------|------------------------|
| 3.5mm      | 42mm              | 77mm                           | 700mm                  |
| 3.8mm      | 45.6mm            | 83.6mm                         | 760mm                  |
| **4.0mm**  | **48mm**          | **88mm**                       | **800mm**              |
| 4.2mm      | 50.4mm            | 92.4mm                         | 840mm                  |
| 4.5mm      | 54mm              | 99mm                           | 900mm                  |

## Instructions de Mesure

1. **Imprimer les PDFs générés**
   - Ouvrir \`test_X.Xmm.html\` dans Chrome/Firefox
   - Ctrl+P → Sauvegarder en PDF
   - **IMPORTANT:** Vérifier "Mise à l'échelle: Aucune" (100%)

2. **Mesurer physiquement**
   - Utiliser une règle millimétrée précise
   - Mesurer la hauteur totale des boxes rouges:
     - Header: Du haut du texte "Nom" au bas de "Titre"
     - Experience: Du haut du "Poste" au bas de la dernière réalisation
   - Noter les mesures dans le tableau ci-dessous

3. **Calculer l'écart**
   \`\`\`
   Écart (%) = ((Mesure réelle - Théorique) / Théorique) × 100
   \`\`\`

4. **Décider de l'ajustement**
   - Si écart < 5% : Valeur OK ✅
   - Si écart 5-10% : Ajustement mineur recommandé ⚠️
   - Si écart > 10% : Ajustement obligatoire ❌

## Tableau de Mesures (À Compléter)

| unit_to_mm | Header Théorique | Header Mesuré | Écart | Experience Théorique | Experience Mesurée | Écart |
|------------|------------------|---------------|-------|----------------------|-------------------|-------|
| 3.5mm      | 42mm             | ___ mm        | _%    | 77mm                 | ___ mm            | _%    |
| 3.8mm      | 45.6mm           | ___ mm        | _%    | 83.6mm               | ___ mm            | _%    |
| **4.0mm**  | **48mm**         | **___ mm**    | **_%**| **88mm**             | **___ mm**        | **_%**|
| 4.2mm      | 50.4mm           | ___ mm        | _%    | 92.4mm               | ___ mm            | _%    |
| 4.5mm      | 54mm             | ___ mm        | _%    | 99mm                 | ___ mm            | _%    |

## Recommandation

Après mesures, choisir la valeur \`unit_to_mm\` ayant le **plus faible écart moyen**.

Exemple:
\`\`\`
Si mesures = 47mm header, 86mm experience pour 4.0mm
→ Écarts: -2.1%, -2.3%
→ Écart moyen: 2.2% ✅ VALEUR OK
\`\`\`

## Ajustement dans le Code

Si besoin d'ajuster, modifier \`lib/cv/content-units-reference.ts\`:

\`\`\`typescript
export const CONTENT_UNIT_CONSTANTS = {
  UNIT_TO_MM_DEFAULT: 4.2,  // ← Nouvelle valeur
  // ...
};
\`\`\`

Et dans \`lib/cv/theme-configs.ts\`, pour chaque thème:

\`\`\`typescript
visual_config: {
  unit_to_mm: 4.2,  // ← Nouvelle valeur
  // ...
}
\`\`\`

## Notes

- Les valeurs peuvent varier légèrement selon:
  - Le navigateur utilisé (Chrome vs Firefox)
  - La police de caractères (font-family)
  - Le line-height et spacing

- Privilégier la précision sur le **header** et les **experiences detailed** car ce sont les éléments les plus visibles.

- Une fois calibré, **relancer les tests** pour vérifier que les CVs générés respectent toujours les contraintes de 1-2 pages.
`;
}

// Exécuter si appelé directement
if (require.main === module) {
  calibrateUnits().catch(console.error);
}

export { calibrateUnits, generateCalibrationHTML, generateCalibrationReport };
