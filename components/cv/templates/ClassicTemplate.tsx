"use client";

import React from "react";
import { TemplateProps } from "./index";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink } from "lucide-react";
// [CDC-24] Utiliser utilitaire centralisé
import { sanitizeText } from "@/lib/cv/sanitize-text";

export default function ClassicTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues, certifications, clients_references, projects } = data;
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
    const limitedFormations = formations || [];
    const initials = `${profil?.prenom?.[0] || ''}${profil?.nom?.[0] || ''}`.toUpperCase();

    return (
        <div
            className="cv-page bg-white shadow-2xl overflow-hidden text-[9pt]"
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
            {/* Elegant Header */}
            <header
                className="text-center py-6 px-8 text-white relative overflow-hidden"
                style={{
                    background: "var(--cv-primary)"
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
                            {hasHttpPhoto ? (
                                <img
                                    src={profil.photo_url}
                                    alt={`Photo professionnelle de ${profil.prenom} ${profil.nom}`}
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
                        <span className="text-[8pt] text-slate-600">
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
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[10pt] font-bold text-slate-900">{exp.poste}</h4>
                                        {(exp as any)._relevance_score >= 50 && (
                                            <span className="bg-slate-200 text-slate-700 text-[6pt] px-1.5 py-0.5 rounded font-bold">
                                                ★ Pertinent
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[8pt] text-slate-600 italic">
                                        {exp.date_debut} - {exp.date_fin || 'Présent'}
                                    </span>
                                </div>
                                <p className="text-[9pt] italic text-slate-600 mb-2">
                                    {exp.entreprise}{exp.lieu && `, ${exp.lieu}`}
                                </p>
                                {exp.clients && exp.clients.length > 0 && (
                                    <p className="text-[8pt] text-slate-600 mb-2">
                                        Clients : {exp.clients.join(", ")}
                                    </p>
                                )}
                                {/* Realisations are pre-sliced by CDC Pipeline based on _format */}
                                {exp.realisations && exp.realisations.length > 0 && (
                                    <ul className="text-[8pt] text-slate-700 space-y-1 list-disc list-inside">
                                        {exp.realisations.map((r, j) => (
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
                                            <span className="text-[8pt] text-slate-600">{edu.annee}</span>
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

                        {/* [CDC-21] Soft skills ajoutés */}
                        {competences?.soft_skills && competences.soft_skills.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <h3 className="text-[10pt] uppercase tracking-wider text-slate-700 mb-2">Soft Skills</h3>
                                <div className="text-[8pt] text-slate-600 leading-relaxed">
                                    {competences.soft_skills.map(safeString).join(' • ')}
                                </div>
                            </div>
                        )}

                        {/* Clients */}
                        {clients_references?.clients && clients_references.clients.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200">
                                <h3 className="text-[10pt] uppercase tracking-wider text-slate-700 mb-2">Clients</h3>
                                <div className="text-[8pt] text-slate-600 leading-relaxed">
                                    {clients_references.clients.join(' • ')}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {certifications && certifications.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200">
                                <h3 className="text-[10pt] uppercase tracking-wider text-slate-700 mb-2">Certifications</h3>
                                <ul className="text-[8pt] text-slate-600 space-y-1">
                                    {certifications.map((cert, i) => (
                                        <li key={i} className="flex items-center gap-1">
                                            <span className="text-slate-600">•</span> {cert}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                </div>

                {/* [CDC-21] Section Projets ajoutée */}
                {projects && projects.length > 0 && (
                    <section className="mt-6">
                        <h2
                            className="text-[11pt] uppercase tracking-widest border-b-2 border-slate-300 pb-2 mb-3 text-slate-800"
                            style={{ letterSpacing: '0.15em' }}
                        >
                            Projets
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {projects.map((project, i) => (
                                <div key={i} className="border-l-2 border-slate-300 pl-3">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[9pt] font-bold text-slate-900">{project.nom}</h4>
                                        {project.lien && (
                                            <ExternalLink className="w-3 h-3 text-slate-500" />
                                        )}
                                    </div>
                                    <p className="text-[8pt] text-slate-600">{project.description}</p>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <p className="text-[7pt] text-slate-500 mt-1">
                                            {project.technologies.join(' • ')}
                                        </p>
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
