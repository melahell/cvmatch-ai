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
 * TERMINAL — IDE / CLI aesthetic pour développeurs
 * Sidebar (35%) dark avec terminal title bar (3 dots), code comments (// labels).
 * Main (65%) : section headers en <tag/> style, arrow bullets (▸).
 * Monospace font via --cv-font-heading (JetBrains Mono).
 * Cible : Développeurs, DevOps, SREs, Data Engineers.
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
    const fullName = `${profil?.prenom || ""} ${profil?.nom || ""}`.trim();
    const monoFont = "var(--cv-font-heading)";

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

    /** Code-style comment label */
    const CodeLabel = ({ text }: { text: string }) => (
        <p className="text-[6.5pt] opacity-40 mb-1" style={{ fontFamily: monoFont }}>{`// ${text}`}</p>
    );

    /** Terminal-style main section heading */
    const TerminalHeading = ({ text }: { text: string }) => (
        <h2 className="text-[9.5pt] font-extrabold mb-2 flex items-center gap-1.5 uppercase tracking-widest text-gray-900">
            <span className="text-[8pt] font-bold" style={{ color: V.primary, fontFamily: monoFont }}>{"<"}</span>
            {text}
            <span className="text-[8pt] font-bold" style={{ color: V.primary, fontFamily: monoFont }}>{"/>"}</span>
        </h2>
    );

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
                    {/* Terminal title bar */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[6pt] ml-1.5 opacity-40" style={{ color: V.sidebarText, fontFamily: monoFont }}>
                            ~/{(profil?.prenom || "dev").toLowerCase()}.tsx
                        </span>
                    </div>

                    <div className={`${sidebarPad} flex flex-col gap-3 flex-1`} style={{ color: V.sidebarText }}>
                        {/* Photo + Name */}
                        {includePhoto && (
                            <div className="flex justify-center">
                                <ProfilePicture
                                    photoUrl={profil?.photo_url}
                                    fullName={fullName}
                                    initials={initials}
                                    includePhoto={includePhoto}
                                    size="md"
                                    shape="rounded"
                                    borderColor={V.sidebarAccent}
                                />
                            </div>
                        )}

                        <div className="text-center">
                            <CodeLabel text="profile" />
                            <h1 className="text-[14pt] font-bold leading-tight" style={{ color: V.sidebarText }}>{fullName}</h1>
                            {profil?.titre_principal && (
                                <p className="text-[8pt] mt-0.5" style={{ color: V.sidebarAccent }}>{profil.titre_principal}</p>
                            )}
                        </div>

                        {/* Contact */}
                        <div>
                            <CodeLabel text="contact" />
                            <ContactInfo
                                email={profil?.email}
                                telephone={profil?.telephone}
                                localisation={profil?.localisation}
                                linkedin={profil?.linkedin}
                                github={profil?.github}
                                portfolio={profil?.portfolio}
                                layout="vertical"
                                textColor={V.sidebarText}
                                iconColor={V.sidebarAccent}
                                iconSize={10}
                                textSize="text-[7pt]"
                                className="space-y-0.5"
                            />
                        </div>

                        {/* Tech Stack */}
                        {limitedSkills.length > 0 && (
                            <section>
                                <CodeLabel text="tech_stack" />
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
                                <CodeLabel text="skills" />
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
                                <CodeLabel text="languages" />
                                <LanguageList langues={limitedLangages} primaryColor={V.sidebarAccent} variant="badge" textSize="text-[7pt]" />
                            </section>
                        )}

                        {/* Certifications */}
                        {limitedCertifications.length > 0 && (
                            <section>
                                <CodeLabel text="certs" />
                                <CertificationList certifications={limitedCertifications} primaryColor={V.sidebarAccent} textSize="text-[7pt]" />
                            </section>
                        )}
                    </div>
                </aside>

                {/* ── MAIN (65%) ── */}
                <main className="flex-1 px-5 pt-4 pb-5 space-y-3">
                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div
                            className="text-[7pt] px-2 py-0.5 rounded inline-block mb-1"
                            style={{ backgroundColor: V.primaryA10, color: V.primary, fontFamily: monoFont }}
                        >
                            {jobContext.job_title}
                            {jobContext.company && ` · ${jobContext.company}`}
                            {jobContext.match_score != null && ` — ${jobContext.match_score}%`}
                        </div>
                    )}

                    {/* Pitch */}
                    {profil?.elevator_pitch && (
                        <section className={sectionMb}>
                            <div className="p-2.5 rounded-sm text-[8pt]" style={{ backgroundColor: V.primaryA10, fontFamily: monoFont }}>
                                <span className="opacity-40">{"/* "}</span>
                                {profil.elevator_pitch}
                                <span className="opacity-40">{" */"}</span>
                            </div>
                        </section>
                    )}

                    {/* Expériences */}
                    {limitedExperiences.length > 0 && (
                        <section className={sectionMb}>
                            <TerminalHeading text="Expérience" />
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
                                        bulletStyle="arrow"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formation */}
                    {limitedFormations.length > 0 && (
                        <section className={sectionMb}>
                            <TerminalHeading text="Formation" />
                            <div className="space-y-1">
                                {limitedFormations.map((edu, i) => (
                                    <EducationItem key={i} diplome={edu.diplome} etablissement={edu.etablissement} annee={edu.annee} primaryColor={V.primary} variant="compact" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projets */}
                    {limitedProjects.length > 0 && (
                        <section className={sectionMb}>
                            <TerminalHeading text="Projets" />
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
                            <TerminalHeading text="Clients" />
                            <ClientReferences clients={limitedClients} secteurs={clients_references?.secteurs} primaryColor={V.primary} variant="pills" textSize="text-[8pt]" />
                        </section>
                    )}
                </main>
            </div>
        </PageContainer>
    );
}
