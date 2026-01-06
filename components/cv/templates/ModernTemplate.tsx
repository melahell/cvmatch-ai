"use client";

import React from "react";
import { TemplateProps } from "./index";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";

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

    // Show all data
    const limitedExperiences = experiences || [];
    const limitedSkills = competences?.techniques || [];
    const limitedSoftSkills = competences?.soft_skills || [];
    const limitedFormations = formations || [];

    // Sanitize elevator pitch
    const cleanElevatorPitch = sanitizeText(profil?.elevator_pitch);

    // Get initials for avatar fallback
    const initials = `${profil?.prenom?.[0] || ''}${profil?.nom?.[0] || ''}`.toUpperCase();

    // Collect all clients for display
    const allClients: { nom: string; secteur?: string }[] = [];
    if (clients_references?.secteurs) {
        clients_references.secteurs.forEach((group: any) => {
            group.clients?.forEach((client: string) => {
                allClients.push({ nom: client, secteur: group.secteur });
            });
        });
    } else if (clients_references?.clients) {
        clients_references.clients.forEach((client: string) => {
            allClients.push({ nom: client });
        });
    }

    return (
        <div
            className="cv-page bg-white shadow-2xl rounded-xl flex"
            style={{
                width: '210mm',
                minHeight: '297mm',
                boxSizing: 'border-box',
                fontFamily: "Arial, Helvetica, sans-serif", // System font for PDF compatibility
                fontSize: '10pt',
                lineHeight: '1.35'
            }}
        >
            {/* Sidebar Gauche - SOLID COLOR for PDF compatibility */}
            <aside
                className="flex-shrink-0 text-white p-4 flex flex-col"
                style={{
                    width: '70mm',
                    backgroundColor: '#1e293b' // Solid color, no gradient
                }}
            >
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-4">
                    <div
                        className="w-20 h-20 rounded-full border-3 border-indigo-400 mb-2 overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: '#334155' }}
                    >
                        {includePhoto && profil.photo_url ? (
                            <img
                                src={profil.photo_url}
                                alt={`${profil.prenom} ${profil.nom}`}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <div
                                className="w-full h-full rounded-full flex items-center justify-center text-xl font-bold"
                                style={{ backgroundColor: '#6366f1' }}
                            >
                                {initials}
                            </div>
                        )}
                    </div>
                    <h1 className="text-base font-bold">{profil.prenom} {profil.nom}</h1>
                    <p className="text-indigo-300 font-semibold mt-1 text-[9pt] uppercase tracking-wide leading-tight">
                        {sanitizeText(profil.titre_principal)}
                    </p>
                </div>

                {/* Contact - LARGER FONTS */}
                <div className="mb-4">
                    <h3 className="text-indigo-300 font-bold uppercase text-[8pt] tracking-wider border-b border-indigo-600 pb-1 mb-2">
                        Contact
                    </h3>
                    <div className="space-y-1 text-[9pt]">
                        {profil.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <span className="text-white break-all">{profil.email}</span>
                            </div>
                        )}
                        {profil.telephone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <span className="text-white">{profil.telephone}</span>
                            </div>
                        )}
                        {profil.localisation && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <span className="text-white">{profil.localisation}</span>
                            </div>
                        )}
                        {profil.linkedin && (
                            <div className="flex items-center gap-2">
                                <Linkedin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <span className="text-white">LinkedIn</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Compétences - SIMPLIFIED for PDF */}
                <div className="mb-4">
                    <h3 className="text-indigo-300 font-bold uppercase text-[8pt] tracking-wider border-b border-indigo-600 pb-1 mb-2">
                        Compétences
                    </h3>
                    <div className="space-y-1">
                        {limitedSkills.slice(0, 12).map((skill, i) => {
                            const level = i < 3 ? 'Expert' : i < 7 ? 'Avancé' : 'Intermédiaire';
                            return (
                                <div key={i} className="flex justify-between items-center text-[9pt]">
                                    <span className="text-white font-medium">{renderSkill(skill)}</span>
                                    <span
                                        className="text-[7pt] px-1.5 py-0.5 rounded uppercase font-bold"
                                        style={{
                                            backgroundColor: i < 3 ? '#6366f1' : i < 7 ? '#8b5cf6' : '#64748b',
                                            color: 'white'
                                        }}
                                    >
                                        {level}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Soft Skills - Tags simples */}
                {limitedSoftSkills.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-indigo-300 font-bold uppercase text-[8pt] tracking-wider border-b border-indigo-600 pb-1 mb-2">
                            Qualités
                        </h3>
                        <div className="flex flex-wrap gap-1">
                            {limitedSoftSkills.slice(0, 6).map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 text-[8pt] rounded font-medium"
                                    style={{ backgroundColor: '#6366f1', color: 'white' }}
                                >
                                    {renderSkill(skill)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Langues - Simple display */}
                {langues && langues.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-indigo-300 font-bold uppercase text-[8pt] tracking-wider border-b border-indigo-600 pb-1 mb-2">
                            Langues
                        </h3>
                        <div className="space-y-1">
                            {langues.map((lang, i) => (
                                <div key={i} className="flex justify-between items-center text-[9pt]">
                                    <span className="text-white font-medium">{lang.langue}</span>
                                    <span
                                        className="px-1.5 py-0.5 rounded text-[7pt] uppercase font-bold"
                                        style={{ backgroundColor: '#6366f1', color: 'white' }}
                                    >
                                        {lang.niveau?.split(' ')[0] || 'N/A'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Références Clients - 2 COLONNES PROPRES */}
                {allClients.length > 0 && (
                    <div className="mt-auto">
                        <h3 className="text-indigo-300 font-bold uppercase text-[8pt] tracking-wider border-b border-indigo-600 pb-1 mb-2">
                            Clients ({allClients.length})
                        </h3>
                        {/* Group by secteur */}
                        {clients_references?.secteurs && clients_references.secteurs.length > 0 ? (
                            <div className="space-y-2">
                                {clients_references.secteurs.map((group: any, i: number) => (
                                    <div key={i}>
                                        <div
                                            className="text-[7pt] uppercase font-bold px-1.5 py-0.5 rounded inline-block mb-1"
                                            style={{ backgroundColor: '#4f46e5', color: 'white' }}
                                        >
                                            {group.secteur}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8pt] text-white">
                                            {(group.clients || []).slice(0, 4).map((client: string, j: number) => (
                                                <span key={j} className="truncate">• {client}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8pt] text-white">
                                {allClients.slice(0, 8).map((client, i) => (
                                    <span key={i} className="truncate">• {client.nom}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-5 bg-white">
                {/* Profil / Résumé */}
                {cleanElevatorPitch && (
                    <section className="mb-3">
                        <h2 className="text-sm font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <span className="w-5 h-0.5 bg-indigo-600 rounded-full" />
                            Profil
                        </h2>
                        <p className="text-slate-700 leading-relaxed text-[9pt] border-l-3 border-indigo-100 pl-3 font-medium">
                            {cleanElevatorPitch}
                        </p>
                    </section>
                )}

                {/* Job context */}
                {jobContext?.job_title && (
                    <div className="mb-3 px-3 py-1.5 bg-indigo-50 rounded border border-indigo-100">
                        <p className="text-[8pt] text-indigo-700 font-semibold">
                            📍 Candidature pour : {jobContext.job_title}
                            {jobContext.company && ` chez ${jobContext.company}`}
                        </p>
                    </div>
                )}

                {/* Expériences avec Timeline - Progressive sizing */}
                <section className="mb-3">
                    <h2 className="text-sm font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                        <span className="w-5 h-0.5 bg-purple-600 rounded-full" />
                        Expériences Professionnelles
                    </h2>
                    <div className="space-y-2">
                        {limitedExperiences.map((exp, i) => {
                            // Progressive sizing: first 2 full, 3+ compact
                            const isCompact = i >= 2;
                            const realisationsToShow = isCompact
                                ? (exp.realisations?.slice(0, 3) || [])
                                : (exp.realisations || []);

                            return (
                                <div
                                    key={i}
                                    className={`relative pl-3 border-l-2 border-purple-300 ${isCompact ? 'py-1' : 'py-1.5'}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-0.5">
                                        <h4 className={`font-bold text-slate-900 ${isCompact ? 'text-[9pt]' : 'text-[10pt]'}`}>
                                            {sanitizeText(exp.poste)}
                                        </h4>
                                        <span
                                            className="font-bold px-2 py-0.5 rounded text-[8pt] whitespace-nowrap"
                                            style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                                        >
                                            {sanitizeText(exp.date_debut)} - {exp.date_fin ? sanitizeText(exp.date_fin) : 'Présent'}
                                        </span>
                                    </div>
                                    <p className={`text-purple-600 font-semibold ${isCompact ? 'text-[8pt]' : 'text-[9pt]'}`}>
                                        {sanitizeText(exp.entreprise)}
                                        {exp.lieu && ` • ${sanitizeText(exp.lieu)}`}
                                    </p>
                                    {realisationsToShow.length > 0 && (
                                        <ul className={`text-slate-700 list-disc list-inside leading-snug mt-0.5 ${isCompact ? 'text-[8pt]' : 'text-[9pt]'}`}>
                                            {realisationsToShow.map((r, j) => (
                                                <li key={j}>{renderRealisation(r)}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Formations */}
                {limitedFormations.length > 0 && (
                    <section className="mb-3">
                        <h2 className="text-sm font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <span className="w-5 h-0.5 bg-indigo-600 rounded-full" />
                            Formation
                        </h2>
                        <div className="space-y-1">
                            {limitedFormations.map((edu, i) => (
                                <div
                                    key={i}
                                    className="pl-3 py-1 border-l-2 border-indigo-200"
                                >
                                    <h4 className="font-bold text-[9pt] text-slate-900">{sanitizeText(edu.diplome)}</h4>
                                    <div className="flex justify-between items-center">
                                        {edu.etablissement && (
                                            <p className="text-indigo-600 font-semibold text-[8pt]">{sanitizeText(edu.etablissement)}</p>
                                        )}
                                        {edu.annee && (
                                            <span className="text-slate-500 text-[8pt]">{sanitizeText(edu.annee)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {certifications && certifications.length > 0 && (
                    <section className="mb-3">
                        <h2 className="text-[10pt] font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <span className="w-4 h-0.5 bg-purple-600 rounded-full" />
                            Certifications
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {certifications.map((cert, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8pt] font-semibold"
                                    style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}
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
