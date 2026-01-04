"use client";

import React from "react";
import { TemplateProps } from "./index";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";

export default function ClassicTemplate({
    data,
    includePhoto = true,
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

    const limitedExperiences = experiences?.slice(0, 4) || [];
    const rawSkills = competences?.techniques?.slice(0, 12) || [];
    const limitedSkills = rawSkills.map(safeString);
    const limitedFormations = formations?.slice(0, 3) || [];
    const initials = `${profil?.prenom?.[0] || ''}${profil?.nom?.[0] || ''}`.toUpperCase();

    return (
        <div
            className={`cv-page bg-white shadow-2xl overflow-hidden ${dense ? 'text-[9pt]' : 'text-[10pt]'}`}
            style={{
                width: '210mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                fontFamily: "'Georgia', 'Times New Roman', serif"
            }}
        >
            {/* Elegant Header */}
            <header
                className="text-center py-6 px-8 text-white relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
                }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative z-10 flex items-center justify-center gap-6">
                    {/* Photo */}
                    {includePhoto && (
                        <div className="w-24 h-24 rounded-lg border-4 border-white/30 overflow-hidden shadow-lg flex-shrink-0">
                            {profil.photo_url ? (
                                <img
                                    src={profil.photo_url}
                                    alt={`${profil.prenom} ${profil.nom}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-600 flex items-center justify-center text-2xl font-bold">
                                    {initials}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <h1
                            className="text-2xl font-normal tracking-widest uppercase"
                            style={{ letterSpacing: '0.2em' }}
                        >
                            {profil.prenom} {profil.nom}
                        </h1>
                        <p className="text-slate-300 mt-1 text-[11pt] italic">
                            {profil.titre_principal}
                        </p>

                        {/* Contact inline */}
                        <div className="flex justify-center gap-4 mt-3 text-[8pt] text-slate-300">
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
            <main className="p-8">
                {/* Summary */}
                {profil.elevator_pitch && (
                    <section className="mb-6 text-center">
                        <p className="text-slate-700 leading-relaxed text-[9pt] max-w-3xl mx-auto italic">
                            "{profil.elevator_pitch}"
                        </p>
                    </section>
                )}

                {/* Job context */}
                {jobContext?.job_title && (
                    <div className="text-center mb-6">
                        <span className="text-[8pt] text-slate-500">
                            Candidature pour le poste de <strong>{jobContext.job_title}</strong>
                            {jobContext.company && ` chez ${jobContext.company}`}
                        </span>
                    </div>
                )}

                {/* Experiences */}
                <section className="mb-6">
                    <h2
                        className="text-[12pt] text-center uppercase tracking-widest border-b-2 border-slate-300 pb-2 mb-4 text-slate-800"
                        style={{ letterSpacing: '0.15em' }}
                    >
                        Expérience Professionnelle
                    </h2>

                    <div className="space-y-4">
                        {limitedExperiences.map((exp, i) => (
                            <div key={i} className="border-l-4 border-slate-400 pl-4 py-2">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-[10pt] font-bold text-slate-900">{exp.poste}</h4>
                                    <span className="text-[8pt] text-slate-500 italic">
                                        {exp.date_debut} - {exp.date_fin || 'Présent'}
                                    </span>
                                </div>
                                <p className="text-[9pt] italic text-slate-600 mb-2">
                                    {exp.entreprise}{exp.lieu && `, ${exp.lieu}`}
                                </p>
                                {exp.realisations && exp.realisations.length > 0 && (
                                    <ul className="text-[8pt] text-slate-700 space-y-1 list-disc list-inside">
                                        {exp.realisations.slice(0, 3).map((r, j) => (
                                            <li key={j}>{safeString(r)}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Two columns: Formation & Skills */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Formation */}
                    <section>
                        <h2
                            className="text-[11pt] uppercase tracking-widest border-b-2 border-slate-300 pb-2 mb-3 text-slate-800"
                            style={{ letterSpacing: '0.15em' }}
                        >
                            Formation
                        </h2>
                        <div className="space-y-3">
                            {limitedFormations.map((edu, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="text-[9pt] font-bold text-slate-900">{edu.diplome}</h4>
                                        {edu.annee && (
                                            <span className="text-[8pt] text-slate-500">{edu.annee}</span>
                                        )}
                                    </div>
                                    <p className="text-[8pt] italic text-slate-600">{edu.etablissement}</p>
                                </div>
                            ))}
                        </div>

                        {/* Languages */}
                        {langues && langues.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200">
                                <h3 className="text-[10pt] uppercase tracking-wider text-slate-700 mb-2">Langues</h3>
                                <div className="text-[8pt] text-slate-600">
                                    {langues.map((l, i) => (
                                        <span key={i}>
                                            <strong>{l.langue}</strong>: {l.niveau}
                                            {i < langues.length - 1 && ' • '}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Skills */}
                    <section>
                        <h2
                            className="text-[11pt] uppercase tracking-widest border-b-2 border-slate-300 pb-2 mb-3 text-slate-800"
                            style={{ letterSpacing: '0.15em' }}
                        >
                            Compétences
                        </h2>
                        <div className="text-[9pt] text-slate-700 leading-relaxed">
                            {limitedSkills.join(' • ')}
                        </div>

                        {/* Certifications */}
                        {certifications && certifications.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200">
                                <h3 className="text-[10pt] uppercase tracking-wider text-slate-700 mb-2">Certifications</h3>
                                <ul className="text-[8pt] text-slate-600 space-y-1">
                                    {certifications.slice(0, 3).map((cert, i) => (
                                        <li key={i} className="flex items-center gap-1">
                                            <span className="text-slate-400">•</span> {cert}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
