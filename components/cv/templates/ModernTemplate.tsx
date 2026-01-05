"use client";

import React from "react";
import { TemplateProps } from "./index";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

// Sanitize text by fixing spacing issues (applied at render time)
function sanitizeText(text: string | undefined | null): string {
    if (!text) return '';
    return text
        .replace(/([a-zàâäéèêëïîôùûüçœæ])([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆ])/g, '$1 $2')
        .replace(/([.,;:!?])([a-zA-ZÀ-ÿ])/g, '$1 $2')
        .replace(/\)([a-zA-ZÀ-ÿ])/g, ') $1')
        .replace(/([a-zA-ZÀ-ÿ])\(/g, '$1 (')
        .replace(/(\d)(ans|projets|utilisateurs|mois)/gi, '$1 $2')
        .replace(/\+(\d)/g, '+ $1')
        .replace(/(\d)\+/g, '$1 +')
        .replace(/\s+/g, ' ')
        .trim();
}

export default function ModernTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues, certifications } = data;

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

    // Use data directly - already limited by normalizer
    const limitedExperiences = experiences?.slice(0, 4) || [];
    const limitedSkills = competences?.techniques?.slice(0, 8) || [];
    const limitedSoftSkills = competences?.soft_skills?.slice(0, 5) || [];
    const limitedFormations = formations?.slice(0, 2) || [];

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
                fontSize: '9pt',
                lineHeight: '1.3'
            }}
        >
            {/* Sidebar Gauche - Sombre */}
            <aside
                className="flex-shrink-0 text-white p-5 flex flex-col"
                style={{
                    width: '75mm',
                    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
                }}
            >
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-5">
                    <div
                        className="w-24 h-24 rounded-full border-4 border-indigo-500 p-0.5 mb-3 overflow-hidden bg-slate-800 flex items-center justify-center"
                        style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
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
                        {profil.titre_principal}
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
                                            className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-1.5 rounded-full"
                                            style={{
                                                width: `${percent}%`,
                                                boxShadow: '0 1px 3px rgba(99, 102, 241, 0.3)'
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

                {/* Formations - Compact in sidebar */}
                {limitedFormations.length > 0 && (
                    <div className="space-y-2 mt-auto">
                        <h3 className="text-indigo-300 font-bold uppercase text-[7pt] tracking-widest border-b-2 border-indigo-700 pb-1.5">
                            Formation
                        </h3>
                        <div className="space-y-1.5 text-[8pt]">
                            {limitedFormations.map((edu, i) => (
                                <div key={i} className="text-slate-200">
                                    <span className="font-semibold">{edu.diplome}</span>
                                    {edu.etablissement && <span className="text-slate-400"> - {edu.etablissement}</span>}
                                    {edu.annee && <span className="text-indigo-400 ml-1">({edu.annee})</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 bg-white overflow-hidden">
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
                <section className="mb-5">
                    <h2 className="text-base font-extrabold mb-4 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                        <span className="w-6 h-0.5 bg-purple-600 rounded-full" />
                        Expériences Professionnelles
                    </h2>
                    <div className="space-y-4">
                        {limitedExperiences.map((exp, i) => (
                            <div
                                key={i}
                                className="relative pl-5 pr-3 py-3 border-l-[3px] group rounded-r-lg"
                                style={{
                                    borderImage: 'linear-gradient(180deg, #a78bfa 0%, #c4b5fd 50%, #ddd6fe 100%) 1',
                                    background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)'
                                }}
                            >
                                {/* Timeline dot */}
                                <div
                                    className="absolute -left-[9px] top-3 w-4 h-4 rounded-full bg-white border-[3px] border-purple-500"
                                    style={{ boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)' }}
                                />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                    <h4 className="text-[10pt] font-extrabold text-slate-900">{exp.poste}</h4>
                                    <span className="text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded text-[7pt]">
                                        {exp.date_debut} - {exp.date_fin || 'Présent'}
                                    </span>
                                </div>
                                <p className="text-purple-600 font-bold mb-1.5 text-[9pt]">
                                    {exp.entreprise}
                                    {exp.lieu && ` • ${exp.lieu}`}
                                </p>
                                {exp.realisations && exp.realisations.length > 0 && (
                                    <ul className="text-slate-700 space-y-0.5 list-disc list-inside text-[8pt] leading-relaxed">
                                        {exp.realisations.slice(0, 3).map((r, j) => (
                                            <li key={j}>{renderRealisation(r)}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Certifications Only (Formations moved to sidebar) */}
                {certifications && certifications.length > 0 && (
                    <section className="mb-4">

                        <h2 className="text-[10pt] font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest">
                            <span className="w-4 h-0.5 bg-purple-600 rounded-full" />
                            Certifications
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {certifications.slice(0, 6).map((cert, i) => (
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
            </main>
        </div>
    );
}
