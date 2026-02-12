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
 * CATALYST — Créatif diagonal header + sections en cartes
 * Header avec gradient diagonal (clip-path), contenu en cartes arrondies.
 * TEMPLATE_OVERRIDES: --cv-sidebar-bg: #881337 (for header), --cv-sidebar-text: #fce7f3
 * Cible : Design, UX/UI, Startup.
 */
export default function CatalystTemplate({
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

    /** Card wrapper — subtle tinted background + rounded corners */
    const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
        <div
            className={`p-3 rounded-sm ${className}`}
            style={{ backgroundColor: V.primaryA20, border: `1px solid ${V.primaryA30}` }}
        >
            {children}
        </div>
    );

    return (
        <PageContainer
            dense={dense}
            fontSize={dense ? "8.5pt" : "9pt"}
            lineHeight={dense ? "1.3" : "1.4"}
            className="shadow-sm"
        >
            {/* ── HEADER — diagonal gradient clip-path ── */}
            <header
                className="relative overflow-hidden px-8 pt-6 pb-8"
                style={{
                    background: `linear-gradient(135deg, ${V.sidebarBg} 0%, ${V.primary} 50%, ${V.sidebarAccent} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
                    color: V.sidebarText,
                }}
            >
                <div className="relative z-10 flex items-center gap-5">
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil?.photo_url}
                            fullName={`${profil.prenom} ${profil.nom}`}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="md"
                            shape="rounded"
                            borderColor={V.sidebarAccent}
                        />
                    )}
                    <div>
                        <h1 className="text-[20pt] font-bold leading-tight" style={{ color: V.sidebarText }}>
                            {profil.prenom} {profil.nom}
                        </h1>
                        <p className="text-[10pt] font-medium mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>
                            {profil.titre_principal}
                        </p>

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

            {/* ── BODY ── */}
            <main className="px-6 pt-2 pb-6">
                {/* Pitch */}
                {profil.elevator_pitch && (
                    <section className={sectionMb}>
                        <Card>
                            <SummaryBlock
                                text={profil.elevator_pitch}
                                primaryColor={V.primary}
                                variant="border-left"
                                textSize="text-[9pt]"
                            />
                        </Card>
                    </section>
                )}

                {/* Expériences — NOT in cards (too much visual noise) */}
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

                {/* Skills + Soft Skills — in one card */}
                {(limitedSkills.length > 0 || limitedSoftSkills.length > 0) && (
                    <section className={sectionMb}>
                        <Card>
                            <SectionTitle
                                title="Compétences"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[9.5pt]"
                            />
                            <div className="flex gap-5">
                                {limitedSkills.length > 0 && (
                                    <div className="flex-1">
                                        <p className="text-[7.5pt] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Techniques</p>
                                        <SkillsGrid
                                            skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                            primaryColor={V.primary}
                                            variant="pills"
                                            textSize="text-[8pt]"
                                        />
                                    </div>
                                )}
                                {limitedSoftSkills.length > 0 && (
                                    <div className="flex-1">
                                        <p className="text-[7.5pt] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Savoir-être</p>
                                        <SkillsGrid
                                            skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                            primaryColor={V.primary}
                                            variant="pills"
                                            textSize="text-[8pt]"
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>
                    </section>
                )}

                {/* Formations + Langues + Certifications — in one card, side by side */}
                {(limitedFormations.length > 0 || limitedLangages.length > 0 || limitedCertifications.length > 0) && (
                    <section className={sectionMb}>
                        <Card>
                            <div className="flex gap-5 flex-wrap">
                                {limitedFormations.length > 0 && (
                                    <div className="flex-1 min-w-[30%]">
                                        <SectionTitle
                                            title="Formation"
                                            primaryColor={V.primary}
                                            variant="accent-line"
                                            textSize="text-[9pt]"
                                        />
                                        <div className="space-y-1">
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
                                            textSize="text-[9pt]"
                                        />
                                        <LanguageList
                                            langues={limitedLangages}
                                            primaryColor={V.primary}
                                            variant="badge"
                                            textSize="text-[8pt]"
                                        />
                                    </div>
                                )}
                                {limitedCertifications.length > 0 && (
                                    <div className="flex-1 min-w-[25%]">
                                        <SectionTitle
                                            title="Certifications"
                                            primaryColor={V.primary}
                                            variant="accent-line"
                                            textSize="text-[9pt]"
                                        />
                                        <CertificationList
                                            certifications={limitedCertifications}
                                            primaryColor={V.primary}
                                            textSize="text-[8pt]"
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>
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
