/**
 * Template Leafish - Inspiré de Reactive Resume
 * 
 * Design nature/organique avec accents verts
 * Layout: Header arrondi + sections avec coins arrondis
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { CVData, TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";

interface LeafishColors {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    background: string;
}

const defaultColors: LeafishColors = {
    primary: "#22c55e",  // Vert feuille
    secondary: "#16a34a",
    text: "#1f2937",
    muted: "#6b7280",
    background: "#ffffff",
};

export default function LeafishTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
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
            style={{ fontFamily: "'Inter', sans-serif", color: colors.text }}
        >
            {/* HEADER avec fond vert arrondi */}
            <header
                className={`${padding} rounded-b-3xl`}
                style={{ backgroundColor: colors.primary }}
            >
                <div className="flex items-center gap-6 text-white">
                    {/* Photo */}
                    {includePhoto && profil.photo_url && (
                        <img
                            src={profil.photo_url}
                            alt={fullName}
                            className="w-24 h-24 rounded-2xl object-cover border-3 border-white shadow-lg"
                        />
                    )}

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
                        {titre && (
                            <h2 className="text-base text-white/90">
                                {sanitizeText(titre)}
                            </h2>
                        )}

                        {/* Contact */}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/80">
                            {profil.email && <span>✉ {profil.email}</span>}
                            {profil.telephone && <span>📞 {profil.telephone}</span>}
                            {profil.localisation && <span>📍 {profil.localisation}</span>}
                            {profil.linkedin && <span>🔗 LinkedIn</span>}
                            {profil.github && <span>GH {profil.github.replace(/https?:\/\/(www\.)?/, "")}</span>}
                            {profil.portfolio && <span>WEB {profil.portfolio.replace(/https?:\/\/(www\.)?/, "")}</span>}
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENT */}
            <main className={`${padding} space-y-5`}>
                {/* Pitch */}
                {profil.elevator_pitch && (
                    <section className="p-4 rounded-2xl" style={{ backgroundColor: `${colors.primary}10` }}>
                        <p className={`${textSize} text-gray-700 leading-relaxed`}>
                            {sanitizeText(profil.elevator_pitch)}
                        </p>
                    </section>
                )}

                {/* Compétences */}
                {allSkills.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: colors.primary }}>
                                🛠
                            </span>
                            Compétences
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {allSkills.slice(0, 16).map((skill: string, idx: number) => (
                                <span key={idx} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.primary}15`, color: colors.secondary }}>
                                    {sanitizeText(skill)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Expériences */}
                {experiences.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: colors.primary }}>
                                💼
                            </span>
                            Expérience Professionnelle
                        </h2>
                        <div className="space-y-4">
                            {experiences.map((exp: any, idx: number) => (
                                <article key={idx} className="p-4 rounded-xl border" style={{ borderColor: `${colors.primary}30` }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold">{sanitizeText(exp.poste)}</h3>
                                            <p className="font-medium text-sm" style={{ color: colors.secondary }}>
                                                {sanitizeText(exp.entreprise)}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500 shrink-0 px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.primary}10` }}>
                                            {exp.date_debut}{exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}
                                        </span>
                                    </div>

                                    {exp.realisations && exp.realisations.length > 0 && (
                                        <ul className={`space-y-1 ${textSize} text-gray-600`}>
                                            {exp.realisations.slice(0, 4).map((real: string, ridx: number) => (
                                                <li key={ridx} className="flex items-start gap-2">
                                                    <span style={{ color: colors.primary }}>🌿</span>
                                                    <span>{sanitizeText(real)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {exp.clients && exp.clients.length > 0 && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            <span className="font-medium">Clients : </span>
                                            {exp.clients.slice(0, 4).join(", ")}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Grid: Formation + Langues + Certifications */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Formations */}
                    {formations.length > 0 && (
                        <section className="p-4 rounded-xl" style={{ backgroundColor: `${colors.primary}08` }}>
                            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span style={{ color: colors.primary }}>🎓</span>
                                Formation
                            </h2>
                            <div className="space-y-2.5">
                                {formations.map((form: any, idx: number) => (
                                    <article key={idx}>
                                        <h3 className="font-semibold text-xs">{sanitizeText(form.diplome)}</h3>
                                        <p className="text-xs text-gray-600">{sanitizeText(form.etablissement)}</p>
                                        <p className="text-xs text-gray-400">{form.annee}</p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                        <section className="p-4 rounded-xl" style={{ backgroundColor: `${colors.primary}08` }}>
                            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span style={{ color: colors.primary }}>🌍</span>
                                Langues
                            </h2>
                            <div className="space-y-2">
                                {langues.map((lang: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-xs font-medium">{lang.langue}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.primary}20`, color: colors.secondary }}>
                                            {lang.niveau}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section className="p-4 rounded-xl" style={{ backgroundColor: `${colors.primary}08` }}>
                            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span style={{ color: colors.primary }}>📜</span>
                                Certifications
                            </h2>
                            <ul className="space-y-1 text-xs">
                                {certifications.slice(0, 5).map((cert: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span style={{ color: colors.primary }}>✓</span>
                                        {sanitizeText(cert)}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                {/* Projets + Clients */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Projets */}
                    {projects.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span style={{ color: colors.primary }}>🚀</span>
                                Projets
                            </h2>
                            <div className="space-y-2">
                                {projects.slice(0, 3).map((proj: any, idx: number) => (
                                    <article key={idx} className="p-3 rounded-xl border" style={{ borderColor: `${colors.primary}30` }}>
                                        <h3 className="font-semibold text-xs">{sanitizeText(proj.nom)}</h3>
                                        {proj.description && (
                                            <p className="text-xs text-gray-600 mt-1">{sanitizeText(proj.description)}</p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Références clients */}
                    {clientsReferences?.clients && clientsReferences.clients.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <span style={{ color: colors.primary }}>🤝</span>
                                Clients
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {clientsReferences.clients.slice(0, 8).map((client: string, idx: number) => (
                                    <span key={idx} className="px-2.5 py-1 rounded-full text-xs border" style={{ borderColor: colors.primary, color: colors.secondary }}>
                                        {client}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
