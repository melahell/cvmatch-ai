/**
 * Template Ditto - Inspiré de Reactive Resume
 * 
 * Design avec header coloré et photo positionnée
 * Layout: Header avec sidebar + Main content
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { CVData, TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";

interface DittoColors {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    background: string;
}

const defaultColors: DittoColors = {
    primary: "#8b5cf6",  // Violet
    secondary: "#7c3aed",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
};

export default function DittoTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = defaultColors;
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
            className="w-full min-h-[1123px] bg-white print:bg-white"
            style={{
                fontFamily: "'Inter', sans-serif",
                color: colors.text,
            }}
        >
            {/* HEADER avec fond coloré */}
            <header
                className="relative"
                style={{ backgroundColor: colors.primary }}
            >
                <div className="flex">
                    {/* Photo sidebar zone */}
                    <div className="w-1/3 flex justify-center py-6">
                        {includePhoto && profil.photo_url && (
                            <img
                                src={profil.photo_url}
                                alt={fullName}
                                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        )}
                    </div>

                    {/* Infos principales */}
                    <div className={`flex-1 ${padding} text-white`}>
                        <h1 className="text-3xl font-bold mb-1">{fullName}</h1>
                        {titre && (
                            <h2 className="text-lg text-white/90 mb-4">
                                {sanitizeText(titre)}
                            </h2>
                        )}
                    </div>
                </div>
            </header>

            {/* Contact bar */}
            <div className={`flex items-center ${padding} py-3 border-b`} style={{ borderColor: `${colors.primary}30` }}>
                <div className="w-1/3"></div>
                <div className="flex-1 flex flex-wrap gap-4 text-sm" style={{ color: colors.muted }}>
                    {profil.email && <span className="flex items-center gap-1">✉ {profil.email}</span>}
                    {profil.telephone && <span className="flex items-center gap-1">📞 {profil.telephone}</span>}
                    {profil.localisation && <span className="flex items-center gap-1">📍 {profil.localisation}</span>}
                    {profil.linkedin && <span className="flex items-center gap-1">🔗 LinkedIn</span>}
                    {profil.github && <span className="flex items-center gap-1">GH {profil.github.replace(/https?:\/\/(www\.)?/, "")}</span>}
                    {profil.portfolio && <span className="flex items-center gap-1">WEB {profil.portfolio.replace(/https?:\/\/(www\.)?/, "")}</span>}
                </div>
            </div>

            {/* LAYOUT: Sidebar + Main */}
            <div className="flex">
                {/* SIDEBAR */}
                <aside className="w-1/3 p-6 space-y-6">
                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <section>
                            <h3 className="text-sm font-bold uppercase mb-2" style={{ color: colors.primary }}>
                                À propos
                            </h3>
                            <p className={`${textSize} text-gray-600 leading-relaxed`}>
                                {sanitizeText(profil.elevator_pitch)}
                            </p>
                        </section>
                    )}

                    {/* Compétences */}
                    {allSkills.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase mb-3" style={{ color: colors.primary }}>
                                Compétences
                            </h3>
                            <div className="space-y-1.5">
                                {allSkills.slice(0, 12).map((skill: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: colors.primary }}
                                        />
                                        <span className={textSize}>{sanitizeText(skill)}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase mb-3" style={{ color: colors.primary }}>
                                Langues
                            </h3>
                            <div className="space-y-2">
                                {langues.map((lang: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className={`${textSize} font-medium`}>{lang.langue}</span>
                                        <span className={`${textSize} text-gray-500`}>{lang.niveau}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase mb-3" style={{ color: colors.primary }}>
                                Certifications
                            </h3>
                            <ul className={`space-y-1.5 ${textSize}`}>
                                {certifications.slice(0, 5).map((cert: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span style={{ color: colors.primary }}>✓</span>
                                        {sanitizeText(cert)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </aside>

                {/* MAIN */}
                <main className={`flex-1 ${padding} space-y-6`}>
                    {/* Expériences */}
                    {experiences.length > 0 && (
                        <section>
                            <h2 className="text-base font-bold uppercase mb-4 pb-2 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Expérience Professionnelle
                            </h2>
                            <div className="space-y-5">
                                {experiences.map((exp: any, idx: number) => (
                                    <article key={idx}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h3 className="font-bold">{sanitizeText(exp.poste)}</h3>
                                                <p className="font-medium" style={{ color: colors.secondary }}>
                                                    {sanitizeText(exp.entreprise)}
                                                </p>
                                            </div>
                                            <span className={`${textSize} text-gray-500 shrink-0`}>
                                                {exp.date_debut}{exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}
                                            </span>
                                        </div>

                                        {exp.realisations && exp.realisations.length > 0 && (
                                            <ul className={`mt-2 space-y-1 ${textSize} text-gray-600`}>
                                                {exp.realisations.slice(0, 4).map((real: string, ridx: number) => (
                                                    <li key={ridx} className="flex items-start gap-2">
                                                        <span className="mt-1" style={{ color: colors.primary }}>•</span>
                                                        <span>{sanitizeText(real)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {exp.clients && exp.clients.length > 0 && (
                                            <p className={`mt-2 ${textSize} text-gray-500`}>
                                                <span className="font-medium">Clients : </span>
                                                {exp.clients.slice(0, 4).join(", ")}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                        <section>
                            <h2 className="text-base font-bold uppercase mb-4 pb-2 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Formation
                            </h2>
                            <div className="space-y-3">
                                {formations.map((form: any, idx: number) => (
                                    <article key={idx} className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{sanitizeText(form.diplome)}</h3>
                                            <p className={`${textSize} text-gray-600`}>{sanitizeText(form.etablissement)}</p>
                                        </div>
                                        <span className={`${textSize} text-gray-500`}>{form.annee}</span>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projets */}
                    {projects.length > 0 && (
                        <section>
                            <h2 className="text-base font-bold uppercase mb-4 pb-2 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Projets
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {projects.slice(0, 4).map((proj: any, idx: number) => (
                                    <article key={idx} className="p-3 rounded border" style={{ borderColor: `${colors.primary}30` }}>
                                        <h3 className="font-semibold text-sm mb-1">{sanitizeText(proj.nom)}</h3>
                                        {proj.description && (
                                            <p className={`${textSize} text-gray-600`}>{sanitizeText(proj.description)}</p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Références clients */}
                    {clientsReferences?.clients && clientsReferences.clients.length > 0 && (
                        <section>
                            <h2 className="text-base font-bold uppercase mb-3 pb-2 border-b" style={{ color: colors.primary, borderColor: colors.primary }}>
                                Clients Références
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {clientsReferences.clients.slice(0, 10).map((client: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className={`px-3 py-1 rounded-full ${textSize} border`}
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
        </div>
    );
}
