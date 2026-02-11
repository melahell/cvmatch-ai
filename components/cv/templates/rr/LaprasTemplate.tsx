/**
 * Template Lapras - Inspiré de Reactive Resume
 * 
 * Design aquatique/élégant avec accents bleus dégradés
 * Layout: Header avec vagues + Two-column layout
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { TemplateProps, isValidEntreprise, withDL } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function LaprasTemplate({ data, includePhoto = true, dense = false, displayLimits: dl }: TemplateProps) {
    const colors = {
        primary: CV_THEME_VARS.primary,
        secondary: CV_THEME_VARS.sidebarAccent,
        text: CV_THEME_VARS.text,
        muted: CV_THEME_VARS.muted,
        background: CV_THEME_VARS.background,
        primary08: CV_THEME_VARS.primaryA08,
        primary15: CV_THEME_VARS.primaryLight,
        primary20: CV_THEME_VARS.primaryA20,
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

    const technicalSkills = competences.techniques || [];
    const softSkills = competences.soft_skills || [];
    const limitedTech = technicalSkills.slice(0, dl?.maxSkills ?? 20);
    const limitedSoft = softSkills.slice(0, dl?.maxSoftSkills ?? 8);
    const allSkills = [...limitedTech, ...limitedSoft];

    return (
        <div
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto"
            style={{ fontFamily: "var(--cv-font-body)", color: colors.text }}
        >
            {/* HEADER avec effet vague */}
            <header
                className={`${padding} pb-10 relative`}
                style={{
                    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                }}
            >
                <div className="flex items-center gap-6 text-white relative z-10">
                    {/* Photo */}
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil.photo_url}
                            fullName={fullName}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="lg"
                            borderColor="rgba(255,255,255,0.3)"
                            className="shadow-lg"
                        />
                    )}

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-1">{fullName}</h1>
                        {titre && (
                            <h2 className="text-lg text-white/90 font-medium">
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
                            textColor="rgba(255,255,255,0.8)"
                            iconColor="rgba(255,255,255,0.8)"
                            className="flex flex-wrap gap-4 mt-4 text-sm"
                        />
                    </div>
                </div>
                {/* Wave effect */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-6 bg-white"
                    style={{
                        clipPath: "ellipse(60% 100% at 50% 100%)",
                    }}
                />
            </header>

            {/* CONTENT - Two columns */}
            <div className={`${padding} flex gap-6`}>
                {/* MAIN (2/3) */}
                <main className="flex-1 space-y-5">
                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <section className="border-l-4 pl-4" style={{ borderColor: colors.primary }}>
                            <p className={`${textSize} text-gray-600 italic leading-relaxed`}>
                                {sanitizeText(profil.elevator_pitch)}
                            </p>
                        </section>
                    )}

                    {/* Expériences */}
                    {experiences.length > 0 && (
                        <section>
                            <h2 className="text-base font-bold mb-4 pb-1 border-b-2" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Expérience Professionnelle
                            </h2>
                            <div className="space-y-4 divide-y" style={{ borderColor: colors.primary08 }}>
                                {experiences.map((exp: any, idx: number) => (
                                    <article key={idx} className={`break-inside-avoid ${idx > 0 ? "pt-4" : ""}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h3 className="font-bold">{sanitizeText(exp.poste)}</h3>
                                                {isValidEntreprise(exp.entreprise) ? (
                                                    <p className="font-medium text-sm" style={{ color: colors.secondary }}>
                                                        {sanitizeText(exp.entreprise)}{exp.lieu ? ` · ${exp.lieu}` : ""}
                                                    </p>
                                                ) : exp.lieu ? (
                                                    <p className="font-medium text-sm" style={{ color: colors.secondary }}>{exp.lieu}</p>
                                                ) : null}
                                            </div>
                                            <span className="text-xs text-gray-500 shrink-0">
                                                {exp.date_debut ? `${exp.date_debut}${exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}` : (exp.date_fin || "")}
                                            </span>
                                        </div>

                                        {exp.realisations && exp.realisations.length > 0 && (
                                            <ul className={`mt-2 space-y-1 ${textSize} text-gray-600`}>
                                                {exp.realisations.slice(0, dl?.maxRealisationsPerExp ?? 6).map((real: string, ridx: number) => (
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
                                                {exp.clients.slice(0, dl?.maxClientsPerExp ?? 6).join(", ")}
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
                            <h2 className="text-base font-bold mb-3 pb-1 border-b-2" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Projets
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {projects.slice(0, dl?.maxProjects ?? 5).map((proj: any, idx: number) => (
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
                        <section className="p-4 rounded-lg" style={{ backgroundColor: colors.primary08 }}>
                            <h3 className="text-sm font-bold mb-3" style={{ color: colors.primary }}>
                                Compétences
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {allSkills.map((skill: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: colors.primary20, color: colors.secondary }}>
                                        {sanitizeText(skill)}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold mb-3 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Formation
                            </h3>
                            <div className="space-y-2.5">
                                {formations.slice(0, dl?.maxFormations ?? 5).map((form: any, idx: number) => (
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
                            <h3 className="text-sm font-bold mb-3 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Langues
                            </h3>
                            <div className="space-y-2">
                                {langues.slice(0, dl?.maxLangues ?? 10).map((lang: any, idx: number) => (
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
                            <h3 className="text-sm font-bold mb-3 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Certifications
                            </h3>
                            <ul className="space-y-1 text-xs">
                                {certifications.slice(0, dl?.maxCertifications ?? 10).map((cert: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span style={{ color: colors.primary }}>✓</span>
                                        {sanitizeText(cert)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Clients */}
                    {clientsReferences?.clients && clientsReferences.clients.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold mb-3 pb-1 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Clients
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {clientsReferences.clients.slice(0, dl?.maxClientsReferences ?? 30).map((client: string, idx: number) => (
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
