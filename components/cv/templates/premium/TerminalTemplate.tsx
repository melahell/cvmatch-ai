"use client";

import React from "react";
import { TemplateProps, withDL, isValidEntreprise } from "../index";
import { CV_THEME_VARS as V } from "@/lib/cv/style/theme-vars";
import { sanitizeText } from "@/lib/cv/sanitize-text";
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
} from "@/components/cv/shared";

/**
 * TERMINAL — IDE / Developer style
 * Sidebar gauche dark avec terminal dots, monospace accents, compétences catégorisées.
 * Cible : Développeurs, DevOps, Data Engineers.
 */
export default function TerminalTemplate({
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

    const pad = dense ? "p-4" : "p-5";
    const sidebarGap = dense ? "gap-3" : "gap-4";

    /** Terminal-style section comment */
    const Comment = ({ text }: { text: string }) => (
        <h3
            className="font-mono text-[8pt] font-bold uppercase tracking-wider pb-1.5 mb-2 border-b"
            style={{ color: V.sidebarAccent, borderBottomColor: `${V.sidebarAccent}40` }}
        >
            {"// "}{text}
        </h3>
    );

    /** Section title with angle brackets for main content */
    const CodeTitle = ({ text }: { text: string }) => (
        <h2 className="text-[10pt] font-extrabold mb-3 text-gray-900 flex items-center gap-2">
            <span className="font-mono" style={{ color: V.primary }}>{"<"}</span>
            {text}
            <span className="font-mono" style={{ color: V.primary }}>{"/>"}</span>
        </h2>
    );

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
            {/* ── SIDEBAR GAUCHE — TERMINAL STYLE ── */}
            <aside
                className={`flex-shrink-0 text-white ${pad} flex flex-col ${sidebarGap}`}
                style={{
                    width: "68mm",
                    background: `linear-gradient(180deg, ${V.sidebarBg}, color-mix(in srgb, ${V.sidebarBg} 88%, black))`,
                }}
            >
                {/* Terminal chrome */}
                <div className="flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#eab308" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                    <span className="ml-2 text-[7pt] text-white/40 font-mono">~/profile</span>
                </div>

                {/* Photo + Name */}
                <div className="flex flex-col items-center text-center">
                    <ProfilePicture
                        photoUrl={profil?.photo_url}
                        fullName={`${profil.prenom} ${profil.nom}`}
                        initials={initials}
                        includePhoto={includePhoto}
                        size="sm"
                        shape="rounded"
                        borderColor={V.sidebarAccent}
                    />
                    <h1 className="text-[12pt] font-bold mt-2 leading-tight">
                        {profil.prenom} {profil.nom}
                    </h1>
                    <p className="font-mono mt-1 text-[8pt]" style={{ color: V.sidebarAccent }}>
                        <span className="text-white/40">{">"}</span> {profil.titre_principal}
                    </p>
                </div>

                {/* Contact */}
                <div>
                    <Comment text="contact" />
                    <ContactInfo
                        email={profil.email}
                        telephone={profil.telephone}
                        localisation={profil.localisation}
                        linkedin={profil.linkedin}
                        github={profil.github}
                        portfolio={profil.portfolio}
                        layout="vertical"
                        iconColor={V.sidebarAccent}
                        textColor="#cbd5e1"
                        iconSize={12}
                        textSize="text-[8pt]"
                    />
                </div>

                {/* Skills */}
                {limitedSkills.length > 0 && (
                    <div>
                        <Comment text="tech_stack" />
                        <SkillsGrid
                            skills={limitedSkills.map(s => typeof s === "string" ? s : String(s))}
                            primaryColor={V.sidebarAccent}
                            variant="tags"
                            textSize="text-[7pt]"
                            className="font-mono"
                        />
                    </div>
                )}

                {/* Soft Skills */}
                {limitedSoftSkills.length > 0 && (
                    <div>
                        <Comment text="soft_skills" />
                        <SkillsGrid
                            skills={limitedSoftSkills.map(s => typeof s === "string" ? s : String(s))}
                            primaryColor={V.sidebarAccent}
                            variant="tags"
                            textSize="text-[7pt]"
                            className="font-mono"
                        />
                    </div>
                )}

                {/* Langues */}
                {limitedLangages.length > 0 && (
                    <div className="mt-auto">
                        <Comment text="languages" />
                        <LanguageList
                            langues={limitedLangages}
                            primaryColor={V.sidebarAccent}
                            variant="inline"
                            textSize="text-[8pt]"
                            className="text-gray-300"
                        />
                    </div>
                )}
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main
                className={`flex-1 ${pad} bg-white overflow-hidden flex flex-col ${dense ? "gap-3" : "gap-4"}`}
            >
                {/* Header */}
                <div className="pb-3 border-b-2" style={{ borderBottomColor: V.primary }}>
                    <h2 className="text-[15pt] font-extrabold text-gray-900">
                        {profil.prenom} {profil.nom}
                    </h2>
                    <p className="font-semibold text-[10pt]" style={{ color: V.primary }}>
                        {profil.titre_principal}
                    </p>
                    {jobContext?.job_title && (
                        <div
                            className="mt-1.5 px-2 py-1 rounded inline-block text-[8pt] font-mono"
                            style={{ backgroundColor: V.primaryA10, color: V.primary }}
                        >
                            {"// Candidature: "}{jobContext.job_title}
                            {jobContext.company && ` @ ${jobContext.company}`}
                            {jobContext.match_score && ` | Match: ${jobContext.match_score}%`}
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
                        <CodeTitle text="Experience" />
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

                {/* Certifications */}
                {limitedCertifications.length > 0 && (
                    <section>
                        <CodeTitle text="Certifications" />
                        <CertificationList
                            certifications={limitedCertifications}
                            primaryColor={V.primary}
                        />
                    </section>
                )}

                {/* Formation */}
                {limitedFormations.length > 0 && (
                    <section>
                        <CodeTitle text="Education" />
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

                {/* Clients */}
                {limitedClients.length > 0 && (
                    <section>
                        <CodeTitle text="Clients" />
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
                        <CodeTitle text="Projects" />
                        <div className="grid grid-cols-2 gap-2">
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
