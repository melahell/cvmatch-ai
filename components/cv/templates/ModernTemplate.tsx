"use client";

import React from "react";
import { TemplateProps, isValidEntreprise, withDL } from "./index";
import { Mail, Phone, MapPin, Linkedin, Globe, Github, ExternalLink } from "lucide-react";
// [CDC-24] Utiliser utilitaire centralisé
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { formatDate } from "@/lib/cv/formatters";


export default function ModernTemplate({
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

    const renderRealisation = (r: string): string => sanitizeText(r);
    const renderSkill = (s: string): string => sanitizeText(s);

    const limitedExperiences = experiences || [];
    const limitedSkills = (competences?.techniques || []).slice(0, limits.maxSkills);
    const limitedSoftSkills = (competences?.soft_skills || []).slice(0, limits.maxSoftSkills);
    const limitedFormations = (formations || []).slice(0, limits.maxFormations);
    const limitedCertifications = (certifications || []).slice(0, limits.maxCertifications);
    const limitedProjects = (projects || []).slice(0, limits.maxProjects);

    // Sanitize elevator pitch
    const cleanElevatorPitch = sanitizeText(profil?.elevator_pitch);

    // Get initials for avatar fallback
    const initials = `${profil?.prenom?.[0] || ''}${profil?.nom?.[0] || ''}`.toUpperCase();

    return (
        <div
            className="cv-page bg-white shadow-2xl rounded-xl flex text-[9pt]"
            style={{
                width: '210mm',
                minHeight: '297mm',
                boxSizing: 'border-box',
                fontFamily: "var(--cv-font-body)",
                fontSize: dense ? '8pt' : '8.5pt',
                lineHeight: dense ? '1.25' : '1.3'
            }}
        >
            {/* Sidebar Gauche - Sombre */}
            <aside
                className="flex-shrink-0 text-white p-5 flex flex-col"
                style={{
                    width: '75mm',
                    background: "var(--cv-sidebar-bg)"
                }}
            >
                {/* Avatar */}
                <div className="flex flex-col items-center text-center" style={{ marginBottom: "var(--spacing-section)" }}>
                    <div
                        className="w-24 h-24 rounded-full border-4 border-[color:var(--cv-sidebar-accent)] p-0.5 mb-3 overflow-hidden bg-slate-800 flex items-center justify-center shadow-level-4"
                    >
                        {includePhoto && hasValidPhoto ? (
                            <img
                                src={profil.photo_url}
                                alt={`Photo professionnelle de ${profil.prenom} ${profil.nom}`}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--cv-primary)] to-[var(--cv-sidebar-accent)] flex items-center justify-center text-2xl font-bold">
                                {initials}
                            </div>
                        )}
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">{profil.prenom} {profil.nom}</h1>
                    <p className="text-[color:var(--cv-sidebar-accent)] font-semibold mt-1 text-[9pt] uppercase tracking-widest leading-tight">
                        {sanitizeText(profil.titre_principal)}
                    </p>
                </div>

                {/* Contact */}
                <div className="flex flex-col text-[8pt]" style={{ gap: "var(--spacing-item)", marginBottom: "var(--spacing-section)" }}>
                    <h3 className="text-[color:var(--cv-sidebar-accent)] font-bold uppercase text-[7pt] tracking-widest border-b-2 border-[color:var(--cv-sidebar-accent)] pb-1.5">
                        Contact
                    </h3>
                    {profil.email && (
                        <div className="flex items-center gap-2 hover:text-[color:var(--cv-sidebar-accent)] transition-colors">
                            <Mail className="w-3.5 h-3.5 text-[color:var(--cv-sidebar-accent)] flex-shrink-0" />
                            <span className="text-slate-100 truncate">{profil.email}</span>
                        </div>
                    )}
                    {profil.telephone && (
                        <div className="flex items-center gap-2 hover:text-[color:var(--cv-sidebar-accent)] transition-colors">
                            <Phone className="w-3.5 h-3.5 text-[color:var(--cv-sidebar-accent)] flex-shrink-0" />
                            <span className="text-slate-100">{profil.telephone}</span>
                        </div>
                    )}
                    {profil.localisation && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[color:var(--cv-sidebar-accent)] flex-shrink-0" />
                            <span className="text-slate-100">{profil.localisation}</span>
                        </div>
                    )}
                    {profil.linkedin && (
                        <div className="flex items-center gap-2 hover:text-[color:var(--cv-sidebar-accent)] transition-colors">
                            <Linkedin className="w-3.5 h-3.5 text-[color:var(--cv-sidebar-accent)] flex-shrink-0" />
                            <span className="text-slate-100 truncate text-[7pt]">{profil.linkedin}</span>
                        </div>
                    )}
                    {profil.github && (
                        <div className="flex items-center gap-2 hover:text-[color:var(--cv-sidebar-accent)] transition-colors">
                            <Github className="w-3.5 h-3.5 text-[color:var(--cv-sidebar-accent)] flex-shrink-0" />
                            <span className="text-slate-100 truncate text-[7pt]">{profil.github}</span>
                        </div>
                    )}
                    {profil.portfolio && (
                        <div className="flex items-center gap-2 hover:text-[color:var(--cv-sidebar-accent)] transition-colors">
                            <Globe className="w-3.5 h-3.5 text-[color:var(--cv-sidebar-accent)] flex-shrink-0" />
                            <span className="text-slate-100 truncate text-[7pt]">{profil.portfolio}</span>
                        </div>
                    )}
                </div>

                {/* Compétences */}
                <div className="space-y-3 mb-5">
                    <h3 className="text-[color:var(--cv-sidebar-accent)] font-bold uppercase text-[7pt] tracking-widest border-b-2 border-[color:var(--cv-sidebar-accent)] pb-1.5">
                        Compétences
                    </h3>
                    <ul className="space-y-1">
                        {limitedSkills.map((skill, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="mt-[4px] w-1.5 h-1.5 rounded-full bg-[var(--cv-sidebar-accent)] flex-shrink-0" />
                                <span className="text-slate-100 font-medium text-[8pt] leading-tight">{renderSkill(skill)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Soft Skills - Tags */}
                {limitedSoftSkills.length > 0 && (
                    <div style={{ marginBottom: "var(--spacing-section)" }}>
                        <h3 className="text-[color:var(--cv-sidebar-accent)] font-bold uppercase text-[7pt] tracking-widest border-b-2 border-[color:var(--cv-sidebar-accent)] pb-1.5">
                            Qualités
                        </h3>
                        <div className="flex flex-wrap gap-1" style={{ marginTop: "var(--spacing-bullet)" }}>
                            {limitedSoftSkills.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 bg-[var(--cv-primary-light)] text-[color:var(--cv-sidebar-text)] text-[7pt] rounded border border-[color:var(--cv-sidebar-accent)] font-medium"
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
                        <h3 className="text-[color:var(--cv-sidebar-accent)] font-bold uppercase text-[7pt] tracking-widest border-b-2 border-[color:var(--cv-sidebar-accent)] pb-1.5">
                            Langues
                        </h3>
                        <div className="space-y-1.5 text-[8pt]">
                            {(langues || []).slice(0, limits.maxLangues).map((lang, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="text-slate-100 font-medium">{lang.langue}</span>
                                    <span className="text-[6pt] bg-[var(--cv-sidebar-accent)] text-white px-1.5 py-0.5 rounded uppercase font-semibold">
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
                        <h3 className="text-[color:var(--cv-sidebar-accent)] font-bold uppercase text-[7pt] tracking-widest border-b-2 border-[color:var(--cv-sidebar-accent)] pb-1.5">
                            Références
                        </h3>
                        {clients_references.secteurs && clients_references.secteurs.length > 0 ? (
                            <div className="space-y-2">
                                {clients_references.secteurs.slice(0, 5).map((group, i) => (
                                    <div key={i}>
                                        <span className="inline-block bg-[var(--cv-sidebar-accent)] text-white text-[6pt] uppercase font-bold px-1.5 py-0.5 rounded mb-1">
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
                                {clients_references.clients.slice(0, limits.maxClientsReferences).map((client: string, i: number) => (
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
                    <section className="mb-6">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--cv-primary)] mb-3 pb-1.5 border-b-2 border-[var(--cv-primary)]">
                            Profil
                        </h2>
                        <p className="text-slate-700 leading-relaxed text-[9pt] border-l-4 border-[var(--cv-primary)] pl-4 py-1 font-medium">
                            {cleanElevatorPitch}
                        </p>
                    </section>
                )}

                {/* Job context */}
                {jobContext?.job_title && (
                    <div className="mb-4 px-3 py-2 bg-[var(--cv-primary-light)] rounded-lg border border-[var(--cv-border)]">
                        <p className="text-[8pt] text-[color:var(--cv-primary)] font-semibold">
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
                    <div className="flex flex-col" style={{ gap: "var(--spacing-item)" }}>
                        {limitedExperiences.map((exp, i) => {
                            return (
                                <div
                                    key={i}
                                    className="relative pl-5 pr-3 py-3 border-l-[3px] border-l-neon-purple group rounded-r-lg bg-gradient-to-r from-neon-purple/5 to-transparent break-inside-avoid"
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
                                        <span className="text-[color:var(--cv-primary)] font-bold bg-[var(--cv-primary-light)] px-2 py-0.5 rounded text-[7pt]">
                                            {(() => {
                                                const start = exp.date_debut ? formatDate(exp.date_debut) : "";
                                                const isCurrent = exp.actuel === true;
                                                const end = exp.date_fin ? formatDate(exp.date_fin) : (isCurrent ? "Présent" : "");
                                                return start && end ? `${start} - ${end}` : start || end;
                                            })()}
                                        </span>
                                    </div>
                                    {isValidEntreprise(exp.entreprise) ? (
                                        <p className="text-purple-600 font-bold mb-1.5 text-[9pt]">
                                            {sanitizeText(exp.entreprise)}
                                            {exp.lieu && ` • ${sanitizeText(exp.lieu)}`}
                                        </p>
                                    ) : exp.lieu ? (
                                        <p className="text-purple-600 font-bold mb-1.5 text-[9pt]">{sanitizeText(exp.lieu)}</p>
                                    ) : null}
                                    {exp.clients && exp.clients.length > 0 && (
                                        <p className="text-slate-500 text-[7pt] mb-1">
                                            Clients : {exp.clients.slice(0, limits.maxClientsPerExp).map(sanitizeText).join(", ")}
                                        </p>
                                    )}
                                    {/* Solution 6.2: Afficher contexte opérationnel */}
                                    {(exp as any).contexte && (
                                        <p className="text-slate-600 text-[7pt] italic mb-1">
                                            {sanitizeText((exp as any).contexte)}
                                        </p>
                                    )}
                                    {/* Solution 6.2: Afficher technologies */}
                                    {(exp as any).technologies && Array.isArray((exp as any).technologies) && (exp as any).technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-1">
                                            {(exp as any).technologies.map((tech: string, idx: number) => (
                                                <span key={idx} className="text-[6pt] bg-[var(--cv-primary-light)] text-[color:var(--cv-primary)] px-1.5 py-0.5 rounded">
                                                    {sanitizeText(tech)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Realisations are pre-sliced by CDC Pipeline based on _format */}
                                    {exp.realisations && exp.realisations.length > 0 && (
                                        <ul className="text-slate-700 space-y-0.5 list-disc list-outside pl-5 text-[8pt] leading-relaxed">
                                            {exp.realisations.slice(0, limits.maxRealisationsPerExp).map((r, j) => (
                                                <li key={j} className="pl-1">{renderRealisation(r)}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Certifications */}
                {limitedCertifications.length > 0 && (
                    <section className="mb-2">
                        <h2 className="text-[10pt] font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <span className="w-4 h-0.5 bg-purple-600 rounded-full" />
                            Certifications
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {limitedCertifications.map((cert, i) => (
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
                            <span className="w-6 h-0.5 bg-[var(--cv-primary)] rounded-full" />
                            Formation
                        </h2>
                        <div className="space-y-2">
                            {limitedFormations.map((edu, i) => (
                                <div
                                    key={i}
                                    className="pl-4 py-2 border-l-2 border-[var(--cv-border)] bg-[var(--cv-primary-light)]"
                                >
                                    <h4 className="font-bold text-[9pt] text-slate-900">{sanitizeText(edu.diplome)}</h4>
                                    {edu.etablissement && (
                                        <p className="text-[color:var(--cv-primary)] font-semibold text-[8pt]">{sanitizeText(edu.etablissement)}</p>
                                    )}
                                    {edu.annee && (
                                        <p className="text-slate-600 text-[7pt] mt-0.5">{sanitizeText(edu.annee)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* [CDC-21] Section Projets ajoutée */}
                {limitedProjects.length > 0 && (
                    <section className="mb-2">
                        <h2 className="text-[10pt] font-extrabold mb-2 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                            <span className="w-4 h-0.5 bg-[var(--cv-primary)] rounded-full" />
                            Projets
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {limitedProjects.map((project, i) => (
                                <div
                                    key={i}
                                    className="pl-3 py-2 border-l-2 border-purple-200 bg-gradient-to-r from-purple-50/50 to-transparent"
                                >
                                    <div className="flex items-center gap-1">
                                        <h4 className="font-bold text-[8pt] text-slate-900">{project.nom}</h4>
                                        {project.lien && <ExternalLink className="w-2.5 h-2.5 text-[color:var(--cv-primary)]" />}
                                    </div>
                                    <p className="text-slate-600 text-[7pt]">{project.description}</p>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {project.technologies.map((tech, j) => (
                                                <span key={j} className="text-[5pt] bg-[var(--cv-primary-light)] text-[color:var(--cv-primary)] px-1 py-0.5 rounded">
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
