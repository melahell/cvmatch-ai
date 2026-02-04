import React from "react";
import { TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function AltariaTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const profil = data.profil || {};
    const experiences = data.experiences || [];
    const competences = data.competences || { techniques: [], soft_skills: [] };
    const formations = data.formations || [];
    const langues = data.langues || [];

    const technicalSkills = Array.isArray(competences)
        ? competences.map((c: any) => c?.nom || c?.name || c).filter(Boolean)
        : competences.techniques || [];

    const padding = dense ? "px-7 py-6" : "px-9 py-8";
    const textSize = dense ? "text-xs" : "text-sm";

    const fullName = `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Nom Prénom";
    const initials = `${(profil.prenom || "N").charAt(0)}${(profil.nom || "P").charAt(0)}`.toUpperCase();

    return (
        <div
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto"
            style={{ fontFamily: "var(--cv-font-body)", color: CV_THEME_VARS.text }}
        >
            <header className={`${padding} pb-6`} style={{ background: CV_THEME_VARS.primaryLight }}>
                <div className="flex items-center gap-6">
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={fullName}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="md"
                            borderColor={CV_THEME_VARS.primary}
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
                        {profil.titre_principal && (
                            <p className="text-[10pt] font-semibold mt-1" style={{ color: CV_THEME_VARS.primary }}>
                                {sanitizeText(profil.titre_principal)}
                            </p>
                        )}
                        <div className="mt-3">
                            <ContactInfo
                                email={profil.email}
                                telephone={profil.telephone}
                                localisation={profil.localisation}
                                linkedin={profil.linkedin}
                                github={profil.github}
                                portfolio={profil.portfolio}
                                layout="inline"
                                iconColor={CV_THEME_VARS.primary}
                                textColor={CV_THEME_VARS.muted}
                                textSize="text-[8pt]"
                                className="gap-3"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className={`${padding} pt-6`}>
                <div className="grid grid-cols-3 gap-6">
                    <aside className="col-span-1 space-y-6">
                        {profil.elevator_pitch && (
                            <section>
                                <div className="text-[10pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.primary }}>
                                    Profil
                                </div>
                                <p className={`${textSize} leading-relaxed`} style={{ color: CV_THEME_VARS.muted }}>
                                    {sanitizeText(profil.elevator_pitch)}
                                </p>
                            </section>
                        )}

                        {technicalSkills.length > 0 && (
                            <section>
                                <div className="text-[10pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.primary }}>
                                    Compétences
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {technicalSkills.slice(0, 18).map((skill: any, i: number) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 rounded text-[7pt] font-medium"
                                            style={{ backgroundColor: CV_THEME_VARS.primaryA20, color: CV_THEME_VARS.text }}
                                        >
                                            {sanitizeText(String(skill))}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {langues.length > 0 && (
                            <section>
                                <div className="text-[10pt] font-bold uppercase tracking-widest mb-2" style={{ color: CV_THEME_VARS.primary }}>
                                    Langues
                                </div>
                                <div className="space-y-1">
                                    {langues.slice(0, 5).map((l: any, i: number) => (
                                        <div key={i} className="flex justify-between text-[7pt]">
                                            <span className="font-semibold">{sanitizeText(l.langue)}</span>
                                            <span style={{ color: CV_THEME_VARS.muted }}>{sanitizeText(l.niveau)}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </aside>

                    <section className="col-span-2">
                        {experiences.length > 0 && (
                            <>
                                <div className="text-[10pt] font-bold uppercase tracking-widest mb-3" style={{ color: CV_THEME_VARS.primary }}>
                                    Expérience
                                </div>
                                <div className="space-y-4">
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
                                                    {exp.realisations.slice(0, 6).map((r: string, j: number) => (
                                                        <li key={j}>{sanitizeText(r)}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}

                        {formations.length > 0 && (
                            <div className="mt-6">
                                <div className="text-[10pt] font-bold uppercase tracking-widest mb-3" style={{ color: CV_THEME_VARS.primary }}>
                                    Formation
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
