"use client";

import React from "react";
import { TemplateProps } from "./index";
import "./cv-base.css";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

// Vibrant color palette
const COLORS = {
    primary: '#f97316', // Orange
    secondary: '#8b5cf6', // Purple
    accent: '#06b6d4', // Cyan
    dark: '#1e293b',
    light: '#f8fafc',
};

export default function CreativeTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues } = data;

    // Limit content for 1-page guarantee
    const limitedExperiences = experiences?.slice(0, 3) || [];
    const limitedSkills = competences?.techniques?.slice(0, 12) || [];
    const limitedSoftSkills = competences?.soft_skills?.slice(0, 4) || [];
    const limitedFormations = formations?.slice(0, 2) || [];

    return (
        <div className={`cv-page cv-preview ${dense ? 'dense' : ''}`} style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            background: '#fff',
            overflow: 'hidden'
        }}>
            {/* Colorful Header Banner */}
            <div style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 50%, ${COLORS.accent} 100%)`,
                padding: '12mm 15mm',
                color: 'white',
                position: 'relative'
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute',
                    top: '-20mm',
                    right: '-20mm',
                    width: '60mm',
                    height: '60mm',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10mm', position: 'relative', zIndex: 1 }}>
                    {includePhoto && profil.photo_url && (
                        <img
                            src={profil.photo_url}
                            alt={`${profil.prenom} ${profil.nom}`}
                            style={{
                                width: '35mm',
                                height: '35mm',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        />
                    )}
                    <div>
                        <h1 style={{
                            fontSize: '22pt',
                            fontWeight: 800,
                            margin: 0,
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {profil.prenom} {profil.nom}
                        </h1>
                        <p style={{
                            fontSize: '12pt',
                            margin: '2mm 0 0 0',
                            opacity: 0.95
                        }}>
                            {profil.titre_principal}
                        </p>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '4mm',
                            marginTop: '3mm',
                            fontSize: '8pt',
                            opacity: 0.9
                        }}>
                            {profil.email && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
                                    <Mail size={10} /> {profil.email}
                                </span>
                            )}
                            {profil.telephone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
                                    <Phone size={10} /> {profil.telephone}
                                </span>
                            )}
                            {profil.localisation && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
                                    <MapPin size={10} /> {profil.localisation}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '8mm 15mm', display: 'flex', gap: '8mm' }}>
                {/* Left Column - Main */}
                <div style={{ flex: 1 }}>
                    {/* Summary */}
                    {profil.elevator_pitch && (
                        <section style={{ marginBottom: '5mm' }}>
                            <p style={{
                                fontSize: '9pt',
                                color: COLORS.dark,
                                lineHeight: 1.6,
                                borderLeft: `3px solid ${COLORS.primary}`,
                                paddingLeft: '3mm',
                                fontStyle: 'italic'
                            }}>
                                {profil.elevator_pitch}
                            </p>
                        </section>
                    )}

                    {/* Experience */}
                    <section style={{ marginBottom: '5mm' }}>
                        <h2 style={{
                            fontSize: '11pt',
                            fontWeight: 700,
                            color: COLORS.secondary,
                            marginBottom: '3mm',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2mm'
                        }}>
                            <span style={{
                                width: '6mm',
                                height: '6mm',
                                background: COLORS.secondary,
                                borderRadius: '50%',
                                display: 'inline-block'
                            }} />
                            Expériences
                        </h2>

                        {limitedExperiences.map((exp, i) => (
                            <div key={i} style={{
                                marginBottom: '4mm',
                                paddingLeft: '8mm',
                                borderLeft: `2px solid ${COLORS.light}`,
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '-4px',
                                    top: '2mm',
                                    width: '8px',
                                    height: '8px',
                                    background: COLORS.accent,
                                    borderRadius: '50%'
                                }} />
                                <div style={{ fontSize: '9pt', color: COLORS.primary, fontWeight: 600 }}>
                                    {exp.date_debut} - {exp.date_fin || 'Présent'}
                                </div>
                                <div style={{ fontSize: '10pt', fontWeight: 700, color: COLORS.dark }}>
                                    {exp.poste}
                                </div>
                                <div style={{ fontSize: '8pt', color: '#64748b' }}>
                                    {exp.entreprise}
                                </div>
                                {exp.realisations && exp.realisations.length > 0 && (
                                    <ul style={{ margin: '1mm 0 0 0', paddingLeft: '3mm', fontSize: '8pt', color: '#475569' }}>
                                        {exp.realisations.slice(0, 2).map((r, j) => (
                                            <li key={j} style={{ marginBottom: '0.5mm' }}>{r}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </section>
                </div>

                {/* Right Column - Sidebar */}
                <div style={{ width: '50mm' }}>
                    {/* Skills */}
                    <section style={{
                        marginBottom: '5mm',
                        background: COLORS.light,
                        padding: '4mm',
                        borderRadius: '3mm'
                    }}>
                        <h2 style={{
                            fontSize: '10pt',
                            fontWeight: 700,
                            color: COLORS.secondary,
                            marginBottom: '2mm'
                        }}>
                            💡 Compétences
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5mm' }}>
                            {limitedSkills.map((skill, i) => (
                                <span key={i} style={{
                                    fontSize: '7pt',
                                    padding: '1mm 2mm',
                                    background: i % 3 === 0 ? COLORS.primary : i % 3 === 1 ? COLORS.secondary : COLORS.accent,
                                    color: 'white',
                                    borderRadius: '1mm'
                                }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Soft Skills */}
                    {limitedSoftSkills.length > 0 && (
                        <section style={{ marginBottom: '5mm' }}>
                            <h2 style={{
                                fontSize: '10pt',
                                fontWeight: 700,
                                color: COLORS.secondary,
                                marginBottom: '2mm'
                            }}>
                                ✨ Qualités
                            </h2>
                            {limitedSoftSkills.map((skill, i) => (
                                <div key={i} style={{
                                    fontSize: '8pt',
                                    color: COLORS.dark,
                                    marginBottom: '1mm',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2mm'
                                }}>
                                    <span style={{ color: COLORS.primary }}>●</span>
                                    {skill}
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Education */}
                    <section style={{ marginBottom: '5mm' }}>
                        <h2 style={{
                            fontSize: '10pt',
                            fontWeight: 700,
                            color: COLORS.secondary,
                            marginBottom: '2mm'
                        }}>
                            🎓 Formation
                        </h2>
                        {limitedFormations.map((edu, i) => (
                            <div key={i} style={{ marginBottom: '2mm' }}>
                                <div style={{ fontSize: '8pt', fontWeight: 600, color: COLORS.dark }}>
                                    {edu.diplome}
                                </div>
                                <div style={{ fontSize: '7pt', color: '#64748b' }}>
                                    {edu.etablissement}
                                    {edu.annee && ` (${edu.annee})`}
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Languages */}
                    {langues && langues.length > 0 && (
                        <section>
                            <h2 style={{
                                fontSize: '10pt',
                                fontWeight: 700,
                                color: COLORS.secondary,
                                marginBottom: '2mm'
                            }}>
                                🌍 Langues
                            </h2>
                            {langues.map((lang, i) => (
                                <div key={i} style={{ fontSize: '8pt', marginBottom: '1mm' }}>
                                    <span style={{ fontWeight: 600, color: COLORS.dark }}>{lang.langue}</span>
                                    <span style={{ color: '#64748b' }}> – {lang.niveau}</span>
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
