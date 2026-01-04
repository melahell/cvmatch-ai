"use client";

import React from "react";
import { TemplateProps } from "./index";
import "./cv-base.css";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";

export default function ClassicTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false
}: TemplateProps) {
    const { profil, experiences, competences, formations, langues, certifications } = data;

    // Limit content for 1-page guarantee
    const limitedExperiences = experiences?.slice(0, 4) || [];
    const limitedSkills = competences?.techniques?.slice(0, 12) || [];
    const limitedFormations = formations?.slice(0, 3) || [];

    return (
        <div className={`cv-page cv-preview ${dense ? 'dense' : ''}`} style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            background: '#fff'
        }}>
            <div className="cv-content" style={{ padding: '15mm 20mm' }}>
                {/* Classic Header - Centered */}
                <header style={{ textAlign: 'center', marginBottom: '6mm', borderBottom: '1px solid #333', paddingBottom: '4mm' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15mm' }}>
                        {includePhoto && profil.photo_url && (
                            <img
                                src={profil.photo_url}
                                alt={`${profil.prenom} ${profil.nom}`}
                                style={{
                                    width: '22mm',
                                    height: '22mm',
                                    borderRadius: '2mm',
                                    objectFit: 'cover',
                                    border: '1px solid #ddd'
                                }}
                            />
                        )}
                        <div>
                            <h1 style={{
                                fontSize: '20pt',
                                fontWeight: 'normal',
                                letterSpacing: '2pt',
                                textTransform: 'uppercase',
                                margin: 0,
                                color: '#1a1a1a'
                            }}>
                                {profil.prenom} {profil.nom}
                            </h1>
                            <p style={{
                                fontSize: '11pt',
                                color: '#666',
                                margin: '2mm 0 0 0',
                                fontStyle: 'italic'
                            }}>
                                {profil.titre_principal}
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '5mm',
                        marginTop: '3mm',
                        fontSize: '8pt',
                        color: '#555'
                    }}>
                        {profil.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
                                <Mail size={9} /> {profil.email}
                            </span>
                        )}
                        {profil.telephone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
                                <Phone size={9} /> {profil.telephone}
                            </span>
                        )}
                        {profil.localisation && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '1mm' }}>
                                <MapPin size={9} /> {profil.localisation}
                            </span>
                        )}
                    </div>
                </header>

                {/* Summary */}
                {profil.elevator_pitch && (
                    <section style={{ marginBottom: '5mm', textAlign: 'justify', fontSize: '9pt', color: '#444', lineHeight: 1.5 }}>
                        {profil.elevator_pitch}
                    </section>
                )}

                {/* Experience Section */}
                <section style={{ marginBottom: '5mm' }}>
                    <h2 style={{
                        fontSize: '11pt',
                        textTransform: 'uppercase',
                        letterSpacing: '1pt',
                        borderBottom: '1px solid #999',
                        paddingBottom: '1mm',
                        marginBottom: '3mm',
                        color: '#333'
                    }}>
                        Expérience Professionnelle
                    </h2>

                    {limitedExperiences.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '3mm' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ fontSize: '10pt', color: '#1a1a1a' }}>{exp.poste}</strong>
                                <span style={{ fontSize: '8pt', color: '#666', fontStyle: 'italic' }}>
                                    {exp.date_debut} - {exp.date_fin || 'Présent'}
                                </span>
                            </div>
                            <div style={{ fontSize: '9pt', color: '#555', fontStyle: 'italic' }}>
                                {exp.entreprise}{exp.lieu && `, ${exp.lieu}`}
                            </div>
                            {exp.realisations && exp.realisations.length > 0 && (
                                <ul style={{ margin: '1mm 0 0 0', paddingLeft: '4mm', fontSize: '9pt', color: '#444' }}>
                                    {exp.realisations.slice(0, 3).map((r, j) => (
                                        <li key={j} style={{ marginBottom: '0.5mm' }}>{r}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>

                {/* Education Section */}
                <section style={{ marginBottom: '5mm' }}>
                    <h2 style={{
                        fontSize: '11pt',
                        textTransform: 'uppercase',
                        letterSpacing: '1pt',
                        borderBottom: '1px solid #999',
                        paddingBottom: '1mm',
                        marginBottom: '3mm',
                        color: '#333'
                    }}>
                        Formation
                    </h2>

                    {limitedFormations.map((edu, i) => (
                        <div key={i} style={{ marginBottom: '2mm' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ fontSize: '9pt' }}>{edu.diplome}</strong>
                                {edu.annee && <span style={{ fontSize: '8pt', color: '#666' }}>{edu.annee}</span>}
                            </div>
                            <div style={{ fontSize: '8pt', color: '#555', fontStyle: 'italic' }}>{edu.etablissement}</div>
                        </div>
                    ))}
                </section>

                {/* Skills Section */}
                <section style={{ marginBottom: '5mm' }}>
                    <h2 style={{
                        fontSize: '11pt',
                        textTransform: 'uppercase',
                        letterSpacing: '1pt',
                        borderBottom: '1px solid #999',
                        paddingBottom: '1mm',
                        marginBottom: '3mm',
                        color: '#333'
                    }}>
                        Compétences
                    </h2>
                    <p style={{ fontSize: '9pt', color: '#444', lineHeight: 1.6 }}>
                        {limitedSkills.join(' • ')}
                    </p>
                </section>

                {/* Languages */}
                {langues && langues.length > 0 && (
                    <section>
                        <h2 style={{
                            fontSize: '11pt',
                            textTransform: 'uppercase',
                            letterSpacing: '1pt',
                            borderBottom: '1px solid #999',
                            paddingBottom: '1mm',
                            marginBottom: '3mm',
                            color: '#333'
                        }}>
                            Langues
                        </h2>
                        <p style={{ fontSize: '9pt', color: '#444' }}>
                            {langues.map((l, i) => (
                                <span key={i}>
                                    <strong>{l.langue}</strong>: {l.niveau}
                                    {i < langues.length - 1 && ' | '}
                                </span>
                            ))}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}
