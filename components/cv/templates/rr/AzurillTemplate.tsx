/**
 * Template Azurill - Inspiré de Reactive Resume
 * Layout: une colonne, header compact avec barre colorée
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { TemplateProps, isValidEntreprise, withDL } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function AzurillTemplate({ data, includePhoto = true, dense = false, displayLimits: dl }: TemplateProps) {
    const limits = withDL(dl);
    const colors = {
        primary: CV_THEME_VARS.primary,
        secondary: CV_THEME_VARS.sidebarAccent,
        text: CV_THEME_VARS.text,
        muted: CV_THEME_VARS.muted,
        primary20: CV_THEME_VARS.primaryA20,
        primary50: CV_THEME_VARS.primaryA50,
    };
    const padding = dense ? "px-6 py-4" : "px-8 py-6";
    const gap = dense ? "gap-4" : "gap-6";
    const textSize = dense ? "text-xs" : "text-sm";

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

    const technicalSkills = competences.techniques || [];
    const softSkills = competences.soft_skills || [];
    const limitedTech = technicalSkills.slice(0, limits.maxSkills);
    const limitedSoft = softSkills.slice(0, limits.maxSoftSkills);
    const allSkills = [...limitedTech, ...limitedSoft];

    return (
        <div
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto"
            style={{ fontFamily: "var(--cv-font-body)", color: colors.text }}
        >
            <div className={`${padding} border-b-4`} style={{ borderColor: colors.primary }}>
                <div className="flex items-center gap-4">
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={fullName}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="md"
                            borderColor={colors.primary}
                            className="flex-shrink-0"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>{fullName}</h1>
                        {titre && <h2 className={`${textSize} font-medium`} style={{ color: colors.secondary }}>{sanitizeText(titre)}</h2>}
                        <ContactInfo
                            email={profil.email}
                            telephone={profil.telephone}
                            localisation={profil.localisation}
                            linkedin={profil.linkedin}
                            github={profil.github}
                            portfolio={profil.portfolio}
                            layout="inline"
                            textColor={colors.muted}
                            className={`flex flex-wrap gap-3 mt-2 ${textSize}`}
                        />
                    </div>
                </div>
            </div>

            <main className={`${padding} ${gap} flex flex-col`}>
                {profil.elevator_pitch && (
                    <section className="mb-4">
                        <p className={`${textSize} text-gray-600 leading-relaxed border-l-2 pl-3`} style={{ borderColor: colors.primary }}>
                            {sanitizeText(profil.elevator_pitch)}
                        </p>
                    </section>
                )}

                {allSkills.length > 0 && (
                    <section className="mb-6 break-inside-avoid">
                        <h2 className="text-base font-bold mb-2" style={{ color: colors.text }}>Compétences</h2>
                        <div className="flex flex-wrap gap-2">
                            {allSkills.map((skill: string, idx: number) => (
                                <span key={idx} className={`px-2.5 py-1 rounded ${textSize}`} style={{ backgroundColor: colors.primary20, color: colors.secondary }}>
                                    {sanitizeText(skill)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {experiences.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-base font-bold mb-3" style={{ color: colors.text }}>Expérience Professionnelle</h2>
                        <div className="space-y-4">
                            {experiences.map((exp: any, idx: number) => (
                                <article key={idx} className="relative pl-5 border-l-2 break-inside-avoid" style={{ borderColor: colors.primary50 }}>
                                    <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2" style={{ borderColor: colors.primary }} />
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <div>
                                            <h3 className="font-bold text-sm">{sanitizeText(exp.poste)}</h3>
                                            {isValidEntreprise(exp.entreprise) ? (
                                                <p className={`${textSize} font-medium`} style={{ color: colors.secondary }}>
                                                    {sanitizeText(exp.entreprise)}{exp.lieu ? ` · ${exp.lieu}` : ""}
                                                </p>
                                            ) : exp.lieu ? (
                                                <p className={`${textSize} font-medium`} style={{ color: colors.secondary }}>{exp.lieu}</p>
                                            ) : null}
                                        </div>
                                        <span className={`${textSize} shrink-0`} style={{ color: colors.muted }}>
                                            {exp.date_debut ? `${exp.date_debut}${exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}` : (exp.date_fin || "")}
                                        </span>
                                    </div>
                                    {exp.realisations?.length > 0 && (
                                        <ul className={`space-y-1 ${textSize} text-gray-600`}>
                                            {exp.realisations.slice(0, limits.maxRealisationsPerExp).map((real: string, ridx: number) => (
                                                <li key={ridx} className="flex items-start gap-2">
                                                    <span style={{ color: colors.primary }}>▸</span>
                                                    <span>{sanitizeText(real)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {exp.clients?.length > 0 && (
                                        <p className={`mt-1 ${textSize} text-gray-500`}>
                                            Clients : {exp.clients.slice(0, limits.maxClientsPerExp).join(", ")}
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
                            <h2 className="text-base font-bold mb-2" style={{ color: colors.text }}>Formation</h2>
                            <div className="space-y-2">
                                {formations.slice(0, limits.maxFormations).map((form: any, idx: number) => (
                                    <article key={idx}>
                                        <h3 className="font-bold text-sm">{sanitizeText(form.diplome)}</h3>
                                        <p className={`${textSize} text-gray-600`}>{sanitizeText(form.etablissement)} {form.annee}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                    <div className="space-y-4">
                        {langues.length > 0 && (
                            <section className="break-inside-avoid">
                                <h2 className="text-base font-bold mb-2" style={{ color: colors.text }}>Langues</h2>
                                <div className="space-y-1">
                                    {langues.slice(0, limits.maxLangues).map((lang: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>{lang.langue}</span>
                                            <span className={`${textSize} px-1.5 rounded`} style={{ backgroundColor: colors.primary20 }}>{lang.niveau}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {certifications.length > 0 && (
                            <section className="break-inside-avoid">
                                <h2 className="text-base font-bold mb-2" style={{ color: colors.text }}>Certifications</h2>
                                <ul className={`space-y-0.5 ${textSize}`}>
                                    {certifications.slice(0, limits.maxCertifications).map((cert: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span style={{ color: colors.primary }}>✓</span> {sanitizeText(cert)}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </div>

                {projects.length > 0 && (
                    <section className="mt-4">
                        <h2 className="text-base font-bold mb-2" style={{ color: colors.text }}>Projets</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {projects.slice(0, limits.maxProjects).map((proj: any, idx: number) => (
                                <article key={idx} className="p-3 rounded break-inside-avoid" style={{ backgroundColor: colors.primary20 }}>
                                    <h3 className="font-bold text-sm">{sanitizeText(proj.nom)}</h3>
                                    {proj.description && <p className={`${textSize} text-gray-600`}>{sanitizeText(proj.description)}</p>}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {(clientsReferences?.clients?.length ?? 0) > 0 && (
                    <section className="mt-4 break-inside-avoid">
                        <h2 className="text-base font-bold mb-2" style={{ color: colors.text }}>Clients Références</h2>
                        <div className="flex flex-wrap gap-2">
                            {(clientsReferences?.clients ?? []).slice(0, limits.maxClientsReferences).map((client: string, idx: number) => (
                                <span key={idx} className={`px-2 py-0.5 rounded border ${textSize}`} style={{ borderColor: colors.primary }}>{client}</span>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
