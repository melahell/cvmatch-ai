/**
 * Template Chikorita - Inspiré de Reactive Resume
 * 
 * Design frais et moderne avec accents colorés
 * Layout: Header avec gradient + Two columns body
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function ChikoritaTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = {
        primary: CV_THEME_VARS.primary,
        secondary: CV_THEME_VARS.sidebarAccent,
        text: CV_THEME_VARS.text,
        muted: CV_THEME_VARS.muted,
        background: CV_THEME_VARS.background,
        primary08: CV_THEME_VARS.primaryA08,
        primary10: CV_THEME_VARS.primaryA10,
        primary15: CV_THEME_VARS.primaryLight,
        primary40: CV_THEME_VARS.primaryA40,
        secondary10: "color-mix(in srgb, var(--cv-sidebar-accent) 6.25%, transparent)",
    };
    const padding = dense ? "px-5 py-4" : "px-8 py-6";
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
            {/* HEADER avec gradient */}
            <header
                className={`${padding} pb-8`}
                style={{
                    background: `linear-gradient(135deg, ${colors.primary15} 0%, ${colors.secondary10} 100%)`,
                    borderBottom: `3px solid ${colors.primary}`
                }}
            >
                <div className="flex items-center gap-6">
                    {/* Photo */}
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={fullName}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="md"
                            borderColor={colors.primary}
                            shape="rounded"
                            className="shadow-md"
                        />
                    )}

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-1">{fullName}</h1>
                        {titre && (
                            <h2 className="text-lg font-medium" style={{ color: colors.primary }}>
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
                            className="flex flex-wrap gap-4 mt-3 text-sm"
                        />
                    </div>
                </div>

                {/* Pitch en dessous du header */}
                {profil.elevator_pitch && (
                    <p className={`mt-5 ${textSize} text-gray-600 leading-relaxed max-w-3xl`}>
                        {sanitizeText(profil.elevator_pitch)}
                    </p>
                )}
            </header>

            {/* CONTENT - Two columns */}
            <div className={`${padding} flex gap-8`}>
                {/* MAIN (2/3) */}
                <main className="flex-1 space-y-6">
                    {/* Expériences */}
                    {experiences.length > 0 && (
                        <section>
                            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-1 rounded" style={{ backgroundColor: colors.primary }} />
                                Expérience Professionnelle
                            </h2>
                            <div className="space-y-5">
                                {experiences.map((exp: any, idx: number) => (
                                    <article key={idx} className="pl-4 border-l-2" style={{ borderColor: colors.primary40 }}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h3 className="font-bold">{sanitizeText(exp.poste)}</h3>
                                                <p className="font-medium text-sm" style={{ color: colors.secondary }}>
                                                    {sanitizeText(exp.entreprise)}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500 shrink-0 px-2 py-0.5 rounded" style={{ backgroundColor: colors.primary10 }}>
                                                {exp.date_debut}{exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}
                                            </span>
                                        </div>

                                        {exp.realisations && exp.realisations.length > 0 && (
                                            <ul className={`mt-2 space-y-1 ${textSize} text-gray-600`}>
                                                {exp.realisations.slice(0, 4).map((real: string, ridx: number) => (
                                                    <li key={ridx} className="flex items-start gap-2">
                                                        <span style={{ color: colors.primary }}>▸</span>
                                                        <span>{sanitizeText(real)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {exp.clients && exp.clients.length > 0 && (
                                            <p className="mt-1.5 text-xs text-gray-500">
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
                            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-1 rounded" style={{ backgroundColor: colors.primary }} />
                                Projets
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {projects.slice(0, 4).map((proj: any, idx: number) => (
                                    <article key={idx} className="p-3 rounded-lg" style={{ backgroundColor: colors.primary08 }}>
                                        <h3 className="font-semibold text-sm">{sanitizeText(proj.nom)}</h3>
                                        {proj.description && (
                                            <p className="text-xs text-gray-600 mt-1">{sanitizeText(proj.description)}</p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* SIDEBAR (1/3) */}
                <aside className="w-1/3 space-y-5">
                    {/* Compétences */}
                    {allSkills.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span className="w-4 h-1 rounded" style={{ backgroundColor: colors.primary }} />
                                Compétences
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {allSkills.slice(0, 12).map((skill: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: colors.primary15, color: colors.secondary }}>
                                        {sanitizeText(skill)}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span className="w-4 h-1 rounded" style={{ backgroundColor: colors.primary }} />
                                Formation
                            </h3>
                            <div className="space-y-2.5">
                                {formations.map((form: any, idx: number) => (
                                    <article key={idx}>
                                        <h4 className="font-semibold text-xs">{sanitizeText(form.diplome)}</h4>
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
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span className="w-4 h-1 rounded" style={{ backgroundColor: colors.primary }} />
                                Langues
                            </h3>
                            <div className="space-y-2">
                                {langues.map((lang: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-xs font-medium">{lang.langue}</span>
                                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.primary15, color: colors.secondary }}>
                                            {lang.niveau}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span className="w-4 h-1 rounded" style={{ backgroundColor: colors.primary }} />
                                Certifications
                            </h3>
                            <ul className="space-y-1 text-xs">
                                {certifications.slice(0, 5).map((cert: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span style={{ color: colors.primary }}>✓</span>
                                        {sanitizeText(cert)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Références clients */}
                    {clientsReferences?.clients && clientsReferences.clients.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span className="w-4 h-1 rounded" style={{ backgroundColor: colors.primary }} />
                                Clients
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {clientsReferences.clients.slice(0, 6).map((client: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 rounded text-xs border" style={{ borderColor: colors.primary }}>
                                        {client}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}
