/**
 * Template Ditto - Bannière couleur pleine largeur + layout ATS-friendly
 *
 * Layout UNIQUE : Grande bannière header colorée avec photo à gauche et
 * infos à droite. Puis une barre de contact. Le body est un layout
 * single-column propre et minimaliste, optimisé ATS.
 * Seul template avec bannière full-width + body single-column.
 *
 * Inspiré de Reactive Resume (Ditto pattern)
 * MIT License - https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function DittoTemplate({ data, includePhoto = true, dense = false, displayLimits: dl }: TemplateProps) {
    const c = {
        primary: CV_THEME_VARS.primary,
        accent: CV_THEME_VARS.sidebarAccent,
        text: CV_THEME_VARS.text,
        muted: CV_THEME_VARS.muted,
        bg: CV_THEME_VARS.background,
        p08: CV_THEME_VARS.primaryA08,
        p10: CV_THEME_VARS.primaryA10,
        p20: CV_THEME_VARS.primaryA20,
        border: CV_THEME_VARS.border,
    };
    const sp = dense ? "px-6 py-3" : "px-8 py-5";
    const px = dense ? "px-6" : "px-8";
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
            {/* ─── BANNER HEADER ─── */}
            <header className={sp} style={{ backgroundColor: c.primary }}>
                <div className="flex items-center gap-6">
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={name}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="lg"
                            borderColor="rgba(255,255,255,0.3)"
                            shape="rounded"
                            className="shadow-lg"
                        />
                    )}
                    <div className="flex-1 text-white">
                        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
                        {titre && (
                            <h2 className="text-base text-white/85 mt-1 font-medium">
                                {sanitizeText(titre)}
                            </h2>
                        )}
                    </div>
                </div>
            </header>

            {/* ─── CONTACT BAR ─── */}
            <div className={`${px} py-2.5 border-b flex items-center`} style={{ backgroundColor: c.p08, borderColor: c.border }}>
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
                    className="flex flex-wrap gap-4 text-xs"
                />
            </div>

            {/* ─── BODY - single column ATS-friendly ─── */}
            <div className={`${sp} space-y-5`}>
                {/* Pitch */}
                {profil.elevator_pitch && (
                    <section>
                        <p className={`${ts} text-gray-600 leading-relaxed`}>
                            {sanitizeText(profil.elevator_pitch)}
                        </p>
                    </section>
                )}

                {/* Skills - horizontal bar */}
                {techSkills.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b" style={{ color: c.primary, borderColor: c.border }}>
                            Compétences
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {techSkills.slice(0, dl?.maxSkills ?? 15).map((skill: string, i: number) => (
                                <span key={i} className="px-2.5 py-0.5 rounded text-xs" style={{ backgroundColor: c.p10, color: c.text }}>
                                    {sanitizeText(skill)}
                                </span>
                            ))}
                            {softSkills.slice(0, dl?.maxSoftSkills ?? 5).map((skill: string, i: number) => (
                                <span key={`s${i}`} className="px-2.5 py-0.5 rounded text-xs border" style={{ borderColor: c.p20, color: c.muted }}>
                                    {sanitizeText(skill)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experiences */}
                {experiences.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: c.primary, borderColor: c.border }}>
                            Expérience Professionnelle
                        </h2>
                        <div className="space-y-4 divide-y" style={{ borderColor: c.border }}>
                            {experiences.map((exp: any, i: number) => (
                                <article key={i} className={`break-inside-avoid ${i > 0 ? "pt-4" : ""}`}>
                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <h3 className="font-bold text-sm">{sanitizeText(exp.poste)}</h3>
                                            {exp.entreprise && exp.entreprise !== "—" && (
                                                <p className="text-xs font-medium" style={{ color: c.accent }}>
                                                    {sanitizeText(exp.entreprise)}{exp.lieu ? ` — ${exp.lieu}` : ""}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 shrink-0 ml-3 whitespace-nowrap">
                                            {exp.date_debut ? `${exp.date_debut}${exp.date_fin ? ` — ${exp.date_fin}` : " — Présent"}` : (exp.date_fin || "")}
                                        </span>
                                    </div>
                                    {exp.realisations?.length > 0 && (
                                        <ul className={`mt-1.5 space-y-0.5 ${ts} text-gray-600`}>
                                            {exp.realisations.slice(0, dl?.maxRealisationsPerExp ?? 5).map((r: string, ri: number) => (
                                                <li key={ri} className="flex items-start gap-1.5">
                                                    <span className="text-gray-300 mt-0.5">—</span>
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

                {/* Two-column grid: Formations + Languages/Certifications */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Formations */}
                    {formations.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b" style={{ color: c.primary, borderColor: c.border }}>
                                Formation
                            </h2>
                            <div className="space-y-2">
                                {formations.map((f: any, i: number) => (
                                    <div key={i}>
                                        <p className="text-xs font-semibold">{sanitizeText(f.diplome)}</p>
                                        <p className="text-[10px] text-gray-500">{sanitizeText(f.etablissement)}</p>
                                        {f.annee && <p className="text-[10px] text-gray-400">{f.annee}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Right column: Languages + Certifications */}
                    <div className="space-y-4">
                        {langues.length > 0 && (
                            <section>
                                <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b" style={{ color: c.primary, borderColor: c.border }}>
                                    Langues
                                </h2>
                                <div className="space-y-1">
                                    {langues.map((l: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-xs">
                                            <span>{l.langue}</span>
                                            <span className="text-[10px] text-gray-500">{l.niveau}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {certifications.length > 0 && (
                            <section>
                                <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b" style={{ color: c.primary, borderColor: c.border }}>
                                    Certifications
                                </h2>
                                <ul className="space-y-0.5 text-xs list-disc list-inside">
                                    {certifications.slice(0, dl?.maxCertifications ?? 5).map((cert: string, i: number) => (
                                        <li key={i}>{sanitizeText(cert)}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </div>

                {/* Projects */}
                {projects.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b" style={{ color: c.primary, borderColor: c.border }}>
                            Projets
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {projects.slice(0, dl?.maxProjects ?? 4).map((p: any, i: number) => (
                                <div key={i}>
                                    <h3 className="font-semibold text-xs">{sanitizeText(p.nom)}</h3>
                                    {p.description && <p className="text-[10px] text-gray-500">{sanitizeText(p.description)}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Clients */}
                {clients?.clients && clients.clients.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b" style={{ color: c.primary, borderColor: c.border }}>
                            Références Clients
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {clients.clients.slice(0, dl?.maxClientsReferences ?? 10).map((cl: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: c.p08 }}>
                                    {cl}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
