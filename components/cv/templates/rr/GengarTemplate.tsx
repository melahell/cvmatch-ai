/**
 * Template Gengar - Sidebar avec header intégré
 *
 * Layout UNIQUE : La sidebar colorée contient le header (nom, photo, contact)
 * dans un bloc de couleur primaire, puis les skills/langues/certifications
 * dans un fond sombre contrasté. Le main reste blanc et aéré.
 *
 * Inspiré de Reactive Resume (Gengar/Ditgar pattern)
 * MIT License - https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function GengarTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const c = {
        primary: CV_THEME_VARS.primary,
        accent: CV_THEME_VARS.sidebarAccent,
        text: CV_THEME_VARS.text,
        muted: CV_THEME_VARS.muted,
        bg: CV_THEME_VARS.background,
        sidebarBg: CV_THEME_VARS.sidebarBg,
        sidebarText: CV_THEME_VARS.sidebarText,
        p10: CV_THEME_VARS.primaryA10,
        p20: CV_THEME_VARS.primaryA20,
        p30: CV_THEME_VARS.primaryA30,
    };
    const sp = dense ? "p-4" : "p-5";
    const ts = dense ? "text-xs" : "text-sm";

    const profil = data.profil || {};
    const experiences = data.experiences || [];
    const formations = data.formations || [];
    const comp = data.competences || { techniques: [], soft_skills: [] };
    const langues = data.langues || [];
    const certifications = data.certifications || [];
    const projects = data.projects || [];
    const clients = data.clients_references;

    const name = `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Nom Prénom";
    const initials = `${(profil.prenom || "N")[0]}${(profil.nom || "P")[0]}`.toUpperCase();
    const titre = profil.titre_principal || "";

    const techSkills = Array.isArray(comp) ? comp.map((s: any) => s.nom || s.name || s).filter(Boolean) : comp.techniques || [];
    const softSkills = Array.isArray(comp) ? [] : comp.soft_skills || [];

    return (
        <div
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white flex mx-auto"
            style={{ fontFamily: "var(--cv-font-body)", color: c.text }}
        >
            {/* ─── SIDEBAR (1/3) ─── */}
            <aside className="w-[35%] flex flex-col" style={{ backgroundColor: c.sidebarBg }}>
                {/* Header block - primary color bg */}
                <div className={`${sp} pb-6`} style={{ backgroundColor: c.primary }}>
                    {includePhoto && (
                        <div className="flex justify-center mb-4">
                            <ProfilePicture
                                photoUrl={profil.photo_url}
                                fullName={name}
                                initials={initials}
                                includePhoto={includePhoto}
                                size="md"
                                borderColor="rgba(255,255,255,0.4)"
                                shape="rounded"
                            />
                        </div>
                    )}
                    <h1 className="text-xl font-bold text-white text-center leading-tight">{name}</h1>
                    {titre && (
                        <p className="text-xs text-white/80 text-center mt-1">{sanitizeText(titre)}</p>
                    )}
                </div>

                {/* Contact - transition zone */}
                <div className={`${sp} py-3`} style={{ backgroundColor: c.primary, opacity: 0.85 }}>
                    <ContactInfo
                        email={profil.email}
                        telephone={profil.telephone}
                        localisation={profil.localisation}
                        linkedin={profil.linkedin}
                        github={profil.github}
                        portfolio={profil.portfolio}
                        layout="vertical"
                        textColor="rgba(255,255,255,0.85)"
                        iconColor="rgba(255,255,255,0.7)"
                        className="space-y-1.5 text-xs"
                    />
                </div>

                {/* Sidebar content - dark bg */}
                <div className={`${sp} flex-1 space-y-5`} style={{ color: c.sidebarText }}>
                    {/* Technical Skills */}
                    {techSkills.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/20">
                                Compétences
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {techSkills.slice(0, 10).map((skill: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/10">
                                        {sanitizeText(skill)}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Soft Skills */}
                    {softSkills.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/20">
                                Savoir-être
                            </h3>
                            <ul className="space-y-1 text-xs">
                                {softSkills.slice(0, 6).map((skill: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: c.accent }} />
                                        {sanitizeText(skill)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Languages */}
                    {langues.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/20">
                                Langues
                            </h3>
                            <div className="space-y-2">
                                {langues.map((l: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <span>{l.langue}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-white/15 text-[10px]">{l.niveau}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/20">
                                Formation
                            </h3>
                            <div className="space-y-2">
                                {formations.map((f: any, i: number) => (
                                    <div key={i}>
                                        <p className="text-xs font-semibold">{sanitizeText(f.diplome)}</p>
                                        <p className="text-[10px] opacity-70">{sanitizeText(f.etablissement)}</p>
                                        {f.annee && <p className="text-[10px] opacity-50">{f.annee}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/20">
                                Certifications
                            </h3>
                            <ul className="space-y-1 text-xs">
                                {certifications.slice(0, 5).map((cert: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                        <span style={{ color: c.accent }}>✓</span>
                                        {sanitizeText(cert)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </aside>

            {/* ─── MAIN (2/3) ─── */}
            <main className={`flex-1 ${sp} space-y-5`}>
                {/* Elevator pitch - highlighted box */}
                {profil.elevator_pitch && (
                    <blockquote className="p-4 rounded-lg border-l-4" style={{ backgroundColor: c.p10, borderColor: c.primary }}>
                        <p className={`${ts} text-gray-700 italic leading-relaxed`}>
                            {sanitizeText(profil.elevator_pitch)}
                        </p>
                    </blockquote>
                )}

                {/* Experiences */}
                {experiences.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wide mb-4 pb-1.5 border-b-2" style={{ color: c.primary, borderColor: c.primary }}>
                            Expérience Professionnelle
                        </h2>
                        <div className="space-y-4">
                            {experiences.map((exp: any, i: number) => (
                                <article key={i}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-sm">{sanitizeText(exp.poste)}</h3>
                                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                            {exp.date_debut}{exp.date_fin ? ` — ${exp.date_fin}` : " — Présent"}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium mb-1.5" style={{ color: c.accent }}>
                                        {sanitizeText(exp.entreprise)}{exp.lieu ? ` · ${exp.lieu}` : ""}
                                    </p>
                                    {exp.realisations?.length > 0 && (
                                        <ul className={`space-y-0.5 ${ts} text-gray-600`}>
                                            {exp.realisations.slice(0, 5).map((r: string, ri: number) => (
                                                <li key={ri} className="flex items-start gap-1.5">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: c.primary }} />
                                                    <span>{sanitizeText(r)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {exp.clients?.length > 0 && (
                                        <p className="mt-1 text-[10px] text-gray-400">
                                            Clients : {exp.clients.slice(0, 4).join(", ")}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1.5 border-b-2" style={{ color: c.primary, borderColor: c.primary }}>
                            Projets
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {projects.slice(0, 4).map((p: any, i: number) => (
                                <div key={i} className="p-2.5 rounded border" style={{ borderColor: c.p30 }}>
                                    <h3 className="font-semibold text-xs">{sanitizeText(p.nom)}</h3>
                                    {p.description && <p className="text-[10px] text-gray-500 mt-0.5">{sanitizeText(p.description)}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Client References */}
                {clients?.clients && clients.clients.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1.5 border-b-2" style={{ color: c.primary, borderColor: c.primary }}>
                            Références Clients
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {clients.clients.slice(0, 8).map((cl: string, i: number) => (
                                <span key={i} className="px-2.5 py-1 rounded-full text-xs border" style={{ borderColor: c.primary }}>
                                    {cl}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
