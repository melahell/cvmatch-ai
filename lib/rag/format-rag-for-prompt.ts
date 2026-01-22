/**
 * Format existing RAG data as readable text for inclusion in prompts
 * This allows Gemini to see the accumulated context when processing new documents
 */

export function formatRAGForPrompt(ragData: any): string {
    if (!ragData) return "";

    const parts: string[] = [];

    // Profil
    if (ragData.profil) {
        parts.push("═══════════════════════════════════════════════════════════════");
        parts.push("PROFIL EXISTANT (RAG accumulé des documents précédents) :");
        parts.push("═══════════════════════════════════════════════════════════════");
        
        if (ragData.profil.nom || ragData.profil.prenom) {
            parts.push(`Nom: ${ragData.profil.prenom || ""} ${ragData.profil.nom || ""}`.trim());
        }
        if (ragData.profil.titre_principal) {
            parts.push(`Titre: ${ragData.profil.titre_principal}`);
        }
        if (ragData.profil.localisation) {
            parts.push(`Localisation: ${ragData.profil.localisation}`);
        }
        if (ragData.profil.elevator_pitch) {
            parts.push(`Pitch: ${ragData.profil.elevator_pitch}`);
        }
        parts.push("");
    }

    // Expériences
    if (ragData.experiences && ragData.experiences.length > 0) {
        parts.push("═══════════════════════════════════════════════════════════════");
        parts.push("EXPÉRIENCES EXISTANTES :");
        parts.push("═══════════════════════════════════════════════════════════════");
        
        ragData.experiences.forEach((exp: any, idx: number) => {
            parts.push(`${idx + 1}. ${exp.poste || "Poste non spécifié"}`);
            parts.push(`   Entreprise: ${exp.entreprise || "Non spécifiée"}`);
            parts.push(`   Période: ${exp.debut || "?"} - ${exp.fin || exp.actuel ? "Présent" : "?"}`);
            
            if (exp.realisations && exp.realisations.length > 0) {
                parts.push(`   Réalisations (${exp.realisations.length}):`);
                exp.realisations.forEach((r: any, rIdx: number) => {
                    const desc = typeof r === 'string' ? r : (r.description || "");
                    const impact = typeof r === 'object' && r.impact ? ` (${r.impact})` : "";
                    parts.push(`     ${rIdx + 1}. ${desc}${impact}`);
                });
            }
            
            if (exp.technologies && exp.technologies.length > 0) {
                parts.push(`   Technologies: ${exp.technologies.join(", ")}`);
            }
            
            if (exp.clients_references && exp.clients_references.length > 0) {
                parts.push(`   Clients: ${exp.clients_references.join(", ")}`);
            }
            
            parts.push("");
        });
    }

    // Compétences
    if (ragData.competences) {
        parts.push("═══════════════════════════════════════════════════════════════");
        parts.push("COMPÉTENCES EXISTANTES :");
        parts.push("═══════════════════════════════════════════════════════════════");
        
        if (ragData.competences.explicit?.techniques?.length > 0) {
            parts.push(`Techniques: ${ragData.competences.explicit.techniques.join(", ")}`);
        }
        if (ragData.competences.explicit?.soft_skills?.length > 0) {
            parts.push(`Soft Skills: ${ragData.competences.explicit.soft_skills.join(", ")}`);
        }
        if (ragData.competences.techniques?.length > 0) {
            parts.push(`Techniques (format simple): ${ragData.competences.techniques.join(", ")}`);
        }
        if (ragData.competences.soft_skills?.length > 0) {
            parts.push(`Soft Skills (format simple): ${ragData.competences.soft_skills.join(", ")}`);
        }
        parts.push("");
    }

    // Formations
    if (ragData.formations && ragData.formations.length > 0) {
        parts.push("═══════════════════════════════════════════════════════════════");
        parts.push("FORMATIONS EXISTANTES :");
        parts.push("═══════════════════════════════════════════════════════════════");
        ragData.formations.forEach((f: any) => {
            parts.push(`- ${f.diplome || ""} ${f.ecole ? `@ ${f.ecole}` : ""} ${f.annee ? `(${f.annee})` : ""}`.trim());
        });
        parts.push("");
    }

    // Certifications
    if (ragData.certifications && ragData.certifications.length > 0) {
        parts.push("═══════════════════════════════════════════════════════════════");
        parts.push("CERTIFICATIONS EXISTANTES :");
        parts.push("═══════════════════════════════════════════════════════════════");
        ragData.certifications.forEach((c: string) => {
            parts.push(`- ${c}`);
        });
        parts.push("");
    }

    // Langues
    if (ragData.langues && Object.keys(ragData.langues).length > 0) {
        parts.push("═══════════════════════════════════════════════════════════════");
        parts.push("LANGUES EXISTANTES :");
        parts.push("═══════════════════════════════════════════════════════════════");
        Object.entries(ragData.langues).forEach(([lang, niveau]) => {
            parts.push(`- ${lang}: ${niveau}`);
        });
        parts.push("");
    }

    return parts.join("\n");
}
