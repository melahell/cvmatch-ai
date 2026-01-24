/**
 * Export CV to Markdown format
 * Converts CV data to structured Markdown text
 */

import type { RendererResumeSchema } from "./renderer-schema";

/**
 * Export CV data to Markdown string
 */
export function exportCVToMarkdown(cvData: RendererResumeSchema): string {
    const lines: string[] = [];

    // Title: Nom complet
    const fullName = `${cvData.profil?.prenom || ""} ${cvData.profil?.nom || ""}`.trim();
    if (fullName) {
        lines.push(`# ${fullName}`);
        lines.push("");
    }

    // Sous-titre: Titre principal
    if (cvData.profil?.titre_principal) {
        lines.push(`## ${cvData.profil.titre_principal}`);
        lines.push("");
    }

    // Contact
    const contactItems: string[] = [];
    if (cvData.profil?.email) contactItems.push(`- **Email:** ${cvData.profil.email}`);
    if (cvData.profil?.telephone) contactItems.push(`- **Téléphone:** ${cvData.profil.telephone}`);
    if (cvData.profil?.linkedin) contactItems.push(`- **LinkedIn:** [${cvData.profil.linkedin}](${cvData.profil.linkedin})`);
    if (cvData.profil?.localisation) contactItems.push(`- **Localisation:** ${cvData.profil.localisation}`);

    if (contactItems.length > 0) {
        lines.push("### Contact");
        lines.push("");
        lines.push(...contactItems);
        lines.push("");
    }

    // Elevator pitch
    if (cvData.profil?.elevator_pitch) {
        lines.push("## Profil");
        lines.push("");
        lines.push(cvData.profil.elevator_pitch);
        lines.push("");
    }

    // Expériences
    if (cvData.experiences && cvData.experiences.length > 0) {
        lines.push("## Expériences Professionnelles");
        lines.push("");

        for (const exp of cvData.experiences) {
            // Titre: Poste @ Entreprise
            const title = `${exp.poste || ""}${exp.entreprise ? ` @ ${exp.entreprise}` : ""}`;
            if (title.trim()) {
                lines.push(`### ${title.trim()}`);
                lines.push("");
            }

            // Dates
            const dates = exp.date_debut
                ? `**${exp.date_debut}${exp.date_fin ? ` - ${exp.date_fin}` : " - Actuel"}**`
                : "";
            if (dates) {
                lines.push(dates);
                lines.push("");
            }

            // Réalisations
            if (exp.realisations && exp.realisations.length > 0) {
                for (const real of exp.realisations) {
                    const realText = typeof real === "string" ? real : (real as any).description || "";
                    if (realText) {
                        lines.push(`- ${realText}`);
                    }
                }
                lines.push("");
            }
        }
    }

    // Compétences
    if (cvData.competences) {
        lines.push("## Compétences");
        lines.push("");

        if (cvData.competences.techniques && cvData.competences.techniques.length > 0) {
            lines.push("### Techniques");
            lines.push("");
            for (const skill of cvData.competences.techniques) {
                lines.push(`- ${skill}`);
            }
            lines.push("");
        }

        if (cvData.competences.soft_skills && cvData.competences.soft_skills.length > 0) {
            lines.push("### Soft Skills");
            lines.push("");
            for (const skill of cvData.competences.soft_skills) {
                lines.push(`- ${skill}`);
            }
            lines.push("");
        }
    }

    // Formations
    if (cvData.formations && cvData.formations.length > 0) {
        lines.push("## Formations");
        lines.push("");

        for (const form of cvData.formations) {
            const formText = `**${form.diplome || ""}**${form.etablissement ? ` - ${form.etablissement}` : ""}${form.annee ? ` (${form.annee})` : ""}`;
            if (formText.trim()) {
                lines.push(`- ${formText.trim()}`);
            }
        }
        lines.push("");
    }

    // Langues
    if (cvData.langues && Object.keys(cvData.langues).length > 0) {
        lines.push("## Langues");
        lines.push("");
        for (const [langue, niveau] of Object.entries(cvData.langues)) {
            lines.push(`- **${langue}:** ${niveau}`);
        }
        lines.push("");
    }

    // Certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
        lines.push("## Certifications");
        lines.push("");
        for (const cert of cvData.certifications) {
            lines.push(`- ${cert}`);
        }
        lines.push("");
    }

    return lines.join("\n");
}
