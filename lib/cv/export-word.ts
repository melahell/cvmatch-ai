/**
 * Export CV to Word (.docx) format
 * Uses docx library to create a formatted Word document
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, WidthType } from "docx";
import type { RendererResumeSchema } from "./renderer-schema";

/**
 * Export CV data to Word document
 */
export async function exportCVToWord(
    cvData: RendererResumeSchema,
    template: string = "modern"
): Promise<Buffer> {
    const sections: Paragraph[] = [];

    // Title: Nom + Titre principal
    if (cvData.profil?.nom || cvData.profil?.prenom) {
        const fullName = `${cvData.profil.prenom || ""} ${cvData.profil.nom || ""}`.trim();
        sections.push(
            new Paragraph({
                text: fullName,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            })
        );
    }

    if (cvData.profil?.titre_principal) {
        sections.push(
            new Paragraph({
                text: cvData.profil.titre_principal,
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
            })
        );
    }

    // Contact section
    const contactItems: string[] = [];
    if (cvData.profil?.email) contactItems.push(`Email: ${cvData.profil.email}`);
    if (cvData.profil?.telephone) contactItems.push(`Téléphone: ${cvData.profil.telephone}`);
    if (cvData.profil?.linkedin) contactItems.push(`LinkedIn: ${cvData.profil.linkedin}`);
    if (cvData.profil?.localisation) contactItems.push(`Localisation: ${cvData.profil.localisation}`);

    if (contactItems.length > 0) {
        sections.push(
            new Paragraph({
                text: contactItems.join(" | "),
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            })
        );
    }

    // Elevator pitch
    if (cvData.profil?.elevator_pitch) {
        sections.push(
            new Paragraph({
                text: "Profil",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            })
        );
        sections.push(
            new Paragraph({
                text: cvData.profil.elevator_pitch,
                spacing: { after: 400 },
            })
        );
    }

    // Expériences
    if (cvData.experiences && cvData.experiences.length > 0) {
        sections.push(
            new Paragraph({
                text: "Expériences Professionnelles",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            })
        );

        for (const exp of cvData.experiences) {
            // Poste @ Entreprise
            const title = `${exp.poste || ""}${exp.entreprise ? ` @ ${exp.entreprise}` : ""}`;
            sections.push(
                new Paragraph({
                    text: title,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                })
            );

            // Dates
            const dates = exp.date_debut
                ? `${exp.date_debut}${exp.date_fin ? ` - ${exp.date_fin}` : " - Actuel"}`
                : "";
            if (dates) {
                sections.push(
                    new Paragraph({
                        text: dates,
                        spacing: { after: 100 },
                    })
                );
            }

            // Réalisations
            if (exp.realisations && exp.realisations.length > 0) {
                for (const real of exp.realisations) {
                    const realText = typeof real === "string" ? real : (real as any).description || "";
                    if (realText) {
                        sections.push(
                            new Paragraph({
                                text: realText,
                                bullet: {
                                    level: 0,
                                },
                                spacing: { after: 100 },
                            })
                        );
                    }
                }
            }
        }
    }

    // Compétences
    if (cvData.competences) {
        sections.push(
            new Paragraph({
                text: "Compétences",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            })
        );

        if (cvData.competences.techniques && cvData.competences.techniques.length > 0) {
            sections.push(
                new Paragraph({
                    text: "Techniques",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                })
            );
            const techText = cvData.competences.techniques.join(", ");
            sections.push(
                new Paragraph({
                    text: techText,
                    spacing: { after: 200 },
                })
            );
        }

        if (cvData.competences.soft_skills && cvData.competences.soft_skills.length > 0) {
            sections.push(
                new Paragraph({
                    text: "Soft Skills",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                })
            );
            const softText = cvData.competences.soft_skills.join(", ");
            sections.push(
                new Paragraph({
                    text: softText,
                    spacing: { after: 200 },
                })
            );
        }
    }

    // Formations
    if (cvData.formations && cvData.formations.length > 0) {
        sections.push(
            new Paragraph({
                text: "Formations",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            })
        );

        for (const form of cvData.formations) {
            const formText = `${form.diplome || ""}${form.etablissement ? ` - ${form.etablissement}` : ""}${form.annee ? ` (${form.annee})` : ""}`;
            if (formText.trim()) {
                sections.push(
                    new Paragraph({
                        text: formText.trim(),
                        spacing: { after: 100 },
                    })
                );
            }
        }
    }

    // Create document
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: sections,
            },
        ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
}
