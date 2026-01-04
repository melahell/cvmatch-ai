"use client";

import React from "react";
import { TemplateProps } from "./index";
import { Mail, Phone, MapPin, Github, Linkedin, Globe } from "lucide-react";

// Tech-specific color palette
const COLORS = {
    primary: '#10b981', // Emerald
    secondary: '#06b6d4', // Cyan
    accent: '#8b5cf6', // Violet
    bg: '#0f172a', // Slate 900
    bgLight: '#1e293b', // Slate 800
};

export default function TechTemplate({
    data,
    includePhoto = false, // Default false for tech
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues, certifications } = data;

    // Helper to safely render a string from potentially object value
    const safeString = (val: any): string => {
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null) {
            if (val.name) return val.name;
            if (val.skill) return val.skill;
            if (val.description) return val.description;
            if (val.impact) return val.impact;
            return JSON.stringify(val);
        }
        return String(val || '');
    };

    // Limit content for 1-page guarantee
    const limitedExperiences = experiences?.slice(0, 4) || [];
    const rawSkills = competences?.techniques?.slice(0, 15) || [];
    const limitedSkills = rawSkills.map(safeString);
    const limitedFormations = formations?.slice(0, 2) || [];

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
            className={`cv-page bg-white shadow-2xl rounded-xl overflow-hidden flex ${dense ? 'text-[9pt]' : 'text-[10pt]'}`}
            style={{
                width: '210mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
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
                <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-2 text-[7pt] text-slate-500 font-mono">~/profile.dev</span>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-4">
                    {includePhoto && profil.photo_url ? (
                        <div
                            className="w-20 h-20 rounded-lg border-2 border-emerald-500 p-0.5 mb-3 overflow-hidden"
                            style={{ boxShadow: `0 0 15px ${COLORS.primary}40` }}
                        >
                            <img
                                src={profil.photo_url}
                                alt={`${profil.prenom} ${profil.nom}`}
                                className="w-full h-full object-cover rounded-md"
                            />
                        </div>
                    ) : (
                        <div
                            className="w-20 h-20 rounded-lg border-2 border-emerald-500 mb-3 flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${COLORS.primary}30, ${COLORS.secondary}30)`,
                                boxShadow: `0 0 15px ${COLORS.primary}40`
                            }}
                        >
                            <span className="text-2xl font-bold text-emerald-400">{initials}</span>
                        </div>
                    )}
                    <h1 className="text-base font-bold tracking-tight">{profil.prenom} {profil.nom}</h1>
                    <p className="text-emerald-400 font-mono mt-1 text-[8pt]">
                        <span className="text-slate-500">{'>'}</span> {profil.titre_principal}
                    </p>
                </div>

                {/* Contact - Terminal style */}
                <div className="space-y-1.5 mb-4 text-[7pt] font-mono">
                    <div className="text-emerald-300 text-[6pt] mb-1">// contact</div>
                    {profil.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-cyan-400" />
                            <span className="text-slate-300 truncate">{profil.email}</span>
                        </div>
                    )}
                    {profil.telephone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-cyan-400" />
                            <span className="text-slate-300">{profil.telephone}</span>
                        </div>
                    )}
                    {profil.localisation && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            <span className="text-slate-300">{profil.localisation}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Github className="w-3 h-3 text-cyan-400" />
                        <span className="text-slate-300">GitHub</span>
                    </div>
                    {profil.linkedin && (
                        <div className="flex items-center gap-2">
                            <Linkedin className="w-3 h-3 text-cyan-400" />
                            <span className="text-slate-300">LinkedIn</span>
                        </div>
                    )}
                </div>

                {/* Skills by Category */}
                <div className="space-y-3 flex-1">
                    <div className="text-emerald-300 text-[6pt] font-mono">// tech_stack</div>

                    {skillCategories.languages.length > 0 && (
                        <div>
                            <div className="text-[6pt] text-slate-500 mb-1">languages:</div>
                            <div className="flex flex-wrap gap-1">
                                {skillCategories.languages.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-[6pt] rounded font-mono"
                                        style={{ background: `${COLORS.primary}30`, color: COLORS.primary }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {skillCategories.frameworks.length > 0 && (
                        <div>
                            <div className="text-[6pt] text-slate-500 mb-1">frameworks:</div>
                            <div className="flex flex-wrap gap-1">
                                {skillCategories.frameworks.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-[6pt] rounded font-mono"
                                        style={{ background: `${COLORS.secondary}30`, color: COLORS.secondary }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {skillCategories.tools.length > 0 && (
                        <div>
                            <div className="text-[6pt] text-slate-500 mb-1">devops:</div>
                            <div className="flex flex-wrap gap-1">
                                {skillCategories.tools.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-[6pt] rounded font-mono"
                                        style={{ background: `${COLORS.accent}30`, color: COLORS.accent }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {skillCategories.databases.length > 0 && (
                        <div>
                            <div className="text-[6pt] text-slate-500 mb-1">databases:</div>
                            <div className="flex flex-wrap gap-1">
                                {skillCategories.databases.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-[6pt] rounded font-mono bg-amber-500/20 text-amber-400"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Education - Bottom */}
                <div className="mt-auto pt-3 border-t border-slate-700">
                    <div className="text-emerald-300 text-[6pt] font-mono mb-2">// education</div>
                    {limitedFormations.map((edu, i) => (
                        <div key={i} className="mb-2">
                            <div className="text-[7pt] font-semibold text-white">{edu.diplome}</div>
                            <div className="text-[6pt] text-slate-400">
                                {edu.etablissement} {edu.annee && `(${edu.annee})`}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Languages */}
                {langues && langues.length > 0 && (
                    <div className="pt-3 border-t border-slate-700 mt-3">
                        <div className="text-emerald-300 text-[6pt] font-mono mb-1">// languages</div>
                        <div className="flex flex-wrap gap-2">
                            {langues.map((lang, i) => (
                                <span key={i} className="text-[7pt] text-slate-300">
                                    {lang.langue}: <span className="text-emerald-400">{lang.niveau.split(' ')[0]}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-5 bg-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* Header */}
                <div className="mb-4 pb-3 border-b-2 border-emerald-500">
                    <h1 className="text-xl font-extrabold text-slate-900">{profil.prenom} {profil.nom}</h1>
                    <p className="text-emerald-600 font-semibold text-[10pt]">{profil.titre_principal}</p>

                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div className="mt-2 px-2 py-1 bg-emerald-50 rounded inline-block">
                            <span className="text-[7pt] text-emerald-700 font-mono">
                                // Candidature: {jobContext.job_title}
                                {jobContext.company && ` @ ${jobContext.company}`}
                                {jobContext.match_score && ` | Match: ${jobContext.match_score}%`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Summary */}
                {profil.elevator_pitch && (
                    <section className="mb-4">
                        <p className="text-slate-700 text-[9pt] leading-relaxed border-l-3 border-emerald-200 pl-3 italic">
                            {profil.elevator_pitch}
                        </p>
                    </section>
                )}

                {/* Experiences */}
                <section className="mb-4">
                    <h2 className="text-[11pt] font-extrabold mb-3 text-slate-900 flex items-center gap-2">
                        <span className="text-emerald-500 font-mono">{'<'}</span>
                        Experience
                        <span className="text-emerald-500 font-mono">{'>'}</span>
                    </h2>

                    <div className="space-y-3">
                        {limitedExperiences.map((exp, i) => (
                            <div
                                key={i}
                                className="pl-4 border-l-2 py-2"
                                style={{ borderColor: i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : COLORS.accent }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-[9pt] font-bold text-slate-900">{exp.poste}</h4>
                                        <p className="text-[8pt] font-semibold" style={{ color: COLORS.primary }}>
                                            @ {exp.entreprise}
                                        </p>
                                    </div>
                                    <span className="text-[7pt] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                        {exp.date_debut} → {exp.date_fin || 'now'}
                                    </span>
                                </div>
                                {exp.realisations && exp.realisations.length > 0 && (
                                    <ul className="mt-1.5 space-y-0.5 text-[8pt] text-slate-700">
                                        {exp.realisations.slice(0, 3).map((r, j) => (
                                            <li key={j} className="flex items-start gap-1.5">
                                                <span className="text-emerald-500 mt-0.5">→</span>
                                                {safeString(r)}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Certifications */}
                {certifications && certifications.length > 0 && (
                    <section>
                        <h2 className="text-[11pt] font-extrabold mb-2 text-slate-900 flex items-center gap-2">
                            <span className="text-emerald-500 font-mono">{'<'}</span>
                            Certifications
                            <span className="text-emerald-500 font-mono">{'/>'}</span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {certifications.slice(0, 5).map((cert, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200"
                                >
                                    <span className="text-emerald-500 text-[8pt]">✓</span>
                                    <span className="text-[7pt] font-medium text-slate-700">{cert}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
