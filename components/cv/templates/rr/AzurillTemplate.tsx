/**
 * Template Azurill - Inspiré de Reactive Resume
 * 
 * Design centré avec photo au centre, layout timeline
 * Layout: Header centré + Sidebar/Main avec decorations
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { CVData, TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";

interface AzurillColors {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    background: string;
}

const defaultColors: AzurillColors = {
    primary: "#3b82f6",  // Bleu vif
    secondary: "#1d4ed8",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
};

export default function AzurillTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = defaultColors;
    const padding = dense ? "px-6 py-4" : "px-8 py-6";
    const gap = dense ? "gap-3" : "gap-5";
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
            style={{
                fontFamily: "var(--cv-font-body)",
                color: colors.text,
            }}
        >
            {/* HEADER Centré */}
            <header className={`${padding} flex flex-col items-center text-center border-b-4`} style={{ borderColor: colors.primary }}>
                {/* Photo centrée */}
                    {includePhoto && (
                        <div className="mb-4">
                            <ProfilePicture
                                photoUrl={profil.photo_url}
                                fullName={fullName}
                                initials={initials}
                                includePhoto={includePhoto}
                                size="md"
                                borderColor={colors.primary}
                            />
                        </div>
                    )}

                {/* Nom et titre */}
                <h1 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
                    {fullName}
                </h1>
                {titre && (
                    <h2 className="text-lg mb-4" style={{ color: colors.primary }}>
                        {sanitizeText(titre)}
                    </h2>
                )}

                <ContactInfo
                    email={profil.email}
                    telephone={profil.telephone}
                    localisation={profil.localisation}
                    linkedin={profil.linkedin}
                    github={profil.github}
                    portfolio={profil.portfolio}
                    layout="inline"
                    textColor={colors.muted}
                    iconColor={colors.primary}
                    className="flex flex-wrap justify-center gap-4 text-sm"
                />
            </header>

            {/* LAYOUT: Sidebar + Main */}
            <div className="flex">
                {/* SIDEBAR */}
                <aside className="w-1/3 p-6 bg-gray-50" style={{ backgroundColor: `${colors.primary}08` }}>
                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <section className="mb-6">
                            <h3 className="text-sm font-bold uppercase mb-2 flex items-center gap-2" style={{ color: colors.primary }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                                Profil
                            </h3>
                            <p className={`${textSize} text-gray-600 leading-relaxed`}>
                                {sanitizeText(profil.elevator_pitch)}
                            </p>
                        </section>
                    )}

                    {/* Compétences */}
                    {allSkills.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                                Compétences
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {allSkills.slice(0, 15).map((skill: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className={`px-2 py-1 rounded ${textSize}`}
                                        style={{
                                            backgroundColor: `${colors.primary}15`,
                                            color: colors.secondary,
                                        }}
                                    >
                                        {sanitizeText(skill)}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                                Langues
                            </h3>
                            <div className="space-y-2">
                                {langues.map((lang: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className={`${textSize} font-medium`}>{lang.langue}</span>
                                        <span className={`${textSize} px-2 py-0.5 rounded`} style={{ backgroundColor: `${colors.primary}15`, color: colors.secondary }}>
                                            {lang.niveau}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                                Formation
                            </h3>
                            <div className="space-y-3">
                                {formations.map((form: any, idx: number) => (
                                    <article key={idx}>
                                        <h4 className={`font-semibold ${textSize}`}>{sanitizeText(form.diplome)}</h4>
                                        <p className={`${textSize} text-gray-600`}>{sanitizeText(form.etablissement)}</p>
                                        <p className={`${textSize} text-gray-400`}>{form.annee}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2" style={{ color: colors.primary }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                                Certifications
                            </h3>
                            <ul className={`space-y-1 ${textSize}`}>
                                {certifications.slice(0, 5).map((cert: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span style={{ color: colors.primary }}>✓</span>
                                        {sanitizeText(cert)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </aside>

                {/* MAIN - Timeline */}
                <main className={`flex-1 ${padding}`}>
                    {/* Expériences */}
                    {experiences.length > 0 && (
                        <section className="mb-6">
                            <h2 className="text-lg font-bold mb-4 pb-2 border-b-2" style={{ borderColor: colors.primary, color: colors.text }}>
                                Expérience Professionnelle
                            </h2>
                            <div className="space-y-5">
                                {experiences.map((exp: any, idx: number) => (
                                    <article
                                        key={idx}
                                        className="relative pl-6 border-l-2"
                                        style={{ borderColor: `${colors.primary}40` }}
                                    >
                                        {/* Timeline dot */}
                                        <span
                                            className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white"
                                            style={{ borderColor: colors.primary }}
                                        />

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-base">{sanitizeText(exp.poste)}</h3>
                                                <p className="font-semibold" style={{ color: colors.primary }}>
                                                    {sanitizeText(exp.entreprise)}
                                                </p>
                                            </div>
                                            <span className={`${textSize} text-gray-500`}>
                                                {exp.date_debut}{exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}
                                            </span>
                                        </div>

                                        {exp.realisations && exp.realisations.length > 0 && (
                                            <ul className={`space-y-1.5 ${textSize} text-gray-600`}>
                                                {exp.realisations.slice(0, 4).map((real: string, ridx: number) => (
                                                    <li key={ridx} className="flex items-start gap-2">
                                                        <span style={{ color: colors.primary }}>▸</span>
                                                        <span>{sanitizeText(real)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {exp.clients && exp.clients.length > 0 && (
                                            <p className={`mt-2 ${textSize} text-gray-500`}>
                                                <span className="font-medium">Clients : </span>
                                                {exp.clients.slice(0, 4).join(", ")}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projets */}
                    {projects.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold mb-4 pb-2 border-b-2" style={{ borderColor: colors.primary, color: colors.text }}>
                                Projets
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {projects.slice(0, 4).map((proj: any, idx: number) => (
                                    <article
                                        key={idx}
                                        className="p-3 rounded-lg border"
                                        style={{ borderColor: `${colors.primary}30` }}
                                    >
                                        <h3 className="font-bold text-sm mb-1">{sanitizeText(proj.nom)}</h3>
                                        {proj.description && (
                                            <p className={`${textSize} text-gray-600 mb-2`}>
                                                {sanitizeText(proj.description)}
                                            </p>
                                        )}
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {proj.technologies.slice(0, 4).map((tech: string, tidx: number) => (
                                                    <span
                                                        key={tidx}
                                                        className="px-1.5 py-0.5 text-xs rounded"
                                                        style={{ backgroundColor: `${colors.primary}15`, color: colors.secondary }}
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Références clients */}
                    {clientsReferences?.clients && clientsReferences.clients.length > 0 && (
                        <section className="mt-6">
                            <h2 className="text-lg font-bold mb-3 pb-2 border-b-2" style={{ borderColor: colors.primary, color: colors.text }}>
                                Clients Références
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {clientsReferences.clients.slice(0, 10).map((client: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className={`px-3 py-1 rounded-full ${textSize} border`}
                                        style={{ borderColor: colors.primary, color: colors.text }}
                                    >
                                        {client}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
