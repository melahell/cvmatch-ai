/**
 * Template Rhyhorn - Inspiré de Reactive Resume
 * 
 * Design robuste avec accents gris/pierre
 * Layout: Header compact + Full width sections
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { CVData, TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";

interface RhyhornColors {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    background: string;
}

const defaultColors: RhyhornColors = {
    primary: "#64748b",  // Gris ardoise
    secondary: "#475569",
    text: "#1e293b",
    muted: "#64748b",
    background: "#ffffff",
};

export default function RhyhornTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = defaultColors;
    const padding = dense ? "px-6 py-4" : "px-8 py-6";
    const textSize = dense ? "text-xs" : "text-sm";

    // Safe accessors
    const profil = data.profil || {};
    const experiences = data.experiences || [];
    const formations = data.formations || [];
    const competences = data.competences || { techniques: [], soft_skills: [] };
    const langues = data.langues || [];
    const certifications = data.certifications || [];
    const projects = data.projects || [];
    const clientsReferences = data.clients_references;

    const fullName = `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Nom Prénom";
    const initials = `${(profil.prenom || "N").charAt(0)}${(profil.nom || "P").charAt(0)}`.toUpperCase();
    const titre = profil.titre_principal || "";

    const technicalSkills = Array.isArray(competences)
        ? competences.map((c: any) => c.nom || c.name || c).filter(Boolean)
        : competences.techniques || [];
    const softSkills = Array.isArray(competences)
        ? []
        : competences.soft_skills || [];
    const allSkills = [...technicalSkills, ...softSkills];

    return (
        <div
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto"
            style={{ fontFamily: "var(--cv-font-body)", color: colors.text }}
        >
            {/* HEADER compact */}
            <header className={`${padding} bg-slate-50 border-b-4`} style={{ borderColor: colors.primary }}>
                <div className="flex items-center gap-6">
                    {/* Photo */}
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={fullName}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="sm"
                            borderColor={colors.primary}
                            shape="square"
                        />
                    )}

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
                        {titre && (
                            <h2 className="text-base font-medium" style={{ color: colors.secondary }}>
                                {sanitizeText(titre)}
                            </h2>
                        )}
                    </div>

                    {/* Contact à droite */}
                    <ContactInfo
                        email={profil.email}
                        telephone={profil.telephone}
                        localisation={profil.localisation}
                        linkedin={profil.linkedin}
                        github={profil.github}
                        portfolio={profil.portfolio}
                        layout="vertical"
                        showIcons={false}
                        textColor={colors.muted}
                        className="text-right text-xs space-y-1"
                    />
                </div>
            </header>

            {/* CONTENT */}
            <main className={`${padding} space-y-5`}>
                {/* Pitch */}
                {profil.elevator_pitch && (
                    <section className="bg-slate-50 p-4 rounded border-l-4" style={{ borderColor: colors.primary }}>
                        <p className={`${textSize} text-gray-700`}>
                            {sanitizeText(profil.elevator_pitch)}
                        </p>
                    </section>
                )}

                {/* Compétences - Horizontal Bar */}
                {allSkills.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase mb-3 tracking-wide" style={{ color: colors.primary }}>
                            Compétences
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {allSkills.slice(0, 16).map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 rounded text-xs font-medium bg-slate-100" style={{ color: colors.secondary }}>
                                    {sanitizeText(skill)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Expériences */}
                {experiences.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase mb-4 tracking-wide" style={{ color: colors.primary }}>
                            Expérience Professionnelle
                        </h2>
                        <div className="space-y-4">
                            {experiences.map((exp: any, idx: number) => (
                                <article key={idx} className="bg-slate-50 p-4 rounded">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold">{sanitizeText(exp.poste)}</h3>
                                            <p className="font-medium text-sm" style={{ color: colors.secondary }}>
                                                {sanitizeText(exp.entreprise)}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500 shrink-0 bg-white px-2 py-1 rounded">
                                            {exp.date_debut}{exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}
                                        </span>
                                    </div>

                                    {exp.realisations && exp.realisations.length > 0 && (
                                        <ul className={`space-y-1 ${textSize} text-gray-600`}>
                                            {exp.realisations.slice(0, 4).map((real: string, ridx: number) => (
                                                <li key={ridx} className="flex items-start gap-2">
                                                    <span style={{ color: colors.secondary }}>▪</span>
                                                    <span>{sanitizeText(real)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {exp.clients && exp.clients.length > 0 && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            <span className="font-medium">Clients : </span>
                                            {exp.clients.slice(0, 4).join(", ")}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Grid: Formation + Langues + Certifications */}
                <div className="grid grid-cols-3 gap-5">
                    {/* Formations */}
                    {formations.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase mb-3 tracking-wide" style={{ color: colors.primary }}>
                                Formation
                            </h2>
                            <div className="space-y-2.5">
                                {formations.map((form: any, idx: number) => (
                                    <article key={idx}>
                                        <h3 className="font-semibold text-xs">{sanitizeText(form.diplome)}</h3>
                                        <p className="text-xs text-gray-600">{sanitizeText(form.etablissement)}</p>
                                        <p className="text-xs text-gray-400">{form.annee}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase mb-3 tracking-wide" style={{ color: colors.primary }}>
                                Langues
                            </h2>
                            <div className="space-y-2">
                                {langues.map((lang: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-xs font-medium">{lang.langue}</span>
                                        <span className="text-xs text-gray-500">{lang.niveau}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase mb-3 tracking-wide" style={{ color: colors.primary }}>
                                Certifications
                            </h2>
                            <ul className="space-y-1 text-xs">
                                {certifications.slice(0, 5).map((cert: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span style={{ color: colors.secondary }}>✓</span>
                                        {sanitizeText(cert)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                {/* Projets + Clients */}
                <div className="grid grid-cols-2 gap-5">
                    {/* Projets */}
                    {projects.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase mb-3 tracking-wide" style={{ color: colors.primary }}>
                                Projets
                            </h2>
                            <div className="space-y-2">
                                {projects.slice(0, 3).map((proj: any, idx: number) => (
                                    <article key={idx} className="bg-slate-50 p-3 rounded">
                                        <h3 className="font-semibold text-xs">{sanitizeText(proj.nom)}</h3>
                                        {proj.description && (
                                            <p className="text-xs text-gray-600 mt-1">{sanitizeText(proj.description)}</p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Références clients */}
                    {clientsReferences?.clients && clientsReferences.clients.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase mb-3 tracking-wide" style={{ color: colors.primary }}>
                                Clients Références
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {clientsReferences.clients.slice(0, 8).map((client: string, idx: number) => (
                                    <span key={idx} className="px-2.5 py-1 rounded text-xs bg-slate-100" style={{ color: colors.secondary }}>
                                        {client}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
