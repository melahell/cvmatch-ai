/**
 * Helix - RR Amélioré : timeline pastilles, bullets soignés
 * Inspiré Reactive Resume (MIT) — design premium
 */

import React from "react";
import { TemplateProps, isValidEntreprise, withDL } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function HelixTemplate({ data, includePhoto = true, dense = false, displayLimits: dl }: TemplateProps) {
    const limits = withDL(dl);
    const c = { p: CV_THEME_VARS.primary, s: CV_THEME_VARS.sidebarAccent, text: CV_THEME_VARS.text, muted: CV_THEME_VARS.muted, a20: CV_THEME_VARS.primaryA20, a50: CV_THEME_VARS.primaryA50 };
    const pad = dense ? "px-6 py-4" : "px-10 py-8";
    const ts = dense ? "text-xs" : "text-sm";
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
    const dot = <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: c.p }} />;

    return (
        <div className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto" style={{ fontFamily: "var(--cv-font-body)", color: c.text }}>
            <div className={pad}>
                <header className="pb-5 mb-5 flex items-center gap-4" style={{ borderBottom: `2px solid ${c.a50}` }}>
                    {includePhoto && <ProfilePicture photoUrl={profil.photo_url} fullName={fullName} initials={initials} includePhoto={includePhoto} size="lg" borderColor={c.p} className="flex-shrink-0" />}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{fullName}</h1>
                        {titre && <p className="text-base mt-0.5" style={{ color: c.s }}>{sanitizeText(titre)}</p>}
                        <ContactInfo email={profil.email} telephone={profil.telephone} localisation={profil.localisation} linkedin={profil.linkedin} github={profil.github} portfolio={profil.portfolio} layout="inline" textColor={c.muted} className={`flex flex-wrap gap-3 mt-2 ${ts}`} />
                    </div>
                </header>
                <main className="space-y-5">
                    {profil.elevator_pitch && <p className={`${ts} pl-4 border-l-4 py-1`} style={{ borderColor: c.p }}>{sanitizeText(profil.elevator_pitch)}</p>}
                    {allSkills.length > 0 && <section><h2 className="text-sm font-bold mb-2 flex items-center gap-2">{dot} Compétences</h2><div className="flex flex-wrap gap-2">{allSkills.map((s: string, i: number) => <span key={i} className={`${ts} px-2.5 py-1 rounded-full`} style={{ backgroundColor: c.a20 }}>{sanitizeText(s)}</span>)}</div></section>}
                    {experiences.length > 0 && <section><h2 className="text-sm font-bold mb-3 flex items-center gap-2">{dot} Expérience</h2><div className="relative pl-5 space-y-4" style={{ borderLeft: `2px solid ${c.a50}` }}>{experiences.map((exp: any, idx: number) => (
                        <article key={idx} className="relative"><span className="absolute -left-[13px] top-1 w-3 h-3 rounded-full border-2 bg-white" style={{ borderColor: c.p }} />
                            <div className="flex justify-between gap-2"><div><h3 className="font-bold text-sm">{sanitizeText(exp.poste)}</h3>{isValidEntreprise(exp.entreprise) ? <p className={ts} style={{ color: c.s }}>{sanitizeText(exp.entreprise)}{exp.lieu ? ` · ${exp.lieu}` : ""}</p> : exp.lieu ? <p className={ts} style={{ color: c.s }}>{exp.lieu}</p> : null}</div><span className={`${ts} text-gray-500`}>{exp.date_debut ? `${exp.date_debut}${exp.date_fin ? ` – ${exp.date_fin}` : " – Présent"}` : ""}</span></div>
                            {exp.realisations?.length > 0 && <ul className={`mt-1 ${ts} text-gray-600 space-y-0.5`}>{exp.realisations.slice(0, limits.maxRealisationsPerExp).map((r: string, ri: number) => <li key={ri} className="flex gap-2">{dot}{sanitizeText(r)}</li>)}</ul>}
                            {exp.clients?.length > 0 && <p className={`mt-1 ${ts} text-gray-500`}>Clients : {exp.clients.slice(0, limits.maxClientsPerExp).join(", ")}</p>}
                        </article>
                    ))}</div></section>}
                    <div className="grid grid-cols-2 gap-5">
                        {formations.length > 0 && <section><h2 className="text-sm font-bold mb-2 flex items-center gap-2">{dot} Formation</h2>{formations.slice(0, limits.maxFormations).map((f: any, i: number) => <article key={i} className="mb-2"><h3 className="font-bold text-sm">{sanitizeText(f.diplome)}</h3><p className={`${ts} text-gray-600`}>{sanitizeText(f.etablissement)} {f.annee}</p></article>)}</section>}
                        <div className="space-y-4">{langues.length > 0 && <section><h2 className="text-sm font-bold mb-2 flex items-center gap-2">{dot} Langues</h2>{langues.slice(0, limits.maxLangues).map((l: any, i: number) => <div key={i} className="flex justify-between text-sm mb-1"><span>{l.langue}</span><span className={`${ts} px-2 py-0.5 rounded`} style={{ backgroundColor: c.a20 }}>{l.niveau}</span></div>)}</section>}{certifications.length > 0 && <section><h2 className="text-sm font-bold mb-2 flex items-center gap-2">{dot} Certifications</h2><ul className={`${ts} space-y-0.5`}>{certifications.slice(0, limits.maxCertifications).map((cert: string, i: number) => <li key={i} className="flex gap-2"><span style={{ color: c.p }}>✓</span>{sanitizeText(cert)}</li>)}</ul></section>}</div>
                    </div>
                    {projects.length > 0 && <section><h2 className="text-sm font-bold mb-2 flex items-center gap-2">{dot} Projets</h2><div className="grid grid-cols-2 gap-2">{projects.slice(0, limits.maxProjects).map((p: any, i: number) => <article key={i} className="p-2 rounded border-l-2" style={{ borderColor: c.a50 }}><h3 className="font-bold text-sm">{sanitizeText(p.nom)}</h3>{p.description && <p className={`${ts} text-gray-600`}>{sanitizeText(p.description)}</p>}</article>)}</div></section>}
                    {(clientsReferences?.clients?.length ?? 0) > 0 && <section><h2 className="text-sm font-bold mb-2 flex items-center gap-2">{dot} Clients références</h2><div className="flex flex-wrap gap-2">{(clientsReferences?.clients ?? []).slice(0, limits.maxClientsReferences).map((client: string, i: number) => <span key={i} className={`${ts} px-2 py-0.5 rounded border`} style={{ borderColor: c.p }}>{client}</span>)}</div></section>}
                </main>
            </div>
        </div>
    );
}
