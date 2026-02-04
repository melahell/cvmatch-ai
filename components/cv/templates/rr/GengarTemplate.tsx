/**
 * Template Gengar - Inspiré de Reactive Resume
 * 
 * Design sombre avec sidebar colorée et header compact
 * Layout: Sidebar avec fond + Main content
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function GengarTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = {
        primary: CV_THEME_VARS.primary,
        secondary: CV_THEME_VARS.sidebarAccent,
        text: CV_THEME_VARS.text,
        muted: CV_THEME_VARS.muted,
        background: CV_THEME_VARS.background,
        sidebarBg: CV_THEME_VARS.sidebarBg,
        primary10: CV_THEME_VARS.primaryA10,
        primary20: CV_THEME_VARS.primaryA20,
        primary30: CV_THEME_VARS.primaryA30,
    };
    const padding = dense ? "px-5 py-4" : "px-6 py-5";
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
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white flex mx-auto"
            style={{
                fontFamily: "var(--cv-font-body)",
                color: colors.text,
            }}
        >
            {/* SIDEBAR avec fond coloré */}
            <aside
                className="w-1/3 flex flex-col"
                style={{ backgroundColor: colors.sidebarBg }}
            >
                {/* Header dans sidebar */}
                <div
                    className={`${padding} text-white`}
                    style={{ backgroundColor: colors.primary }}
                >
                    {/* Photo */}
                    {includePhoto && (
                        <div className="mb-4">
                            <ProfilePicture
                                photoUrl={profil.photo_url}
                                fullName={fullName}
                                initials={initials}
                                includePhoto={includePhoto}
                                size="md"
                                borderColor="#ffffff"
                                shape="rounded"
                            />
                        </div>
                    )}

                    <h1 className="text-xl font-bold mb-1">{fullName}</h1>
                    {titre && (
                        <h2 className="text-sm text-white/90">
                            {sanitizeText(titre)}
                        </h2>
                    )}

                    {/* Contact */}
                    <ContactInfo
                        email={profil.email}
                        telephone={profil.telephone}
                        localisation={profil.localisation}
                        linkedin={profil.linkedin}
                        github={profil.github}
                        portfolio={profil.portfolio}
                        layout="vertical"
                        textColor="rgba(255,255,255,0.8)"
                        iconColor="rgba(255,255,255,0.8)"
                        className="mt-4 space-y-1.5 text-xs"
                    />
                </div>

                {/* Sidebar content */}
                <div className={`${padding} flex-1 space-y-5`}>
                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <section>
                            <h3 className="text-xs font-bold uppercase mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Profil
                            </h3>
                            <p className={`${textSize} text-gray-600 leading-relaxed`}>
                                {sanitizeText(profil.elevator_pitch)}
                            </p>
                        </section>
                    )}

                    {/* Compétences */}
                    {allSkills.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Compétences
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {allSkills.slice(0, 12).map((skill: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className={`px-2 py-0.5 rounded text-xs`}
                                        style={{ backgroundColor: colors.primary20, color: colors.secondary }}
                                    >
                                        {sanitizeText(skill)}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Langues
                            </h3>
                            <div className="space-y-1.5">
                                {langues.map((lang: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className={`${textSize} font-medium`}>{lang.langue}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded`} style={{ backgroundColor: colors.primary20, color: colors.secondary }}>
                                            {lang.niveau}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Formation
                            </h3>
                            <div className="space-y-2">
                                {formations.map((form: any, idx: number) => (
                                    <article key={idx}>
                                        <h4 className={`font-semibold ${textSize}`}>{sanitizeText(form.diplome)}</h4>
                                        <p className="text-xs text-gray-600">{sanitizeText(form.etablissement)}</p>
                                        <p className="text-xs text-gray-400">{form.annee}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase mb-2 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
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
                </div>
            </aside>

            {/* MAIN */}
            <main className={`flex-1 ${padding}`}>
                {/* Pitch en highlight */}
                {profil.elevator_pitch && (
                    <section
                        className="mb-5 p-4 rounded-lg"
                        style={{ backgroundColor: colors.primary10 }}
                    >
                        <p className={`${textSize} text-gray-700 italic`}>
                            "{sanitizeText(profil.elevator_pitch)}"
                        </p>
                    </section>
                )}

                {/* Expériences */}
                {experiences.length > 0 && (
                    <section className="mb-5">
                        <h2 className="text-base font-bold uppercase mb-4 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                            Expérience Professionnelle
                        </h2>
                        <div className="space-y-4">
                            {experiences.map((exp: any, idx: number) => (
                                <article key={idx}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="font-bold">{sanitizeText(exp.poste)}</h3>
                                            <p className="font-medium text-sm" style={{ color: colors.secondary }}>
                                                {sanitizeText(exp.entreprise)}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500 shrink-0">
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
                                        <p className={`mt-1.5 text-xs text-gray-500`}>
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
                    <section className="mb-5">
                        <h2 className="text-base font-bold uppercase mb-3 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                            Projets
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {projects.slice(0, 4).map((proj: any, idx: number) => (
                                <article key={idx} className="p-3 rounded border" style={{ borderColor: colors.primary30 }}>
                                    <h3 className="font-semibold text-sm">{sanitizeText(proj.nom)}</h3>
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
                        <h2 className="text-base font-bold uppercase mb-3 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                            Clients Références
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {clientsReferences.clients.slice(0, 8).map((client: string, idx: number) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-1 rounded-full text-xs border"
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
    );
}
