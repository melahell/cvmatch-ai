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
 * TERMINAL — IDE-inspired pour développeurs
 * Dark sidebar (68mm) avec terminal dots, monospace accents.
 * TEMPLATE_OVERRIDES: --cv-sidebar-bg: #0f172a, monospace fonts.
 * Cible : Développeurs, DevOps, Data Engineers.
 */
export default function TerminalTemplate({
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

    const mainGap = dense ? "gap-3" : "gap-4";

    /** Terminal-style comment heading for main sections */
    const CodeTitle = ({ title }: { title: string }) => (
        <div
            className="flex items-center gap-2 mb-2 pb-1.5"
            style={{ borderBottom: `2px solid ${V.primaryA40}` }}
        >
            <span className="text-[9pt] font-semibold" style={{ color: V.primary, fontFamily: "var(--cv-font-heading)" }}>
                {"<"}
            </span>
            <span className="text-[9.5pt] font-bold" style={{ color: V.text, fontFamily: "var(--cv-font-heading)" }}>
                {title}
            </span>
            <span className="text-[9pt] font-semibold" style={{ color: V.primary, fontFamily: "var(--cv-font-heading)" }}>
                {"/>"}
            </span>
        </div>
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
                    className="flex flex-col shrink-0"
                    style={{
                        width: "68mm",
                        backgroundColor: V.sidebarBg,
                        color: V.sidebarText,
                    }}
                >
                    {/* Terminal title bar */}
                    <div className="flex items-center gap-1.5 px-4 py-2" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                        <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: "#ef4444" }} />
                        <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: "#eab308" }} />
                        <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: "#22c55e" }} />
                        <span className="text-[7pt] ml-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                            ~/cv/{(profil.prenom || "user").toLowerCase()}.tsx
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 px-4 py-4">
                        {/* Photo */}
                        {includePhoto && (
                            <div className="flex justify-center mb-2">
                                <ProfilePicture
                                    photoUrl={profil?.photo_url}
                                    fullName={`${profil.prenom} ${profil.nom}`}
                                    initials={initials}
                                    includePhoto={includePhoto}
                                    size="md"
                                    shape="rounded"
                                    borderColor={V.sidebarAccent}
                                />
                            </div>
                        )}

                        {/* Name */}
                        <div className="text-center mb-1">
                            <p className="text-[7pt]" style={{ color: "rgba(255,255,255,0.4)" }}>
                                {"// developer.profile"}
                            </p>
                            <h2 className="text-[13pt] font-bold leading-tight" style={{ color: V.sidebarText }}>
                                {profil.prenom} {profil.nom}
                            </h2>
                            <p className="text-[8.5pt] font-medium mt-1" style={{ color: V.sidebarAccent }}>
                                {profil.titre_principal}
                            </p>
                        </div>

                        {/* Contact */}
                        <div>
                            <p className="text-[7pt] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                {"// contact"}
                            </p>
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
                                iconSize={11}
                                textSize="text-[8pt]"
                            />
                        </div>

                        {/* Skills */}
                        {limitedSkills.length > 0 && (
                            <div>
                                <p className="text-[7pt] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    {"// tech_stack"}
                                </p>
                                <SkillsGrid
                                    skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                    primaryColor={V.sidebarAccent}
                                    variant="tags"
                                    textSize="text-[8pt]"
                                    className="text-white/90"
                                />
                            </div>
                        )}

                        {/* Langues */}
                        {limitedLangages.length > 0 && (
                            <div>
                                <p className="text-[7pt] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    {"// languages"}
                                </p>
                                <LanguageList
                                    langues={limitedLangages}
                                    primaryColor={V.sidebarAccent}
                                    variant="simple"
                                    textSize="text-[8pt]"
                                    className="text-white/80"
                                />
                            </div>
                        )}

                        {/* Certifications */}
                        {limitedCertifications.length > 0 && (
                            <div>
                                <p className="text-[7pt] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    {"// certifications"}
                                </p>
                                <CertificationList
                                    certifications={limitedCertifications}
                                    primaryColor={V.sidebarAccent}
                                    textSize="text-[8pt]"
                                    className="text-white/80"
                                />
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className={`flex-1 flex flex-col ${mainGap} px-5 py-5`}>
                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div
                            className="text-[8pt] px-3 py-1.5 rounded-sm self-start"
                            style={{
                                backgroundColor: V.primaryA20,
                                color: V.primary,
                                fontFamily: "var(--cv-font-heading)",
                            }}
                        >
                            {">"} target: {jobContext.job_title}
                            {jobContext.company && ` @ ${jobContext.company}`}
                            {jobContext.match_score != null && ` [${jobContext.match_score}%]`}
                        </div>
                    )}

                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <div
                            className="p-3 rounded-sm text-[8.5pt]"
                            style={{
                                backgroundColor: V.primaryA10,
                                borderLeft: `3px solid ${V.primary}`,
                                color: V.text,
                            }}
                        >
                            {profil.elevator_pitch}
                        </div>
                    )}

                    {/* Expériences */}
                    {limitedExperiences.length > 0 && (
                        <section>
                            <CodeTitle title="Expérience" />
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
                                        bulletStyle="arrow"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {limitedFormations.length > 0 && (
                        <section>
                            <CodeTitle title="Formation" />
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

                    {/* Soft Skills */}
                    {limitedSoftSkills.length > 0 && (
                        <section>
                            <CodeTitle title="Soft Skills" />
                            <SkillsGrid
                                skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                primaryColor={V.primary}
                                variant="pills"
                                textSize="text-[8pt]"
                            />
                        </section>
                    )}

                    {/* Clients */}
                    {limitedClients.length > 0 && (
                        <section>
                            <CodeTitle title="Clients" />
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
                            <CodeTitle title="Projets" />
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
