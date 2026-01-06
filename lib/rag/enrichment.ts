/**
 * RAG Data Enrichment Module
 * Post-processes and enriches extracted RAG data
 */

/**
 * Normalizes company names (fixes typos, standardizes formatting)
 */
function normalizeCompanyName(name: string): string {
    if (!name) return name;

    // Common typos and abbreviations
    const replacements: Record<string, string> = {
        "BNP": "BNP Paribas",
        "SG": "Société Générale",
        "CA": "Crédit Agricole",
        "BNPP": "BNP Paribas",
        "LV": "Louis Vuitton",
        "LVMH": "LVMH",
        "L'Oreal": "L'Oréal",
        "Loreal": "L'Oréal",
        "Hermes": "Hermès",
        "Societe Generale": "Société Générale",
        "Credit Agricole": "Crédit Agricole",
    };

    const trimmed = name.trim();
    return replacements[trimmed] || trimmed;
}

/**
 * Detects and warns about overlapping date ranges in experiences
 */
function detectDateOverlaps(experiences: any[]): string[] {
    const warnings: string[] = [];

    for (let i = 0; i < experiences.length; i++) {
        const exp1 = experiences[i];
        if (!exp1.debut) continue;

        const start1 = new Date(exp1.debut);
        const end1 = exp1.fin ? new Date(exp1.fin) : new Date();

        for (let j = i + 1; j < experiences.length; j++) {
            const exp2 = experiences[j];
            if (!exp2.debut) continue;

            const start2 = new Date(exp2.debut);
            const end2 = exp2.fin ? new Date(exp2.fin) : new Date();

            // Check if date ranges overlap
            if (start1 <= end2 && start2 <= end1) {
                warnings.push(
                    `Chevauchement détecté entre "${exp1.poste}" (${exp1.debut} - ${exp1.fin || "Présent"}) ` +
                    `et "${exp2.poste}" (${exp2.debut} - ${exp2.fin || "Présent"})`
                );
            }
        }
    }

    return warnings;
}

/**
 * Calculates total years of experience
 */
function calculateTotalExperience(experiences: any[]): number {
    let totalMonths = 0;

    experiences.forEach(exp => {
        if (!exp.debut) return;

        const start = new Date(exp.debut);
        const end = exp.actuel || !exp.fin ? new Date() : new Date(exp.fin);

        const months = Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
        totalMonths += months;
    });

    return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
}

/**
 * Detects missing critical information
 */
function detectMissingInfo(ragData: any): string[] {
    const missing: string[] = [];

    if (!ragData?.profil?.email && !ragData?.profil?.contact?.email) {
        missing.push("Email de contact manquant");
    }

    if (!ragData?.profil?.localisation) {
        missing.push("Localisation manquante");
    }

    const experiences = ragData?.experiences || [];
    if (experiences.length > 0) {
        const experiencesWithoutRealisations = experiences.filter((exp: any) =>
            !exp.realisations || exp.realisations.length === 0
        );
        if (experiencesWithoutRealisations.length > 0) {
            missing.push(`${experiencesWithoutRealisations.length} expérience(s) sans réalisations`);
        }
    }

    return missing;
}

/**
 * Enriches RAG data with computed fields and normalizations
 */
export function enrichRAGData(ragData: any): any {
    const enriched = JSON.parse(JSON.stringify(ragData)); // Deep clone

    const enrichmentLog: string[] = [];

    // ═══════════════════════════════════════════════════════════════
    // 1. Normalize company names in experiences
    // ═══════════════════════════════════════════════════════════════
    if (enriched.experiences) {
        enriched.experiences.forEach((exp: any) => {
            if (exp.entreprise) {
                const original = exp.entreprise;
                exp.entreprise = normalizeCompanyName(exp.entreprise);
                if (original !== exp.entreprise) {
                    enrichmentLog.push(`Normalized company: "${original}" → "${exp.entreprise}"`);
                }
            }

            // Normalize client names
            if (exp.clients_references) {
                exp.clients_references = exp.clients_references.map((client: string) => {
                    const normalized = normalizeCompanyName(client);
                    if (normalized !== client) {
                        enrichmentLog.push(`Normalized client: "${client}" → "${normalized}"`);
                    }
                    return normalized;
                });
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. Add computed fields
    // ═══════════════════════════════════════════════════════════════
    if (!enriched.computed) {
        enriched.computed = {};
    }

    // Total years of experience
    if (enriched.experiences) {
        enriched.computed.total_years_experience = calculateTotalExperience(enriched.experiences);
        enrichmentLog.push(`Calculated total experience: ${enriched.computed.total_years_experience} years`);
    }

    // Total number of unique skills
    const allSkills = new Set<string>();
    enriched.competences?.explicit?.techniques?.forEach((s: string) => allSkills.add(s));
    enriched.competences?.explicit?.soft_skills?.forEach((s: string) => allSkills.add(s));
    enriched.computed.total_unique_skills = allSkills.size;

    // ═══════════════════════════════════════════════════════════════
    // 3. Detect anomalies and issues
    // ═══════════════════════════════════════════════════════════════
    const anomalies: string[] = [];

    // Check for date overlaps
    if (enriched.experiences) {
        const overlaps = detectDateOverlaps(enriched.experiences);
        anomalies.push(...overlaps);
    }

    // Check for missing critical info
    const missing = detectMissingInfo(enriched);
    anomalies.push(...missing);

    if (anomalies.length > 0) {
        enriched.anomalies = anomalies;
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. Sort experiences by date (most recent first)
    // ═══════════════════════════════════════════════════════════════
    if (enriched.experiences) {
        enriched.experiences.sort((a: any, b: any) => {
            const dateA = a.fin || a.debut || "0000-00";
            const dateB = b.fin || b.debut || "0000-00";
            return dateB.localeCompare(dateA);
        });
        enrichmentLog.push("Sorted experiences by date (most recent first)");
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. Deduplicate skills
    // ═══════════════════════════════════════════════════════════════
    if (enriched.competences?.explicit?.techniques) {
        const original = enriched.competences.explicit.techniques.length;
        enriched.competences.explicit.techniques = [...new Set(enriched.competences.explicit.techniques)];
        const deduplicated = enriched.competences.explicit.techniques.length;
        if (original !== deduplicated) {
            enrichmentLog.push(`Deduplicated technical skills: ${original} → ${deduplicated}`);
        }
    }

    if (enriched.competences?.explicit?.soft_skills) {
        const original = enriched.competences.explicit.soft_skills.length;
        enriched.competences.explicit.soft_skills = [...new Set(enriched.competences.explicit.soft_skills)];
        const deduplicated = enriched.competences.explicit.soft_skills.length;
        if (original !== deduplicated) {
            enrichmentLog.push(`Deduplicated soft skills: ${original} → ${deduplicated}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. Deduplicate certifications
    // ═══════════════════════════════════════════════════════════════
    if (enriched.certifications) {
        const original = enriched.certifications.length;
        enriched.certifications = [...new Set(enriched.certifications)];
        const deduplicated = enriched.certifications.length;
        if (original !== deduplicated) {
            enrichmentLog.push(`Deduplicated certifications: ${original} → ${deduplicated}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 7. Add enrichment metadata
    // ═══════════════════════════════════════════════════════════════
    enriched.enrichment_metadata = {
        enriched_at: new Date().toISOString(),
        enrichment_log: enrichmentLog,
        anomalies_detected: anomalies.length
    };

    return enriched;
}

/**
 * Generates suggestions for improving the profile
 */
export function generateImprovementSuggestions(ragData: any): string[] {
    const suggestions: string[] = [];

    // Check elevator pitch
    const pitch = ragData?.profil?.elevator_pitch || "";
    if (pitch.length < 200) {
        suggestions.push("Enrichir l'elevator pitch avec des accomplissements quantifiés (min 200 caractères)");
    }

    // Check quantified impacts
    const experiences = ragData?.experiences || [];
    let totalRealisations = 0;
    let quantifiedRealisations = 0;

    experiences.forEach((exp: any) => {
        const realisations = exp?.realisations || [];
        realisations.forEach((r: any) => {
            totalRealisations++;
            if (r.impact && /\d+/.test(r.impact)) {
                quantifiedRealisations++;
            }
        });
    });

    const quantificationRate = totalRealisations > 0 ? (quantifiedRealisations / totalRealisations) * 100 : 0;
    if (quantificationRate < 60) {
        suggestions.push(`Ajouter des impacts quantifiés aux réalisations (actuellement ${Math.round(quantificationRate)}%, objectif 60%+)`);
    }

    // Check clients
    const allClients = new Set<string>();
    experiences.forEach((exp: any) => {
        exp?.clients_references?.forEach((client: string) => allClients.add(client));
    });
    ragData?.references?.clients?.forEach((client: any) => {
        const nom = typeof client === "string" ? client : client.nom;
        if (nom) allClients.add(nom);
    });

    if (allClients.size === 0) {
        suggestions.push("Ajouter des références de clients prestigieux dans les expériences");
    } else if (allClients.size < 3) {
        suggestions.push("Ajouter plus de références clients pour renforcer la crédibilité (actuellement: " + allClients.size + ")");
    }

    // Check certifications
    const certCount = ragData?.certifications?.length || 0;
    if (certCount === 0) {
        suggestions.push("Ajouter des certifications professionnelles si disponibles (PMP, AWS, Scrum, etc.)");
    }

    // Check contact info
    if (!ragData?.profil?.contact?.email) {
        suggestions.push("Ajouter une adresse email de contact");
    }
    if (!ragData?.profil?.contact?.linkedin) {
        suggestions.push("Ajouter le profil LinkedIn");
    }

    // Check formations
    const formCount = ragData?.formations?.length || 0;
    if (formCount === 0) {
        suggestions.push("Ajouter au moins une formation académique");
    }

    // Check languages
    const langCount = Object.keys(ragData?.langues || {}).length;
    if (langCount === 0) {
        suggestions.push("Ajouter les langues parlées avec niveaux");
    }

    return suggestions;
}
