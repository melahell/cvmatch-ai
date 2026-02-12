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
 * HORIZON — Bande latérale fine + layout aéré full-width
 * Très clean, ATS-friendly, beaucoup de blanc, bande accent de 5mm.
 * Cible : Juridique, Académique, profils universels.
 */
export default function HorizonTemplate({
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

    const sectionMb = dense ? "mb-3" : "mb-5";

    return (
        <PageContainer
            dense={dense}
            fontSize={dense ? "8.5pt" : "9pt"}
            lineHeight={dense ? "1.3" : "1.5"}
            className="shadow-sm"
        >
            <div className="flex h-full min-h-full">
                {/* ── Accent stripe (5mm) ── */}
                <div
                    className="shrink-0"
                    style={{
                        width: "5mm",
                        background: `linear-gradient(180deg, ${V.primary} 0%, ${V.sidebarAccent} 100%)`,
                    }}
                />

                {/* ── Content ── */}
                <main className="flex-1 px-8 py-7">
                    {/* ── HEADER ── */}
                    <header className="mb-5">
                        <div className="flex items-center gap-4">
                            {includePhoto && (
                                <ProfilePicture
                                    photoUrl={profil?.photo_url}
                                    fullName={`${profil.prenom} ${profil.nom}`}
                                    initials={initials}
                                    includePhoto={includePhoto}
                                    size="md"
                                    shape="circle"
                                    borderColor={V.primary}
                                />
                            )}
                            <div>
                                <h1
                                    className="text-[18pt] font-bold leading-tight"
                                    style={{ color: V.text }}
                                >
                                    {profil.prenom} {profil.nom}
                                </h1>
                                <p
                                    className="text-[10pt] font-medium mt-0.5"
                                    style={{ color: V.primary }}
                                >
                                    {profil.titre_principal}
                                </p>
                            </div>
                        </div>

                        {/* Contact — inline */}
                        <div className="mt-3 flex items-center gap-4 flex-wrap">
                            <ContactInfo
                                email={profil.email}
                                telephone={profil.telephone}
                                localisation={profil.localisation}
                                linkedin={profil.linkedin}
                                github={profil.github}
                                portfolio={profil.portfolio}
                                layout="inline"
                                iconColor={V.primary}
                                textColor={V.muted}
                                iconSize={11}
                                textSize="text-[8.5pt]"
                            />
                        </div>

                        {/* Separator */}
                        <div className="mt-4" style={{ borderBottom: `2px solid ${V.primaryA30}` }} />
                    </header>

                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div
                            className={`text-[8pt] font-medium px-3 py-1.5 rounded-sm inline-block ${sectionMb}`}
                            style={{ backgroundColor: V.primaryA20, color: V.primary }}
                        >
                            {jobContext.job_title}
                            {jobContext.company && ` · ${jobContext.company}`}
                            {jobContext.match_score != null && ` — ${jobContext.match_score}%`}
                        </div>
                    )}

                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <section className={sectionMb}>
                            <SummaryBlock
                                text={profil.elevator_pitch}
                                primaryColor={V.primary}
                                variant="box"
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

                    {/* Compétences — in 2 columns */}
                    {(limitedSkills.length > 0 || limitedSoftSkills.length > 0) && (
                        <section className={sectionMb}>
                            <SectionTitle
                                title="Compétences"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[10pt]"
                            />
                            <div className="flex gap-6">
                                {limitedSkills.length > 0 && (
                                    <div className="flex-1">
                                        <p className="text-[8pt] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Techniques</p>
                                        <SkillsGrid
                                            skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                            primaryColor={V.primary}
                                            variant="columns"
                                            columns={2}
                                            textSize="text-[8pt]"
                                        />
                                    </div>
                                )}
                                {limitedSoftSkills.length > 0 && (
                                    <div className="flex-1">
                                        <p className="text-[8pt] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Savoir-être</p>
                                        <SkillsGrid
                                            skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                            primaryColor={V.primary}
                                            variant="columns"
                                            columns={2}
                                            textSize="text-[8pt]"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Formations + Langues + Certifications — side by side */}
                    {(limitedFormations.length > 0 || limitedLangages.length > 0 || limitedCertifications.length > 0) && (
                        <section className={`flex gap-6 flex-wrap ${sectionMb}`}>
                            {limitedFormations.length > 0 && (
                                <div className="flex-1 min-w-[30%]">
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
                                </div>
                            )}
                            {limitedLangages.length > 0 && (
                                <div className="flex-1 min-w-[25%]">
                                    <SectionTitle
                                        title="Langues"
                                        primaryColor={V.primary}
                                        variant="accent-line"
                                        textSize="text-[9.5pt]"
                                    />
                                    <LanguageList
                                        langues={limitedLangages}
                                        primaryColor={V.primary}
                                        variant="inline"
                                        textSize="text-[8.5pt]"
                                    />
                                </div>
                            )}
                            {limitedCertifications.length > 0 && (
                                <div className="flex-1 min-w-[25%]">
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
                                </div>
                            )}
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
                </main>
            </div>
        </PageContainer>
    );
}
