"use client";

import React from "react";
import { TemplateProps } from "./index";
import "./cv-base.css";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";

export default function ModernTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues, certifications } = data;

    // Limit content for 1-page guarantee
    const limitedExperiences = experiences?.slice(0, 4) || [];
    const limitedSkills = competences?.techniques?.slice(0, 15) || [];
    const limitedSoftSkills = competences?.soft_skills?.slice(0, 6) || [];
    const limitedFormations = formations?.slice(0, 2) || [];

    return (
        <div className={`cv-page cv-preview ${dense ? 'dense' : ''}`}>
            <div className="cv-content">
                {/* Header with photo */}
                <header className="cv-header" style={{ display: 'flex', gap: '15mm', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <h1 className="cv-name">{profil.prenom} {profil.nom}</h1>
                        <p className="cv-title">{profil.titre_principal}</p>

                        <div className="cv-contact">
                            {profil.email && (
                                <span className="cv-contact-item">
                                    <Mail size={10} /> {profil.email}
                                </span>
                            )}
                            {profil.telephone && (
                                <span className="cv-contact-item">
                                    <Phone size={10} /> {profil.telephone}
                                </span>
                            )}
                            {profil.localisation && (
                                <span className="cv-contact-item">
                                    <MapPin size={10} /> {profil.localisation}
                                </span>
                            )}
                            {profil.linkedin && (
                                <span className="cv-contact-item">
                                    <Linkedin size={10} /> LinkedIn
                                </span>
                            )}
                        </div>
                    </div>

                    {includePhoto && profil.photo_url && (
                        <img
                            src={profil.photo_url}
                            alt={`${profil.prenom} ${profil.nom}`}
                            className="cv-photo"
                        />
                    )}
                </header>

                {/* Summary/Pitch */}
                {profil.elevator_pitch && (
                    <p className="cv-summary truncate-3">
                        {profil.elevator_pitch}
                    </p>
                )}

                {/* Job context if available */}
                {jobContext?.job_title && (
                    <div style={{
                        fontSize: '8pt',
                        color: '#64748b',
                        marginBottom: '3mm',
                        fontStyle: 'italic'
                    }}>
                        → Candidature pour : {jobContext.job_title}
                        {jobContext.company && ` chez ${jobContext.company}`}
                    </div>
                )}

                <div className="cv-divider" />

                {/* Two column layout */}
                <div className="cv-two-col">
                    {/* Main column - Experiences */}
                    <div className="cv-main-col">
                        <section className="cv-section">
                            <h2 className="cv-section-title accent">Expériences Professionnelles</h2>

                            {limitedExperiences.map((exp, i) => (
                                <div key={i} className="cv-experience">
                                    <div className="cv-exp-header">
                                        <span className="cv-exp-role">{exp.poste}</span>
                                        <span className="cv-exp-date">
                                            {exp.date_debut} - {exp.date_fin || 'Présent'}
                                        </span>
                                    </div>
                                    <div className="cv-exp-company">
                                        {exp.entreprise}
                                        {exp.lieu && ` · ${exp.lieu}`}
                                    </div>
                                    {exp.realisations && exp.realisations.length > 0 && (
                                        <ul className="cv-exp-bullets">
                                            {exp.realisations.slice(0, 3).map((r, j) => (
                                                <li key={j}>{r}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="cv-side-col">
                        <div className="cv-sidebar">
                            {/* Skills */}
                            <section className="cv-section">
                                <h2 className="cv-section-title">Compétences</h2>
                                <div className="cv-skills-grid">
                                    {limitedSkills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className={`cv-skill-tag ${jobContext?.keywords?.includes(skill.toLowerCase())
                                                    ? 'highlight'
                                                    : ''
                                                }`}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Soft Skills */}
                            {limitedSoftSkills.length > 0 && (
                                <section className="cv-section">
                                    <h2 className="cv-section-title">Qualités</h2>
                                    <div className="cv-skills-grid">
                                        {limitedSoftSkills.map((skill, i) => (
                                            <span key={i} className="cv-skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Education */}
                            <section className="cv-section">
                                <h2 className="cv-section-title">Formation</h2>
                                {limitedFormations.map((edu, i) => (
                                    <div key={i} className="cv-education-item">
                                        <div className="cv-edu-degree">{edu.diplome}</div>
                                        <div className="cv-edu-school">
                                            {edu.etablissement}
                                            {edu.annee && ` · ${edu.annee}`}
                                        </div>
                                    </div>
                                ))}
                            </section>

                            {/* Languages */}
                            {langues && langues.length > 0 && (
                                <section className="cv-section">
                                    <h2 className="cv-section-title">Langues</h2>
                                    <div className="cv-languages">
                                        {langues.map((lang, i) => (
                                            <span key={i} className="cv-lang-item">
                                                <span className="cv-lang-name">{lang.langue}</span>
                                                <span className="cv-lang-level"> ({lang.niveau})</span>
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Certifications */}
                            {certifications && certifications.length > 0 && (
                                <section className="cv-section">
                                    <h2 className="cv-section-title">Certifications</h2>
                                    <div style={{ fontSize: '8pt', color: '#475569' }}>
                                        {certifications.slice(0, 4).map((cert, i) => (
                                            <div key={i} style={{ marginBottom: '1mm' }}>• {cert}</div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
