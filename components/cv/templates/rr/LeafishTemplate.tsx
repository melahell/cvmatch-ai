/**
 * Template Leafish - Inspiré de Reactive Resume
 * Layout: une colonne, accents verts / nature
 * MIT License - Adapté depuis https://github.com/amruthpillai/reactive-resume
 */

import React from "react";
import { TemplateProps, isValidEntreprise, withDL } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function LeafishTemplate({ data, includePhoto = true, dense = false, displayLimits: dl }: TemplateProps) {
    const limits = withDL(dl);
    const colors = { primary: CV_THEME_VARS.primary, secondary: CV_THEME_VARS.sidebarAccent, text: CV_THEME_VARS.text, muted: CV_THEME_VARS.muted, primary20: CV_THEME_VARS.primaryA20, primary50: CV_THEME_VARS.primaryA50 };
    const padding = dense ? "px-6 py-4" : "px-8 py-6";
    const textSize = dense ? "text-xs" : "text-sm";

    const profil = data.profil || {};
    const experiences = data.experiences || [];
    const formations = data.formations || [];
    const competences = data.competences || { techniques: [], soft_skills: [] };
    const langues = data.langues || [];
    const certifications = data.certifications || [];
    const projects = data.projects || [];
    const clientsReferences = data.clients_references;

    const fullName = `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Nom Prénom";
    const initials = `${(profil.prenom || "N").charAt(0)}${(profil.nom || "P").charAt(0)}`.toUpperCase();
    const titre = profil.titre_principal || "";
    const allSkills = [...(competences.techniques || []).slice(0, limits.maxSkills), ...(competences.soft_skills || []).slice(0, limits.maxSoftSkills)];

    return (
        <div className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto" style={{ fontFamily: "var(--cv-font-body)", color: colors.text }}>
            <header className={`${padding} rounded-b-lg`} style={{ background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, color: "#fff" }}>
                <div className="flex items-center gap-4">
                    {includePhoto && <ProfilePicture photoUrl={profil.photo_url} fullName={fullName} initials={initials} includePhoto={includePhoto} size="md" borderColor="#fff" className="flex-shrink-0" />}
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white">{fullName}</h1>
                        {titre && <h2 className="text-white/90 text-base">{sanitizeText(titre)}</h2>}
                        <ContactInfo email={profil.email} telephone={profil.telephone} localisation={profil.localisation} linkedin={profil.linkedin} github={profil.github} portfolio={profil.portfolio} layout="inline" textColor="rgba(255,255,255,0.85)" className={`flex flex-wrap gap-3 mt-2 ${textSize}`} />
                    </div>
                </div>
            </header>

            <main className={`${padding} space-y-4 pt-4`}>
                {profil.elevator_pitch && <p className={`${textSize} text-gray-600 italic pl-3 border-l-4`} style={{ borderColor: colors.primary }}>{sanitizeText(profil.elevator_pitch)}</p>}
                {allSkills.length > 0 && <section><h2 className="text-base font-bold mb-2" style={{ color: colors.primary }}>Compétences</h2><div className="flex flex-wrap gap-2">{allSkills.map((s: string, i: number) => <span key={i} className={`px-2.5 py-1 rounded-full ${textSize}`} style={{ backgroundColor: colors.primary20, color: colors.secondary }}>{sanitizeText(s)}</span>)}</div></section>}
                {experiences.length > 0 && (
                    <section><h2 className="text-base font-bold mb-2" style={{ color: colors.primary }}>Expérience</h2><div className="space-y-3">
                        {experiences.map((exp: any, idx: number) => (
                            <article key={idx} className="pl-4 border-l-2" style={{ borderColor: colors.primary50 }}>
                                <div className="flex justify-between gap-2"><div><h3 className="font-bold text-sm">{sanitizeText(exp.poste)}</h3>{isValidEntreprise(exp.entreprise) ? <p className={`${textSize}`} style={{ color: colors.secondary }}>{sanitizeText(exp.entreprise)}{exp.lieu ? ` · ${exp.lieu}` : ""}</p> : exp.lieu ? <p className={`${textSize}`} style={{ color: colors.secondary }}>{exp.lieu}</p> : null}</div><span className={`${textSize} text-gray-500`}>{exp.date_debut ? `${exp.date_debut}${exp.date_fin ? ` - ${exp.date_fin}` : " - Présent"}` : ""}</span></div>
                                {exp.realisations?.length > 0 && <ul className={`mt-1 ${textSize} text-gray-600 space-y-0.5`}>{exp.realisations.slice(0, limits.maxRealisationsPerExp).map((r: string, ri: number) => <li key={ri} className="flex gap-2"><span style={{ color: colors.primary }}>•</span>{sanitizeText(r)}</li>)}</ul>}
                            </article>
                        ))}
                    </div></section>
                )}
                <div className="grid grid-cols-2 gap-4">
                    {formations.length > 0 && <section><h2 className="text-base font-bold mb-2" style={{ color: colors.primary }}>Formation</h2>{formations.slice(0, limits.maxFormations).map((f: any, i: number) => <article key={i} className="mb-2"><h3 className="font-bold text-sm">{sanitizeText(f.diplome)}</h3><p className={`${textSize} text-gray-600`}>{sanitizeText(f.etablissement)} {f.annee}</p></article>)}</section>}
                    {langues.length > 0 && <section><h2 className="text-base font-bold mb-2" style={{ color: colors.primary }}>Langues</h2>{langues.slice(0, limits.maxLangues).map((l: any, i: number) => <div key={i} className="flex justify-between text-sm mb-1"><span>{l.langue}</span><span className={`${textSize} px-1.5 rounded`} style={{ backgroundColor: colors.primary20 }}>{l.niveau}</span></div>)}</section>}
                </div>
                {certifications.length > 0 && <section><h2 className="text-base font-bold mb-2" style={{ color: colors.primary }}>Certifications</h2><ul className={`${textSize} space-y-0.5`}>{certifications.slice(0, limits.maxCertifications).map((cert: string, i: number) => <li key={i} className="flex gap-2"><span style={{ color: colors.primary }}>✓</span>{sanitizeText(cert)}</li>)}</ul></section>}
                {projects.length > 0 && <section><h2 className="text-base font-bold mb-2" style={{ color: colors.primary }}>Projets</h2><div className="grid grid-cols-2 gap-2">{projects.slice(0, limits.maxProjects).map((p: any, i: number) => <article key={i} className="p-2 rounded" style={{ backgroundColor: colors.primary20 }}><h3 className="font-bold text-sm">{sanitizeText(p.nom)}</h3>{p.description && <p className={`${textSize} text-gray-600`}>{sanitizeText(p.description)}</p>}</article>)}</div></section>}
                {(clientsReferences?.clients?.length ?? 0) > 0 && <section><h2 className="text-base font-bold mb-2" style={{ color: colors.primary }}>Clients Références</h2><div className="flex flex-wrap gap-2">{(clientsReferences?.clients ?? []).slice(0, limits.maxClientsReferences).map((client: string, i: number) => <span key={i} className={`px-2 py-0.5 rounded border ${textSize}`} style={{ borderColor: colors.primary }}>{client}</span>)}</div></section>}
            </main>
        </div>
    );
}
