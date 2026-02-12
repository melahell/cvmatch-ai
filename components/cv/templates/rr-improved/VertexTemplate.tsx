/**
 * Vertex - RR Amélioré : deux colonnes (compétences + formation), exp pleine largeur
 * Inspiré Reactive Resume (MIT) — design premium
 */

import React from "react";
import { TemplateProps, isValidEntreprise, withDL } from "../index";
import { sanitizeText } from "@/lib/cv/sanitize-text";
import { ContactInfo, ProfilePicture } from "@/components/cv/shared";
import { CV_THEME_VARS } from "@/lib/cv/style/theme-vars";

export default function VertexTemplate({ data, includePhoto = true, dense = false, displayLimits: dl }: TemplateProps) {
    const limits = withDL(dl);
    const c = { p: CV_THEME_VARS.primary, s: CV_THEME_VARS.sidebarAccent, text: CV_THEME_VARS.text, muted: CV_THEME_VARS.muted, a10: CV_THEME_VARS.primaryA10, a20: CV_THEME_VARS.primaryA20, a50: CV_THEME_VARS.primaryA50 };
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

    return (
        <div className="w-[var(--cv-page-width)] min-h-[var(--cv-page-height)] bg-white print:bg-white mx-auto" style={{ fontFamily: "var(--cv-font-body)", color: c.text }}>
            <div className={pad}>
                <header className="pb-5 mb-5 flex items-start gap-4" style={{ borderBottom: `3px solid ${c.p}` }}>
                    {includePhoto && <ProfilePicture photoUrl={profil.photo_url} fullName={fullName} initials={initials} includePhoto={includePhoto} size="lg" borderColor={c.p} className="flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold">{fullName}</h1>
                        {titre && <p className="text-base mt-0.5" style={{ color: c.s }}>{sanitizeText(titre)}</p>}
                        <ContactInfo email={profil.email} telephone={profil.telephone} localisation={profil.localisation} linkedin={profil.linkedin} github={profil.github} portfolio={profil.portfolio} layout="inline" textColor={c.muted} className={`flex flex-wrap gap-3 mt-2 ${ts}`} />
                    </div>
                </header>

                {profil.elevator_pitch && <p className={`${ts} mb-4 py-2 px-3 rounded-r`} style={{ backgroundColor: c.a10, borderLeft: `4px solid ${c.p}` }}>{sanitizeText(profil.elevator_pitch)}</p>}

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-5">
                        {allSkills.length > 0 && <section><h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.p }}>Compétences</h2><div className="flex flex-wrap gap-2">{allSkills.map((s: string, i: number) => <span key={i} className={`${ts} px-2.5 py-1 rounded-full`} style={{ backgroundColor: c.a20 }}>{sanitizeText(s)}</span>)}</div></section>}
                        {experiences.length > 0 && (
                            <section><h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: c.p }}>Expérience</h2><div className="space-y-4">
                                {experiences.map((exp: any, idx: number) => (
                                    <article key={idx} className="pl-3 border-l-2" style={{ borderColor: c.p }}>
                                        <div className="flex justify-between gap-2"><div><h3 className="font-bold text-sm">{sanitizeText(exp.poste)}</h3>{isValidEntreprise(exp.entreprise) ? <p className={ts} style={{ color: c.s }}>{sanitizeText(exp.entreprise)}{exp.lieu ? ` · ${exp.lieu}` : ""}</p> : exp.lieu ? <p className={ts} style={{ color: c.s }}>{exp.lieu}</p> : null}</div><span className={`${ts} text-gray-500`}>{exp.date_debut ? `${exp.date_debut}${exp.date_fin ? ` – ${exp.date_fin}` : " – Présent"}` : ""}</span></div>
                                        {exp.realisations?.length > 0 && <ul className={`mt-1 ${ts} text-gray-600 space-y-0.5`}>{exp.realisations.slice(0, limits.maxRealisationsPerExp).map((r: string, ri: number) => <li key={ri} className="flex gap-2"><span style={{ color: c.p }}>•</span>{sanitizeText(r)}</li>)}</ul>}
                                        {exp.clients?.length > 0 && <p className={`mt-1 ${ts} text-gray-500`}>Clients : {exp.clients.slice(0, limits.maxClientsPerExp).join(", ")}</p>}
                                    </article>
                                ))}
                            </div></section>
                        )}
                        {projects.length > 0 && <section><h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.p }}>Projets</h2><div className="grid grid-cols-2 gap-2">{projects.slice(0, limits.maxProjects).map((p: any, i: number) => <article key={i} className="p-2 rounded" style={{ backgroundColor: c.a10 }}><h3 className="font-bold text-sm">{sanitizeText(p.nom)}</h3>{p.description && <p className={`${ts} text-gray-600`}>{sanitizeText(p.description)}</p>}</article>)}</div></section>}
                    </div>
                    <div className="space-y-5">
                        {formations.length > 0 && <section><h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.p }}>Formation</h2>{formations.slice(0, limits.maxFormations).map((f: any, i: number) => <article key={i} className="mb-2"><h3 className="font-bold text-sm">{sanitizeText(f.diplome)}</h3><p className={`${ts} text-gray-600`}>{sanitizeText(f.etablissement)} {f.annee}</p></article>)}</section>}
                        {langues.length > 0 && <section><h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.p }}>Langues</h2>{langues.slice(0, limits.maxLangues).map((l: any, i: number) => <div key={i} className="flex justify-between text-sm mb-1"><span>{l.langue}</span><span className={`${ts} px-2 py-0.5 rounded`} style={{ backgroundColor: c.a20 }}>{l.niveau}</span></div>)}</section>}
                        {certifications.length > 0 && <section><h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.p }}>Certifications</h2><ul className={`${ts} space-y-0.5`}>{certifications.slice(0, limits.maxCertifications).map((cert: string, i: number) => <li key={i} className="flex gap-2"><span style={{ color: c.p }}>✓</span>{sanitizeText(cert)}</li>)}</ul></section>}
                        {(clientsReferences?.clients?.length ?? 0) > 0 && <section><h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.p }}>Références</h2><div className="flex flex-wrap gap-1">{(clientsReferences?.clients ?? []).slice(0, limits.maxClientsReferences).map((client: string, i: number) => <span key={i} className={`${ts} px-1.5 py-0.5 rounded border`} style={{ borderColor: c.a50 }}>{client}</span>)}</div></section>}
                    </div>
                </div>
            </div>
        </div>
    );
}
