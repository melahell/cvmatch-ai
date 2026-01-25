/**
 * Regression Testing System - Tests automatisés de qualité CV
 *
 * [AMÉLIORATION P2-6] : Système de tests de régression pour garantir
 * que les modifications ne dégradent pas la qualité des CVs générés.
 *
 * Features:
 * - Golden tests avec profils de référence
 * - Snapshot testing des CVs
 * - Comparaison sémantique
 * - CI/CD integration
 */

import { logger } from "@/lib/utils/logger";
import crypto from "crypto";

// ============================================================================
// TYPES
// ============================================================================

export interface GoldenProfile {
    id: string;
    name: string;
    description: string;
    ragProfile: any;
    jobDescription: string;
    expectedCV: ExpectedCVProperties;
    createdAt: string;
    updatedAt: string;
}

export interface ExpectedCVProperties {
    minExperiences: number;
    maxExperiences: number;
    minSkills: number;
    requiredKeywords: string[];
    forbiddenPatterns: string[];
    minGroundingScore: number;
    expectedSections: string[];
    maxGenerationTimeMs: number;
}

export interface TestResult {
    profileId: string;
    profileName: string;
    passed: boolean;
    duration: number;
    checks: CheckResult[];
    cvSnapshot?: any;
    diff?: string;
}

export interface CheckResult {
    name: string;
    passed: boolean;
    expected: any;
    actual: any;
    message: string;
}

export interface RegressionReport {
    runId: string;
    timestamp: string;
    totalTests: number;
    passed: number;
    failed: number;
    duration: number;
    results: TestResult[];
    summary: string;
}

// ============================================================================
// GOLDEN PROFILES - Profils de référence pour tests
// ============================================================================

export const GOLDEN_PROFILES: GoldenProfile[] = [
    {
        id: "senior-tech-lead",
        name: "Tech Lead Senior (10+ ans)",
        description: "Profil technique senior avec leadership",
        ragProfile: {
            profil: {
                prenom: "Jean",
                nom: "Dupont",
                titre_principal: "Tech Lead",
                localisation: "Paris",
                elevator_pitch: "Tech Lead passionné avec 12 ans d'expérience en architecture cloud et management d'équipes techniques.",
            },
            experiences: [
                {
                    poste: "Tech Lead",
                    entreprise: "Startup Scale",
                    debut: "2020-01",
                    actuel: true,
                    realisations: [
                        "Architecture microservices réduisant le time-to-market de 60%",
                        "Management d'une équipe de 8 développeurs",
                        "Migration cloud AWS diminuant les coûts de 45%",
                    ],
                },
                {
                    poste: "Senior Developer",
                    entreprise: "BigCorp",
                    debut: "2015-01",
                    fin: "2019-12",
                    realisations: [
                        "Développement API REST traitant 1M requêtes/jour",
                        "Implémentation CI/CD réduisant le temps de déploiement de 80%",
                    ],
                },
            ],
            competences: {
                techniques: ["TypeScript", "Node.js", "AWS", "Kubernetes", "PostgreSQL"],
                soft_skills: ["Leadership", "Communication", "Problem Solving"],
            },
            formations: [
                { diplome: "Master Informatique", etablissement: "EPITA", annee: "2012" },
            ],
        },
        jobDescription: "Recherche Tech Lead pour scale-up FinTech. Stack: Node.js, TypeScript, AWS. Management équipe 5-10 personnes.",
        expectedCV: {
            minExperiences: 2,
            maxExperiences: 4,
            minSkills: 5,
            requiredKeywords: ["Tech Lead", "AWS", "TypeScript", "équipe"],
            forbiddenPatterns: ["Lorem ipsum", "À renseigner", "N/A"],
            minGroundingScore: 80,
            expectedSections: ["profil", "experiences", "competences", "formations"],
            maxGenerationTimeMs: 60000,
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
    },
    {
        id: "junior-dev",
        name: "Développeur Junior (2 ans)",
        description: "Profil junior avec stages et alternance",
        ragProfile: {
            profil: {
                prenom: "Marie",
                nom: "Martin",
                titre_principal: "Développeuse Full Stack",
                localisation: "Lyon",
            },
            experiences: [
                {
                    poste: "Développeuse Full Stack",
                    entreprise: "Agence Web",
                    debut: "2023-01",
                    actuel: true,
                    realisations: [
                        "Développement de 5 sites e-commerce React/Node.js",
                        "Optimisation performances frontend (-40% temps de chargement)",
                    ],
                },
                {
                    poste: "Stagiaire Développement",
                    entreprise: "ESN",
                    debut: "2022-03",
                    fin: "2022-08",
                    realisations: [
                        "Contribution au développement d'une application mobile Flutter",
                    ],
                },
            ],
            competences: {
                techniques: ["React", "Node.js", "TypeScript", "PostgreSQL"],
                soft_skills: ["Curiosité", "Travail d'équipe"],
            },
            formations: [
                { diplome: "Master Développement Web", etablissement: "Université Lyon 1", annee: "2022" },
            ],
        },
        jobDescription: "CDI Développeur Full Stack Junior. React, Node.js. Télétravail partiel.",
        expectedCV: {
            minExperiences: 1,
            maxExperiences: 3,
            minSkills: 3,
            requiredKeywords: ["React", "Node.js", "Full Stack"],
            forbiddenPatterns: ["Senior", "10 ans", "expert"],
            minGroundingScore: 80,
            expectedSections: ["profil", "experiences", "competences", "formations"],
            maxGenerationTimeMs: 60000,
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
    },
    {
        id: "consultant-finance",
        name: "Consultant Finance (5 ans)",
        description: "Profil conseil en finance",
        ragProfile: {
            profil: {
                prenom: "Pierre",
                nom: "Durand",
                titre_principal: "Consultant Senior Finance",
                localisation: "Paris",
                elevator_pitch: "Consultant spécialisé en transformation finance et conformité réglementaire.",
            },
            experiences: [
                {
                    poste: "Consultant Senior",
                    entreprise: "Big Four",
                    debut: "2019-01",
                    actuel: true,
                    realisations: [
                        "Pilotage mission transformation finance (budget 5M€)",
                        "Due diligence M&A identifiant 8M€ de synergies",
                        "Déploiement outil reporting réglementaire Bâle III",
                    ],
                },
            ],
            competences: {
                techniques: ["SAP", "Power BI", "Excel avancé", "SQL"],
                soft_skills: ["Communication C-level", "Gestion de projet", "Analyse"],
            },
            certifications: ["CFA Level II", "Prince2"],
            formations: [
                { diplome: "Master Finance", etablissement: "HEC Paris", annee: "2018" },
            ],
        },
        jobDescription: "Manager Conseil Finance pour cabinet tier 1. Missions transformation, M&A, réglementaire.",
        expectedCV: {
            minExperiences: 1,
            maxExperiences: 3,
            minSkills: 4,
            requiredKeywords: ["Finance", "transformation", "M&A", "réglementaire"],
            forbiddenPatterns: ["Lorem ipsum", "développeur", "code"],
            minGroundingScore: 85,
            expectedSections: ["profil", "experiences", "competences", "certifications"],
            maxGenerationTimeMs: 60000,
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
    },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

export class RegressionTestRunner {
    private results: TestResult[] = [];

    /**
     * Exécute tous les tests de régression
     */
    async runAllTests(
        generateCV: (profile: any, jobDescription: string) => Promise<any>
    ): Promise<RegressionReport> {
        const runId = `run_${Date.now()}`;
        const startTime = Date.now();
        this.results = [];

        logger.info("[regression] Démarrage tests de régression", {
            profileCount: GOLDEN_PROFILES.length,
        });

        for (const profile of GOLDEN_PROFILES) {
            const result = await this.runSingleTest(profile, generateCV);
            this.results.push(result);
        }

        const duration = Date.now() - startTime;
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;

        const report: RegressionReport = {
            runId,
            timestamp: new Date().toISOString(),
            totalTests: GOLDEN_PROFILES.length,
            passed,
            failed,
            duration,
            results: this.results,
            summary: this.generateSummary(passed, failed, duration),
        };

        logger.info("[regression] Tests terminés", {
            passed,
            failed,
            duration,
        });

        return report;
    }

    /**
     * Exécute un test pour un profil donné
     */
    private async runSingleTest(
        profile: GoldenProfile,
        generateCV: (profile: any, jobDescription: string) => Promise<any>
    ): Promise<TestResult> {
        const startTime = Date.now();
        const checks: CheckResult[] = [];

        try {
            // Générer le CV
            const cvData = await generateCV(profile.ragProfile, profile.jobDescription);
            const duration = Date.now() - startTime;

            // Vérifications
            checks.push(this.checkExperienceCount(cvData, profile.expectedCV));
            checks.push(this.checkSkillsCount(cvData, profile.expectedCV));
            checks.push(this.checkRequiredKeywords(cvData, profile.expectedCV));
            checks.push(this.checkForbiddenPatterns(cvData, profile.expectedCV));
            checks.push(this.checkSections(cvData, profile.expectedCV));
            checks.push(this.checkGenerationTime(duration, profile.expectedCV));

            // Vérification grounding si disponible
            if (cvData.cv_metadata?.grounding?.percentage !== undefined) {
                checks.push(this.checkGroundingScore(
                    cvData.cv_metadata.grounding.percentage,
                    profile.expectedCV
                ));
            }

            const allPassed = checks.every(c => c.passed);

            return {
                profileId: profile.id,
                profileName: profile.name,
                passed: allPassed,
                duration,
                checks,
                cvSnapshot: cvData,
            };
        } catch (error: any) {
            return {
                profileId: profile.id,
                profileName: profile.name,
                passed: false,
                duration: Date.now() - startTime,
                checks: [{
                    name: "generation",
                    passed: false,
                    expected: "CV généré",
                    actual: error.message,
                    message: `Erreur de génération: ${error.message}`,
                }],
            };
        }
    }

    // ========================================================================
    // CHECKS
    // ========================================================================

    private checkExperienceCount(cvData: any, expected: ExpectedCVProperties): CheckResult {
        const actual = cvData.experiences?.length || 0;
        const passed = actual >= expected.minExperiences && actual <= expected.maxExperiences;

        return {
            name: "experience_count",
            passed,
            expected: `${expected.minExperiences}-${expected.maxExperiences}`,
            actual,
            message: passed
                ? `Nombre d'expériences OK (${actual})`
                : `Nombre d'expériences incorrect: ${actual} (attendu: ${expected.minExperiences}-${expected.maxExperiences})`,
        };
    }

    private checkSkillsCount(cvData: any, expected: ExpectedCVProperties): CheckResult {
        const techniques = cvData.competences?.techniques?.length || 0;
        const soft = cvData.competences?.soft_skills?.length || 0;
        const actual = techniques + soft;
        const passed = actual >= expected.minSkills;

        return {
            name: "skills_count",
            passed,
            expected: `>= ${expected.minSkills}`,
            actual,
            message: passed
                ? `Nombre de compétences OK (${actual})`
                : `Pas assez de compétences: ${actual} (minimum: ${expected.minSkills})`,
        };
    }

    private checkRequiredKeywords(cvData: any, expected: ExpectedCVProperties): CheckResult {
        const cvText = JSON.stringify(cvData).toLowerCase();
        const missing = expected.requiredKeywords.filter(
            kw => !cvText.includes(kw.toLowerCase())
        );
        const passed = missing.length === 0;

        return {
            name: "required_keywords",
            passed,
            expected: expected.requiredKeywords,
            actual: missing.length === 0 ? "Tous présents" : `Manquants: ${missing.join(", ")}`,
            message: passed
                ? "Tous les mots-clés requis sont présents"
                : `Mots-clés manquants: ${missing.join(", ")}`,
        };
    }

    private checkForbiddenPatterns(cvData: any, expected: ExpectedCVProperties): CheckResult {
        const cvText = JSON.stringify(cvData).toLowerCase();
        const found = expected.forbiddenPatterns.filter(
            pattern => cvText.includes(pattern.toLowerCase())
        );
        const passed = found.length === 0;

        return {
            name: "forbidden_patterns",
            passed,
            expected: "Aucun pattern interdit",
            actual: found.length === 0 ? "OK" : `Trouvés: ${found.join(", ")}`,
            message: passed
                ? "Aucun pattern interdit trouvé"
                : `Patterns interdits trouvés: ${found.join(", ")}`,
        };
    }

    private checkSections(cvData: any, expected: ExpectedCVProperties): CheckResult {
        const missing = expected.expectedSections.filter(
            section => !cvData[section] && section !== "certifications"
        );
        const passed = missing.length === 0;

        return {
            name: "sections",
            passed,
            expected: expected.expectedSections,
            actual: missing.length === 0 ? "Toutes présentes" : `Manquantes: ${missing.join(", ")}`,
            message: passed
                ? "Toutes les sections attendues sont présentes"
                : `Sections manquantes: ${missing.join(", ")}`,
        };
    }

    private checkGenerationTime(duration: number, expected: ExpectedCVProperties): CheckResult {
        const passed = duration <= expected.maxGenerationTimeMs;

        return {
            name: "generation_time",
            passed,
            expected: `<= ${expected.maxGenerationTimeMs}ms`,
            actual: `${duration}ms`,
            message: passed
                ? `Temps de génération OK (${duration}ms)`
                : `Temps de génération trop long: ${duration}ms (max: ${expected.maxGenerationTimeMs}ms)`,
        };
    }

    private checkGroundingScore(score: number, expected: ExpectedCVProperties): CheckResult {
        const passed = score >= expected.minGroundingScore;

        return {
            name: "grounding_score",
            passed,
            expected: `>= ${expected.minGroundingScore}%`,
            actual: `${score}%`,
            message: passed
                ? `Score grounding OK (${score}%)`
                : `Score grounding insuffisant: ${score}% (minimum: ${expected.minGroundingScore}%)`,
        };
    }

    private generateSummary(passed: number, failed: number, duration: number): string {
        const total = passed + failed;
        const successRate = ((passed / total) * 100).toFixed(1);

        if (failed === 0) {
            return `✅ Tous les tests passent (${passed}/${total}) en ${duration}ms`;
        }

        return `❌ ${failed} test(s) échoué(s) sur ${total} (${successRate}% de succès) en ${duration}ms`;
    }
}

// ============================================================================
// SNAPSHOT COMPARISON
// ============================================================================

/**
 * Compare deux snapshots de CV
 */
export function compareCVSnapshots(
    baseline: any,
    current: any
): { identical: boolean; diff: string[] } {
    const diff: string[] = [];

    // Comparer les sections principales
    const sections = ["profil", "experiences", "competences", "formations", "certifications", "langues"];

    for (const section of sections) {
        const baselineHash = hashSection(baseline[section]);
        const currentHash = hashSection(current[section]);

        if (baselineHash !== currentHash) {
            diff.push(`Section "${section}" modifiée`);
        }
    }

    // Comparer le nombre d'éléments
    const baselineExpCount = baseline.experiences?.length || 0;
    const currentExpCount = current.experiences?.length || 0;
    if (baselineExpCount !== currentExpCount) {
        diff.push(`Nombre d'expériences: ${baselineExpCount} → ${currentExpCount}`);
    }

    return {
        identical: diff.length === 0,
        diff,
    };
}

function hashSection(data: any): string {
    if (!data) return "empty";
    return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

// ============================================================================
// EXPORTS
// ============================================================================

export const regressionRunner = new RegressionTestRunner();
