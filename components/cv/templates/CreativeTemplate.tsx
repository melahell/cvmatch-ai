"use client";

import React from "react";
import { TemplateProps } from "./index";
import { Mail, Phone, MapPin, Linkedin, Sparkles } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/design-tokens";

// Vibrant creative palette using design tokens
// NOTE: Inline styles in this template (style={{ color, background }}) reference this COLORS object
// which uses design tokens. Inline styles are necessary for proper PDF/print rendering.
const COLORS = {
    primary: DESIGN_TOKENS.colors.semantic.warning, // Orange/Warning
    secondary: DESIGN_TOKENS.colors.neon.pink, // Pink
    accent: DESIGN_TOKENS.colors.neon.purple, // Violet
    tertiary: DESIGN_TOKENS.colors.semantic.info, // Cyan/Info
};

// Sanitize text by fixing spacing issues (applied at render time)
function sanitizeText(text: unknown): string {
    if (text === null || text === undefined) return "";
    if (typeof text !== "string") return "";
    const input = text;
    if (!input) return "";

    return input
        // Fix common French word concatenations
        .replace(/([a-zàâäéèêëïîôùûüçœæ])(de|des|du|pour|avec|sans|dans|sur|sous|entre|chez|vers|par|et|ou|à|au|aux|un|une|le|la|les)([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆA-zàâäéèêëïîôùûüçœæ])/g, '$1 $2 $3')
        // Fix lowercase + uppercase (camelCase)
        .replace(/([a-zàâäéèêëïîôùûüçœæ])([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆ])/g, '$1 $2')
        // Fix punctuation + letter
        .replace(/([.,;:!?])([a-zA-ZÀ-ÿ])/g, '$1 $2')
        // Fix closing parenthesis + letter
        .replace(/\)([a-zA-ZÀ-ÿ])/g, ') $1')
        // Fix letter + opening parenthesis
        .replace(/([a-zA-ZÀ-ÿ])\(/g, '$1 (')
        // Fix number + letter (12clients → 12 clients)
        .replace(/(\d)([a-zA-ZÀ-ÿ])/g, '$1 $2')
        // Fix letter + number (pour12 → pour 12)
        .replace(/([a-zA-ZÀ-ÿ])(\d)/g, '$1 $2')
        // Fix + and numbers
        .replace(/\+(\d)/g, '+ $1')
        .replace(/(\d)\+/g, '$1 +')
        // Fix % and numbers
        .replace(/(\d)%/g, '$1 %')
        .replace(/%(\d)/g, '% $1')
        // Normalize multiple spaces to single space
        .replace(/\s+/g, ' ')
        .trim();
}

export default function CreativeTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues } = data;
    const hasHttpPhoto =
        typeof profil?.photo_url === "string" &&
        (profil.photo_url.startsWith("http://") || profil.photo_url.startsWith("https://"));

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
    const rawSkills = competences?.techniques || [];
    const limitedSkills = rawSkills.map(safeString);
    const rawSoftSkills = competences?.soft_skills || [];
    const limitedSoftSkills = rawSoftSkills.map(safeString);
    const limitedFormations = formations || [];
    const initials = `${profil?.prenom?.[0] || ''}${profil?.nom?.[0] || ''}`.toUpperCase();

    return (
        <div
            className="cv-page bg-white shadow-2xl rounded-2xl overflow-hidden text-[9pt]"
            style={{
                width: '210mm',
                height: '297mm',
                maxHeight: '297mm',
                overflow: 'hidden',
                boxSizing: 'border-box',
                fontFamily: "'Outfit', 'Inter', sans-serif",
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
                            {hasHttpPhoto ? (
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
                        <section className="mb-5">
                            <p
                                className="text-slate-700 text-[9pt] leading-relaxed pl-4 italic"
                                style={{ borderLeft: `4px solid ${COLORS.primary}` }}
                            >
                                {profil.elevator_pitch}
                            </p>
                        </section>
                    )}

                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div
                            className="mb-5 px-4 py-2 rounded-lg text-[8pt]"
                            style={{ background: `linear-gradient(90deg, ${COLORS.primary}10, ${COLORS.secondary}10)` }}
                        >
                            <span style={{ color: COLORS.primary }}>✨</span>
                            <span className="ml-2 text-slate-700">
                                Candidature pour : <strong>{jobContext.job_title}</strong>
                                {jobContext.company && ` chez ${jobContext.company}`}
                            </span>
                        </div>
                    )}

                    {/* Experiences with colorful timeline */}
                    <section className="mb-5">
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

                        <div className="space-y-4">
                            {limitedExperiences.map((exp, i) => {
                                const colors = [COLORS.primary, COLORS.secondary, COLORS.accent];
                                const color = colors[i % colors.length];
                                return (
                                    <div
                                        key={i}
                                        className="pl-5 py-3 rounded-r-xl relative"
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
                                            {exp.date_debut} - {exp.date_fin || 'Présent'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-[10pt] font-extrabold text-slate-900">{exp.poste}</h4>
                                            {(exp as any)._relevance_score >= 50 && (
                                                <span
                                                    className="text-[6pt] px-1.5 py-0.5 rounded font-bold text-white"
                                                    style={{ background: color }}
                                                >
                                                    ★ Match
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[8pt] text-slate-600 mb-1.5">{exp.entreprise}</p>

                                        {/* Realisations are pre-sliced by CDC Pipeline based on _format */}
                                        {exp.realisations && exp.realisations.length > 0 && (
                                            <ul className="text-[8pt] text-slate-700 space-y-0.5">
                                                {exp.realisations.map((r, j) => (
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
                    style={{ background: DESIGN_TOKENS.colors.surface.secondary }}
                >
                    {/* Skills with colorful tags */}
                    <section className="mb-5">
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
                        <section className="mb-5">
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
                    <section className="mb-5">
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
                            {langues.map((lang, i) => (
                                <div key={i} className="text-[8pt] mb-1">
                                    <span className="font-bold text-slate-900">{lang.langue}</span>
                                    <span className="text-slate-600"> – {lang.niveau}</span>
                                </div>
                            ))}
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}
