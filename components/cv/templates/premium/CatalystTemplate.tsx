"use client";

import React from "react";
import { TemplateProps, withDL, isValidEntreprise } from "../index";
import { CV_THEME_VARS as V } from "@/lib/cv/style/theme-vars";
import {
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
 * CATALYST — Header gradient asymétrique + sections en cartes
 * clip-path diagonal header, sections en cards arrondies avec fond léger.
 * Cible : Design, UX/UI, marketing créatif, startup.
 */
export default function CatalystTemplate({
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

    const sectionGap = dense ? "gap-3" : "gap-4";

    /** Card wrapper for sections */
    const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
        <div
            className={`rounded-lg px-4 py-3 ${className}`}
            style={{ backgroundColor: V.primaryA08 }}
        >
            {children}
        </div>
    );

    return (
        <div
            className="cv-page bg-white overflow-hidden text-[9pt]"
            style={{
                width: "210mm",
                minHeight: "297mm",
                maxHeight: "297mm",
                boxSizing: "border-box",
                fontFamily: "var(--cv-font-body)",
                fontSize: dense ? "8.5pt" : "9pt",
                lineHeight: dense ? "1.3" : "1.4",
            }}
        >
            {/* ── HEADER — Gradient avec clip-path diagonal ── */}
            <header
                className="relative text-white"
                style={{
                    padding: dense ? "24px 28px 32px" : "28px 32px 40px",
                    background: `linear-gradient(160deg, ${V.primary} 0%, ${V.sidebarAccent} 70%, ${V.sidebarBg} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
                }}
            >
                <div className="flex items-center gap-5">
                    <ProfilePicture
                        photoUrl={profil?.photo_url}
                        fullName={`${profil.prenom} ${profil.nom}`}
                        initials={initials}
                        includePhoto={includePhoto}
                        size="lg"
                        shape="rounded"
                        borderColor="rgba(255,255,255,0.5)"
                    />
                    <div className="flex-1">
                        <h1 className="text-[22pt] font-bold leading-tight">
                            {profil.prenom} {profil.nom}
                        </h1>
                        <p className="text-[11pt] font-light mt-1 opacity-90">
                            {profil.titre_principal}
                        </p>

                        {/* Contact inline */}
                        <div className="mt-3">
                            <ContactInfo
                                email={profil.email}
                                telephone={profil.telephone}
                                localisation={profil.localisation}
                                linkedin={profil.linkedin}
                                github={profil.github}
                                portfolio={profil.portfolio}
                                layout="inline"
                                iconColor="rgba(255,255,255,0.7)"
                                textColor="rgba(255,255,255,0.9)"
                                iconSize={11}
                                textSize="text-[8pt]"
                            />
                        </div>
                    </div>
                </div>

                {jobContext?.job_title && (
                    <div className="mt-3 inline-block text-[8pt] px-3 py-1 rounded bg-white/15">
                        {jobContext.job_title}
                        {jobContext.company && ` · ${jobContext.company}`}
                        {jobContext.match_score && ` — ${jobContext.match_score}%`}
                    </div>
                )}
            </header>

            {/* ── BODY — Sections en cartes ── */}
            <main
                className={`flex flex-col ${sectionGap}`}
                style={{ padding: dense ? "8px 24px 16px" : "4px 28px 20px" }}
            >
                {/* Pitch */}
                {profil.elevator_pitch && (
                    <Card>
                        <SummaryBlock
                            text={profil.elevator_pitch}
                            primaryColor={V.primary}
                            variant="plain"
                            textSize="text-[9pt]"
                        />
                    </Card>
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
                        <div className={`flex flex-col ${dense ? "gap-2" : "gap-2.5"}`}>
                            {limitedExperiences.map((exp, i) => (
                                <Card key={i}>
                                    <ExperienceItem
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
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills row — Techniques + Soft */}
                {(limitedSkills.length > 0 || limitedSoftSkills.length > 0) && (
                    <div className="flex gap-3">
                        {limitedSkills.length > 0 && (
                            <Card className="flex-1">
                                <SectionTitle
                                    title="Compétences"
                                    primaryColor={V.primary}
                                    variant="simple"
                                    textSize="text-[9pt]"
                                />
                                <SkillsGrid
                                    skills={limitedSkills.map(s => typeof s === "string" ? s : String(s))}
                                    primaryColor={V.primary}
                                    variant="pills"
                                    textSize="text-[8pt]"
                                />
                            </Card>
                        )}
                        {limitedSoftSkills.length > 0 && (
                            <Card className="flex-1">
                                <SectionTitle
                                    title="Savoir-être"
                                    primaryColor={V.primary}
                                    variant="simple"
                                    textSize="text-[9pt]"
                                />
                                <SkillsGrid
                                    skills={limitedSoftSkills.map(s => typeof s === "string" ? s : String(s))}
                                    primaryColor={V.primary}
                                    variant="pills"
                                    textSize="text-[8pt]"
                                />
                            </Card>
                        )}
                    </div>
                )}

                {/* Formation + Langues + Certifications row */}
                <div className="flex gap-3">
                    {limitedFormations.length > 0 && (
                        <Card className="flex-1">
                            <SectionTitle
                                title="Formation"
                                primaryColor={V.primary}
                                variant="simple"
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
                        </Card>
                    )}
                    {limitedLangages.length > 0 && (
                        <Card className="flex-1">
                            <SectionTitle
                                title="Langues"
                                primaryColor={V.primary}
                                variant="simple"
                                textSize="text-[9pt]"
                            />
                            <LanguageList
                                langues={limitedLangages}
                                primaryColor={V.primary}
                                variant="badge"
                                textSize="text-[8pt]"
                            />
                        </Card>
                    )}
                    {limitedCertifications.length > 0 && (
                        <Card className="flex-1">
                            <SectionTitle
                                title="Certifications"
                                primaryColor={V.primary}
                                variant="simple"
                                textSize="text-[9pt]"
                            />
                            <CertificationList
                                certifications={limitedCertifications}
                                primaryColor={V.primary}
                            />
                        </Card>
                    )}
                </div>

                {/* Clients */}
                {limitedClients.length > 0 && (
                    <Card>
                        <SectionTitle
                            title="Clients & Références"
                            primaryColor={V.primary}
                            variant="simple"
                            textSize="text-[9pt]"
                        />
                        <ClientReferences
                            clients={limitedClients}
                            secteurs={clients_references?.secteurs}
                            primaryColor={V.primary}
                            variant="pills"
                            textSize="text-[8pt]"
                        />
                    </Card>
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
                        <div className="grid grid-cols-2 gap-2">
                            {limitedProjects.map((project, i) => (
                                <Card key={i}>
                                    <ProjectItem
                                        nom={project.nom}
                                        description={project.description}
                                        technologies={project.technologies}
                                        lien={project.lien}
                                        primaryColor={V.primary}
                                        variant="compact"
                                    />
                                </Card>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
