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
 * EXECUTIVE — Sidebar corporate sombre + main content blanc
 * Sidebar (35%) : header primaire + contenu en dark bg
 * Main (65%) : expériences + projets + clients en blanc propre.
 * Cible : Management, Consulting, Finance, Direction.
 */
export default function ExecutiveTemplate({
    data,
    includePhoto = true,
    jobContext,
    dense = false,
    displayLimits: dl,
}: TemplateProps) {
    const limits = withDL(dl);
    const { profil, experiences, competences, formations, langues, certifications, clients_references, projects } = data;
    const initials = `${profil?.prenom?.[0] || ""}${profil?.nom?.[0] || ""}`.toUpperCase();
    const fullName = `${profil?.prenom || ""} ${profil?.nom || ""}`.trim();

    const limitedExperiences = experiences || [];
    const limitedSkills = (competences?.techniques || []).slice(0, limits.maxSkills);
    const limitedSoftSkills = (competences?.soft_skills || []).slice(0, limits.maxSoftSkills);
    const limitedFormations = (formations || []).slice(0, limits.maxFormations);
    const limitedLangages = (langues || []).slice(0, limits.maxLangues);
    const limitedCertifications = (certifications || []).slice(0, limits.maxCertifications);
    const limitedClients = (clients_references?.clients || []).slice(0, limits.maxClientsReferences);
    const limitedProjects = (projects || []).slice(0, limits.maxProjects);

    const sectionMb = dense ? "mb-2" : "mb-3";
    const sidebarPad = dense ? "px-3 py-2" : "px-4 py-3";

    return (
        <PageContainer
            dense={dense}
            fontSize={dense ? "8pt" : "9pt"}
            lineHeight={dense ? "1.25" : "1.35"}
            className="shadow-sm"
        >
            <div className="flex h-full">
                {/* ── SIDEBAR (35%) ── */}
                <aside className="w-[35%] flex flex-col" style={{ backgroundColor: V.sidebarBg }}>
                    {/* Header — primary block */}
                    <div className={`${sidebarPad} pb-4`} style={{ backgroundColor: V.primary }}>
                        {includePhoto && (
                            <div className="flex justify-center mb-2">
                                <ProfilePicture
                                    photoUrl={profil?.photo_url}
                                    fullName={fullName}
                                    initials={initials}
                                    includePhoto={includePhoto}
                                    size="md"
                                    shape="circle"
                                    borderColor="rgba(255,255,255,0.3)"
                                />
                            </div>
                        )}
                        <h1 className="text-[14pt] font-bold text-white text-center leading-tight">{fullName}</h1>
                        {profil?.titre_principal && (
                            <p className="text-[8pt] text-white/80 text-center mt-0.5">{profil.titre_principal}</p>
                        )}
                    </div>

                    {/* Contact — transition zone */}
                    <div className={`${sidebarPad} py-2`} style={{ backgroundColor: V.primary, opacity: 0.9 }}>
                        <ContactInfo
                            email={profil?.email}
                            telephone={profil?.telephone}
                            localisation={profil?.localisation}
                            linkedin={profil?.linkedin}
                            github={profil?.github}
                            portfolio={profil?.portfolio}
                            layout="vertical"
                            textColor="rgba(255,255,255,0.85)"
                            iconColor="rgba(255,255,255,0.7)"
                            iconSize={10}
                            textSize="text-[7.5pt]"
                            className="space-y-1"
                        />
                    </div>

                    {/* Sidebar content */}
                    <div className={`${sidebarPad} flex-1 space-y-3`} style={{ color: V.sidebarText }}>
                        {/* Skills */}
                        {limitedSkills.length > 0 && (
                            <section>
                                <SectionTitle title="Compétences" primaryColor={V.sidebarAccent} variant="sidebar" textSize="text-[7pt]" />
                                <SkillsGrid
                                    skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                    primaryColor={V.sidebarAccent}
                                    variant="pills"
                                    textSize="text-[7pt]"
                                />
                            </section>
                        )}

                        {/* Soft Skills */}
                        {limitedSoftSkills.length > 0 && (
                            <section>
                                <SectionTitle title="Savoir-être" primaryColor={V.sidebarAccent} variant="sidebar" textSize="text-[7pt]" />
                                <SkillsGrid
                                    skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                    primaryColor={V.sidebarAccent}
                                    variant="list"
                                    textSize="text-[7pt]"
                                />
                            </section>
                        )}

                        {/* Langues */}
                        {limitedLangages.length > 0 && (
                            <section>
                                <SectionTitle title="Langues" primaryColor={V.sidebarAccent} variant="sidebar" textSize="text-[7pt]" />
                                <LanguageList langues={limitedLangages} primaryColor={V.sidebarAccent} variant="badge" textSize="text-[7pt]" />
                            </section>
                        )}

                        {/* Formation */}
                        {limitedFormations.length > 0 && (
                            <section>
                                <SectionTitle title="Formation" primaryColor={V.sidebarAccent} variant="sidebar" textSize="text-[7pt]" />
                                <div className="space-y-1">
                                    {limitedFormations.map((edu, i) => (
                                        <EducationItem
                                            key={i}
                                            diplome={edu.diplome}
                                            etablissement={edu.etablissement}
                                            annee={edu.annee}
                                            primaryColor={V.sidebarAccent}
                                            variant="compact"
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Certifications */}
                        {limitedCertifications.length > 0 && (
                            <section>
                                <SectionTitle title="Certifications" primaryColor={V.sidebarAccent} variant="sidebar" textSize="text-[7pt]" />
                                <CertificationList certifications={limitedCertifications} primaryColor={V.sidebarAccent} textSize="text-[7pt]" />
                            </section>
                        )}
                    </div>
                </aside>

                {/* ── MAIN (65%) ── */}
                <main className="flex-1 px-5 pt-5 pb-5 space-y-3">
                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div
                            className="text-[7pt] px-2 py-0.5 rounded inline-block mb-1"
                            style={{ backgroundColor: V.primaryA10, color: V.primary }}
                        >
                            {jobContext.job_title}
                            {jobContext.company && ` · ${jobContext.company}`}
                            {jobContext.match_score != null && ` — ${jobContext.match_score}%`}
                        </div>
                    )}

                    {/* Pitch */}
                    {profil?.elevator_pitch && (
                        <section className={sectionMb}>
                            <SummaryBlock
                                text={profil.elevator_pitch}
                                primaryColor={V.primary}
                                variant="border-left"
                                textSize="text-[8.5pt]"
                            />
                        </section>
                    )}

                    {/* Expériences */}
                    {limitedExperiences.length > 0 && (
                        <section className={sectionMb}>
                            <SectionTitle
                                title="Expérience Professionnelle"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[10pt]"
                            />
                            <div className={`flex flex-col ${dense ? "gap-1.5" : "gap-2"}`}>
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

                    {/* Projets */}
                    {limitedProjects.length > 0 && (
                        <section className={sectionMb}>
                            <SectionTitle title="Projets" primaryColor={V.primary} variant="accent-line" textSize="text-[10pt]" />
                            <div className="space-y-1.5">
                                {limitedProjects.map((project, i) => (
                                    <ProjectItem key={i} nom={project.nom} description={project.description} technologies={project.technologies} lien={project.lien} primaryColor={V.primary} variant="card" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Clients */}
                    {limitedClients.length > 0 && (
                        <section>
                            <SectionTitle title="Clients & Références" primaryColor={V.primary} variant="accent-line" textSize="text-[10pt]" />
                            <ClientReferences clients={limitedClients} secteurs={clients_references?.secteurs} primaryColor={V.primary} variant="pills" textSize="text-[8pt]" />
                        </section>
                    )}
                </main>
            </div>
        </PageContainer>
    );
}
