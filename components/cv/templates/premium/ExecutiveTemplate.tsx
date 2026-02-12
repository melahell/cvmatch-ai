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
 * EXECUTIVE — Corporate sérieux, deux colonnes
 * Sidebar gauche (65mm) sombre + main content droite.
 * Cible : Managers, consultants, profils business.
 */
export default function ExecutiveTemplate({
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

    const sidebarGap = dense ? "gap-3" : "gap-4";
    const mainGap = dense ? "gap-3" : "gap-4";

    return (
        <div
            className="cv-page bg-white overflow-hidden flex text-[9pt]"
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
            {/* ── SIDEBAR GAUCHE ── */}
            <aside
                className={`flex-shrink-0 text-white flex flex-col ${sidebarGap}`}
                style={{
                    width: "65mm",
                    padding: dense ? "16px" : "20px",
                    background: V.sidebarBg,
                }}
            >
                {/* Photo + Identity */}
                <div className="flex flex-col items-center text-center">
                    <ProfilePicture
                        photoUrl={profil?.photo_url}
                        fullName={`${profil.prenom} ${profil.nom}`}
                        initials={initials}
                        includePhoto={includePhoto}
                        size="md"
                        shape="circle"
                        borderColor={V.sidebarAccent}
                    />
                    <h1 className="text-[13pt] font-bold mt-3 leading-tight">
                        {profil.prenom} {profil.nom}
                    </h1>
                    <p
                        className="text-[8pt] font-light mt-1 uppercase tracking-wider"
                        style={{ color: V.sidebarAccent }}
                    >
                        {profil.titre_principal}
                    </p>
                </div>

                {/* Contact */}
                <div>
                    <SectionTitle
                        title="Contact"
                        primaryColor={V.sidebarAccent}
                        variant="sidebar"
                    />
                    <ContactInfo
                        email={profil.email}
                        telephone={profil.telephone}
                        localisation={profil.localisation}
                        linkedin={profil.linkedin}
                        github={profil.github}
                        portfolio={profil.portfolio}
                        layout="vertical"
                        iconColor={V.sidebarAccent}
                        textColor="#e2e8f0"
                        iconSize={12}
                        textSize="text-[8pt]"
                    />
                </div>

                {/* Compétences Techniques */}
                {limitedSkills.length > 0 && (
                    <div>
                        <SectionTitle
                            title="Compétences"
                            primaryColor={V.sidebarAccent}
                            variant="sidebar"
                        />
                        <SkillsGrid
                            skills={limitedSkills.map(s => typeof s === "string" ? s : String(s))}
                            primaryColor={V.sidebarAccent}
                            variant="dots"
                            textSize="text-[8pt]"
                            className="text-gray-200"
                        />
                    </div>
                )}

                {/* Soft Skills */}
                {limitedSoftSkills.length > 0 && (
                    <div>
                        <SectionTitle
                            title="Savoir-être"
                            primaryColor={V.sidebarAccent}
                            variant="sidebar"
                        />
                        <SkillsGrid
                            skills={limitedSoftSkills.map(s => typeof s === "string" ? s : String(s))}
                            primaryColor={V.sidebarAccent}
                            variant="dots"
                            textSize="text-[8pt]"
                            className="text-gray-200"
                        />
                    </div>
                )}

                {/* Langues */}
                {limitedLangages.length > 0 && (
                    <div>
                        <SectionTitle
                            title="Langues"
                            primaryColor={V.sidebarAccent}
                            variant="sidebar"
                        />
                        <LanguageList
                            langues={limitedLangages}
                            primaryColor={V.sidebarAccent}
                            variant="bar"
                            textSize="text-[8pt]"
                            className="text-gray-200"
                        />
                    </div>
                )}

                {/* Certifications */}
                {limitedCertifications.length > 0 && (
                    <div>
                        <SectionTitle
                            title="Certifications"
                            primaryColor={V.sidebarAccent}
                            variant="sidebar"
                        />
                        <CertificationList
                            certifications={limitedCertifications}
                            primaryColor={V.sidebarAccent}
                            className="text-gray-200"
                        />
                    </div>
                )}
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main
                className={`flex-1 flex flex-col ${mainGap} overflow-hidden`}
                style={{ padding: dense ? "16px 20px" : "20px 24px" }}
            >
                {/* Header repris sur la droite — nom + titre */}
                <div
                    className="pb-3 border-b-2"
                    style={{ borderBottomColor: V.primary }}
                >
                    <h2 className="text-[14pt] font-bold text-gray-900">
                        {profil.prenom} {profil.nom}
                    </h2>
                    <p className="text-[9pt]" style={{ color: V.primary }}>
                        {profil.titre_principal}
                    </p>
                    {jobContext?.job_title && (
                        <div
                            className="mt-1.5 inline-block text-[8pt] px-2 py-0.5 rounded"
                            style={{ backgroundColor: V.primaryA10, color: V.primary }}
                        >
                            Candidature : {jobContext.job_title}
                            {jobContext.company && ` · ${jobContext.company}`}
                            {jobContext.match_score && ` — Match ${jobContext.match_score}%`}
                        </div>
                    )}
                </div>

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
                            title="Expérience"
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
                                    variant="timeline"
                                    relevanceScore={(exp as any)._relevance_score}
                                    maxRealisations={limits.maxRealisationsPerExp}
                                    bulletStyle="disc"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Formation */}
                {limitedFormations.length > 0 && (
                    <section>
                        <SectionTitle
                            title="Formation"
                            primaryColor={V.primary}
                            variant="underline"
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
                                    variant="standard"
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
                            variant="tags"
                            textSize="text-[8pt]"
                        />
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
                                    variant="compact"
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
