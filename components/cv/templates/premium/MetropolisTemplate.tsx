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
 * METROPOLIS — Grand header gradient + body 2 colonnes
 * Header pleine largeur avec gradient diagonal + info personnelle.
 * Main body en 2 colonnes (60/40).
 * TEMPLATE_OVERRIDES: --cv-sidebar-bg: #4c1d95, --cv-sidebar-text: #f5f3ff
 * Cible : Marketing, Product, profils polyvalents.
 */
export default function MetropolisTemplate({
    data,
    includePhoto = true,
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

    const sectionMb = dense ? "mb-3" : "mb-4";

    return (
        <PageContainer
            dense={dense}
            fontSize={dense ? "8.5pt" : "9pt"}
            lineHeight={dense ? "1.3" : "1.4"}
            className="shadow-sm"
        >
            {/* ── HEADER with gradient ── */}
            <header
                className="relative overflow-hidden px-8 py-6"
                style={{
                    background: `linear-gradient(135deg, ${V.sidebarBg} 0%, ${V.primary} 60%, ${V.sidebarAccent} 100%)`,
                    color: V.sidebarText,
                }}
            >
                {/* Decorative SVG — subtle geometric pattern */}
                <svg
                    className="absolute right-0 top-0 opacity-15"
                    width="280" height="160"
                    viewBox="0 0 280 160"
                    fill="none"
                    style={{ pointerEvents: "none" }}
                >
                    <polygon points="280,0 280,160 120,160" fill="white" />
                    <polygon points="280,0 200,160 160,0" fill="white" opacity="0.5" />
                </svg>

                <div className="relative z-10 flex items-center gap-5">
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil?.photo_url}
                            fullName={`${profil.prenom} ${profil.nom}`}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="md"
                            shape="circle"
                            borderColor="rgba(255,255,255,0.6)"
                        />
                    )}
                    <div>
                        <h1 className="text-[22pt] font-bold leading-tight" style={{ color: V.sidebarText }}>
                            {profil.prenom} {profil.nom}
                        </h1>
                        <p className="text-[11pt] font-medium mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>
                            {profil.titre_principal}
                        </p>

                        {/* Contact in header */}
                        <div className="mt-2">
                            <ContactInfo
                                email={profil.email}
                                telephone={profil.telephone}
                                localisation={profil.localisation}
                                linkedin={profil.linkedin}
                                github={profil.github}
                                portfolio={profil.portfolio}
                                layout="horizontal"
                                iconColor="rgba(255,255,255,0.7)"
                                textColor="rgba(255,255,255,0.85)"
                                iconSize={11}
                                textSize="text-[8pt]"
                            />
                        </div>
                    </div>
                </div>

                {/* Job context */}
                {jobContext?.job_title && (
                    <div
                        className="relative z-10 mt-3 text-[8pt] px-3 py-1 rounded-sm inline-block"
                        style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
                    >
                        {jobContext.job_title}
                        {jobContext.company && ` · ${jobContext.company}`}
                        {jobContext.match_score != null && ` — ${jobContext.match_score}%`}
                    </div>
                )}
            </header>

            {/* ── BODY — 2 columns ── */}
            <main className="flex px-6 py-5 gap-5">
                {/* Left column — 60% — Experiences */}
                <div style={{ width: "60%" }}>
                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <section className={sectionMb}>
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
                        <section className={sectionMb}>
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

                    {/* Clients */}
                    {limitedClients.length > 0 && (
                        <section className={sectionMb}>
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
                                textSize="text-[8.5pt]"
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
                                        variant="compact"
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right column — 40% — Skills, Education, Langues */}
                <div
                    style={{ width: "40%", borderLeft: `2px solid ${V.primaryA30}` }}
                    className="pl-5"
                >
                    {/* Skills */}
                    {limitedSkills.length > 0 && (
                        <section className={sectionMb}>
                            <SectionTitle
                                title="Compétences"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[9.5pt]"
                            />
                            <SkillsGrid
                                skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                primaryColor={V.primary}
                                variant="pills"
                                textSize="text-[8pt]"
                            />
                        </section>
                    )}

                    {/* Soft Skills */}
                    {limitedSoftSkills.length > 0 && (
                        <section className={sectionMb}>
                            <SectionTitle
                                title="Savoir-être"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[9.5pt]"
                            />
                            <SkillsGrid
                                skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                primaryColor={V.primary}
                                variant="list"
                                textSize="text-[8pt]"
                            />
                        </section>
                    )}

                    {/* Formations */}
                    {limitedFormations.length > 0 && (
                        <section className={sectionMb}>
                            <SectionTitle
                                title="Formation"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[9.5pt]"
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
                        </section>
                    )}

                    {/* Langues */}
                    {limitedLangages.length > 0 && (
                        <section className={sectionMb}>
                            <SectionTitle
                                title="Langues"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[9.5pt]"
                            />
                            <LanguageList
                                langues={limitedLangages}
                                primaryColor={V.primary}
                                variant="badge"
                                textSize="text-[8pt]"
                            />
                        </section>
                    )}

                    {/* Certifications */}
                    {limitedCertifications.length > 0 && (
                        <section>
                            <SectionTitle
                                title="Certifications"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[9.5pt]"
                            />
                            <CertificationList
                                certifications={limitedCertifications}
                                primaryColor={V.primary}
                                textSize="text-[8pt]"
                            />
                        </section>
                    )}
                </div>
            </main>
        </PageContainer>
    );
}
