"use client";

import React from "react";
import { TemplateProps, withDL, isValidEntreprise } from "../index";
import { CV_THEME_VARS as V } from "@/lib/cv/style/theme-vars";
import SectionTitle from "@/components/cv/shared/SectionTitle";
import ExperienceItem from "@/components/cv/shared/ExperienceItem";
import SkillsGrid from "@/components/cv/shared/SkillsGrid";
import EducationItem from "@/components/cv/shared/EducationItem";
import ClientReferences from "@/components/cv/shared/ClientReferences";
import ProjectItem from "@/components/cv/shared/ProjectItem";
import {
    PageContainer,
    ProfilePicture,
    ContactInfo,
    SummaryBlock,
    LanguageList,
    CertificationList,
} from "@/components/cv/shared";

/**
 * ÉLÉGANT — Classique raffiné, full-width, serif headings
 * Pas de sidebar. Header sobre avec ligne d'accent. Typographie distinguée.
 * Sections secondaires groupées en cartes (compétences, formation + langues + certifs).
 * Cible : Juridique, Académique, Conseil stratégique, Profils seniors.
 */
export default function ElegantTemplate({
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

    return (
        <PageContainer
            dense={dense}
            fontSize={dense ? "9pt" : "9.5pt"} // [FIX-13] Increased font size
            lineHeight={dense ? "1.4" : "1.5"} // [FIX-13] Increased leading
            className="shadow-xl" // [FIX-34] Stronger shadow
        >
            {/* ── HEADER — sobre classique ── */}
            <header className="px-10 pt-10 pb-6"> {/* [FIX-12] Increased padding */}
                <div className="flex items-start gap-6"> {/* [FIX-06] items-start for better photo alignment */}
                    {includePhoto && (
                        <ProfilePicture
                            photoUrl={profil?.photo_url}
                            fullName={fullName}
                            initials={initials}
                            includePhoto={includePhoto}
                            size="xl" // Larger photo
                            shape="circle"
                            borderColor={V.primary}
                            className="mt-1" // Subtle alignment tweak
                        />
                    )}
                    <div className="flex-1 min-w-0"> {/* min-w-0 to allow text truncation if needed */}
                        <h1
                            className="text-[26pt] font-bold tracking-tight text-slate-900 leading-[1.1]" // [FIX-05] Larger title, tighter leading for headings
                            style={{ fontFamily: "var(--cv-font-heading)" }}
                        >
                            {fullName}
                        </h1>
                        <p className="text-[12pt] font-medium mt-1 text-slate-700" style={{ color: V.primary }}>
                            {profil?.titre_principal}
                        </p>

                        {/* Accent double line - Connected style */}
                        <div className="mt-3 mb-3 flex items-center gap-1">
                            <div className="h-[2px] flex-1 rounded-full opacity-30" style={{ backgroundColor: V.primary }} />
                            <div className="h-[2px] w-2 rounded-full" style={{ backgroundColor: V.primary }} />
                        </div>

                        {/* [FIX-03] Contact Layout Improvement */}
                        <ContactInfo
                            email={profil?.email}
                            telephone={profil?.telephone}
                            localisation={profil?.localisation}
                            linkedin={profil?.linkedin}
                            github={profil?.github}
                            portfolio={profil?.portfolio}
                            layout="horizontal"
                            iconColor={V.primary}
                            // [FIX-10] Darker text for accessibility
                            textColor="#475569"
                            iconSize={13}
                            textSize="text-[9pt]"
                            className="flex-wrap"
                        />
                    </div>
                </div>

                {/* Job context badge */}
                {jobContext?.job_title && (
                    <div
                        className="mt-3 text-[8pt] font-medium px-2.5 py-0.5 rounded-full inline-block border"
                        style={{
                            backgroundColor: `${V.primary}08`, // Very light background
                            color: V.primary,
                            borderColor: `${V.primary}20`
                        }}
                    >
                        Objet : Candidature pour le poste de {jobContext.job_title}
                        {jobContext.company && ` chez ${jobContext.company}`}
                    </div>
                )}
            </header>

            {/* ── BODY ── */}
            <main className="px-10 pt-2 pb-10"> {/* [FIX-12] Increased padding */}

                {/* Pitch - [FIX-07] Connected design */}
                {profil?.elevator_pitch && (
                    <section className={`${sectionMb} border-l-[3px] pl-4`} style={{ borderColor: `${V.primary}40` }}>
                        <SummaryBlock
                            text={profil.elevator_pitch}
                            primaryColor={V.primary}
                            variant="plain" // Cleaner without extra borders
                            textSize="text-[9.5pt] text-slate-700 leading-relaxed italic"
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
                            textSize="text-[11pt]" // [FIX-15] Larger hierarchy
                            className="mb-4"
                        />
                        <div className={`flex flex-col ${dense ? "gap-3" : "gap-5"}`}>
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
                                    bulletStyle="disc" // [FIX-14] Standard bullets
                                    className="mb-1"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Compétences — [FIX-08, 10] Better visual layout */}
                {(limitedSkills.length > 0 || limitedSoftSkills.length > 0) && (
                    <section className={sectionMb}>
                        <SectionTitle
                            title="Compétences"
                            primaryColor={V.primary}
                            variant="accent-line"
                            textSize="text-[11pt]"
                            className="mb-3"
                        />
                        <div className="grid grid-cols-2 gap-6">
                            {limitedSkills.length > 0 && (
                                <div>
                                    <h4 className="text-[8pt] font-bold text-slate-500 uppercase tracking-wider mb-2">Techniques</h4>
                                    <SkillsGrid
                                        skills={limitedSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                        primaryColor={V.primary}
                                        variant="tags" // [FIX-08] Tags instead of pills for better text fit
                                        textSize="text-[9pt]"
                                    />
                                </div>
                            )}
                            {limitedSoftSkills.length > 0 && (
                                <div>
                                    <h4 className="text-[8pt] font-bold text-slate-500 uppercase tracking-wider mb-2">Savoir-être</h4>
                                    <SkillsGrid
                                        skills={limitedSoftSkills.map(s => typeof s === "string" ? s : (s as any).name || String(s))}
                                        primaryColor={V.primary}
                                        variant="list" // List for soft skills to vary
                                        textSize="text-[9pt]"
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Formation + Langues + Certifications — [FIX-09] Improved Grid */}
                {(limitedFormations.length > 0 || limitedLangages.length > 0 || limitedCertifications.length > 0) && (
                    <section className={sectionMb}>
                        <div className="grid grid-cols-12 gap-6">
                            {/* Formations (Main column) */}
                            {limitedFormations.length > 0 && (
                                <div className={`${limitedLangages.length > 0 ? "col-span-7" : "col-span-12"}`}>
                                    <SectionTitle title="Formation" primaryColor={V.primary} variant="accent-line" textSize="text-[11pt]" className="mb-3" />
                                    <div className="space-y-3">
                                        {limitedFormations.map((edu, i) => (
                                            <EducationItem
                                                key={i}
                                                diplome={edu.diplome}
                                                etablissement={edu.etablissement}
                                                annee={edu.annee}
                                                primaryColor={V.primary}
                                                variant="standard" // [FIX-04] Standard to show details
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sidebar column for Lang & Certifs */}
                            {(limitedLangages.length > 0 || limitedCertifications.length > 0) && (
                                <div className="col-span-5 space-y-5">
                                    {limitedLangages.length > 0 && (
                                        <div>
                                            <SectionTitle title="Langues" primaryColor={V.primary} variant="accent-line" textSize="text-[11pt]" className="mb-3" />
                                            <LanguageList
                                                langues={limitedLangages}
                                                primaryColor={V.primary}
                                                variant="simple" // Clean list
                                                textSize="text-[9pt]"
                                            />
                                        </div>
                                    )}
                                    {limitedCertifications.length > 0 && (
                                        <div>
                                            <SectionTitle title="Certifications" primaryColor={V.primary} variant="accent-line" textSize="text-[11pt]" className="mb-3" />
                                            <CertificationList
                                                certifications={limitedCertifications}
                                                primaryColor={V.primary}
                                                textSize="text-[9pt]"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Clients — [FIX-11] Better presentation */}
                {limitedClients.length > 0 && (
                    <section className={sectionMb}>
                        <SectionTitle title="Clients & Références" primaryColor={V.primary} variant="accent-line" textSize="text-[11pt]" className="mb-3" />
                        <ClientReferences
                            clients={limitedClients}
                            secteurs={clients_references?.secteurs}
                            primaryColor={V.primary}
                            variant="tags" // Clean tags
                            textSize="text-[8.5pt]"
                        />
                    </section>
                )}

                {/* Projets */}
                {limitedProjects.length > 0 && (
                    <section>
                        <SectionTitle title="Projets Clés" primaryColor={V.primary} variant="accent-line" textSize="text-[11pt]" className="mb-3" />
                        <div className="space-y-3">
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
