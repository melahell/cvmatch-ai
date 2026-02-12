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
 * METROPOLIS — Gradient header + 2-column body
 * Header avec gradient diagonal + SVG decoration + photo avec ring.
 * Body en 2 colonnes : 60% expériences/projets | 40% skills/formation/langues/certifs.
 * Cible : Marketing, Communication, Chef de projet, Digital.
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

    /** Column heading for the right column */
    const ColHeading = ({ title }: { title: string }) => (
        <h3
            className="text-[7pt] font-bold uppercase tracking-widest mb-1.5 pb-1 border-b"
            style={{ color: V.primary, borderColor: V.primaryA30 }}
        >
            {title}
        </h3>
    );

    return (
        <PageContainer
            dense={dense}
            fontSize={dense ? "8pt" : "9pt"}
            lineHeight={dense ? "1.25" : "1.35"}
            className="shadow-sm"
        >
            {/* ── HEADER — gradient + SVG decoration ── */}
            <header
                className="relative overflow-hidden px-7 pt-5 pb-4"
                style={{
                    background: `linear-gradient(135deg, ${V.primary} 0%, ${V.sidebarBg} 100%)`,
                    color: V.sidebarText,
                }}
            >
                {/* SVG diagonal decoration */}
                <svg
                    className="absolute right-0 top-0 h-full w-32 opacity-20"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 200"
                    preserveAspectRatio="none"
                >
                    <polygon points="30,0 100,0 100,200 70,200" fill="rgba(255,255,255,0.1)" />
                    <polygon points="60,0 100,0 100,200" fill="rgba(255,255,255,0.08)" />
                </svg>

                <div className="relative z-10 flex items-center gap-5">
                    {includePhoto && (
                        <div className="rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${V.sidebarAccent}, transparent)` }}>
                            <ProfilePicture
                                photoUrl={profil?.photo_url}
                                fullName={fullName}
                                initials={initials}
                                includePhoto={includePhoto}
                                size="lg"
                                shape="circle"
                                borderColor={V.sidebarText}
                            />
                        </div>
                    )}
                    <div>
                        <h1 className="text-[20pt] font-bold leading-tight text-white">
                            {fullName}
                        </h1>
                        <p className="text-[10pt] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                            {profil?.titre_principal}
                        </p>
                        <div className="mt-2">
                            <ContactInfo
                                email={profil?.email}
                                telephone={profil?.telephone}
                                localisation={profil?.localisation}
                                linkedin={profil?.linkedin}
                                github={profil?.github}
                                portfolio={profil?.portfolio}
                                layout="horizontal"
                                iconColor="rgba(255,255,255,0.7)"
                                textColor="rgba(255,255,255,0.85)"
                                iconSize={10}
                                textSize="text-[7.5pt]"
                            />
                        </div>
                    </div>
                </div>

                {/* Job context */}
                {jobContext?.job_title && (
                    <div
                        className="relative z-10 mt-2 text-[7pt] px-2 py-0.5 rounded inline-block"
                        style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
                    >
                        {jobContext.job_title}
                        {jobContext.company && ` · ${jobContext.company}`}
                        {jobContext.match_score != null && ` — ${jobContext.match_score}%`}
                    </div>
                )}
            </header>

            {/* ── BODY — 2 columns ── */}
            <div className="flex flex-1 px-5 pt-3 pb-5 gap-4">
                {/* Left column (60%) — main content */}
                <div className="w-[60%]">
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
                            <div className={`flex flex-col ${dense ? "gap-1" : "gap-2"}`}>
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
                </div>

                {/* Right column (40%) — sidebar info */}
                <div className="w-[40%] pl-3 space-y-3" style={{ borderLeft: `1px solid ${V.primaryA20}` }}>
                    {/* Skills */}
                    {limitedSkills.length > 0 && (
                        <section>
                            <ColHeading title="Compétences" />
                            <SkillsGrid
                                skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                primaryColor={V.primary}
                                variant="pills"
                                textSize="text-[7.5pt]"
                            />
                        </section>
                    )}

                    {/* Soft Skills */}
                    {limitedSoftSkills.length > 0 && (
                        <section>
                            <ColHeading title="Savoir-être" />
                            <SkillsGrid
                                skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                primaryColor={V.primary}
                                variant="list"
                                textSize="text-[7.5pt]"
                            />
                        </section>
                    )}

                    {/* Formation */}
                    {limitedFormations.length > 0 && (
                        <section>
                            <ColHeading title="Formation" />
                            <div className="space-y-1">
                                {limitedFormations.map((edu, i) => (
                                    <EducationItem key={i} diplome={edu.diplome} etablissement={edu.etablissement} annee={edu.annee} primaryColor={V.primary} variant="compact" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Langues */}
                    {limitedLangages.length > 0 && (
                        <section>
                            <ColHeading title="Langues" />
                            <LanguageList langues={limitedLangages} primaryColor={V.primary} variant="badge" textSize="text-[7.5pt]" />
                        </section>
                    )}

                    {/* Certifications */}
                    {limitedCertifications.length > 0 && (
                        <section>
                            <ColHeading title="Certifications" />
                            <CertificationList certifications={limitedCertifications} primaryColor={V.primary} textSize="text-[7.5pt]" />
                        </section>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
