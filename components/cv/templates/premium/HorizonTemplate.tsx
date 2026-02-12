"use client";

import React from "react";
import { TemplateProps, withDL, isValidEntreprise } from "../index";
import { CV_THEME_VARS as V } from "@/lib/cv/style/theme-vars";
import {
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
 * HORIZON — Bande latérale fine colorée (8mm) + blanc aéré
 * Très lisible, très imprimable, ATS-friendly.
 * Cible : Universel, juridique, académique, profils seniors.
 */
export default function HorizonTemplate({
    data,
    includePhoto = false,
    jobContext,
    dense = false,
    displayLimits: dl,
}: TemplateProps) {
    const limits = withDL(dl);
    const { profil, experiences, competences, formations, langues, certifications, clients_references, projects } = data;

    const limitedExperiences = experiences || [];
    const limitedSkills = (competences?.techniques || []).slice(0, limits.maxSkills);
    const limitedSoftSkills = (competences?.soft_skills || []).slice(0, limits.maxSoftSkills);
    const limitedFormations = (formations || []).slice(0, limits.maxFormations);
    const limitedLangages = (langues || []).slice(0, limits.maxLangues);
    const limitedCertifications = (certifications || []).slice(0, limits.maxCertifications);
    const limitedClients = (clients_references?.clients || []).slice(0, limits.maxClientsReferences);
    const limitedProjects = (projects || []).slice(0, limits.maxProjects);

    const mainPad = dense ? "px-8 py-6" : "px-10 py-8";
    const sectionGap = dense ? "space-y-3" : "space-y-5";

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
                lineHeight: dense ? "1.3" : "1.45",
            }}
        >
            {/* ── BANDE LATÉRALE FINE ── */}
            <div
                className="flex-shrink-0"
                style={{
                    width: "8mm",
                    background: `linear-gradient(180deg, ${V.primary}, ${V.sidebarAccent})`,
                }}
            />

            {/* ── CONTENU PRINCIPAL ── */}
            <div className={`flex-1 ${mainPad} overflow-hidden`}>
                {/* Header */}
                <header className="mb-5">
                    <h1 className="text-[20pt] font-bold text-gray-900 leading-tight">
                        {profil.prenom} {profil.nom}
                    </h1>
                    <p
                        className="text-[11pt] font-medium mt-1"
                        style={{ color: V.primary }}
                    >
                        {profil.titre_principal}
                    </p>

                    {/* Contact — horizontal */}
                    <div className="mt-3 pb-4 border-b" style={{ borderBottomColor: V.primaryA20 }}>
                        <ContactInfo
                            email={profil.email}
                            telephone={profil.telephone}
                            localisation={profil.localisation}
                            linkedin={profil.linkedin}
                            github={profil.github}
                            portfolio={profil.portfolio}
                            layout="horizontal"
                            iconColor={V.primary}
                            textColor="#475569"
                            iconSize={12}
                            textSize="text-[8pt]"
                        />
                    </div>

                    {/* Job context */}
                    {jobContext?.job_title && (
                        <div
                            className="mt-2 text-[8pt] px-3 py-1 rounded inline-block"
                            style={{ backgroundColor: V.primaryA10, color: V.primary }}
                        >
                            {jobContext.job_title}
                            {jobContext.company && ` · ${jobContext.company}`}
                            {jobContext.match_score && ` — ${jobContext.match_score}%`}
                        </div>
                    )}
                </header>

                {/* Body */}
                <div className={sectionGap}>
                    {/* Pitch */}
                    {profil.elevator_pitch && (
                        <section>
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
                        <section>
                            <SectionTitle
                                title="Expérience Professionnelle"
                                primaryColor={V.primary}
                                variant="underline"
                                textSize="text-[10pt]"
                            />
                            <div className={`flex flex-col ${dense ? "gap-1.5" : "gap-2.5"}`}>
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
                                        variant="compact"
                                        relevanceScore={(exp as any)._relevance_score}
                                        maxRealisations={limits.maxRealisationsPerExp}
                                        bulletStyle="dash"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Compétences — sur 3 colonnes */}
                    {limitedSkills.length > 0 && (
                        <section>
                            <SectionTitle
                                title="Compétences Techniques"
                                primaryColor={V.primary}
                                variant="underline"
                                textSize="text-[10pt]"
                            />
                            <SkillsGrid
                                skills={limitedSkills.map(s => typeof s === "string" ? s : String(s))}
                                primaryColor={V.primary}
                                variant="columns"
                                columns={3}
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
                                variant="underline"
                                textSize="text-[10pt]"
                            />
                            <SkillsGrid
                                skills={limitedSoftSkills.map(s => typeof s === "string" ? s : String(s))}
                                primaryColor={V.primary}
                                variant="columns"
                                columns={3}
                                textSize="text-[8pt]"
                            />
                        </section>
                    )}

                    {/* Formation + Langues + Certifications — en ligne */}
                    <div className="flex gap-6">
                        {/* Formation */}
                        {limitedFormations.length > 0 && (
                            <section className="flex-1">
                                <SectionTitle
                                    title="Formation"
                                    primaryColor={V.primary}
                                    variant="underline"
                                    textSize="text-[10pt]"
                                />
                                <div className="space-y-1">
                                    {limitedFormations.map((edu, i) => (
                                        <EducationItem
                                            key={i}
                                            diplome={edu.diplome}
                                            etablissement={edu.etablissement}
                                            annee={edu.annee}
                                            primaryColor={V.primary}
                                            variant="inline"
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Langues */}
                        {limitedLangages.length > 0 && (
                            <section className="flex-1">
                                <SectionTitle
                                    title="Langues"
                                    primaryColor={V.primary}
                                    variant="underline"
                                    textSize="text-[10pt]"
                                />
                                <LanguageList
                                    langues={limitedLangages}
                                    primaryColor={V.primary}
                                    variant="simple"
                                    textSize="text-[8pt]"
                                />
                            </section>
                        )}

                        {/* Certifications */}
                        {limitedCertifications.length > 0 && (
                            <section className="flex-1">
                                <SectionTitle
                                    title="Certifications"
                                    primaryColor={V.primary}
                                    variant="underline"
                                    textSize="text-[10pt]"
                                />
                                <CertificationList
                                    certifications={limitedCertifications}
                                    primaryColor={V.primary}
                                />
                            </section>
                        )}
                    </div>

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
                                variant="list"
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
                            <div className="space-y-1.5">
                                {limitedProjects.map((project, i) => (
                                    <ProjectItem
                                        key={i}
                                        nom={project.nom}
                                        description={project.description}
                                        technologies={project.technologies}
                                        lien={project.lien}
                                        primaryColor={V.primary}
                                        variant="inline"
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
