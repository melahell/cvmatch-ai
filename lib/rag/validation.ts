/**
 * RAG Data Validation Module
 * Validates extracted RAG data against quality criteria
 */

interface ValidationWarning {
    severity: "critical" | "warning" | "info";
    category: string;
    message: string;
    field?: string;
}

interface ValidationResult {
    isValid: boolean;
    warnings: ValidationWarning[];
    metrics: {
        elevator_pitch_length: number;
        elevator_pitch_numbers_count: number;
        quantified_impacts_count: number;
        total_impacts_count: number;
        quantification_percentage: number;
        clients_count: number;
        certifications_count: number;
        inferred_skills_valid_count: number;
        inferred_skills_total_count: number;
    };
}

/**
 * Checks if a string contains quantified data (numbers, percentages, etc.)
 */
function hasQuantification(text: string | undefined | null): boolean {
    if (!text) return false;

    // Patterns for quantification
    const patterns = [
        /\d+\s*%/,  // Percentages: 45%, 30 %
        /\d+\s*[€$£¥]/,  // Currency: 15M€, $500K
        /\d+\s*(K|M|B|k|m|b)€/,  // Large amounts: 2M€, 500K€
        /\d+\+/,  // Volume: 150+, 50+
        /\d+\s*(projets|clients|utilisateurs|personnes|sites|pays|mois|ans|années|jours)/i,
        /équipe\s+de\s+\d+/i,  // Team of X
        /budget\s+.*\d+/i,  // Budget with numbers
        /(\d+)\s*→\s*(\d+)/,  // Before → After: 15M€ → 22M€
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * Counts numbers in a string
 */
function countNumbers(text: string | undefined | null): number {
    if (!text) return 0;
    const matches = text.match(/\d+/g);
    return matches ? matches.length : 0;
}

/**
 * Validates RAG data extracted by Gemini
 */
export function validateRAGData(ragData: any): ValidationResult {
    const warnings: ValidationWarning[] = [];

    // Initialize metrics
    const metrics = {
        elevator_pitch_length: 0,
        elevator_pitch_numbers_count: 0,
        quantified_impacts_count: 0,
        total_impacts_count: 0,
        quantification_percentage: 0,
        clients_count: 0,
        certifications_count: 0,
        inferred_skills_valid_count: 0,
        inferred_skills_total_count: 0,
    };

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION 1: Elevator Pitch Quality
    // ═══════════════════════════════════════════════════════════════
    const elevatorPitch = ragData?.profil?.elevator_pitch || "";
    metrics.elevator_pitch_length = elevatorPitch.length;
    metrics.elevator_pitch_numbers_count = countNumbers(elevatorPitch);

    if (!elevatorPitch || elevatorPitch.length < 100) {
        warnings.push({
            severity: "critical",
            category: "Elevator Pitch",
            message: `Elevator pitch trop court (${elevatorPitch.length} caractères). Minimum attendu: 200 caractères.`,
            field: "profil.elevator_pitch"
        });
    } else if (elevatorPitch.length < 200) {
        warnings.push({
            severity: "warning",
            category: "Elevator Pitch",
            message: `Elevator pitch court (${elevatorPitch.length} caractères). Recommandé: 200-400 caractères.`,
            field: "profil.elevator_pitch"
        });
    }

    if (metrics.elevator_pitch_numbers_count < 3) {
        warnings.push({
            severity: "warning",
            category: "Elevator Pitch",
            message: `Elevator pitch peu quantifié (${metrics.elevator_pitch_numbers_count} chiffres). Attendu: 3+ chiffres/pourcentages.`,
            field: "profil.elevator_pitch"
        });
    }

    // Check for generic phrases
    const genericPhrases = [
        "professionnel expérimenté",
        "passionné par",
        "expert reconnu",
        "forte expérience"
    ];
    if (genericPhrases.some(phrase => elevatorPitch.toLowerCase().includes(phrase))) {
        warnings.push({
            severity: "info",
            category: "Elevator Pitch",
            message: "Elevator pitch contient des phrases génériques. Privilégier des accomplissements spécifiques et quantifiés.",
            field: "profil.elevator_pitch"
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION 2: Quantified Impacts
    // ═══════════════════════════════════════════════════════════════
    const experiences = ragData?.experiences || [];
    let totalRealisations = 0;
    let quantifiedRealisations = 0;

    experiences.forEach((exp: any, expIdx: number) => {
        const realisations = exp?.realisations || [];
        realisations.forEach((realisation: any, realIdx: number) => {
            totalRealisations++;
            if (hasQuantification(realisation.impact)) {
                quantifiedRealisations++;
            } else {
                warnings.push({
                    severity: "info",
                    category: "Impacts",
                    message: `Réalisation sans impact quantifié: "${realisation.description?.substring(0, 50)}..."`,
                    field: `experiences[${expIdx}].realisations[${realIdx}].impact`
                });
            }
        });
    });

    metrics.total_impacts_count = totalRealisations;
    metrics.quantified_impacts_count = quantifiedRealisations;
    metrics.quantification_percentage = totalRealisations > 0
        ? Math.round((quantifiedRealisations / totalRealisations) * 100)
        : 0;

    if (metrics.quantification_percentage < 60 && totalRealisations > 0) {
        warnings.push({
            severity: "warning",
            category: "Impacts",
            message: `Seulement ${metrics.quantification_percentage}% des réalisations sont quantifiées (${quantifiedRealisations}/${totalRealisations}). Attendu: 60%+.`,
            field: "experiences[].realisations[].impact"
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION 3: Client Extraction
    // ═══════════════════════════════════════════════════════════════
    const clientsFromExperiences = experiences.flatMap((exp: any) => exp?.clients_references || []);
    const clientsFromReferences = ragData?.references?.clients || [];
    const allClients = new Set([
        ...clientsFromExperiences,
        ...clientsFromReferences.map((c: any) => typeof c === 'string' ? c : c.nom)
    ]);

    metrics.clients_count = allClients.size;

    if (metrics.clients_count === 0) {
        warnings.push({
            severity: "warning",
            category: "Clients",
            message: "Aucun client identifié. Vérifier si le document mentionne des entreprises clientes.",
            field: "references.clients"
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION 4: Certifications
    // ═══════════════════════════════════════════════════════════════
    const certifications = ragData?.certifications || [];
    metrics.certifications_count = certifications.length;

    if (metrics.certifications_count === 0) {
        warnings.push({
            severity: "info",
            category: "Certifications",
            message: "Aucune certification identifiée. Vérifier si le document en mentionne.",
            field: "certifications"
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION 5: Inferred Skills Quality
    // ═══════════════════════════════════════════════════════════════
    const inferredSkills = [
        ...(ragData?.competences?.inferred?.techniques || []),
        ...(ragData?.competences?.inferred?.tools || []),
        ...(ragData?.competences?.inferred?.soft_skills || [])
    ];

    metrics.inferred_skills_total_count = inferredSkills.length;

    inferredSkills.forEach((skill: any, idx: number) => {
        let isValid = true;

        if (!skill.name) {
            warnings.push({
                severity: "critical",
                category: "Compétences Inférées",
                message: `Compétence inférée #${idx + 1} sans nom`,
                field: `competences.inferred[${idx}].name`
            });
            isValid = false;
        }

        if (!skill.confidence || skill.confidence < 60) {
            warnings.push({
                severity: "warning",
                category: "Compétences Inférées",
                message: `"${skill.name}": confidence trop faible (${skill.confidence || 0}). Minimum: 60.`,
                field: `competences.inferred[${idx}].confidence`
            });
            isValid = false;
        }

        if (!skill.reasoning || skill.reasoning.length < 50) {
            warnings.push({
                severity: "warning",
                category: "Compétences Inférées",
                message: `"${skill.name}": reasoning trop court (${skill.reasoning?.length || 0} chars). Minimum: 50.`,
                field: `competences.inferred[${idx}].reasoning`
            });
            isValid = false;
        }

        if (!skill.sources || skill.sources.length === 0) {
            warnings.push({
                severity: "warning",
                category: "Compétences Inférées",
                message: `"${skill.name}": aucune source/citation fournie.`,
                field: `competences.inferred[${idx}].sources`
            });
            isValid = false;
        }

        if (isValid) {
            metrics.inferred_skills_valid_count++;
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION 6: Basic Profile Fields
    // ═══════════════════════════════════════════════════════════════
    if (!ragData?.profil?.nom || !ragData?.profil?.prenom) {
        warnings.push({
            severity: "critical",
            category: "Profil",
            message: "Nom ou prénom manquant",
            field: "profil.nom / profil.prenom"
        });
    }

    if (!ragData?.profil?.titre_principal) {
        warnings.push({
            severity: "warning",
            category: "Profil",
            message: "Titre principal manquant",
            field: "profil.titre_principal"
        });
    } else if (ragData.profil.titre_principal.length < 10) {
        warnings.push({
            severity: "info",
            category: "Profil",
            message: `Titre principal générique: "${ragData.profil.titre_principal}". Privilégier un titre précis.`,
            field: "profil.titre_principal"
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // FINAL RESULT
    // ═══════════════════════════════════════════════════════════════
    const criticalWarnings = warnings.filter(w => w.severity === "critical");
    const isValid = criticalWarnings.length === 0;

    return {
        isValid,
        warnings,
        metrics
    };
}

/**
 * Formats validation warnings for console logging
 */
export function formatValidationReport(result: ValidationResult): string {
    const { warnings, metrics, isValid } = result;

    let report = "\n";
    report += "═══════════════════════════════════════════════════════════════\n";
    report += `RAG VALIDATION REPORT - ${isValid ? "✅ VALID" : "❌ INVALID"}\n`;
    report += "═══════════════════════════════════════════════════════════════\n\n";

    report += "METRICS:\n";
    report += `  • Elevator Pitch: ${metrics.elevator_pitch_length} chars, ${metrics.elevator_pitch_numbers_count} numbers\n`;
    report += `  • Quantified Impacts: ${metrics.quantified_impacts_count}/${metrics.total_impacts_count} (${metrics.quantification_percentage}%)\n`;
    report += `  • Clients: ${metrics.clients_count}\n`;
    report += `  • Certifications: ${metrics.certifications_count}\n`;
    report += `  • Inferred Skills: ${metrics.inferred_skills_valid_count}/${metrics.inferred_skills_total_count} valid\n`;
    report += "\n";

    if (warnings.length > 0) {
        const critical = warnings.filter(w => w.severity === "critical");
        const warningLevel = warnings.filter(w => w.severity === "warning");
        const info = warnings.filter(w => w.severity === "info");

        if (critical.length > 0) {
            report += `❌ CRITICAL ISSUES (${critical.length}):\n`;
            critical.forEach(w => report += `   - ${w.category}: ${w.message}\n`);
            report += "\n";
        }

        if (warningLevel.length > 0) {
            report += `⚠️  WARNINGS (${warningLevel.length}):\n`;
            warningLevel.forEach(w => report += `   - ${w.category}: ${w.message}\n`);
            report += "\n";
        }

        if (info.length > 0) {
            report += `ℹ️  INFO (${info.length}):\n`;
            info.forEach(w => report += `   - ${w.category}: ${w.message}\n`);
        }
    } else {
        report += "✅ No warnings - data quality is excellent!\n";
    }

    report += "═══════════════════════════════════════════════════════════════\n";

    return report;
}
