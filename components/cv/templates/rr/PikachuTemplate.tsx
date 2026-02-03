/**
 * Template Pikachu - Inspiré de Reactive Resume
 * 
 * Design moderne et clean sans sidebar
 * Layout: Full width, sections empilées
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { CVData, TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";

interface PikachuColors {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    background: string;
}

const defaultColors: PikachuColors = {
    primary: "#fbbf24",
    secondary: "#f59e0b",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
};

export default function PikachuTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = defaultColors;
    const padding = dense ? "px-6 py-4" : "px-8 py-6";
    const gap = dense ? "gap-4" : "gap-6";
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

    // Extraire les skills
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
                className={`${padding} pb-8`}
                style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                }}
            >
                <div className="flex items-center gap-6">
                    {/* Photo */}
                    {includePhoto && profil.photo_url && (
                        <img
                            src={profil.photo_url}
                            alt={fullName}
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                    )}
                    
                    {/* Infos principales */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-1">
                            {fullName}
                        </h1>
                        {titre && (
                            <h2 className="text-xl text-white/90 font-medium">
                                {sanitizeText(titre)}
                            </h2>
                        )}
                        
                        {/* Contact inline */}
                        <div className="flex flex-wrap gap-4 mt-4 text-white/80 text-sm">
                            {profil.email && (
                                <span className="flex items-center gap-1">
                                    ✉ {profil.email}
                                </span>
                            )}
                            {profil.telephone && (
                                <span className="flex items-center gap-1">
                                    📞 {profil.telephone}
                                </span>
                            )}
                            {profil.localisation && (
                                <span className="flex items-center gap-1">
                                    📍 {profil.localisation}
                                </span>
                            )}
                            {profil.linkedin && (
                                <span className="flex items-center gap-1">
                                    🔗 LinkedIn
                                </span>
                            )}
                            {profil.github && (
                                <span className="flex items-center gap-1">
                                    GH {profil.github.replace(/https?:\/\/(www\.)?/, "")}
                                </span>
                            )}
                            {profil.portfolio && (
                                <span className="flex items-center gap-1">
                                    WEB {profil.portfolio.replace(/https?:\/\/(www\.)?/, "")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENU PRINCIPAL */}
            <main className={`${padding} ${gap} flex flex-col`}>
                {/* Pitch / Résumé */}
                {profil.elevator_pitch && (
                    <section className="mb-4">
                        <p className={`${textSize} text-gray-600 leading-relaxed italic border-l-4 pl-4`}
                           style={{ borderColor: colors.primary }}
                        >
                            "{sanitizeText(profil.elevator_pitch)}"
                        </p>
                    </section>
                )}

                {/* Compétences - Affichage horizontal */}
                {allSkills.length > 0 && (
                    <section className="mb-6 break-inside-avoid">
                        <h2 
                            className="text-lg font-bold mb-3 flex items-center gap-2"
                            style={{ color: colors.text }}
                        >
                            <span 
                                className="w-2 h-6 rounded"
                                style={{ backgroundColor: colors.primary }}
                            />
                            Compétences
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {allSkills.slice(0, 20).map((skill: string, idx: number) => (
                                <span
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-full ${textSize} font-medium`}
                                    style={{ 
                                        backgroundColor: `${colors.primary}20`,
                                        color: colors.secondary,
                                    }}
                                >
                                    {sanitizeText(skill)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Expériences */}
                {experiences.length > 0 && (
                    <section className="mb-6">
                        <h2 
                            className="text-lg font-bold mb-4 flex items-center gap-2"
                            style={{ color: colors.text }}
                        >
                            <span 
                                className="w-2 h-6 rounded"
                                style={{ backgroundColor: colors.primary }}
                            />
                            Expérience Professionnelle
                        </h2>
                        <div className="space-y-5">
                            {experiences.map((exp: any, idx: number) => (
                                <article 
                                    key={idx} 
                                    className="relative pl-6 border-l-2 break-inside-avoid"
                                    style={{ borderColor: `${colors.primary}50` }}
                                >
                                    {/* Timeline dot */}
                                    <span 
                                        className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white"
                                        style={{ borderColor: colors.primary }}
                                    />
                                    
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-base">
                                                {sanitizeText(exp.poste)}
                                            </h3>
                                            <p 
                                                className="font-semibold"
                                                style={{ color: colors.secondary }}
                                            >
                                                {sanitizeText(exp.entreprise)}
                                            </p>
                                        </div>
                                        <span 
                                            className={`${textSize} px-3 py-1 rounded-full`}
                                            style={{ 
                                                backgroundColor: `${colors.primary}20`,
                                                color: colors.muted,
                                            }}
                                        >
                                            {exp.date_debut}
                                            {exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}
                                        </span>
                                    </div>
                                    
                                    {exp.realisations && exp.realisations.length > 0 && (
                                        <ul className={`space-y-1.5 ${textSize} text-gray-600`}>
                                            {exp.realisations.slice(0, 4).map((real: string, ridx: number) => (
                                                <li key={ridx} className="flex items-start gap-2">
                                                    <span 
                                                        className="mt-1.5"
                                                        style={{ color: colors.primary }}
                                                    >
                                                        ▸
                                                    </span>
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

                {/* Grille : Formation + Langues + Certifications */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Formations */}
                    {formations.length > 0 && (
                        <section className="break-inside-avoid">
                            <h2 
                                className="text-lg font-bold mb-3 flex items-center gap-2"
                                style={{ color: colors.text }}
                            >
                                <span 
                                    className="w-2 h-6 rounded"
                                    style={{ backgroundColor: colors.primary }}
                                />
                                Formation
                            </h2>
                            <div className="space-y-3">
                                {formations.map((form: any, idx: number) => (
                                    <article key={idx}>
                                        <h3 className="font-bold text-sm">
                                            {sanitizeText(form.diplome)}
                                        </h3>
                                        <p className={`${textSize} text-gray-600`}>
                                            {sanitizeText(form.etablissement)}
                                        </p>
                                        <p className={`${textSize} text-gray-400`}>
                                            {form.annee}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Langues + Certifications */}
                    <div className="space-y-6">
                        {langues.length > 0 && (
                            <section className="break-inside-avoid">
                                <h2 
                                    className="text-lg font-bold mb-3 flex items-center gap-2"
                                    style={{ color: colors.text }}
                                >
                                    <span 
                                        className="w-2 h-6 rounded"
                                        style={{ backgroundColor: colors.primary }}
                                    />
                                    Langues
                                </h2>
                                <div className="space-y-2">
                                    {langues.map((lang: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{lang.langue}</span>
                                            <span 
                                                className={`${textSize} px-2 py-0.5 rounded`}
                                                style={{ 
                                                    backgroundColor: `${colors.primary}20`,
                                                    color: colors.secondary,
                                                }}
                                            >
                                                {lang.niveau}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {certifications.length > 0 && (
                            <section className="break-inside-avoid">
                                <h2 
                                    className="text-lg font-bold mb-3 flex items-center gap-2"
                                    style={{ color: colors.text }}
                                >
                                    <span 
                                        className="w-2 h-6 rounded"
                                        style={{ backgroundColor: colors.primary }}
                                    />
                                    Certifications
                                </h2>
                                <ul className={`space-y-1 ${textSize}`}>
                                    {certifications.slice(0, 5).map((cert: string, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span style={{ color: colors.primary }}>✓</span>
                                            {sanitizeText(cert)}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </div>

                {/* Projets */}
                {projects.length > 0 && (
                    <section className="mt-6">
                        <h2 
                            className="text-lg font-bold mb-4 flex items-center gap-2"
                            style={{ color: colors.text }}
                        >
                            <span 
                                className="w-2 h-6 rounded"
                                style={{ backgroundColor: colors.primary }}
                            />
                            Projets
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {projects.slice(0, 4).map((proj: any, idx: number) => (
                                <article 
                                    key={idx} 
                                    className="p-4 rounded-lg break-inside-avoid"
                                    style={{ backgroundColor: `${colors.primary}10` }}
                                >
                                    <h3 className="font-bold text-sm mb-1">
                                        {sanitizeText(proj.nom)}
                                    </h3>
                                    {proj.description && (
                                        <p className={`${textSize} text-gray-600 mb-2`}>
                                            {sanitizeText(proj.description)}
                                        </p>
                                    )}
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {proj.technologies.slice(0, 4).map((tech: string, tidx: number) => (
                                                <span
                                                    key={tidx}
                                                    className="px-1.5 py-0.5 text-xs rounded bg-white"
                                                    style={{ color: colors.secondary }}
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Références clients */}
                {clientsReferences?.clients && clientsReferences.clients.length > 0 && (
                    <section className="mt-6 break-inside-avoid">
                        <h2 
                            className="text-lg font-bold mb-3 flex items-center gap-2"
                            style={{ color: colors.text }}
                        >
                            <span 
                                className="w-2 h-6 rounded"
                                style={{ backgroundColor: colors.primary }}
                            />
                            Clients Références
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {clientsReferences.clients.slice(0, 10).map((client: string, idx: number) => (
                                <span
                                    key={idx}
                                    className={`px-3 py-1 rounded-full ${textSize} border-2`}
                                    style={{ 
                                        borderColor: colors.primary,
                                        color: colors.text,
                                    }}
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
