/**
 * Aurora - RR Amélioré : dégradé doux, cartes légères, espacement soigné
 * Inspiré Reactive Resume (MIT) — design premium
 */

import React from "react";
import { TemplateProps, isValidEntreprise, withDL } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function AuroraTemplate({ data, includePhoto = true, dense = false, displayLimits: dl }: TemplateProps) {
    const limits = withDL(dl);
    const colors = {
        primary: CV_THEME_VARS.primary,
        secondary: CV_THEME_VARS.sidebarAccent,
        text: CV_THEME_VARS.text,
        muted: CV_THEME_VARS.muted,
        primary10: CV_THEME_VARS.primaryA10,
        primary20: CV_THEME_VARS.primaryA20,
        primary50: CV_THEME_VARS.primaryA50,
    };
    const padding = dense ? "px-6 py-4" : "px-10 py-8";
    const textSize = dense ? "text-xs" : "text-sm";
    const gap = dense ? "gap-4" : "gap-6";

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
    const allSkills = [...(competences.techniques || []).slice(0, limits.maxSkills), ...(competences.soft_skills || []).slice(0, limits.maxSoftSkills)];

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: colors.primary }}>
            {children}
        </h2>
    );

    return (
        <div
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto rounded-sm overflow-hidden shadow-sm"
            style={{ fontFamily: "var(--cv-font-body)", color: colors.text }}
        >
            <header
                className={`${padding} pb-8`}
                style={{
                    background: `linear-gradient(160deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                }}
            >
                <div className="flex items-center gap-6">
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={fullName}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="lg"
                            borderColor="#fff"
                            className="shadow-md ring-2 ring-white/30"
                        />
                    )}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white tracking-tight">{fullName}</h1>
                        {titre && <p className="text-white/90 text-lg mt-1">{sanitizeText(titre)}</p>}
                        <ContactInfo
                            email={profil.email}
                            telephone={profil.telephone}
                            localisation={profil.localisation}
                            linkedin={profil.linkedin}
                            github={profil.github}
                            portfolio={profil.portfolio}
                            layout="inline"
                            textColor="rgba(255,255,255,0.85)"
                            iconColor="rgba(255,255,255,0.85)"
                            className={`flex flex-wrap gap-4 mt-4 ${textSize}`}
                        />
                    </div>
                </div>
            </header>

            <main className={`${padding} ${gap} flex flex-col`}>
                {profil.elevator_pitch && (
                    <section className="p-4 rounded-lg border-l-4" style={{ backgroundColor: colors.primary10, borderColor: colors.primary }}>
                        <p className={`${textSize} italic leading-relaxed`} style={{ color: colors.text }}>{sanitizeText(profil.elevator_pitch)}</p>
                    </section>
                )}

                {allSkills.length > 0 && (
                    <section className="break-inside-avoid">
                        <SectionTitle>Compétences</SectionTitle>
                        <div className="flex flex-wrap gap-2">
                            {allSkills.map((s: string, i: number) => (
                                <span
                                    key={i}
                                    className={`px-3 py-1.5 rounded-full ${textSize} font-medium shadow-sm`}
                                    style={{ backgroundColor: colors.primary20, color: colors.text }}
                                >
                                    {sanitizeText(s)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {experiences.length > 0 && (
                    <section className="break-inside-avoid">
                        <SectionTitle>Expérience professionnelle</SectionTitle>
                        <div className="space-y-4">
                            {experiences.map((exp: any, idx: number) => (
                                <article
                                    key={idx}
                                    className="p-4 rounded-lg border border-gray-100 break-inside-avoid"
                                    style={{ borderLeftColor: colors.primary, borderLeftWidth: "3px" }}
                                >
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div>
                                            <h3 className="font-bold text-base">{sanitizeText(exp.poste)}</h3>
                                            {isValidEntreprise(exp.entreprise) ? (
                                                <p className={`${textSize} font-medium`} style={{ color: colors.secondary }}>
                                                    {sanitizeText(exp.entreprise)}{exp.lieu ? ` · ${exp.lieu}` : ""}
                                                </p>
                                            ) : exp.lieu ? <p className={`${textSize}`} style={{ color: colors.muted }}>{exp.lieu}</p> : null}
                                        </div>
                                        <span className={`${textSize} text-gray-500 whitespace-nowrap`}>
                                            {exp.date_debut ? `${exp.date_debut}${exp.date_fin ? ` – ${exp.date_fin}` : " – Présent"}` : exp.date_fin || ""}
                                        </span>
                                    </div>
                                    {exp.realisations?.length > 0 && (
                                        <ul className={`space-y-1 ${textSize} text-gray-600`}>
                                            {exp.realisations.slice(0, limits.maxRealisationsPerExp).map((r: string, ri: number) => (
                                                <li key={ri} className="flex gap-2">
                                                    <span style={{ color: colors.primary }}>•</span>
                                                    {sanitizeText(r)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {exp.clients?.length > 0 && (
                                        <p className={`mt-2 ${textSize} text-gray-500`}>
                                            <span className="font-medium">Clients : </span>
                                            {exp.clients.slice(0, limits.maxClientsPerExp).join(", ")}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-2 gap-6">
                    {formations.length > 0 && (
                        <section className="break-inside-avoid">
                            <SectionTitle>Formation</SectionTitle>
                            <div className="space-y-3">
                                {formations.slice(0, limits.maxFormations).map((f: any, i: number) => (
                                    <article key={i}>
                                        <h3 className="font-bold text-sm">{sanitizeText(f.diplome)}</h3>
                                        <p className={`${textSize} text-gray-600`}>{sanitizeText(f.etablissement)}</p>
                                        {f.annee && <p className={`${textSize} text-gray-500`}>{f.annee}</p>}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                    <div className="space-y-6">
                        {langues.length > 0 && (
                            <section className="break-inside-avoid">
                                <SectionTitle>Langues</SectionTitle>
                                <div className="space-y-2">
                                    {langues.slice(0, limits.maxLangues).map((l: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <span className="font-medium text-sm">{l.langue}</span>
                                            <span className={`${textSize} px-2 py-0.5 rounded`} style={{ backgroundColor: colors.primary20 }}>{l.niveau}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {certifications.length > 0 && (
                            <section className="break-inside-avoid">
                                <SectionTitle>Certifications</SectionTitle>
                                <ul className={`space-y-1 ${textSize}`}>
                                    {certifications.slice(0, limits.maxCertifications).map((c: string, i: number) => (
                                        <li key={i} className="flex gap-2">
                                            <span style={{ color: colors.primary }}>✓</span>
                                            {sanitizeText(c)}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </div>

                {projects.length > 0 && (
                    <section className="break-inside-avoid">
                        <SectionTitle>Projets</SectionTitle>
                        <div className="grid grid-cols-2 gap-3">
                            {projects.slice(0, limits.maxProjects).map((p: any, i: number) => (
                                <article key={i} className="p-3 rounded-lg" style={{ backgroundColor: colors.primary10 }}>
                                    <h3 className="font-bold text-sm">{sanitizeText(p.nom)}</h3>
                                    {p.description && <p className={`${textSize} text-gray-600 mt-0.5`}>{sanitizeText(p.description)}</p>}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {(clientsReferences?.clients?.length ?? 0) > 0 && (
                    <section className="break-inside-avoid">
                        <SectionTitle>Clients références</SectionTitle>
                        <div className="flex flex-wrap gap-2">
                            {(clientsReferences?.clients ?? []).slice(0, limits.maxClientsReferences).map((c: string, i: number) => (
                                <span key={i} className={`px-3 py-1 rounded-full ${textSize} border`} style={{ borderColor: colors.primary50 }}>{c}</span>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
