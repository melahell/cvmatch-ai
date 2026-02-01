/**
 * Template Bronzor - Inspiré de Reactive Resume
 * 
 * Design minimaliste et élégant
 * Layout: Full width, typographie épurée
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { CVData, TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";

interface BronzorColors {
    primary: string;
    accent: string;
    text: string;
    muted: string;
    background: string;
    line: string;
}

const defaultColors: BronzorColors = {
    primary: "#374151",
    accent: "#6366f1",
    text: "#111827",
    muted: "#9ca3af",
    background: "#ffffff",
    line: "#e5e7eb",
};

export default function BronzorTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = defaultColors;
    const padding = dense ? "px-8 py-6" : "px-12 py-8";
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

    const fullName = `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Nom Prénom";
    const titre = profil.titre_principal || "";

    // Extraire les skills
    const technicalSkills = Array.isArray(competences) 
        ? competences.map((c: any) => c.nom || c.name || c).filter(Boolean)
        : competences.techniques || [];
    const softSkills = Array.isArray(competences) 
        ? [] 
        : competences.soft_skills || [];

    return (
        <div 
            className="w-full min-h-[1123px] bg-white print:bg-white"
            style={{ 
                fontFamily: "'Inter', sans-serif",
                color: colors.text,
            }}
        >
            <div className={`${padding}`}>
                {/* HEADER - Minimaliste */}
                <header className="mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 
                                className="text-4xl font-light tracking-tight mb-2"
                                style={{ color: colors.text }}
                            >
                                {fullName}
                            </h1>
                            {titre && (
                                <h2 
                                    className="text-lg font-normal tracking-wide uppercase"
                                    style={{ color: colors.accent }}
                                >
                                    {sanitizeText(titre)}
                                </h2>
                            )}
                            
                            {/* Contact - Ligne simple */}
                            <div 
                                className={`flex flex-wrap gap-4 mt-4 ${textSize}`}
                                style={{ color: colors.muted }}
                            >
                                {profil.email && <span>{profil.email}</span>}
                                {profil.email && profil.telephone && <span>•</span>}
                                {profil.telephone && <span>{profil.telephone}</span>}
                                {profil.telephone && profil.localisation && <span>•</span>}
                                {profil.localisation && <span>{profil.localisation}</span>}
                                {profil.linkedin && (
                                    <>
                                        <span>•</span>
                                        <span style={{ color: colors.accent }}>
                                            {profil.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* Photo - Petite et discrète */}
                        {includePhoto && profil.photo_url && (
                            <img
                                src={profil.photo_url}
                                alt={fullName}
                                className="w-20 h-20 rounded-full object-cover grayscale hover:grayscale-0 transition-all"
                            />
                        )}
                    </div>
                    
                    {/* Séparateur */}
                    <div 
                        className="h-px mt-6"
                        style={{ backgroundColor: colors.line }}
                    />
                </header>

                {/* PITCH */}
                {profil.elevator_pitch && (
                    <section className="mb-8">
                        <p 
                            className={`${textSize} leading-relaxed`}
                            style={{ color: colors.muted }}
                        >
                            {sanitizeText(profil.elevator_pitch)}
                        </p>
                    </section>
                )}

                {/* EXPÉRIENCES */}
                {experiences.length > 0 && (
                    <section className="mb-8">
                        <h2 
                            className="text-xs font-semibold tracking-widest uppercase mb-4"
                            style={{ color: colors.accent }}
                        >
                            Expérience
                        </h2>
                        <div className="space-y-6">
                            {experiences.map((exp: any, idx: number) => (
                                <article key={idx} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold">
                                            {sanitizeText(exp.poste)}
                                        </h3>
                                        <span 
                                            className={`${textSize}`}
                                            style={{ color: colors.muted }}
                                        >
                                            {exp.date_debut}
                                            {exp.date_fin ? ` — ${exp.date_fin}` : " — Présent"}
                                        </span>
                                    </div>
                                    <p 
                                        className={`${textSize} font-medium mb-2`}
                                        style={{ color: colors.accent }}
                                    >
                                        {sanitizeText(exp.entreprise)}
                                        {exp.lieu && <span style={{ color: colors.muted }}> • {exp.lieu}</span>}
                                    </p>
                                    
                                    {exp.realisations && exp.realisations.length > 0 && (
                                        <ul 
                                            className={`space-y-1 ${textSize}`}
                                            style={{ color: colors.muted }}
                                        >
                                            {exp.realisations.slice(0, 4).map((real: string, ridx: number) => (
                                                <li key={ridx} className="flex items-start">
                                                    <span className="mr-2">—</span>
                                                    <span>{sanitizeText(real)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* FORMATION */}
                {formations.length > 0 && (
                    <section className="mb-8">
                        <h2 
                            className="text-xs font-semibold tracking-widest uppercase mb-4"
                            style={{ color: colors.accent }}
                        >
                            Formation
                        </h2>
                        <div className="space-y-3">
                            {formations.map((form: any, idx: number) => (
                                <article key={idx} className="flex justify-between items-baseline break-inside-avoid">
                                    <div>
                                        <span className="font-semibold">{sanitizeText(form.diplome)}</span>
                                        <span 
                                            className={`${textSize} ml-2`}
                                            style={{ color: colors.muted }}
                                        >
                                            {sanitizeText(form.etablissement)}
                                        </span>
                                    </div>
                                    <span 
                                        className={`${textSize}`}
                                        style={{ color: colors.muted }}
                                    >
                                        {form.annee}
                                    </span>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* COMPÉTENCES - Grille minimaliste */}
                {(technicalSkills.length > 0 || softSkills.length > 0) && (
                    <section className="mb-8">
                        <h2 
                            className="text-xs font-semibold tracking-widest uppercase mb-4"
                            style={{ color: colors.accent }}
                        >
                            Compétences
                        </h2>
                        <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                            {[...technicalSkills, ...softSkills].slice(0, 18).map((skill: string, idx: number) => (
                                <span 
                                    key={idx}
                                    className={`${textSize}`}
                                    style={{ color: colors.muted }}
                                >
                                    {sanitizeText(skill)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* LANGUES + CERTIFICATIONS - Sur deux colonnes */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                    {langues.length > 0 && (
                        <section className="break-inside-avoid">
                            <h2 
                                className="text-xs font-semibold tracking-widest uppercase mb-4"
                                style={{ color: colors.accent }}
                            >
                                Langues
                            </h2>
                            <div className="space-y-1">
                                {langues.map((lang: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className={`flex justify-between ${textSize}`}
                                    >
                                        <span>{lang.langue}</span>
                                        <span style={{ color: colors.muted }}>{lang.niveau}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {certifications.length > 0 && (
                        <section className="break-inside-avoid">
                            <h2 
                                className="text-xs font-semibold tracking-widest uppercase mb-4"
                                style={{ color: colors.accent }}
                            >
                                Certifications
                            </h2>
                            <div className="space-y-1">
                                {certifications.slice(0, 5).map((cert: string, idx: number) => (
                                    <p 
                                        key={idx}
                                        className={`${textSize}`}
                                        style={{ color: colors.muted }}
                                    >
                                        {sanitizeText(cert)}
                                    </p>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* PROJETS */}
                {projects.length > 0 && (
                    <section className="mb-8">
                        <h2 
                            className="text-xs font-semibold tracking-widest uppercase mb-4"
                            style={{ color: colors.accent }}
                        >
                            Projets
                        </h2>
                        <div className="space-y-4">
                            {projects.slice(0, 3).map((proj: any, idx: number) => (
                                <article key={idx} className="break-inside-avoid">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <h3 className="font-semibold">{sanitizeText(proj.nom)}</h3>
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <span 
                                                className={`${textSize}`}
                                                style={{ color: colors.muted }}
                                            >
                                                — {proj.technologies.slice(0, 3).join(", ")}
                                            </span>
                                        )}
                                    </div>
                                    {proj.description && (
                                        <p 
                                            className={`${textSize}`}
                                            style={{ color: colors.muted }}
                                        >
                                            {sanitizeText(proj.description)}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer minimal */}
                <footer 
                    className="pt-4 mt-8 border-t"
                    style={{ borderColor: colors.line }}
                >
                    <p 
                        className="text-xs text-center"
                        style={{ color: colors.muted }}
                    >
                        Références disponibles sur demande
                    </p>
                </footer>
            </div>
        </div>
    );
}
