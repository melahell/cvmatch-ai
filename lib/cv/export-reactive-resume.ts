/**
 * Export Reactive Resume JSON
 *
 * [AUDIT FIX MOYEN-8] : Convertit notre format CV en format compatible Reactive Resume
 * Permet l'interopérabilité avec https://github.com/amruthpillai/reactive-resume
 *
 * Format Reactive Resume v4 basé sur le schéma officiel:
 * https://docs.rxresu.me/schema/overview
 */

import type { RendererResumeSchema } from "./renderer-schema";
import { v4 as uuidv4 } from "uuid";

/**
 * Schéma Reactive Resume simplifié (v4)
 */
export interface ReactiveResumeSchema {
    basics: {
        name: string;
        headline: string;
        email: string;
        phone: string;
        location: string;
        url?: {
            label: string;
            href: string;
        };
        customFields?: Array<{
            id: string;
            icon: string;
            name: string;
            value: string;
        }>;
        picture?: {
            url: string;
            size: number;
            aspectRatio: number;
            borderRadius: number;
            effects: {
                hidden: boolean;
                border: boolean;
                grayscale: boolean;
            };
        };
    };
    sections: {
        summary: {
            name: string;
            columns: number;
            separateLinks: boolean;
            visible: boolean;
            id: string;
            content: string;
        };
        experience: {
            name: string;
            columns: number;
            separateLinks: boolean;
            visible: boolean;
            id: string;
            items: Array<{
                id: string;
                visible: boolean;
                company: string;
                position: string;
                location: string;
                date: string;
                summary: string;
                url?: {
                    label: string;
                    href: string;
                };
            }>;
        };
        education: {
            name: string;
            columns: number;
            separateLinks: boolean;
            visible: boolean;
            id: string;
            items: Array<{
                id: string;
                visible: boolean;
                institution: string;
                studyType: string;
                area: string;
                score: string;
                date: string;
                summary: string;
                url?: {
                    label: string;
                    href: string;
                };
            }>;
        };
        skills: {
            name: string;
            columns: number;
            separateLinks: boolean;
            visible: boolean;
            id: string;
            items: Array<{
                id: string;
                visible: boolean;
                name: string;
                description: string;
                level: number;
                keywords: string[];
            }>;
        };
        languages: {
            name: string;
            columns: number;
            separateLinks: boolean;
            visible: boolean;
            id: string;
            items: Array<{
                id: string;
                visible: boolean;
                name: string;
                description: string;
                level: number;
            }>;
        };
        certifications: {
            name: string;
            columns: number;
            separateLinks: boolean;
            visible: boolean;
            id: string;
            items: Array<{
                id: string;
                visible: boolean;
                name: string;
                issuer: string;
                date: string;
                summary: string;
                url?: {
                    label: string;
                    href: string;
                };
            }>;
        };
        references?: {
            name: string;
            columns: number;
            separateLinks: boolean;
            visible: boolean;
            id: string;
            items: Array<{
                id: string;
                visible: boolean;
                name: string;
                description: string;
                summary: string;
                url?: {
                    label: string;
                    href: string;
                };
            }>;
        };
    };
    metadata: {
        template: string;
        layout: string[][];
        css: {
            value: string;
            visible: boolean;
        };
        page: {
            margin: number;
            format: string;
            options: {
                breakLine: boolean;
                pageNumbers: boolean;
            };
        };
        theme: {
            background: string;
            text: string;
            primary: string;
        };
        typography: {
            font: {
                family: string;
                subset: string;
                variants: string[];
                size: number;
            };
            lineHeight: number;
            hideIcons: boolean;
            underlineLinks: boolean;
        };
        notes: string;
    };
}

/**
 * Convertit un niveau de langue texte en niveau numérique (0-5)
 */
function convertLanguageLevel(niveau: string): number {
    const lower = niveau.toLowerCase();
    if (lower.includes("natif") || lower.includes("native") || lower.includes("c2")) return 5;
    if (lower.includes("bilingue") || lower.includes("bilingual") || lower.includes("c1")) return 4;
    if (lower.includes("courant") || lower.includes("fluent") || lower.includes("b2")) return 3;
    if (lower.includes("intermédiaire") || lower.includes("intermediate") || lower.includes("b1")) return 2;
    if (lower.includes("débutant") || lower.includes("beginner") || lower.includes("a2") || lower.includes("a1")) return 1;
    return 2; // Par défaut intermédiaire
}

/**
 * Formate une date au format "Month Year" ou "Present"
 */
function formatDateRange(dateDebut?: string, dateFin?: string, actuel?: boolean): string {
    const months = [
        "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
        "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
    ];

    let start = "";
    if (dateDebut) {
        const [year, month] = dateDebut.split("-");
        const monthIdx = parseInt(month, 10) - 1;
        start = `${months[monthIdx] || month} ${year}`;
    }

    let end = "";
    if (actuel) {
        end = "Présent";
    } else if (dateFin) {
        const [year, month] = dateFin.split("-");
        const monthIdx = parseInt(month, 10) - 1;
        end = `${months[monthIdx] || month} ${year}`;
    }

    if (start && end) return `${start} - ${end}`;
    if (start) return `${start} - Présent`;
    return "";
}

/**
 * [AUDIT FIX MOYEN-8] : Convertit notre CVData en format Reactive Resume v4
 */
export function convertToReactiveResume(
    cvData: RendererResumeSchema,
    options?: {
        template?: string;
        includePhoto?: boolean;
        locale?: string;
    }
): ReactiveResumeSchema {
    const profil = cvData.profil || {};
    const template = options?.template || "rhyhorn";

    // Basics
    const basics: ReactiveResumeSchema["basics"] = {
        name: `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Candidat",
        headline: profil.titre_principal || "",
        email: profil.email || "",
        phone: profil.telephone || "",
        location: profil.localisation || "",
    };

    // LinkedIn comme URL
    if (profil.linkedin) {
        basics.url = {
            label: "LinkedIn",
            href: profil.linkedin.startsWith("http") ? profil.linkedin : `https://linkedin.com/in/${profil.linkedin}`,
        };
    }

    // Photo
    if (options?.includePhoto && profil.photo_url) {
        basics.picture = {
            url: profil.photo_url,
            size: 128,
            aspectRatio: 1,
            borderRadius: 0,
            effects: {
                hidden: false,
                border: false,
                grayscale: false,
            },
        };
    }

    // Sections
    const sections: ReactiveResumeSchema["sections"] = {
        summary: {
            name: "Résumé",
            columns: 1,
            separateLinks: true,
            visible: !!profil.elevator_pitch,
            id: "summary",
            content: profil.elevator_pitch || "",
        },
        experience: {
            name: "Expérience Professionnelle",
            columns: 1,
            separateLinks: true,
            visible: (cvData.experiences?.length || 0) > 0,
            id: "experience",
            items: (cvData.experiences || []).map((exp) => ({
                id: uuidv4(),
                visible: true,
                company: exp.entreprise || "",
                position: exp.poste || "",
                location: exp.lieu || "",
                date: formatDateRange(exp.date_debut, exp.date_fin, exp.actuel),
                summary: (exp.realisations || [])
                    .map((r) => {
                        const text = typeof r === "string" ? r : r.description || "";
                        return `• ${text}`;
                    })
                    .join("\n"),
            })),
        },
        education: {
            name: "Formation",
            columns: 1,
            separateLinks: true,
            visible: (cvData.formations?.length || 0) > 0,
            id: "education",
            items: (cvData.formations || []).map((f) => ({
                id: uuidv4(),
                visible: true,
                institution: f.etablissement || "",
                studyType: "",
                area: f.diplome || "",
                score: "",
                date: f.annee || "",
                summary: "",
            })),
        },
        skills: {
            name: "Compétences",
            columns: 2,
            separateLinks: true,
            visible: true,
            id: "skills",
            items: [
                // Compétences techniques
                ...(cvData.competences?.techniques || []).map((skill) => ({
                    id: uuidv4(),
                    visible: true,
                    name: typeof skill === "string" ? skill : skill.nom || "",
                    description: "",
                    level: 3,
                    keywords: [],
                })),
                // Soft skills
                ...(cvData.competences?.soft_skills || []).map((skill) => ({
                    id: uuidv4(),
                    visible: true,
                    name: typeof skill === "string" ? skill : skill.nom || "",
                    description: "Soft skill",
                    level: 3,
                    keywords: [],
                })),
            ],
        },
        languages: {
            name: "Langues",
            columns: 2,
            separateLinks: true,
            visible: (cvData.langues?.length || 0) > 0,
            id: "languages",
            items: (cvData.langues || []).map((l) => ({
                id: uuidv4(),
                visible: true,
                name: l.langue || "",
                description: l.niveau || "",
                level: convertLanguageLevel(l.niveau || ""),
            })),
        },
        certifications: {
            name: "Certifications",
            columns: 1,
            separateLinks: true,
            visible: (cvData.certifications?.length || 0) > 0,
            id: "certifications",
            items: (cvData.certifications || []).map((cert) => {
                const certStr = typeof cert === "string" ? cert : cert.nom || "";
                return {
                    id: uuidv4(),
                    visible: true,
                    name: certStr,
                    issuer: "",
                    date: "",
                    summary: "",
                };
            }),
        },
    };

    // Ajouter références clients si présentes
    if (cvData.clients_references?.clients && cvData.clients_references.clients.length > 0) {
        sections.references = {
            name: "Références Clients",
            columns: 2,
            separateLinks: true,
            visible: true,
            id: "references",
            items: cvData.clients_references.clients.map((client) => ({
                id: uuidv4(),
                visible: true,
                name: typeof client === "string" ? client : client.nom || "",
                description: typeof client === "object" && client.secteur ? client.secteur : "",
                summary: "",
            })),
        };
    }

    // Metadata
    const metadata: ReactiveResumeSchema["metadata"] = {
        template,
        layout: [
            ["summary", "experience", "education"],
            ["skills", "languages", "certifications", "references"],
        ],
        css: {
            value: "",
            visible: false,
        },
        page: {
            margin: 18,
            format: "a4",
            options: {
                breakLine: true,
                pageNumbers: true,
            },
        },
        theme: {
            background: "#ffffff",
            text: "#000000",
            primary: "#0066cc",
        },
        typography: {
            font: {
                family: "IBM Plex Sans",
                subset: "latin",
                variants: ["regular", "italic", "500", "700"],
                size: 14,
            },
            lineHeight: 1.5,
            hideIcons: false,
            underlineLinks: false,
        },
        notes: `Exporté depuis CVMatch AI - ${new Date().toISOString()}`,
    };

    return {
        basics,
        sections,
        metadata,
    };
}

/**
 * Exporte en JSON string formaté
 */
export function exportToReactiveResumeJSON(
    cvData: RendererResumeSchema,
    options?: {
        template?: string;
        includePhoto?: boolean;
        pretty?: boolean;
    }
): string {
    const rrData = convertToReactiveResume(cvData, options);
    return options?.pretty !== false
        ? JSON.stringify(rrData, null, 2)
        : JSON.stringify(rrData);
}

/**
 * Génère un fichier téléchargeable
 */
export function createReactiveResumeDownload(
    cvData: RendererResumeSchema,
    filename: string = "cv-reactive-resume.json"
): { blob: Blob; filename: string } {
    const json = exportToReactiveResumeJSON(cvData, { pretty: true });
    const blob = new Blob([json], { type: "application/json" });
    return { blob, filename };
}
