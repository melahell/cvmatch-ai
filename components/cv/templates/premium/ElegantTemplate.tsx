"use client";

import React from "react";
import { TemplateProps, withDL, isValidEntreprise } from "../index";
import { CV_THEME_VARS as V } from "@/lib/cv/style/theme-vars";
import {
    PageContainer,
    ProfilePicture,
    ContactInfo,
    SummaryBlock,
    ExperienceItem,
    EducationItem,
    SkillsGrid,
    LanguageList,
    CertificationList,
    ClientReferences,
    ProjectItem,
    SectionTitle,
} from "@/components/cv/shared";

/**
 * ÉLÉGANT — Minimaliste luxe
 * Full-width, typographie raffinée, séparateurs fins, beaucoup de blanc.
 * Cible : Cadres supérieurs, finance, consulting, direction.
 */
export default function ElegantTemplate({
    data,
    includePhoto = false,
    jobContext,
    dense = false,
    displayLimits: dl,
}: TemplateProps) {
    const limits = withDL(dl);
    const { profil, experiences, competences, formations, langues, certifications, clients_references, projects } = data;
    const initials = `${profil?.prenom?.[0] || ""}${profil?.nom?.[0] || ""}`.toUpperCase();

    const limitedExperiences = experiences || [];
    const limitedSkills = (competences?.techniques || []).slice(0, limits.maxSkills);
    const limitedSoftSkills = (competences?.soft_skills || []).slice(0, limits.maxSoftSkills);
    const limitedFormations = (formations || []).slice(0, limits.maxFormations);
    const limitedLangages = (langues || []).slice(0, limits.maxLangues);
    const limitedCertifications = (certifications || []).slice(0, limits.maxCertifications);
    const limitedClients = (clients_references?.clients || []).slice(0, limits.maxClientsReferences);
    const limitedProjects = (projects || []).slice(0, limits.maxProjects);

    const gap = dense ? "gap-3" : "gap-5";
    const sectionGap = dense ? "space-y-3" : "space-y-5";

    return (
        <PageContainer
            dense={dense}
            fontSize={dense ? "8.5pt" : "9pt"}
            lineHeight={dense ? "1.3" : "1.4"}
            className="shadow-sm"
        >
            {/* ── HEADER ── */}
            <header className="px-10 pt-10 pb-6">
                <div className="flex items-end justify-between">
                    <div className="flex items-center gap-5">
                        <ProfilePicture
                            photoUrl={profil?.photo_url}
                            fullName={`${profil.prenom} ${profil.nom}`}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="md"
                            shape="circle"
                            borderColor={V.primary}
                        />
                        <div>
                            <h1
                                className="text-[22pt] font-extralight tracking-wide text-gray-900 leading-tight"
                            >
                                {profil.prenom}{" "}
                                <span className="font-semibold">{profil.nom}</span>
                            </h1>
                            <p
                                className="text-[11pt] font-light tracking-wider mt-1"
                                style={{ color: V.primary }}
                            >
                                {profil.titre_principal}
                            </p>
                        </div>
                    </div>

                    {/* Job context badge */}
                    {jobContext?.job_title && (
                        <div
                            className="text-[8pt] px-3 py-1.5 rounded-sm"
                            style={{ backgroundColor: V.primaryA10, color: V.primary }}
                        >
                            {jobContext.job_title}
                            {jobContext.company && ` · ${jobContext.company}`}
                            {jobContext.match_score && ` — ${jobContext.match_score}%`}
                        </div>
                    )}
                </div>

                {/* Fine accent line */}
                <div
                    className="mt-4 h-[1.5px] w-full"
                    style={{ background: `linear-gradient(90deg, ${V.primary}, ${V.primaryA20})` }}
                />

                {/* Contact — inline horizontal */}
                <div className="mt-3">
                    <ContactInfo
                        email={profil.email}
                        telephone={profil.telephone}
                        localisation={profil.localisation}
                        linkedin={profil.linkedin}
                        github={profil.github}
                        portfolio={profil.portfolio}
                        layout="inline"
                        iconColor={V.primary}
                        textColor="#475569"
                        iconSize={11}
                        textSize="text-[8pt]"
                    />
                </div>
            </header>

            {/* ── BODY ── */}
            <main className={`px-10 pb-8 ${sectionGap}`}>
                {/* Pitch */}
                {profil.elevator_pitch && (
                    <section>
                        <SummaryBlock
                            text={profil.elevator_pitch}
                            primaryColor={V.primary}
                            variant="border-left"
                            textSize="text-[9pt]"
                        />
                    </section>
                )}

                {/* Expériences */}
                {limitedExperiences.length > 0 && (
                    <section>
                        <SectionTitle
                            title="Expérience Professionnelle"
                            primaryColor={V.primary}
                            variant="accent-line"
                            textSize="text-[10pt]"
                        />
                        <div className={`flex flex-col ${dense ? "gap-2" : "gap-3"}`}>
                            {limitedExperiences.map((exp, i) => (
                                <ExperienceItem
                                    key={i}
                                    poste={exp.poste}
                                    entreprise={isValidEntreprise(exp.entreprise) ? exp.entreprise : ""}
                                    date_debut={exp.date_debut}
                                    date_fin={exp.date_fin}
                                    lieu={exp.lieu}
                                    realisations={exp.realisations}
                                    clients={exp.clients}
                                    primaryColor={V.primary}
                                    variant="standard"
                                    relevanceScore={(exp as any)._relevance_score}
                                    maxRealisations={limits.maxRealisationsPerExp}
                                    bulletStyle="dot"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Compétences + Soft Skills */}
                {(limitedSkills.length > 0 || limitedSoftSkills.length > 0) && (
                    <section>
                        <SectionTitle
                            title="Compétences"
                            primaryColor={V.primary}
                            variant="accent-line"
                            textSize="text-[10pt]"
                        />
                        <div className={`flex flex-col ${gap}`}>
                            {limitedSkills.length > 0 && (
                                <div>
                                    <p className="text-[8pt] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Techniques</p>
                                    <SkillsGrid
                                        skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                        primaryColor={V.primary}
                                        variant="pills"
                                        textSize="text-[8pt]"
                                    />
                                </div>
                            )}
                            {limitedSoftSkills.length > 0 && (
                                <div>
                                    <p className="text-[8pt] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Savoir-être</p>
                                    <SkillsGrid
                                        skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                        primaryColor={V.primary}
                                        variant="pills"
                                        textSize="text-[8pt]"
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Formations + Certifications — côte à côte */}
                {(limitedFormations.length > 0 || limitedCertifications.length > 0) && (
                    <section className="flex gap-8">
                        {limitedFormations.length > 0 && (
                            <div className="flex-1">
                                <SectionTitle
                                    title="Formation"
                                    primaryColor={V.primary}
                                    variant="accent-line"
                                    textSize="text-[10pt]"
                                />
                                <div className="space-y-1.5">
                                    {limitedFormations.map((edu, i) => (
                                        <EducationItem
                                            key={i}
                                            diplome={edu.diplome}
                                            etablissement={edu.etablissement}
                                            annee={edu.annee}
                                            primaryColor={V.primary}
                                            variant="compact"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {limitedCertifications.length > 0 && (
                            <div className="flex-1">
                                <SectionTitle
                                    title="Certifications"
                                    primaryColor={V.primary}
                                    variant="accent-line"
                                    textSize="text-[10pt]"
                                />
                                <CertificationList
                                    certifications={limitedCertifications}
                                    primaryColor={V.primary}
                                />
                            </div>
                        )}
                    </section>
                )}

                {/* Langues */}
                {limitedLangages.length > 0 && (
                    <section>
                        <SectionTitle
                            title="Langues"
                            primaryColor={V.primary}
                            variant="accent-line"
                            textSize="text-[10pt]"
                        />
                        <LanguageList
                            langues={limitedLangages}
                            primaryColor={V.primary}
                            variant="inline"
                            textSize="text-[8pt]"
                        />
                    </section>
                )}

                {/* Clients & Références */}
                {limitedClients.length > 0 && (
                    <section>
                        <SectionTitle
                            title="Clients & Références"
                            primaryColor={V.primary}
                            variant="accent-line"
                            textSize="text-[10pt]"
                        />
                        <ClientReferences
                            clients={limitedClients}
                            secteurs={clients_references?.secteurs}
                            primaryColor={V.primary}
                            variant="pills"
                            textSize="text-[8pt]"
                        />
                    </section>
                )}

                {/* Projets */}
                {limitedProjects.length > 0 && (
                    <section>
                        <SectionTitle
                            title="Projets"
                            primaryColor={V.primary}
                            variant="accent-line"
                            textSize="text-[10pt]"
                        />
                        <div className="space-y-2">
                            {limitedProjects.map((project, i) => (
                                <ProjectItem
                                    key={i}
                                    nom={project.nom}
                                    description={project.description}
                                    technologies={project.technologies}
                                    lien={project.lien}
                                    primaryColor={V.primary}
                                    variant="card"
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </PageContainer>
    );
}
