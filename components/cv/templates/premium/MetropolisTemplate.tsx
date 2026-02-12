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
 * METROPOLIS — Grand header gradient + body 2 colonnes
 * Header pleine largeur avec gradient diagonal, forme SVG décorative.
 * Body : colonne gauche 60% (expériences, projets) / droite 40% (skills, formation, etc.)
 * Cible : Profils polyvalents, marketing, product management.
 */
export default function MetropolisTemplate({
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

    const gap = dense ? "gap-3" : "gap-4";

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
            {/* ── HEADER — Grand gradient avec forme géométrique ── */}
            <header
                className="relative text-white overflow-hidden"
                style={{
                    padding: dense ? "20px 28px 28px" : "28px 32px 36px",
                    background: `linear-gradient(135deg, ${V.primary} 0%, ${V.sidebarAccent} 100%)`,
                }}
            >
                {/* Decorative triangle SVG */}
                <svg
                    className="absolute bottom-0 right-0 opacity-10"
                    width="200" height="120" viewBox="0 0 200 120"
                    fill="none"
                >
                    <polygon points="200,0 200,120 60,120" fill="white" />
                </svg>

                <div className="relative z-10 flex items-center gap-5">
                    <ProfilePicture
                        photoUrl={profil?.photo_url}
                        fullName={`${profil.prenom} ${profil.nom}`}
                        initials={initials}
                        includePhoto={includePhoto}
                        size="lg"
                        shape="circle"
                        borderColor="rgba(255,255,255,0.6)"
                    />
                    <div className="flex-1">
                        <h1 className="text-[20pt] font-bold leading-tight">
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

                {/* Job context */}
                {jobContext?.job_title && (
                    <div className="relative z-10 mt-3 inline-block text-[8pt] px-3 py-1 rounded bg-white/15">
                        {jobContext.job_title}
                        {jobContext.company && ` · ${jobContext.company}`}
                        {jobContext.match_score && ` — ${jobContext.match_score}%`}
                    </div>
                )}
            </header>

            {/* ── BODY — 2 colonnes ── */}
            <div
                className="flex flex-1"
                style={{ padding: dense ? "16px 24px" : "20px 28px" }}
            >
                {/* Colonne Gauche 60% — Expériences + Projets */}
                <div className={`flex-[3] flex flex-col ${gap} pr-5 border-r`} style={{ borderRightColor: V.primaryA20 }}>
                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <SummaryBlock
                            text={profil.elevator_pitch}
                            primaryColor={V.primary}
                            variant="quote"
                            textSize="text-[9pt]"
                        />
                    )}

                    {/* Expériences */}
                    {limitedExperiences.length > 0 && (
                        <section>
                            <SectionTitle
                                title="Expérience Professionnelle"
                                primaryColor={V.primary}
                                variant="underline"
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

                    {/* Projets */}
                    {limitedProjects.length > 0 && (
                        <section>
                            <SectionTitle
                                title="Projets"
                                primaryColor={V.primary}
                                variant="underline"
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

                    {/* Clients */}
                    {limitedClients.length > 0 && (
                        <section>
                            <SectionTitle
                                title="Clients & Références"
                                primaryColor={V.primary}
                                variant="underline"
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
                </div>

                {/* Colonne Droite 40% — Skills, Formation, Langues, Certifications */}
                <div className={`flex-[2] flex flex-col ${gap} pl-5`}>
                    {/* Compétences */}
                    {limitedSkills.length > 0 && (
                        <section>
                            <SectionTitle
                                title="Compétences"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[10pt]"
                            />
                            <SkillsGrid
                                skills={limitedSkills.map(s => typeof s === "string" ? s : String(s))}
                                primaryColor={V.primary}
                                variant="tags"
                                textSize="text-[8pt]"
                            />
                        </section>
                    )}

                    {/* Soft Skills */}
                    {limitedSoftSkills.length > 0 && (
                        <section>
                            <SectionTitle
                                title="Savoir-être"
                                primaryColor={V.primary}
                                variant="accent-line"
                                textSize="text-[10pt]"
                            />
                            <SkillsGrid
                                skills={limitedSoftSkills.map(s => typeof s === "string" ? s : String(s))}
                                primaryColor={V.primary}
                                variant="pills"
                                textSize="text-[8pt]"
                            />
                        </section>
                    )}

                    {/* Formation */}
                    {limitedFormations.length > 0 && (
                        <section>
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
                                textSize="text-[10pt]"
                            />
                            <CertificationList
                                certifications={limitedCertifications}
                                primaryColor={V.primary}
                            />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
