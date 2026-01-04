"use client";

import React from "react";
import { TemplateProps } from "./index";
import "./cv-base.css";
import { Mail, Phone, MapPin, Github, Linkedin } from "lucide-react";

export default function TechTemplate({
    data,
    includePhoto = false, // Default false for tech
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues, certifications } = data;

    // Limit content for 1-page guarantee
    const limitedExperiences = experiences?.slice(0, 4) || [];
    const limitedSkills = competences?.techniques?.slice(0, 18) || [];
    const limitedFormations = formations?.slice(0, 2) || [];

    // Categorize skills (mock - in real implementation, use AI categorization)
    const skillCategories = {
        languages: limitedSkills.filter(s =>
            ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c++', 'ruby', 'php'].some(
                lang => s.toLowerCase().includes(lang)
            )
        ),
        frameworks: limitedSkills.filter(s =>
            ['react', 'vue', 'angular', 'next', 'node', 'express', 'django', 'spring', 'rails'].some(
                fw => s.toLowerCase().includes(fw)
            )
        ),
        tools: limitedSkills.filter(s =>
            ['git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci', 'jenkins', 'terraform'].some(
                tool => s.toLowerCase().includes(tool)
            )
        ),
        databases: limitedSkills.filter(s =>
            ['sql', 'postgres', 'mysql', 'mongo', 'redis', 'elastic', 'firebase'].some(
                db => s.toLowerCase().includes(db)
            )
        ),
    };

    // Remaining skills not categorized
    const categorizedSkills = [...skillCategories.languages, ...skillCategories.frameworks,
    ...skillCategories.tools, ...skillCategories.databases];
    const otherSkills = limitedSkills.filter(s => !categorizedSkills.includes(s));

    return (
        <div className={`cv-page cv-preview ${dense ? 'dense' : ''}`} style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
            <div className="cv-content">
                {/* Header - Tech style */}
                <header className="cv-header" style={{ display: 'flex', gap: '10mm', alignItems: 'flex-start' }}>
                    {includePhoto && profil.photo_url && (
                        <img
                            src={profil.photo_url}
                            alt={`${profil.prenom} ${profil.nom}`}
                            className="cv-photo"
                            style={{ width: '20mm', height: '20mm' }}
                        />
                    )}

                    <div style={{ flex: 1 }}>
                        <h1 className="cv-name" style={{ fontSize: '16pt', fontWeight: 800 }}>
                            {profil.prenom} {profil.nom}
                        </h1>
                        <p className="cv-title" style={{ color: '#10b981', fontFamily: 'monospace' }}>
                            {'>'} {profil.titre_principal}
                        </p>

                        <div className="cv-contact" style={{ marginTop: '2mm', gap: '4mm' }}>
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
                            <span className="cv-contact-item">
                                <Github size={10} /> GitHub
                            </span>
                            {profil.linkedin && (
                                <span className="cv-contact-item">
                                    <Linkedin size={10} /> LinkedIn
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Job context */}
                {jobContext?.job_title && (
                    <div style={{
                        fontSize: '8pt',
                        color: '#10b981',
                        marginTop: '2mm',
                        fontFamily: 'monospace'
                    }}>
                        // Candidature: {jobContext.job_title}
                        {jobContext.company && ` @ ${jobContext.company}`}
                        {jobContext.match_score && ` | Match: ${jobContext.match_score}%`}
                    </div>
                )}

                <div className="cv-divider" style={{ background: '#10b981', marginTop: '3mm' }} />

                {/* Two column layout - sidebar left */}
                <div className="cv-two-col" style={{ gap: '5mm' }}>
                    {/* Sidebar - Left */}
                    <div className="cv-side-col left" style={{ width: '55mm' }}>
                        {/* Skills by category */}
                        <section className="cv-section">
                            <h2 className="cv-section-title" style={{ color: '#10b981', borderColor: '#10b981' }}>
                                {'<'}Skills{'>'}
                            </h2>

                            {skillCategories.languages.length > 0 && (
                                <div style={{ marginBottom: '2mm' }}>
                                    <div style={{ fontSize: '7pt', color: '#64748b', marginBottom: '1mm' }}>
                                        // Languages
                                    </div>
                                    <div className="cv-skills-grid">
                                        {skillCategories.languages.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="cv-skill-tag"
                                                style={{
                                                    background: '#ecfdf5',
                                                    color: '#059669',
                                                    fontFamily: 'monospace',
                                                    fontSize: '7pt'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {skillCategories.frameworks.length > 0 && (
                                <div style={{ marginBottom: '2mm' }}>
                                    <div style={{ fontSize: '7pt', color: '#64748b', marginBottom: '1mm' }}>
                                        // Frameworks
                                    </div>
                                    <div className="cv-skills-grid">
                                        {skillCategories.frameworks.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="cv-skill-tag"
                                                style={{
                                                    background: '#f0fdf4',
                                                    color: '#16a34a',
                                                    fontFamily: 'monospace',
                                                    fontSize: '7pt'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {skillCategories.tools.length > 0 && (
                                <div style={{ marginBottom: '2mm' }}>
                                    <div style={{ fontSize: '7pt', color: '#64748b', marginBottom: '1mm' }}>
                                        // DevOps & Tools
                                    </div>
                                    <div className="cv-skills-grid">
                                        {skillCategories.tools.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="cv-skill-tag"
                                                style={{
                                                    background: '#fef3c7',
                                                    color: '#d97706',
                                                    fontFamily: 'monospace',
                                                    fontSize: '7pt'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {skillCategories.databases.length > 0 && (
                                <div style={{ marginBottom: '2mm' }}>
                                    <div style={{ fontSize: '7pt', color: '#64748b', marginBottom: '1mm' }}>
                                        // Databases
                                    </div>
                                    <div className="cv-skills-grid">
                                        {skillCategories.databases.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="cv-skill-tag"
                                                style={{
                                                    background: '#ede9fe',
                                                    color: '#7c3aed',
                                                    fontFamily: 'monospace',
                                                    fontSize: '7pt'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {otherSkills.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '7pt', color: '#64748b', marginBottom: '1mm' }}>
                                        // Other
                                    </div>
                                    <div className="cv-skills-grid">
                                        {otherSkills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="cv-skill-tag"
                                                style={{ fontFamily: 'monospace', fontSize: '7pt' }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Education */}
                        <section className="cv-section">
                            <h2 className="cv-section-title" style={{ color: '#10b981', borderColor: '#10b981' }}>
                                {'<'}Education{'>'}
                            </h2>
                            {limitedFormations.map((edu, i) => (
                                <div key={i} className="cv-education-item">
                                    <div className="cv-edu-degree" style={{ fontSize: '8pt' }}>{edu.diplome}</div>
                                    <div className="cv-edu-school" style={{ fontSize: '7pt' }}>
                                        {edu.etablissement}
                                        {edu.annee && ` (${edu.annee})`}
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Languages */}
                        {langues && langues.length > 0 && (
                            <section className="cv-section">
                                <h2 className="cv-section-title" style={{ color: '#10b981', borderColor: '#10b981' }}>
                                    {'<'}Languages{'>'}
                                </h2>
                                {langues.map((lang, i) => (
                                    <div key={i} style={{ fontSize: '8pt', marginBottom: '1mm' }}>
                                        <span style={{ fontWeight: 600 }}>{lang.langue}:</span>{' '}
                                        <span style={{ color: '#64748b' }}>{lang.niveau}</span>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Certifications */}
                        {certifications && certifications.length > 0 && (
                            <section className="cv-section">
                                <h2 className="cv-section-title" style={{ color: '#10b981', borderColor: '#10b981' }}>
                                    {'<'}Certs{'>'}
                                </h2>
                                {certifications.slice(0, 3).map((cert, i) => (
                                    <div key={i} style={{ fontSize: '7pt', color: '#475569', marginBottom: '1mm' }}>
                                        ✓ {cert}
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>

                    {/* Main column - Experiences */}
                    <div className="cv-main-col">
                        <section className="cv-section">
                            <h2 className="cv-section-title" style={{ color: '#10b981', borderColor: '#10b981' }}>
                                {'<'}Experience{'>'}
                            </h2>

                            {limitedExperiences.map((exp, i) => (
                                <div key={i} className="cv-experience">
                                    <div className="cv-exp-header">
                                        <span className="cv-exp-role" style={{ fontSize: '9pt' }}>{exp.poste}</span>
                                        <span className="cv-exp-date" style={{ fontFamily: 'monospace' }}>
                                            {exp.date_debut} → {exp.date_fin || 'now'}
                                        </span>
                                    </div>
                                    <div className="cv-exp-company" style={{ fontSize: '8pt', color: '#10b981' }}>
                                        @ {exp.entreprise}
                                        {exp.lieu && ` | ${exp.lieu}`}
                                    </div>
                                    {exp.realisations && exp.realisations.length > 0 && (
                                        <ul className="cv-exp-bullets" style={{ fontSize: '8pt', paddingLeft: '3mm' }}>
                                            {exp.realisations.slice(0, 3).map((r, j) => (
                                                <li key={j} style={{ marginBottom: '0.5mm' }}>→ {r}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
