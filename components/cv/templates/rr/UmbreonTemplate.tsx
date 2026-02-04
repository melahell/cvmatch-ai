import React from "react";
import { TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function UmbreonTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const profil = data.profil || {};
    const experiences = data.experiences || [];
    const formations = data.formations || [];
    const competences = data.competences || { techniques: [], soft_skills: [] };
    const langues = data.langues || [];
    const certifications = data.certifications || [];

    const technicalSkills = Array.isArray(competences)
        ? competences.map((c: any) => c?.nom || c?.name || c).filter(Boolean)
        : competences.techniques || [];
    const softSkills = Array.isArray(competences) ? [] : competences.soft_skills || [];

    const padding = dense ? "p-5" : "p-6";
    const textSize = dense ? "text-xs" : "text-sm";

    const fullName = `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Nom Prénom";
    const initials = `${(profil.prenom || "N").charAt(0)}${(profil.nom || "P").charAt(0)}`.toUpperCase();

    return (
        <div
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white flex mx-auto"
            style={{ fontFamily: "var(--cv-font-body)", color: CV_THEME_VARS.text }}
        >
            <aside className={`w-[35%] ${padding} flex flex-col`} style={{ background: CV_THEME_VARS.sidebarBg, color: CV_THEME_VARS.sidebarText }}>
                <div className="flex flex-col items-center text-center">
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={fullName}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="lg"
                            borderColor={CV_THEME_VARS.sidebarAccent}
                        />
                    )}
                    <h1 className="mt-4 text-lg font-bold">{fullName}</h1>
                    {profil.titre_principal && (
                        <p className="mt-1 text-[8pt] font-semibold" style={{ color: CV_THEME_VARS.sidebarAccent }}>
                            {sanitizeText(profil.titre_principal)}
                        </p>
                    )}
                </div>

                <div className="mt-5">
                    <div className="text-[7pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.sidebarAccent }}>
                        Contact
                    </div>
                    <ContactInfo
                        email={profil.email}
                        telephone={profil.telephone}
                        localisation={profil.localisation}
                        linkedin={profil.linkedin}
                        github={profil.github}
                        portfolio={profil.portfolio}
                        layout="vertical"
                        iconColor={CV_THEME_VARS.sidebarAccent}
                        textColor={CV_THEME_VARS.sidebarText}
                        textSize="text-[8pt]"
                        className="space-y-1.5"
                    />
                </div>

                {technicalSkills.length > 0 && (
                    <div className="mt-5">
                        <div className="text-[7pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.sidebarAccent }}>
                            Compétences
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {technicalSkills.slice(0, 18).map((skill: any, i: number) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 rounded text-[7pt] font-medium"
                                    style={{ backgroundColor: CV_THEME_VARS.primaryA20, color: CV_THEME_VARS.sidebarText }}
                                >
                                    {sanitizeText(String(skill))}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {softSkills.length > 0 && (
                    <div className="mt-5">
                        <div className="text-[7pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.sidebarAccent }}>
                            Qualités
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {softSkills.slice(0, 10).map((skill: any, i: number) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 rounded text-[7pt] font-medium"
                                    style={{ backgroundColor: CV_THEME_VARS.primaryA10, color: CV_THEME_VARS.sidebarText }}
                                >
                                    {sanitizeText(String(skill))}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            <main className={`flex-1 ${padding} overflow-hidden`} style={{ background: CV_THEME_VARS.background, color: CV_THEME_VARS.text }}>
                {profil.elevator_pitch && (
                    <section className="mb-4">
                        <div className="text-[10pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.primary }}>
                            Profil
                        </div>
                        <p className={`leading-relaxed ${textSize}`} style={{ borderLeft: `3px solid ${CV_THEME_VARS.primary}`, paddingLeft: "10px" }}>
                            {sanitizeText(profil.elevator_pitch)}
                        </p>
                    </section>
                )}

                {experiences.length > 0 && (
                    <section className="mb-4">
                        <div className="text-[10pt] font-bold uppercase tracking-widest mb-3" style={{ color: CV_THEME_VARS.primary }}>
                            Expérience
                        </div>
                        <div className="space-y-3">
                            {experiences.map((exp: any, i: number) => (
                                <article key={i} className="break-inside-avoid">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h3 className="text-[9pt] font-bold">{sanitizeText(exp.poste)}</h3>
                                        <span className="text-[7pt]" style={{ color: CV_THEME_VARS.muted }}>
                                            {sanitizeText(exp.date_debut)}
                                            {exp.date_fin ? ` – ${sanitizeText(exp.date_fin)}` : " – Présent"}
                                        </span>
                                    </div>
                                    <div className="text-[8pt] font-semibold" style={{ color: CV_THEME_VARS.primary }}>
                                        {sanitizeText(exp.entreprise)}
                                        {exp.lieu ? ` • ${sanitizeText(exp.lieu)}` : ""}
                                    </div>
                                    {Array.isArray(exp.realisations) && exp.realisations.length > 0 && (
                                        <ul className={`mt-1 space-y-1 ${textSize} text-slate-700 list-disc list-outside pl-5`}>
                                            {exp.realisations.slice(0, 5).map((r: string, j: number) => (
                                                <li key={j}>{sanitizeText(r)}</li>
                                            ))}
                                        </ul>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {formations.length > 0 && (
                        <section className="break-inside-avoid">
                            <div className="text-[10pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.primary }}>
                                Formation
                            </div>
                            <div className="space-y-2">
                                {formations.slice(0, 4).map((f: any, i: number) => (
                                    <div key={i}>
                                        <div className="text-[8pt] font-bold">{sanitizeText(f.diplome)}</div>
                                        <div className="text-[7pt]" style={{ color: CV_THEME_VARS.muted }}>
                                            {sanitizeText(f.etablissement)}
                                            {f.annee ? ` • ${sanitizeText(f.annee)}` : ""}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {(langues.length > 0 || certifications.length > 0) && (
                        <section className="break-inside-avoid">
                            {langues.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-[10pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.primary }}>
                                        Langues
                                    </div>
                                    <div className="space-y-1">
                                        {langues.slice(0, 4).map((l: any, i: number) => (
                                            <div key={i} className="flex justify-between text-[7pt]">
                                                <span className="font-semibold">{sanitizeText(l.langue)}</span>
                                                <span style={{ color: CV_THEME_VARS.muted }}>{sanitizeText(l.niveau)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {certifications.length > 0 && (
                                <div>
                                    <div className="text-[10pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.primary }}>
                                        Certifications
                                    </div>
                                    <div className="space-y-1">
                                        {certifications.slice(0, 5).map((c: any, i: number) => (
                                            <div key={i} className="text-[7pt]">
                                                {sanitizeText(String(c))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
