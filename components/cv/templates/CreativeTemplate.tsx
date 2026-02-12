"use client";

import React from "react";
import { TemplateProps, isValidEntreprise, withDL } from "./index";
import { Mail, Phone, MapPin, Linkedin, Sparkles, Github, Globe, ExternalLink } from "lucide-react";
// [CDC-24] Utiliser utilitaire centralisé
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { formatDate } from "@/lib/cv/formatters";

const COLORS = {
    primary: "var(--cv-primary)",
    secondary: "var(--cv-sidebar-accent)",
    accent: "var(--cv-sidebar-accent)",
    tertiary: "var(--cv-sidebar-accent)",
    primary10: "color-mix(in srgb, var(--cv-primary) 6.25%, transparent)",
    secondary10: "color-mix(in srgb, var(--cv-sidebar-accent) 6.25%, transparent)",
};

export default function CreativeTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false,
    displayLimits: dl
}: TemplateProps) {
    const limits = withDL(dl);
    const { profil, experiences, competences, formations, langues, certifications, clients_references, projects } = data;
    // Support HTTP URLs AND base64 data URIs
    const hasValidPhoto =
        typeof profil?.photo_url === "string" &&
        (profil.photo_url.startsWith("http://") || profil.photo_url.startsWith("https://") || profil.photo_url.startsWith("data:image/"));

    // Helper to safely render a string from potentially object value
    const safeString = (val: any): string => {
        if (typeof val === 'string') return sanitizeText(val);
        if (typeof val === 'object' && val !== null) {
            if (val.name) return sanitizeText(val.name);
            if (val.skill) return sanitizeText(val.skill);
            if (val.description) return sanitizeText(val.description);
            if (val.impact) return sanitizeText(val.impact);
            return sanitizeText(JSON.stringify(val));
        }
        return sanitizeText(String(val || ''));
    };

    const limitedExperiences = experiences || [];
    const rawSkills = (competences?.techniques || []).slice(0, limits.maxSkills);
    const limitedSkills = rawSkills.map(safeString);
    const rawSoftSkills = (competences?.soft_skills || []).slice(0, limits.maxSoftSkills);
    const limitedSoftSkills = rawSoftSkills.map(safeString);
    const limitedFormations = (formations || []).slice(0, limits.maxFormations);
    const limitedCertifications = (certifications || []).slice(0, limits.maxCertifications).map(safeString);
    const limitedClients = (clients_references?.clients || []).slice(0, limits.maxClientsReferences).map(safeString);
    const limitedProjects = (projects || []).slice(0, limits.maxProjects);
    const initials = `${profil?.prenom?.[0] || ''}${profil?.nom?.[0] || ''}`.toUpperCase();

    return (
        <div
            className="cv-page bg-white shadow-2xl rounded-2xl text-[9pt]"
            style={{
                width: '210mm',
                minHeight: '297mm',
                boxSizing: 'border-box',
                fontFamily: "var(--cv-font-body)",
                fontSize: dense ? '8.5pt' : '9pt',
                lineHeight: dense ? '1.25' : '1.3'
            }}
        >
            {/* Colorful Header Banner */}
            <header
                className="relative p-6 text-white overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 50%, ${COLORS.accent} 100%)`
                }}
            >
                {/* Decorative circles */}
                <div
                    className="absolute rounded-full opacity-20"
                    style={{
                        width: '150mm',
                        height: '150mm',
                        top: '-80mm',
                        right: '-50mm',
                        background: 'white'
                    }}
                />
                <div
                    className="absolute rounded-full opacity-10"
                    style={{
                        width: '100mm',
                        height: '100mm',
                        bottom: '-60mm',
                        left: '-30mm',
                        background: 'white'
                    }}
                />

                <div className="relative z-10 flex items-center gap-5">
                    {/* Avatar */}
                    {includePhoto && (
                        <div
                            className="w-28 h-28 rounded-full border-4 border-white overflow-hidden flex-shrink-0 shadow-level-4"
                        >
                            {hasValidPhoto ? (
                                <img
                                    src={profil.photo_url}
                                    alt={`Photo professionnelle de ${profil.prenom} ${profil.nom}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                                    {initials}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1">
                        <h1
                            className="text-2xl font-extrabold tracking-tight drop-shadow-lg"
                        >
                            {profil.prenom} {profil.nom}
                        </h1>
                        <p className="text-white/90 mt-1 text-[11pt] font-medium">
                            {profil.titre_principal}
                        </p>

                        {/* Contact */}
                        <div className="flex flex-wrap gap-3 mt-3 text-[8pt] text-white/80">
                            {profil.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {profil.email}
                                </span>
                            )}
                            {profil.telephone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {profil.telephone}
                                </span>
                            )}
                            {profil.localisation && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {profil.localisation}
                                </span>
                            )}
                            {/* [CDC-21] Liens sociaux ajoutés */}
                            {profil.linkedin && (
                                <span className="flex items-center gap-1">
                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                </span>
                            )}
                            {profil.github && (
                                <span className="flex items-center gap-1">
                                    <Github className="w-3 h-3" /> GitHub
                                </span>
                            )}
                            {profil.portfolio && (
                                <span className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Portfolio
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex">
                {/* Main Column */}
                <main className="flex-1 p-6">
                    {/* Summary with accent border */}
                    {profil.elevator_pitch && (
                        <section style={{ marginBottom: "var(--spacing-section)" }}>
                            <p
                                className="text-slate-700 text-[9pt] leading-relaxed pl-4 italic"
                                style={{ borderLeft: `4px solid ${COLORS.primary}` }}
                            >
                                {sanitizeText(profil.elevator_pitch)}
                            </p>
                        </section>
                    )}

                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div
                            className="px-4 py-2 rounded-lg text-[8pt]"
                            style={{
                                background: `linear-gradient(90deg, ${COLORS.primary10}, ${COLORS.secondary10})`,
                                marginBottom: "var(--spacing-section)"
                            }}
                        >
                            <span style={{ color: COLORS.primary }}>✨</span>
                            <span className="ml-2 text-slate-700">
                                Candidature pour : <strong>{jobContext.job_title}</strong>
                                {jobContext.company && ` chez ${jobContext.company}`}
                            </span>
                        </div>
                    )}

                    {/* Experiences with colorful timeline */}
                    <section style={{ marginBottom: "var(--spacing-section)" }}>
                        <h2
                            className="text-[12pt] font-extrabold mb-4 flex items-center gap-2"
                            style={{ color: COLORS.secondary }}
                        >
                            <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                style={{ background: COLORS.secondary }}
                            >
                                💼
                            </span>
                            Expériences
                        </h2>

                        <div className="flex flex-col" style={{ gap: "var(--spacing-item)" }}>
                            {limitedExperiences.map((exp, i) => {
                                const colors = [COLORS.primary, COLORS.secondary, COLORS.accent];
                                const color = colors[i % colors.length];
                                return (
                                    <div
                                        key={i}
                                        className="pl-5 py-3 rounded-r-xl relative break-inside-avoid"
                                        style={{
                                            borderLeft: `4px solid ${color}`,
                                            background: `linear-gradient(90deg, ${color}08, transparent)`
                                        }}
                                    >
                                        {/* Colorful dot */}
                                        <div
                                            className="absolute -left-[10px] top-3 w-4 h-4 rounded-full border-4 border-white"
                                            style={{ background: color, boxShadow: `0 0 10px ${color}60` }}
                                        />

                                        <div className="text-[8pt] font-bold" style={{ color }}>
                                            {exp.date_debut ? `${formatDate(exp.date_debut)} - ${exp.date_fin ? formatDate(exp.date_fin) : 'Présent'}` : (exp.date_fin ? formatDate(exp.date_fin) : "")}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-[10pt] font-extrabold text-slate-900">{sanitizeText(exp.poste)}</h4>
                                            {(exp as any)._relevance_score >= 50 && (
                                                <span
                                                    className="text-[6pt] px-1.5 py-0.5 rounded font-bold text-white"
                                                    style={{ background: color }}
                                                >
                                                    ★ Match
                                                </span>
                                            )}
                                        </div>
                                        {isValidEntreprise(exp.entreprise) ? (
                                            <p className="text-[8pt] text-slate-600 mb-1.5">{exp.entreprise}{exp.lieu && ` · ${exp.lieu}`}</p>
                                        ) : exp.lieu ? (
                                            <p className="text-[8pt] text-slate-600 mb-1.5">{exp.lieu}</p>
                                        ) : null}
                                        {exp.clients && exp.clients.length > 0 && (
                                            <p className="text-[7pt] text-slate-600 mb-1.5">
                                                Clients : {exp.clients.slice(0, limits.maxClientsPerExp).map(safeString).join(", ")}
                                            </p>
                                        )}

                                        {exp.realisations && exp.realisations.length > 0 && (
                                            <ul className="text-[8pt] text-slate-700 space-y-0.5">
                                                {exp.realisations.slice(0, limits.maxRealisationsPerExp).map((r, j) => (
                                                    <li key={j} className="flex items-start gap-1.5">
                                                        <span style={{ color }}>→</span> {safeString(r)}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </main>

                {/* Sidebar */}
                <aside
                    className="w-64 p-5 flex-shrink-0"
                    style={{ background: "var(--cv-sidebar-bg)" }}
                >
                    {/* Skills with colorful tags */}
                    <section style={{ marginBottom: "var(--spacing-section)" }}>
                        <h3
                            className="text-[10pt] font-extrabold mb-3 flex items-center gap-2"
                            style={{ color: COLORS.accent }}
                        >
                            💡 Compétences
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {limitedSkills.map((skill, i) => {
                                const colors = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.tertiary];
                                const color = colors[i % colors.length];
                                return (
                                    <span
                                        key={i}
                                        className="px-2 py-1 text-[7pt] rounded-md text-white font-medium"
                                        style={{ background: color }}
                                    >
                                        {skill}
                                    </span>
                                );
                            })}
                        </div>
                    </section>

                    {/* Soft Skills */}
                    {limitedSoftSkills.length > 0 && (
                        <section style={{ marginBottom: "var(--spacing-section)" }}>
                            <h3
                                className="text-[10pt] font-extrabold mb-2 flex items-center gap-2"
                                style={{ color: COLORS.secondary }}
                            >
                                ✨ Qualités
                            </h3>
                            <div className="space-y-1.5">
                                {limitedSoftSkills.map((skill, i) => (
                                    <div
                                        key={i}
                                        className="text-[8pt] text-slate-700 flex items-center gap-2"
                                    >
                                        <span style={{ color: COLORS.primary }}>●</span>
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formation */}
                    <section style={{ marginBottom: "var(--spacing-section)" }}>
                        <h3
                            className="text-[10pt] font-extrabold mb-2 flex items-center gap-2"
                            style={{ color: COLORS.accent }}
                        >
                            🎓 Formation
                        </h3>
                        {limitedFormations.map((edu, i) => (
                            <div key={i} className="mb-2">
                                <div className="text-[8pt] font-bold text-slate-900">{edu.diplome}</div>
                                <div className="text-[7pt] text-slate-600">
                                    {edu.etablissement}
                                    {edu.annee && ` (${edu.annee})`}
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Languages */}
                    {langues && langues.length > 0 && (
                        <section>
                            <h3
                                className="text-[10pt] font-extrabold mb-2 flex items-center gap-2"
                                style={{ color: COLORS.tertiary }}
                            >
                                🌍 Langues
                            </h3>
                            {(langues || []).slice(0, limits.maxLangues).map((lang, i) => (
                                <div key={i} className="text-[8pt] mb-1">
                                    <span className="font-bold text-slate-900">{lang.langue}</span>
                                    <span className="text-slate-600"> – {lang.niveau}</span>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Certifications */}
                    {limitedCertifications.length > 0 && (
                        <section style={{ marginTop: "var(--spacing-section)" }}>
                            <h3
                                className="text-[10pt] font-extrabold mb-2 flex items-center gap-2"
                                style={{ color: COLORS.primary }}
                            >
                                ✅ Certifications
                            </h3>
                            <div className="space-y-1.5">
                                {limitedCertifications.map((cert, i) => (
                                    <div
                                        key={i}
                                        className="text-[8pt] text-slate-700 flex items-center gap-2"
                                    >
                                        <span style={{ color: COLORS.primary }}>●</span>
                                        {cert}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Clients */}
                    {limitedClients.length > 0 && (
                        <section style={{ marginTop: "var(--spacing-section)" }}>
                            <h3
                                className="text-[10pt] font-extrabold mb-2 flex items-center gap-2"
                                style={{ color: COLORS.secondary }}
                            >
                                🏢 Clients
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {limitedClients.map((client, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 text-[7pt] rounded-md text-white font-medium"
                                        style={{ background: COLORS.secondary }}
                                    >
                                        {client}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* [CDC-21] Section Projets ajoutée */}
                    {limitedProjects.length > 0 && (
                        <section style={{ marginTop: "var(--spacing-section)" }}>
                            <h3
                                className="text-[10pt] font-extrabold mb-2 flex items-center gap-2"
                                style={{ color: COLORS.accent }}
                            >
                                🚀 Projets
                            </h3>
                            <div className="space-y-2">
                                {limitedProjects.map((project, i) => (
                                    <div key={i} className="mb-2">
                                        <div className="text-[8pt] font-bold text-slate-900 flex items-center gap-1">
                                            {project.nom}
                                            {project.lien && <ExternalLink className="w-2.5 h-2.5 text-slate-500" />}
                                        </div>
                                        <div className="text-[7pt] text-slate-600">{project.description}</div>
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {project.technologies.map((tech, j) => (
                                                    <span
                                                        key={j}
                                                        className="px-1.5 py-0.5 text-[6pt] rounded text-white"
                                                        style={{ background: COLORS.tertiary }}
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}
