/**
 * Template Onyx - Inspiré de Reactive Resume
 * 
 * Design professionnel avec sidebar
 * Layout: Main content + Sidebar
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { CVData, TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";

interface OnyxColors {
    primary: string;
    text: string;
    background: string;
    sidebar: string;
}

const defaultColors: OnyxColors = {
    primary: "#3b82f6",
    text: "#1f2937",
    background: "#ffffff",
    sidebar: "#f8fafc",
};

export default function OnyxTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = defaultColors;
    const padding = dense ? "p-4" : "p-6";
    const gap = dense ? "gap-3" : "gap-4";
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

    return (
        <div 
            className="w-full min-h-[1123px] bg-white print:bg-white"
            style={{ 
                fontFamily: "'Inter', sans-serif",
                color: colors.text,
            }}
        >
            <div className="flex min-h-[1123px]">
                {/* SIDEBAR */}
                <aside 
                    className={`w-[35%] ${padding} print:break-inside-avoid`}
                    style={{ backgroundColor: colors.sidebar }}
                >
                    {/* Photo */}
                    {includePhoto && profil.photo_url && (
                        <div className="flex justify-center mb-6">
                            <img
                                src={profil.photo_url}
                                alt={fullName}
                                className="w-32 h-32 rounded-full object-cover border-4"
                                style={{ borderColor: colors.primary }}
                            />
                        </div>
                    )}

                    {/* Contact */}
                    <section className={`mb-6 ${gap}`}>
                        <h2 
                            className="text-lg font-bold mb-3 pb-2 border-b-2"
                            style={{ borderColor: colors.primary, color: colors.primary }}
                        >
                            Contact
                        </h2>
                        <div className={`space-y-2 ${textSize}`}>
                            {profil.email && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">✉</span>
                                    <span>{profil.email}</span>
                                </div>
                            )}
                            {profil.telephone && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">📞</span>
                                    <span>{profil.telephone}</span>
                                </div>
                            )}
                            {profil.localisation && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">📍</span>
                                    <span>{profil.localisation}</span>
                                </div>
                            )}
                            {profil.linkedin && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">🔗</span>
                                    <span className="text-blue-600 break-all">
                                        {profil.linkedin.replace(/https?:\/\/(www\.)?/, "")}
                                    </span>
                                </div>
                            )}
                            {profil.github && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">💻</span>
                                    <span className="break-all">
                                        {profil.github.replace(/https?:\/\/(www\.)?/, "")}
                                    </span>
                                </div>
                            )}
                            {profil.portfolio && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">🌐</span>
                                    <span className="break-all">
                                        {profil.portfolio.replace(/https?:\/\/(www\.)?/, "")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Compétences */}
                    {technicalSkills.length > 0 && (
                        <section className="mb-6 break-inside-avoid">
                            <h2 
                                className="text-lg font-bold mb-3 pb-2 border-b-2"
                                style={{ borderColor: colors.primary, color: colors.primary }}
                            >
                                Compétences
                            </h2>
                            <div className="flex flex-wrap gap-1.5">
                                {technicalSkills.slice(0, 15).map((skill: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className={`px-2 py-1 rounded ${textSize}`}
                                        style={{ 
                                            backgroundColor: `${colors.primary}15`,
                                            color: colors.primary,
                                        }}
                                    >
                                        {sanitizeText(skill)}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Soft Skills */}
                    {softSkills.length > 0 && (
                        <section className="mb-6 break-inside-avoid">
                            <h2 
                                className="text-lg font-bold mb-3 pb-2 border-b-2"
                                style={{ borderColor: colors.primary, color: colors.primary }}
                            >
                                Soft Skills
                            </h2>
                            <ul className={`space-y-1 ${textSize}`}>
                                {softSkills.slice(0, 8).map((skill: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span style={{ color: colors.primary }}>●</span>
                                        {sanitizeText(skill)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                        <section className="mb-6 break-inside-avoid">
                            <h2 
                                className="text-lg font-bold mb-3 pb-2 border-b-2"
                                style={{ borderColor: colors.primary, color: colors.primary }}
                            >
                                Langues
                            </h2>
                            <div className={`space-y-2 ${textSize}`}>
                                {langues.map((lang: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="font-medium">{lang.langue}</span>
                                        <span className="text-gray-500">{lang.niveau}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section className="mb-6 break-inside-avoid">
                            <h2 
                                className="text-lg font-bold mb-3 pb-2 border-b-2"
                                style={{ borderColor: colors.primary, color: colors.primary }}
                            >
                                Certifications
                            </h2>
                            <ul className={`space-y-1 ${textSize}`}>
                                {certifications.slice(0, 6).map((cert: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span style={{ color: colors.primary }}>✓</span>
                                        {sanitizeText(cert)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </aside>

                {/* MAIN CONTENT */}
                <main className={`flex-1 ${padding}`}>
                    {/* Header */}
                    <header className="mb-6 pb-4 border-b-2" style={{ borderColor: colors.primary }}>
                        <h1 
                            className="text-3xl font-bold mb-1"
                            style={{ color: colors.text }}
                        >
                            {fullName}
                        </h1>
                        {titre && (
                            <h2 
                                className="text-xl font-medium"
                                style={{ color: colors.primary }}
                            >
                                {sanitizeText(titre)}
                            </h2>
                        )}
                        {profil.elevator_pitch && (
                            <p className={`mt-3 ${textSize} text-gray-600 leading-relaxed`}>
                                {sanitizeText(profil.elevator_pitch)}
                            </p>
                        )}
                    </header>

                    {/* Expériences */}
                    {experiences.length > 0 && (
                        <section className="mb-6">
                            <h2 
                                className="text-xl font-bold mb-4 pb-2 border-b"
                                style={{ color: colors.primary, borderColor: colors.primary }}
                            >
                                Expérience Professionnelle
                            </h2>
                            <div className={`space-y-4 ${gap}`}>
                                {experiences.map((exp: any, idx: number) => (
                                    <article key={idx} className="break-inside-avoid">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h3 className="font-bold text-base">
                                                    {sanitizeText(exp.poste)}
                                                </h3>
                                                <p 
                                                    className="font-medium"
                                                    style={{ color: colors.primary }}
                                                >
                                                    {sanitizeText(exp.entreprise)}
                                                </p>
                                            </div>
                                            <div className={`text-right ${textSize} text-gray-500`}>
                                                <div>
                                                    {exp.date_debut}
                                                    {exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}
                                                </div>
                                                {exp.lieu && <div>{exp.lieu}</div>}
                                            </div>
                                        </div>
                                        {exp.realisations && exp.realisations.length > 0 && (
                                            <ul className={`mt-2 space-y-1 ${textSize} text-gray-700`}>
                                                {exp.realisations.slice(0, 4).map((real: string, ridx: number) => (
                                                    <li key={ridx} className="flex items-start gap-2">
                                                        <span 
                                                            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: colors.primary }}
                                                        />
                                                        <span>{sanitizeText(real)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {exp.clients && exp.clients.length > 0 && (
                                            <p className={`mt-2 ${textSize} text-gray-500`}>
                                                <span className="font-medium">Clients : </span>
                                                {exp.clients.slice(0, 3).join(", ")}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                        <section className="mb-6">
                            <h2 
                                className="text-xl font-bold mb-4 pb-2 border-b"
                                style={{ color: colors.primary, borderColor: colors.primary }}
                            >
                                Formation
                            </h2>
                            <div className={`space-y-3 ${gap}`}>
                                {formations.map((form: any, idx: number) => (
                                    <article key={idx} className="break-inside-avoid">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold">
                                                    {sanitizeText(form.diplome)}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {sanitizeText(form.etablissement)}
                                                </p>
                                            </div>
                                            <span className={`${textSize} text-gray-500`}>
                                                {form.annee}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projets */}
                    {projects.length > 0 && (
                        <section className="mb-6">
                            <h2 
                                className="text-xl font-bold mb-4 pb-2 border-b"
                                style={{ color: colors.primary, borderColor: colors.primary }}
                            >
                                Projets
                            </h2>
                            <div className={`space-y-3 ${gap}`}>
                                {projects.slice(0, 4).map((proj: any, idx: number) => (
                                    <article key={idx} className="break-inside-avoid">
                                        <h3 className="font-bold">{sanitizeText(proj.nom)}</h3>
                                        {proj.description && (
                                            <p className={`${textSize} text-gray-600 mt-1`}>
                                                {sanitizeText(proj.description)}
                                            </p>
                                        )}
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {proj.technologies.slice(0, 5).map((tech: string, tidx: number) => (
                                                    <span
                                                        key={tidx}
                                                        className="px-1.5 py-0.5 text-xs rounded"
                                                        style={{ 
                                                            backgroundColor: `${colors.primary}10`,
                                                            color: colors.primary,
                                                        }}
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
                        <section className="mb-6">
                            <h2 
                                className="text-xl font-bold mb-4 pb-2 border-b"
                                style={{ color: colors.primary, borderColor: colors.primary }}
                            >
                                Clients Références
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {clientsReferences.clients.slice(0, 8).map((client: string, idx: number) => (
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
