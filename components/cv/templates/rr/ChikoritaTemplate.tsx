/**
 * Template Chikorita - Sidebar DROITE avec fond coloré solide
 *
 * Layout UNIQUE : Header pleine largeur + body avec main à gauche (2/3)
 * et sidebar DROITE (1/3) sur fond coloré primaire avec texte inversé blanc.
 * Seul template avec sidebar à droite colorée.
 *
 * Inspiré de Reactive Resume (Chikorita pattern)
 * MIT License - https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function ChikoritaTemplate({ data, includePhoto = true, dense = false, displayLimits: dl }: TemplateProps) {
    const c = {
        primary: CV_THEME_VARS.primary,
        accent: CV_THEME_VARS.sidebarAccent,
        text: CV_THEME_VARS.text,
        muted: CV_THEME_VARS.muted,
        bg: CV_THEME_VARS.background,
        p10: CV_THEME_VARS.primaryA10,
        p20: CV_THEME_VARS.primaryA20,
    };
    const sp = dense ? "px-5 py-4" : "px-6 py-5";
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
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto"
            style={{ fontFamily: "var(--cv-font-body)", color: c.text }}
        >
            {/* ─── HEADER - full width ─── */}
            <header className={`${sp} pb-4`} style={{ backgroundColor: c.p10 }}>
                <div className="flex items-center gap-5">
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={name}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="md"
                            borderColor={c.primary}
                            shape="circle"
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{name}</h1>
                        {titre && (
                            <h2 className="text-sm font-medium mt-0.5" style={{ color: c.primary }}>
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
                            textColor={c.muted}
                            iconColor={c.primary}
                            className="flex flex-wrap gap-3 mt-2 text-xs"
                        />
                    </div>
                </div>
                {profil.elevator_pitch && (
                    <p className={`mt-4 ${ts} text-gray-600 leading-relaxed`}>
                        {sanitizeText(profil.elevator_pitch)}
                    </p>
                )}
            </header>

            {/* ─── BODY - main left + sidebar right ─── */}
            <div className="flex flex-1">
                {/* MAIN (2/3) */}
                <main className={`flex-1 ${sp} space-y-5`}>
                    {/* Experiences */}
                    {experiences.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2" style={{ color: c.primary, borderColor: c.primary }}>
                                Expérience Professionnelle
                            </h2>
                            <div className="space-y-4">
                                {experiences.map((exp: any, i: number) => (
                                    <article key={i} className="relative pl-3 border-l-2 break-inside-avoid" style={{ borderColor: c.p20 }}>
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-sm">{sanitizeText(exp.poste)}</h3>
                                            <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                                {exp.date_debut ? `${exp.date_debut}${exp.date_fin ? ` — ${exp.date_fin}` : " — Présent"}` : (exp.date_fin || "")}
                                            </span>
                                        </div>
                                        {(exp.entreprise && exp.entreprise !== "—") ? (
                                            <p className="text-xs font-medium mb-1" style={{ color: c.accent }}>
                                                {sanitizeText(exp.entreprise)}{exp.lieu ? ` · ${exp.lieu}` : ""}
                                            </p>
                                        ) : exp.lieu ? (
                                            <p className="text-xs font-medium mb-1" style={{ color: c.accent }}>{exp.lieu}</p>
                                        ) : null}
                                        {exp.realisations?.length > 0 && (
                                            <ul className={`space-y-0.5 ${ts} text-gray-600`}>
                                                {exp.realisations.slice(0, dl?.maxRealisationsPerExp ?? 5).map((r: string, ri: number) => (
                                                    <li key={ri} className="flex items-start gap-1.5">
                                                        <span style={{ color: c.primary }}>›</span>
                                                        <span>{sanitizeText(r)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {exp.clients?.length > 0 && (
                                            <p className="mt-1 text-[10px] text-gray-400">
                                                Clients : {exp.clients.slice(0, dl?.maxClientsPerExp ?? 4).join(", ")}
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
                            <h2 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2" style={{ color: c.primary, borderColor: c.primary }}>
                                Projets
                            </h2>
                            <div className="space-y-2">
                                {projects.slice(0, dl?.maxProjects ?? 4).map((p: any, i: number) => (
                                    <div key={i}>
                                        <h3 className="font-semibold text-xs">{sanitizeText(p.nom)}</h3>
                                        {p.description && <p className="text-[10px] text-gray-500">{sanitizeText(p.description)}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Client References */}
                    {clients?.clients && clients.clients.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2" style={{ color: c.primary, borderColor: c.primary }}>
                                Références Clients
                            </h2>
                            <div className="flex flex-wrap gap-1.5">
                                {clients.clients.slice(0, dl?.maxClientsReferences ?? 8).map((cl: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 rounded text-xs border" style={{ borderColor: c.primary }}>
                                        {cl}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* ─── SIDEBAR DROITE (1/3) - fond coloré solide ─── */}
                <aside
                    className="w-[33%] flex flex-col"
                    style={{ backgroundColor: c.primary }}
                >
                    <div className={`${sp} space-y-5 text-white`}>
                        {/* Technical Skills */}
                        {techSkills.length > 0 && (
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/25">
                                    Compétences Techniques
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {techSkills.slice(0, dl?.maxSkills ?? 12).map((skill: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 rounded text-xs bg-white/15">
                                            {sanitizeText(skill)}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Soft Skills */}
                        {softSkills.length > 0 && (
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/25">
                                    Savoir-être
                                </h3>
                                <ul className="space-y-1 text-xs text-white/85">
                                    {softSkills.slice(0, dl?.maxSoftSkills ?? 6).map((skill: string, i: number) => (
                                        <li key={i} className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                            {sanitizeText(skill)}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Formations */}
                        {formations.length > 0 && (
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/25">
                                    Formation
                                </h3>
                                <div className="space-y-2.5">
                                    {formations.map((f: any, i: number) => (
                                        <div key={i}>
                                            <p className="text-xs font-semibold">{sanitizeText(f.diplome)}</p>
                                            <p className="text-[10px] text-white/70">{sanitizeText(f.etablissement)}</p>
                                            {f.annee && <p className="text-[10px] text-white/50">{f.annee}</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Languages */}
                        {langues.length > 0 && (
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/25">
                                    Langues
                                </h3>
                                <div className="space-y-1.5">
                                    {langues.map((l: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-xs">
                                            <span>{l.langue}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15">{l.niveau}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Certifications */}
                        {certifications.length > 0 && (
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-white/25">
                                    Certifications
                                </h3>
                                <ul className="space-y-1 text-xs text-white/85">
                                    {certifications.slice(0, dl?.maxCertifications ?? 5).map((cert: string, i: number) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-white/60">✓</span>
                                            {sanitizeText(cert)}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
