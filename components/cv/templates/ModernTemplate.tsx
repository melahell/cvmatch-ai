"use client";

import React from "react";
import { TemplateProps } from "./index";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/design-tokens";

// Sanitize text by fixing spacing issues (applied at render time)
function sanitizeText(text: string | undefined | null): string {
    if (!text) return '';

    return text
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


export default function ModernTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues, certifications, clients_references } = data;

    // Helper to safely render a realisation (can be string or object)
    const renderRealisation = (r: any): string => {
        let text = '';
        if (typeof r === 'string') text = r;
        else if (typeof r === 'object' && r !== null) {
            if (r.description) text = r.description;
            else if (r.impact) text = r.impact;
            else text = JSON.stringify(r);
        } else {
            text = String(r);
        }
        return sanitizeText(text);
    };

    // Helper to safely render a skill (can be string or object)
    const renderSkill = (s: any): string => {
        if (typeof s === 'string') return s;
        if (typeof s === 'object' && s !== null) {
            if (s.name) return s.name;
            if (s.skill) return s.skill;
            return JSON.stringify(s);
        }
        return String(s);
    };

    // Data is pre-adapted by the CDC Pipeline (adaptive-algorithm.ts)
    // Templates only render, no slicing or limits here
    const limitedExperiences = experiences || [];
    const limitedSkills = competences?.techniques || [];
    const limitedSoftSkills = competences?.soft_skills || [];
    const limitedFormations = formations || [];

    // Sanitize elevator pitch
    const cleanElevatorPitch = sanitizeText(profil?.elevator_pitch);

    // Get initials for avatar fallback
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
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontSize: dense ? '8pt' : '8.5pt',
                lineHeight: dense ? '1.25' : '1.3'
            }}
        >
            {/* Sidebar Gauche - Sombre */}
            <aside
                className="flex-shrink-0 text-white p-5 flex flex-col"
                style={{
                    width: '75mm',
                    background: `linear-gradient(180deg, ${DESIGN_TOKENS.colors.text.primary} 0%, ${DESIGN_TOKENS.colors.text.secondary} 100%)`
                }}
            >
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-5">
                    <div
                        className="w-24 h-24 rounded-full border-4 border-neon-indigo p-0.5 mb-3 overflow-hidden bg-slate-800 flex items-center justify-center shadow-level-4"
                    >
                        {includePhoto && profil.photo_url ? (
                            <img
                                src={profil.photo_url}
                                alt={`${profil.prenom} ${profil.nom}`}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                                {initials}
                            </div>
                        )}
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">{profil.prenom} {profil.nom}</h1>
                    <p className="text-indigo-400 font-semibold mt-1 text-[9pt] uppercase tracking-widest leading-tight">
                        {sanitizeText(profil.titre_principal)}
                    </p>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-5 text-[8pt]">
                    <h3 className="text-indigo-300 font-bold uppercase text-[7pt] tracking-widest border-b-2 border-indigo-700 pb-1.5">
                        Contact
                    </h3>
                    {profil.email && (
                        <div className="flex items-center gap-2 hover:text-indigo-300 transition-colors">
                            <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            <span className="text-slate-100 truncate">{profil.email}</span>
                        </div>
                    )}
                    {profil.telephone && (
                        <div className="flex items-center gap-2 hover:text-indigo-300 transition-colors">
                            <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            <span className="text-slate-100">{profil.telephone}</span>
                        </div>
                    )}
                    {profil.localisation && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            <span className="text-slate-100">{profil.localisation}</span>
                        </div>
                    )}
                    {profil.linkedin && (
                        <div className="flex items-center gap-2 hover:text-indigo-300 transition-colors">
                            <Linkedin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            <span className="text-slate-100 truncate text-[7pt]">LinkedIn</span>
                        </div>
                    )}
                </div>

                {/* Compétences avec barres de progression */}
                <div className="space-y-3 mb-5">
                    <h3 className="text-indigo-300 font-bold uppercase text-[7pt] tracking-widest border-b-2 border-indigo-700 pb-1.5">
                        Compétences
                    </h3>
                    <div className="space-y-2">
                        {limitedSkills.map((skill, i) => {
                            const percent = 95 - (i * 8); // Décroissant pour effet visuel
                            return (
                                <div key={i}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-slate-100 font-medium text-[8pt]">{renderSkill(skill)}</span>
                                        <span className="text-[6pt] text-indigo-300 font-semibold">
                                            {percent >= 90 ? 'Expert' : percent >= 75 ? 'Avancé' : 'Intermédiaire'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                                        <div
                                            className="bg-gradient-to-r from-neon-indigo to-neon-purple h-1.5 rounded-full shadow-level-1"
                                            style={{
                                                width: `${percent}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Soft Skills - Tags */}
                {limitedSoftSkills.length > 0 && (
                    <div className="space-y-2 mb-5">
                        <h3 className="text-indigo-300 font-bold uppercase text-[7pt] tracking-widest border-b-2 border-indigo-700 pb-1.5">
                            Qualités
                        </h3>
                        <div className="flex flex-wrap gap-1">
                            {limitedSoftSkills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 text-[7pt] rounded border border-indigo-400/50 font-medium"
                                >
                                    {renderSkill(skill)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Langues */}
                {langues && langues.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-indigo-300 font-bold uppercase text-[7pt] tracking-widest border-b-2 border-indigo-700 pb-1.5">
                            Langues
                        </h3>
                        <div className="space-y-1.5 text-[8pt]">
                            {langues.map((lang, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="text-slate-100 font-medium">{lang.langue}</span>
                                    <span className="text-[6pt] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase font-semibold">
                                        {lang.niveau.split(' ')[0]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Références Clients - Grille 2 colonnes */}
                {clients_references && clients_references.clients && clients_references.clients.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <h3 className="text-indigo-300 font-bold uppercase text-[7pt] tracking-widest border-b-2 border-indigo-700 pb-1.5">
                            Références
                        </h3>
                        {clients_references.secteurs && clients_references.secteurs.length > 0 ? (
                            <div className="space-y-2">
                                {clients_references.secteurs.slice(0, 5).map((group, i) => (
                                    <div key={i}>
                                        <span className="inline-block bg-indigo-600 text-white text-[6pt] uppercase font-bold px-1.5 py-0.5 rounded mb-1">
                                            {group.secteur}
                                        </span>
                                        <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[7pt] text-slate-200">
                                            {(group.clients || []).map((client: string, j: number) => (
                                                <span key={j} className="truncate">• {client}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[7pt] text-slate-200">
                                {clients_references.clients.map((client: string, i: number) => (
                                    <span key={i} className="truncate">• {client}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-5 bg-white overflow-hidden">
                {/* Profil / Résumé */}
                {cleanElevatorPitch && (
                    <section className="mb-4">
                        <h2 className="text-base font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <span className="w-6 h-0.5 bg-indigo-600 rounded-full" />
                            Profil
                        </h2>
                        <p className="text-slate-700 leading-relaxed text-[9pt] border-l-4 border-indigo-100 pl-3 font-medium">
                            {cleanElevatorPitch}
                        </p>
                    </section>
                )}

                {/* Job context */}
                {jobContext?.job_title && (
                    <div className="mb-4 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <p className="text-[8pt] text-indigo-700 font-semibold">
                            📍 Candidature pour : {jobContext.job_title}
                            {jobContext.company && ` chez ${jobContext.company}`}
                        </p>
                    </div>
                )}

                {/* Expériences avec Timeline */}
                <section className="mb-3">
                    <h2 className="text-base font-extrabold mb-4 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                        <span className="w-6 h-0.5 bg-purple-600 rounded-full" />
                        Expériences Professionnelles
                    </h2>
                    <div className="space-y-1.5">
                        {limitedExperiences.map((exp, i) => (
                            <div
                                key={i}
                                className="relative pl-5 pr-3 py-3 border-l-[3px] border-l-neon-purple group rounded-r-lg bg-gradient-to-r from-neon-purple/5 to-transparent"
                            >
                                {/* Timeline dot */}
                                <div
                                    className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-white border-[3px] border-neon-purple shadow-level-2"
                                />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[10pt] font-extrabold text-slate-900">{sanitizeText(exp.poste)}</h4>
                                        {(exp as any)._relevance_score >= 50 && (
                                            <span className="bg-green-100 text-green-700 text-[6pt] px-1.5 py-0.5 rounded font-bold">
                                                ★ Pertinent
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded text-[7pt]">
                                        {sanitizeText(exp.date_debut)} - {exp.date_fin ? sanitizeText(exp.date_fin) : 'Présent'}
                                    </span>
                                </div>
                                <p className="text-purple-600 font-bold mb-1.5 text-[9pt]">
                                    {sanitizeText(exp.entreprise)}
                                    {exp.lieu && ` • ${sanitizeText(exp.lieu)}`}
                                </p>
                                {/* Realisations are pre-sliced by CDC Pipeline based on _format */}
                                {exp.realisations && exp.realisations.length > 0 && (
                                    <ul className="text-slate-700 space-y-0.5 list-disc list-inside text-[8pt] leading-relaxed">
                                        {exp.realisations.map((r, j) => (
                                            <li key={j}>{renderRealisation(r)}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Certifications */}
                {certifications && certifications.length > 0 && (
                    <section className="mb-2">
                        <h2 className="text-[10pt] font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <span className="w-4 h-0.5 bg-purple-600 rounded-full" />
                            Certifications
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {certifications.map((cert, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded text-[7pt] font-semibold text-purple-700"
                                >
                                    ✓ {cert}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Formations - Moved to white section for better readability */}
                {limitedFormations.length > 0 && (
                    <section className="mb-2">
                        <h2 className="text-base font-extrabold mb-3 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <span className="w-6 h-0.5 bg-indigo-600 rounded-full" />
                            Formation
                        </h2>
                        <div className="space-y-2">
                            {limitedFormations.map((edu, i) => (
                                <div
                                    key={i}
                                    className="pl-4 py-2 border-l-2 border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-transparent"
                                >
                                    <h4 className="font-bold text-[9pt] text-slate-900">{sanitizeText(edu.diplome)}</h4>
                                    {edu.etablissement && (
                                        <p className="text-indigo-600 font-semibold text-[8pt]">{sanitizeText(edu.etablissement)}</p>
                                    )}
                                    {edu.annee && (
                                        <p className="text-slate-600 text-[7pt] mt-0.5">{sanitizeText(edu.annee)}</p>
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
