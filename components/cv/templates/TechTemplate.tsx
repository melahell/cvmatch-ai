"use client";

import React from "react";
import { TemplateProps } from "./index";
import { Mail, Phone, MapPin, Github, Linkedin, Globe, ExternalLink } from "lucide-react";
// [CDC-24] Utiliser utilitaire centralisé
import { sanitizeText } from "@/lib/cv/sanitize-text";

const COLORS = {
    primary: "var(--cv-primary)",
    secondary: "var(--cv-sidebar-accent)",
    accent: "var(--cv-sidebar-accent)",
    bg: "var(--cv-sidebar-bg)",
    bgLight: "color-mix(in srgb, var(--cv-sidebar-bg) 85%, white)",
    primary30: "color-mix(in srgb, var(--cv-primary) 18.75%, transparent)",
    secondary30: "color-mix(in srgb, var(--cv-sidebar-accent) 18.75%, transparent)",
    accent30: "color-mix(in srgb, var(--cv-sidebar-accent) 18.75%, transparent)",
    primary40: "color-mix(in srgb, var(--cv-primary) 25%, transparent)",
};

export default function TechTemplate({
    data,
    includePhoto = false, // Default false for tech
    jobContext,
    dense = false
}: TemplateProps) {
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

    // Show all data - let CDC Pipeline handle optimization
    const limitedExperiences = experiences || [];
    const rawSkills = competences?.techniques || [];
    const limitedSkills = rawSkills.map(safeString);
    const limitedFormations = formations || [];

    // Categorize skills
    const categorizeSkills = (skills: string[]) => {
        const categories: Record<string, string[]> = {
            languages: [],
            frameworks: [],
            tools: [],
            databases: [],
            other: []
        };

        const patterns = {
            languages: ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin'],
            frameworks: ['react', 'vue', 'angular', 'next', 'node', 'express', 'django', 'spring', 'rails', 'fastapi', 'nest'],
            tools: ['git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci', 'cd', 'jenkins', 'terraform', 'ansible'],
            databases: ['sql', 'postgres', 'mysql', 'mongo', 'redis', 'elastic', 'firebase', 'supabase', 'dynamodb']
        };

        skills.forEach(skill => {
            const lower = skill.toLowerCase();
            let categorized = false;
            for (const [cat, keywords] of Object.entries(patterns)) {
                if (keywords.some(kw => lower.includes(kw))) {
                    categories[cat].push(skill);
                    categorized = true;
                    break;
                }
            }
            if (!categorized) categories.other.push(skill);
        });

        return categories;
    };

    const skillCategories = categorizeSkills(limitedSkills);
    const initials = `${profil?.prenom?.[0] || ''}${profil?.nom?.[0] || ''}`.toUpperCase();

    return (
        <div
            className="cv-page bg-white shadow-2xl rounded-xl overflow-hidden flex text-[9pt]"
            style={{
                width: '210mm',
                height: '297mm',
                maxHeight: '297mm',
                overflow: 'hidden',
                boxSizing: 'border-box',
                fontFamily: "var(--cv-font-body)",
                fontSize: dense ? '8.5pt' : '9pt',
                lineHeight: dense ? '1.25' : '1.3'
            }}
        >
            {/* Sidebar Gauche - Terminal Style */}
            <aside
                className="flex-shrink-0 text-white p-5 flex flex-col"
                style={{
                    width: '70mm',
                    background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bgLight} 100%)`
                }}
            >
                {/* Terminal Header */}
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-700" style={{ marginBottom: "var(--spacing-section)" }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-2 text-[7pt] text-slate-600 font-mono">~/profile.dev</span>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center text-center" style={{ marginBottom: "var(--spacing-section)" }}>
                    {includePhoto && hasValidPhoto ? (
                        <div
                            className="w-20 h-20 rounded-lg border-2 border-[color:var(--cv-primary)] p-0.5 mb-3 overflow-hidden shadow-level-3"
                        >
                            <img
                                src={profil.photo_url}
                                alt={`Photo professionnelle de ${profil.prenom} ${profil.nom}`}
                                className="w-full h-full object-cover rounded-md"
                            />
                        </div>
                    ) : (
                        <div
                            className="w-20 h-20 rounded-lg border-2 border-[color:var(--cv-primary)] mb-3 flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${COLORS.primary30}, ${COLORS.secondary30})`,
                                boxShadow: `0 0 15px ${COLORS.primary40}`
                            }}
                        >
                            <span className="text-2xl font-bold text-[color:var(--cv-primary)]">{initials}</span>
                        </div>
                    )}
                    <h1 className="text-base font-bold tracking-tight">{profil.prenom} {profil.nom}</h1>
                    <p className="text-[color:var(--cv-primary)] font-mono mt-1 text-[8pt]">
                        <span className="text-slate-600">{'>'}</span> {profil.titre_principal}
                    </p>
                </div>

                {/* Contact - Terminal style */}
                <div className="flex flex-col text-[7pt] font-mono" style={{ gap: "var(--spacing-item)", marginBottom: "var(--spacing-section)" }}>
                    <div className="text-[color:var(--cv-primary)] text-[6pt] mb-1">{'// contact'}</div>
                    {profil.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-[color:var(--cv-sidebar-accent)]" />
                            <span className="text-slate-300 truncate">{profil.email}</span>
                        </div>
                    )}
                    {profil.telephone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-[color:var(--cv-sidebar-accent)]" />
                            <span className="text-slate-300">{profil.telephone}</span>
                        </div>
                    )}
                    {profil.localisation && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-[color:var(--cv-sidebar-accent)]" />
                            <span className="text-slate-300">{profil.localisation}</span>
                        </div>
                    )}
                    {profil.github && (
                        <div className="flex items-center gap-2">
                            <Github className="w-3 h-3 text-[color:var(--cv-sidebar-accent)]" />
                            <span className="text-slate-300 truncate">{profil.github}</span>
                        </div>
                    )}
                    {profil.portfolio && (
                        <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-[color:var(--cv-sidebar-accent)]" />
                            <span className="text-slate-300 truncate">{profil.portfolio}</span>
                        </div>
                    )}
                    {profil.linkedin && (
                        <div className="flex items-center gap-2">
                            <Linkedin className="w-3 h-3 text-[color:var(--cv-sidebar-accent)]" />
                            <span className="text-slate-300 truncate">{profil.linkedin}</span>
                        </div>
                    )}
                </div>

                {/* Skills by Category */}
                <div className="flex-1 flex flex-col" style={{ gap: "var(--spacing-item)" }}>
                    <div className="text-[color:var(--cv-primary)] text-[6pt] font-mono">{'// tech_stack'}</div>

                    {skillCategories.languages.length > 0 && (
                        <div>
                            <div className="text-[6pt] text-slate-600 mb-1">languages:</div>
                            <div className="flex flex-wrap gap-1">
                                {skillCategories.languages.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-[6pt] rounded font-mono"
                                        style={{ background: COLORS.primary30, color: COLORS.primary }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {skillCategories.frameworks.length > 0 && (
                        <div>
                            <div className="text-[6pt] text-slate-600 mb-1">frameworks:</div>
                            <div className="flex flex-wrap gap-1">
                                {skillCategories.frameworks.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-[6pt] rounded font-mono"
                                        style={{ background: COLORS.secondary30, color: COLORS.secondary }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {skillCategories.tools.length > 0 && (
                        <div>
                            <div className="text-[6pt] text-slate-600 mb-1">devops:</div>
                            <div className="flex flex-wrap gap-1">
                                {skillCategories.tools.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-[6pt] rounded font-mono"
                                        style={{ background: COLORS.accent30, color: COLORS.accent }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {skillCategories.databases.length > 0 && (
                        <div>
                            <div className="text-[6pt] text-slate-600 mb-1">databases:</div>
                            <div className="flex flex-wrap gap-1">
                                {skillCategories.databases.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-[6pt] rounded font-mono bg-[var(--cv-primary-light)] text-[color:var(--cv-primary)]"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* [CDC-21] Soft Skills ajoutés */}
                {competences?.soft_skills && competences.soft_skills.length > 0 && (
                    <div className="pt-3 border-t border-slate-700 mt-3">
                        <div className="text-[color:var(--cv-primary)] text-[6pt] font-mono mb-1">{'// soft_skills'}</div>
                        <div className="flex flex-wrap gap-1">
                            {competences.soft_skills.map(safeString).map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-1.5 py-0.5 text-[6pt] rounded font-mono bg-[var(--cv-primary-light)] text-[color:var(--cv-sidebar-accent)]"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {langues && langues.length > 0 && (
                    <div className="pt-3 border-t border-slate-700 mt-auto">
                        <div className="text-[color:var(--cv-primary)] text-[6pt] font-mono mb-1">{'// languages'}</div>
                        <div className="flex flex-wrap gap-2">
                            {langues.map((lang, i) => (
                                <span key={i} className="text-[7pt] text-slate-300">
                                    {lang.langue}: <span className="text-[color:var(--cv-primary)]">{lang.niveau.split(' ')[0]}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-5 bg-white overflow-hidden" style={{ fontFamily: "var(--cv-font-body)" }}>
                {/* Header */}
                <div className="pb-3 border-b-2 border-[color:var(--cv-primary)]" style={{ marginBottom: "var(--spacing-section)" }}>
                    <h1 className="text-xl font-extrabold text-slate-900">{profil.prenom} {profil.nom}</h1>
                    <p className="text-[color:var(--cv-primary)] font-semibold text-[10pt]">{profil.titre_principal}</p>

                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div className="mt-2 px-2 py-1 bg-[var(--cv-primary-light)] rounded inline-block">
                            <span className="text-[7pt] text-[color:var(--cv-primary)] font-mono">
                                {'// Candidature: '} {jobContext.job_title}
                                {jobContext.company && ` @ ${jobContext.company}`}
                                {jobContext.match_score && ` | Match: ${jobContext.match_score}%`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Summary */}
                {profil.elevator_pitch && (
                    <section style={{ marginBottom: "var(--spacing-section)" }}>
                        <p className="text-slate-700 text-[9pt] leading-relaxed border-l-3 border-[color:var(--cv-primary)] pl-3 italic">
                            {profil.elevator_pitch}
                        </p>
                    </section>
                )}

                {/* Experiences */}
                <section style={{ marginBottom: "var(--spacing-section)" }}>
                    <h2 className="text-[11pt] font-extrabold mb-3 text-slate-900 flex items-center gap-2">
                        <span className="text-[color:var(--cv-primary)] font-mono">{'<'}</span>
                        Experience
                        <span className="text-[color:var(--cv-primary)] font-mono">{'>'}</span>
                    </h2>

                    <div className="flex flex-col" style={{ gap: "var(--spacing-item)" }}>
                        {limitedExperiences.map((exp, i) => (
                            <div
                                key={i}
                                className="pl-4 border-l-2 py-2"
                                style={{ borderColor: i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : COLORS.accent }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[9pt] font-bold text-slate-900">{exp.poste}</h4>
                                        {(exp as any)._relevance_score >= 50 && (
                                            <span className="bg-[var(--cv-primary-light)] text-[color:var(--cv-primary)] text-[6pt] px-1.5 py-0.5 rounded font-bold font-sans">
                                                ★ Match
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[7pt] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                        {exp.date_debut} → {exp.date_fin || 'now'}
                                    </span>
                                </div>
                                <p className="text-[8pt] font-semibold" style={{ color: COLORS.primary }}>
                                    @ {exp.entreprise}
                                </p>
                                {exp.clients && exp.clients.length > 0 && (
                                    <p className="text-[7pt] text-slate-600 mt-0.5">
                                        Clients : {exp.clients.join(", ")}
                                    </p>
                                )}
                                {/* Realisations are pre-sliced by CDC Pipeline based on _format */}
                                {exp.realisations && exp.realisations.length > 0 && (
                                    <ul className="mt-1.5 space-y-0.5 text-[8pt] text-slate-700">
                                        {exp.realisations.map((r, j) => (
                                            <li key={j} className="flex items-start gap-1.5">
                                                <span className="text-[color:var(--cv-primary)] mt-0.5">→</span>
                                                {safeString(r)}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Clients */}
                {clients_references?.clients && clients_references.clients.length > 0 && (
                    <section style={{ marginBottom: "var(--spacing-section)" }}>
                        <h2 className="text-[11pt] font-extrabold mb-2 text-slate-900 flex items-center gap-2">
                            <span className="text-[color:var(--cv-primary)] font-mono">{'<'}</span>
                            Clients
                            <span className="text-[color:var(--cv-primary)] font-mono">{'/>'}</span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {clients_references.clients.map((client, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200"
                                >
                                    <span className="text-[color:var(--cv-primary)] text-[8pt]">◆</span>
                                    <span className="text-[7pt] font-medium text-slate-700">{client}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {certifications && certifications.length > 0 && (
                    <section style={{ marginBottom: "var(--spacing-section)" }}>
                        <h2 className="text-[11pt] font-extrabold mb-2 text-slate-900 flex items-center gap-2">
                            <span className="text-[color:var(--cv-primary)] font-mono">{'<'}</span>
                            Certifications
                            <span className="text-[color:var(--cv-primary)] font-mono">{'/>'}</span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {certifications.map((cert, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200"
                                >
                                    <span className="text-[color:var(--cv-primary)] text-[8pt]">✓</span>
                                    <span className="text-[7pt] font-medium text-slate-700">{cert}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education - Moved to white section for better readability */}
                {limitedFormations.length > 0 && (
                    <section style={{ marginBottom: "var(--spacing-section)" }}>
                        <h2 className="text-[11pt] font-extrabold mb-3 text-slate-900 flex items-center gap-2">
                            <span className="text-[color:var(--cv-primary)] font-mono">{'<'}</span>
                            Education
                            <span className="text-[color:var(--cv-primary)] font-mono">{'/>'}</span>
                        </h2>
                        <div className="flex flex-col" style={{ gap: "var(--spacing-item)" }}>
                            {limitedFormations.map((edu, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="text-[9pt] font-bold text-slate-900">{edu.diplome}</h4>
                                            {edu.etablissement && (
                                                <p className="text-[color:var(--cv-primary)] font-semibold text-[8pt] mt-0.5">{edu.etablissement}</p>
                                            )}
                                        </div>
                                        {edu.annee && (
                                            <span className="text-[7pt] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700 whitespace-nowrap">
                                                {edu.annee}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* [CDC-21] Section Projets ajoutée */}
                {projects && projects.length > 0 && (
                    <section style={{ marginTop: "var(--spacing-section)" }}>
                        <h2 className="text-[11pt] font-extrabold mb-3 text-slate-900 flex items-center gap-2">
                            <span className="text-[color:var(--cv-primary)] font-mono">{'<'}</span>
                            Projects
                            <span className="text-[color:var(--cv-primary)] font-mono">{'/>'}</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {projects.map((project, i) => (
                                <div
                                    key={i}
                                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg"
                                >
                                    <div className="flex items-center gap-1">
                                        <h4 className="text-[8pt] font-bold text-slate-900">{project.nom}</h4>
                                        {project.lien && <ExternalLink className="w-2.5 h-2.5 text-[color:var(--cv-primary)]" />}
                                    </div>
                                    <p className="text-[7pt] text-slate-600 mt-0.5">{project.description}</p>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {project.technologies.map((tech, j) => (
                                                <span
                                                    key={j}
                                                    className="px-1 py-0.5 text-[5pt] rounded font-mono"
                                                    style={{ background: COLORS.primary30, color: COLORS.primary }}
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
            </main>
        </div>
    );
}
