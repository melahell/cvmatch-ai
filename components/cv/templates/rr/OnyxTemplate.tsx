/**
 * Template Onyx - Inspiré de Reactive Resume
 * 
 * Design professionnel avec sidebar
 * Layout: Main content + Sidebar
 * 
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { CVData, TemplateProps } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { CertificationList, ClientReferences, ContactInfo, EducationItem, ExperienceItem, LanguageList, ProfilePicture, ProjectItem, SectionTitle, SkillsGrid } from "@/components/cv/shared";

interface OnyxColors {
    primary: string;
    text: string;
    background: string;
    sidebar: string;
}

const defaultColors: OnyxColors = {
    primary: "#3b82f6",
    text: "#1f2937",
    background: "#ffffff",
    sidebar: "#f8fafc",
};

export default function OnyxTemplate({ data, includePhoto = true, dense = false }: TemplateProps) {
    const colors = defaultColors;
    const padding = dense ? "p-4" : "p-6";
    const gap = dense ? "gap-3" : "gap-4";
    const textSize = dense ? "text-xs" : "text-sm";

    // Safe accessors
    const profil = data.profil || {};
    const experiences = data.experiences || [];
    const formations = data.formations || [];
    const competences = data.competences || { techniques: [], soft_skills: [] };
    const langues = data.langues || [];
    const certifications = data.certifications || [];
    const projects = data.projects || [];
    const clientsReferences = data.clients_references;

    const fullName = `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Nom Prénom";
    const titre = profil.titre_principal || "";
    const initials = `${(profil.prenom || "N").charAt(0)}${(profil.nom || "P").charAt(0)}`.toUpperCase();

    // Extraire les skills
    const technicalSkills = Array.isArray(competences) 
        ? competences.map((c: any) => c.nom || c.name || c).filter(Boolean)
        : competences.techniques || [];
    const softSkills = Array.isArray(competences) 
        ? [] 
        : competences.soft_skills || [];

    return (
        <div 
            className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto"
            style={{ 
                fontFamily: "var(--cv-font-body)",
                color: colors.text,
            }}
        >
            <div className="flex min-h-[var(--cv-page-height)]">
                {/* SIDEBAR */}
                <aside 
                    className={`w-[35%] ${padding} print:break-inside-avoid`}
                    style={{ backgroundColor: colors.sidebar }}
                >
                    {includePhoto && (
                        <div className="flex justify-center mb-6">
                            <ProfilePicture
                                photoUrl={profil.photo_url}
                                fullName={fullName}
                                initials={initials}
                                includePhoto={includePhoto}
                                size="lg"
                                borderColor={colors.primary}
                            />
                        </div>
                    )}

                    <section className={`mb-6 ${gap}`}>
                        <SectionTitle title="Contact" primaryColor={colors.primary} variant="sidebar" textSize="text-lg" />
                        <ContactInfo
                            email={profil.email}
                            telephone={profil.telephone}
                            localisation={profil.localisation}
                            linkedin={profil.linkedin}
                            github={profil.github}
                            portfolio={profil.portfolio}
                            layout="vertical"
                            iconColor={colors.primary}
                            textColor={colors.text}
                            textSize={textSize}
                        />
                    </section>

                    {/* Compétences */}
                    {technicalSkills.length > 0 && (
                        <section className="mb-6 break-inside-avoid">
                            <SectionTitle title="Compétences" primaryColor={colors.primary} variant="sidebar" textSize="text-lg" />
                            <SkillsGrid skills={technicalSkills} primaryColor={colors.primary} variant="tags" maxItems={15} textSize={textSize} />
                        </section>
                    )}

                    {/* Soft Skills */}
                    {softSkills.length > 0 && (
                        <section className="mb-6 break-inside-avoid">
                            <SectionTitle title="Soft Skills" primaryColor={colors.primary} variant="sidebar" textSize="text-lg" />
                            <SkillsGrid skills={softSkills} primaryColor={colors.primary} variant="list" maxItems={8} textSize={textSize} />
                        </section>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                        <section className="mb-6 break-inside-avoid">
                            <SectionTitle title="Langues" primaryColor={colors.primary} variant="sidebar" textSize="text-lg" />
                            <LanguageList langues={langues as any} primaryColor={colors.primary} variant="simple" textSize={textSize} />
                        </section>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <section className="mb-6 break-inside-avoid">
                            <SectionTitle title="Certifications" primaryColor={colors.primary} variant="sidebar" textSize="text-lg" />
                            <CertificationList certifications={certifications} primaryColor={colors.primary} variant="list" maxItems={6} textSize={textSize} />
                        </section>
                    )}
                </aside>

                {/* MAIN CONTENT */}
                <main className={`flex-1 ${padding}`}>
                    {/* Header */}
                    <header className="mb-6 pb-4 border-b-2" style={{ borderColor: colors.primary }}>
                        <h1 
                            className="text-3xl font-bold mb-1"
                            style={{ color: colors.text }}
                        >
                            {fullName}
                        </h1>
                        {titre && (
                            <h2 
                                className="text-xl font-medium"
                                style={{ color: colors.primary }}
                            >
                                {sanitizeText(titre)}
                            </h2>
                        )}
                        {profil.elevator_pitch && (
                            <p className={`mt-3 ${textSize} text-gray-600 leading-relaxed`}>
                                {sanitizeText(profil.elevator_pitch)}
                            </p>
                        )}
                    </header>

                    {/* Expériences */}
                    {experiences.length > 0 && (
                        <section className="mb-6">
                            <SectionTitle title="Expérience Professionnelle" primaryColor={colors.primary} variant="underline" textSize="text-xl" className="mb-4" />
                            <div className={`space-y-4 ${gap}`}>
                                {experiences.map((exp: any, idx: number) => (
                                    <ExperienceItem
                                        key={idx}
                                        poste={exp.poste}
                                        entreprise={exp.entreprise}
                                        date_debut={exp.date_debut}
                                        date_fin={exp.date_fin}
                                        lieu={exp.lieu}
                                        realisations={Array.isArray(exp.realisations) ? exp.realisations : []}
                                        clients={Array.isArray(exp.clients) ? exp.clients : []}
                                        primaryColor={colors.primary}
                                        variant="standard"
                                        maxRealisations={4}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                        <section className="mb-6">
                            <SectionTitle title="Formation" primaryColor={colors.primary} variant="underline" textSize="text-xl" className="mb-4" />
                            <div className={`space-y-3 ${gap}`}>
                                {formations.map((form: any, idx: number) => (
                                    <EducationItem
                                        key={idx}
                                        diplome={form.diplome}
                                        etablissement={form.etablissement}
                                        annee={form.annee}
                                        primaryColor={colors.primary}
                                        variant="standard"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projets */}
                    {projects.length > 0 && (
                        <section className="mb-6">
                            <SectionTitle title="Projets" primaryColor={colors.primary} variant="underline" textSize="text-xl" className="mb-4" />
                            <div className={`space-y-3 ${gap}`}>
                                {projects.slice(0, 4).map((proj: any, idx: number) => (
                                    <ProjectItem
                                        key={idx}
                                        nom={proj.nom}
                                        description={proj.description}
                                        technologies={Array.isArray(proj.technologies) ? proj.technologies : []}
                                        lien={proj.lien}
                                        primaryColor={colors.primary}
                                        variant="card"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Références clients */}
                    {clientsReferences?.clients && clientsReferences.clients.length > 0 && (
                        <section className="mb-6">
                            <SectionTitle title="Clients Références" primaryColor={colors.primary} variant="underline" textSize="text-xl" className="mb-4" />
                            <ClientReferences
                                clients={clientsReferences.clients}
                                secteurs={clientsReferences.secteurs}
                                primaryColor={colors.primary}
                                variant={clientsReferences.secteurs ? "grouped" : "pills"}
                                maxClients={8}
                                textSize={textSize}
                            />
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
