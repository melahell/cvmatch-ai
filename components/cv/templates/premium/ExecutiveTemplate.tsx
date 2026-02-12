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
 * EXECUTIVE — Corporate Premium
 * Dark sidebar (70mm) avec photo, contact, skills. Main content avec timeline.
 * TEMPLATE_OVERRIDES: --cv-sidebar-bg: #1e293b, --cv-sidebar-text: #f1f5f9
 * Cible : Management, Consulting, Business.
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

    const limitedExperiences = experiences || [];
    const limitedSkills = (competences?.techniques || []).slice(0, limits.maxSkills);
    const limitedSoftSkills = (competences?.soft_skills || []).slice(0, limits.maxSoftSkills);
    const limitedFormations = (formations || []).slice(0, limits.maxFormations);
    const limitedLangages = (langues || []).slice(0, limits.maxLangues);
    const limitedCertifications = (certifications || []).slice(0, limits.maxCertifications);
    const limitedClients = (clients_references?.clients || []).slice(0, limits.maxClientsReferences);
    const limitedProjects = (projects || []).slice(0, limits.maxProjects);

    const sidebarGap = dense ? "gap-3" : "gap-4";
    const mainGap = dense ? "gap-3" : "gap-5";

    /** Sidebar section divider — subtle white line */
    const SidebarDivider = () => (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", margin: dense ? "4px 0" : "6px 0" }} />
    );

    return (
        <PageContainer
            dense={dense}
            fontSize={dense ? "8.5pt" : "9pt"}
            lineHeight={dense ? "1.3" : "1.4"}
            className="shadow-sm"
        >
            <div className="flex h-full min-h-full">
                {/* ── SIDEBAR ── */}
                <aside
                    className="flex flex-col px-5 py-6 shrink-0"
                    style={{
                        width: "70mm",
                        backgroundColor: V.sidebarBg,
                        color: V.sidebarText,
                    }}
                >
                    {/* Photo */}
                    {includePhoto && (
                        <div className="flex justify-center mb-4">
                            <ProfilePicture
                                photoUrl={profil?.photo_url}
                                fullName={`${profil.prenom} ${profil.nom}`}
                                initials={initials}
                                includePhoto={includePhoto}
                                size="lg"
                                shape="circle"
                                borderColor={V.sidebarAccent}
                            />
                        </div>
                    )}

                    {/* Name in sidebar */}
                    <div className="text-center mb-1">
                        <h2 className="text-[14pt] font-bold leading-tight" style={{ color: V.sidebarText }}>
                            {profil.prenom} {profil.nom}
                        </h2>
                        <p className="text-[9pt] font-medium mt-1" style={{ color: V.sidebarAccent }}>
                            {profil.titre_principal}
                        </p>
                    </div>

                    <SidebarDivider />

                    {/* Contact */}
                    <div className={sidebarGap}>
                        <ContactInfo
                            email={profil.email}
                            telephone={profil.telephone}
                            localisation={profil.localisation}
                            linkedin={profil.linkedin}
                            github={profil.github}
                            portfolio={profil.portfolio}
                            layout="vertical"
                            iconColor={V.sidebarAccent}
                            textColor={V.sidebarText}
                            iconSize={12}
                            textSize="text-[8pt]"
                        />
                    </div>

                    <SidebarDivider />

                    {/* Skills */}
                    {limitedSkills.length > 0 && (
                        <div>
                            <h3
                                className="text-[8.5pt] font-bold uppercase tracking-wider mb-2"
                                style={{ color: V.sidebarAccent }}
                            >
                                Compétences
                            </h3>
                            <SkillsGrid
                                skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                primaryColor={V.sidebarAccent}
                                variant="tags"
                                textSize="text-[7.5pt]"
                                className="text-white/90"
                            />
                        </div>
                    )}

                    {/* Soft Skills */}
                    {limitedSoftSkills.length > 0 && (
                        <>
                            <SidebarDivider />
                            <div>
                                <h3
                                    className="text-[8.5pt] font-bold uppercase tracking-wider mb-2"
                                    style={{ color: V.sidebarAccent }}
                                >
                                    Savoir-être
                                </h3>
                                <SkillsGrid
                                    skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                    primaryColor={V.sidebarAccent}
                                    variant="tags"
                                    textSize="text-[7.5pt]"
                                    className="text-white/90"
                                />
                            </div>
                        </>
                    )}

                    {/* Langues */}
                    {limitedLangages.length > 0 && (
                        <>
                            <SidebarDivider />
                            <div>
                                <h3
                                    className="text-[8.5pt] font-bold uppercase tracking-wider mb-2"
                                    style={{ color: V.sidebarAccent }}
                                >
                                    Langues
                                </h3>
                                <LanguageList
                                    langues={limitedLangages}
                                    primaryColor={V.sidebarAccent}
                                    variant="bar"
                                    textSize="text-[8pt]"
                                    className="text-white/90"
                                />
                            </div>
                        </>
                    )}

                    {/* Certifications */}
                    {limitedCertifications.length > 0 && (
                        <>
                            <SidebarDivider />
                            <div>
                                <h3
                                    className="text-[8.5pt] font-bold uppercase tracking-wider mb-2"
                                    style={{ color: V.sidebarAccent }}
                                >
                                    Certifications
                                </h3>
                                <CertificationList
                                    certifications={limitedCertifications}
                                    primaryColor={V.sidebarAccent}
                                    textSize="text-[8pt]"
                                    className="text-white/80"
                                />
                            </div>
                        </>
                    )}
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className={`flex-1 flex flex-col ${mainGap} px-6 py-6`}>
                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div
                            className="text-[8pt] px-3 py-1.5 rounded-sm font-medium self-start"
                            style={{ backgroundColor: V.primaryA20, color: V.primary }}
                        >
                            Optimisé pour : {jobContext.job_title}
                            {jobContext.company && ` · ${jobContext.company}`}
                            {jobContext.match_score != null && ` — ${jobContext.match_score}%`}
                        </div>
                    )}

                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <SummaryBlock
                            text={profil.elevator_pitch}
                            primaryColor={V.primary}
                            variant="border-left"
                            textSize="text-[9pt]"
                        />
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
                            <div className={`flex flex-col ${dense ? "gap-2" : "gap-3"} mt-2`}>
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
                                        variant="timeline"
                                        relevanceScore={(exp as any)._relevance_score}
                                        maxRealisations={limits.maxRealisationsPerExp}
                                        bulletStyle="dot"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {limitedFormations.length > 0 && (
                        <section>
                            <SectionTitle
                                title="Formation"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[10pt]"
                            />
                            <div className="space-y-1 mt-2">
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

                    {/* Clients */}
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
                            <div className="space-y-2 mt-2">
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
