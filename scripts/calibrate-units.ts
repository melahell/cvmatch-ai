/**
 * Script de Calibration des Units CV
 * 
 * Ce script génère des CVs de test avec différents profils
 * pour valider que le système de units fonctionne correctement
 * et que les CVs tiennent sur une page A4.
 * 
 * Usage:
 *   npx tsx scripts/calibrate-units.ts
 */

import { CV_THEMES, CVThemeId } from "../lib/cv/theme-configs.js";
import { CONTENT_UNITS_REFERENCE } from "../lib/cv/content-units-reference.js";
import { adaptCVToThemeUnits } from "../lib/cv/adaptive-algorithm.js";

// Mock profiles pour les tests
const MOCK_PROFILES = {
    junior: {
        profil: {
            prenom: "Alice",
            nom: "Martin",
            titre_principal: "Développeuse Full-Stack Junior",
            email: "alice.martin@email.com",
            telephone: "06 12 34 56 78",
            localisation: "Paris, France",
            elevator_pitch: "Jeune développeuse passionnée avec 2 ans d'expérience en React et Node.js. Forte capacité d'apprentissage et esprit d'équipe."
        },
        experiences: [
            {
                poste: "Développeuse Full-Stack",
                entreprise: "Startup Tech",
                date_debut: "2023-01",
                date_fin: "present",
                lieu: "Paris",
                realisations: [
                    "Développement d'une API REST avec Node.js et Express",
                    "Création d'interfaces utilisateur avec React et TypeScript",
                    "Tests unitaires avec Jest et Cypress"
                ]
            },
            {
                poste: "Stagiaire Développeuse",
                entreprise: "Agence Web",
                date_debut: "2022-06",
                date_fin: "2022-12",
                lieu: "Lyon",
                realisations: [
                    "Intégration de maquettes Figma en HTML/CSS",
                    "Création de sites WordPress"
                ]
            }
        ],
        competences: {
            techniques: ["JavaScript", "TypeScript", "React", "Node.js", "HTML/CSS", "Git"],
            soft_skills: ["Travail d'équipe", "Curiosité", "Rigueur"]
        },
        formations: [
            {
                diplome: "Master Informatique",
                etablissement: "Université Paris-Saclay",
                annee: "2022"
            }
        ],
        langues: [
            { langue: "Français", niveau: "Natif" },
            { langue: "Anglais", niveau: "Courant (B2)" }
        ]
    },

    senior: {
        profil: {
            prenom: "Jean-Pierre",
            nom: "Dubois",
            titre_principal: "Directeur de Projet IT / PMO Senior",
            email: "jp.dubois@email.com",
            telephone: "06 98 76 54 32",
            localisation: "Paris, France",
            linkedin: "linkedin.com/in/jpdubois",
            elevator_pitch: "Executive IT avec 20+ ans d'expérience dans le pilotage de transformations digitales. Expertise reconnue en gestion de programmes complexes (budgets >10M€), management d'équipes pluridisciplinaires et relation C-level. Track record solide de succès dans les secteurs bancaire, assurance et retail."
        },
        experiences: [
            {
                poste: "Directeur PMO",
                entreprise: "Grande Banque SA",
                date_debut: "2020-01",
                date_fin: "present",
                lieu: "Paris",
                realisations: [
                    "Direction d'un portefeuille de 25 projets IT (budget total 45M€)",
                    "Management d'une équipe de 15 chefs de projet",
                    "Mise en place d'un référentiel méthodologique Agile/SAFe",
                    "Réduction de 30% des délais de delivery",
                    "Pilotage direct du programme de migration Cloud (12M€)"
                ]
            },
            {
                poste: "Senior Program Manager",
                entreprise: "Assurance Internationale",
                date_debut: "2016-03",
                date_fin: "2019-12",
                lieu: "Paris",
                realisations: [
                    "Pilotage du programme de refonte SI cœur métier",
                    "Coordination de 8 workstreams et 60 contributeurs",
                    "Négociation et suivi des contrats éditeurs (5M€/an)",
                    "Mise en conformité RGPD du SI"
                ]
            },
            {
                poste: "Chef de Projet Senior",
                entreprise: "Cabinet de Conseil",
                date_debut: "2012-01",
                date_fin: "2016-02",
                lieu: "Paris",
                realisations: [
                    "Missions de conseil en transformation digitale",
                    "Accompagnement de DAF et DSI dans leurs projets stratégiques",
                    "Développement commercial du practice Finance"
                ]
            },
            {
                poste: "Chef de Projet",
                entreprise: "SSII Nationale",
                date_debut: "2008-06",
                date_fin: "2011-12",
                lieu: "Lyon",
                realisations: [
                    "Projets ERP/CRM pour le secteur retail",
                    "Encadrement d'équipes de 5-10 développeurs"
                ]
            },
            {
                poste: "Ingénieur Développement",
                entreprise: "Startup E-commerce",
                date_debut: "2005-01",
                date_fin: "2008-05",
                lieu: "Lyon",
                realisations: [
                    "Développement Java/J2EE",
                    "Architecture applicative"
                ]
            },
            {
                poste: "Développeur Junior",
                entreprise: "ESN Régionale",
                date_debut: "2003-09",
                date_fin: "2004-12",
                lieu: "Grenoble",
                realisations: [
                    "Développement d'applications métier"
                ]
            }
        ],
        competences: {
            techniques: [
                "Gestion de Programme", "PMO", "Agile/SAFe", "Prince2", "MS Project",
                "Jira", "Confluence", "Power BI", "Excel avancé", "Cloud AWS/Azure",
                "Architecture SI", "ITIL"
            ],
            soft_skills: [
                "Leadership", "Communication C-level", "Négociation",
                "Gestion du changement", "Vision stratégique", "Résolution de conflits"
            ]
        },
        formations: [
            {
                diplome: "MBA Executive",
                etablissement: "HEC Paris",
                annee: "2015"
            },
            {
                diplome: "Diplôme d'Ingénieur",
                etablissement: "INSA Lyon",
                annee: "2003"
            }
        ],
        certifications: ["PMP", "SAFe Agilist", "PRINCE2 Practitioner", "ITIL v4"],
        langues: [
            { langue: "Français", niveau: "Natif" },
            { langue: "Anglais", niveau: "Courant (C1)" },
            { langue: "Allemand", niveau: "Intermédiaire (B1)" }
        ]
    }
};

// Fonction principale de calibration
function runCalibration() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("           CALIBRATION DU SYSTÈME DE UNITS CV              ");
    console.log("═══════════════════════════════════════════════════════════\n");

    const themes: CVThemeId[] = ["modern", "classic", "tech", "creative", "compact_ats"];
    const profiles = ["junior", "senior"] as const;

    // Afficher les références des units
    console.log("📏 RÉFÉRENCE DES UNITS :");
    console.log("   1 UNIT ≈ 4mm sur A4");
    console.log("   Page A4 = 200 UNITS maximum\n");
    console.log("   Hauteurs de référence :");
    console.log(`   - experience_detailed: ${CONTENT_UNITS_REFERENCE.experience_detailed.height_units} units`);
    console.log(`   - experience_standard: ${CONTENT_UNITS_REFERENCE.experience_standard.height_units} units`);
    console.log(`   - experience_compact: ${CONTENT_UNITS_REFERENCE.experience_compact.height_units} units`);
    console.log(`   - experience_minimal: ${CONTENT_UNITS_REFERENCE.experience_minimal.height_units} units\n`);

    const results: any[] = [];

    for (const profileName of profiles) {
        const profile = MOCK_PROFILES[profileName];
        console.log(`\n🧑 PROFIL: ${profileName.toUpperCase()} (${profile.experiences.length} expériences)`);
        console.log("─".repeat(60));

        for (const theme of themes) {
            const themeConfig = CV_THEMES[theme];

            const result = adaptCVToThemeUnits({
                cvData: profile as any,
                templateName: theme,
                includePhoto: theme === "modern" || theme === "creative",
                jobOffer: null
            });

            const maxUnits = themeConfig.page_config.total_height_units;
            const percentage = Math.round((result.totalUnitsUsed / maxUnits) * 100);
            const status = result.totalUnitsUsed <= maxUnits ? "✅" : "❌";

            // Compter les formats d'expériences
            const formats = { detailed: 0, standard: 0, compact: 0, minimal: 0 };
            for (const exp of result.cvData.experiences || []) {
                const fmt = (exp as any)._format || "standard";
                if (fmt in formats) formats[fmt as keyof typeof formats]++;
            }

            console.log(`   ${theme.padEnd(10)} : ${result.totalUnitsUsed}/${maxUnits} units (${percentage}%) ${status}`);
            console.log(`              Formats: D=${formats.detailed} S=${formats.standard} C=${formats.compact} M=${formats.minimal}`);

            if (result.warnings.length > 0) {
                console.log(`              ⚠️ Warnings: ${result.warnings.length}`);
                result.warnings.forEach(w => console.log(`                 - ${w}`));
            }

            results.push({
                profile: profileName,
                theme,
                unitsUsed: result.totalUnitsUsed,
                maxUnits,
                percentage,
                overflow: result.totalUnitsUsed > maxUnits,
                formats,
                warnings: result.warnings
            });
        }
    }

    // Résumé
    console.log("\n\n═══════════════════════════════════════════════════════════");
    console.log("                       RÉSUMÉ                               ");
    console.log("═══════════════════════════════════════════════════════════");

    const overflowCount = results.filter(r => r.overflow).length;
    const totalTests = results.length;

    console.log(`\n   Tests exécutés : ${totalTests}`);
    console.log(`   Débordements   : ${overflowCount}`);
    console.log(`   Taux de succès : ${Math.round(((totalTests - overflowCount) / totalTests) * 100)}%\n`);

    if (overflowCount === 0) {
        console.log("   🎉 SUCCÈS : Tous les CVs tiennent sur une page A4 !");
    } else {
        console.log("   ⚠️  ATTENTION : Certains CVs dépassent la capacité");
        console.log("   Ajustez les capacités de zones ou vérifiez l'algorithme");
    }

    console.log("\n═══════════════════════════════════════════════════════════\n");
}

// Exécution
runCalibration();
