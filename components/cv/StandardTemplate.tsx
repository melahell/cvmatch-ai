
import React from "react";

interface CVProps {
    data: any; // Using any for POC speed, strictly should match RAG schema
}

export const StandardTemplate: React.FC<CVProps> = ({ data }) => {
    if (!data || !data.profil) return <div>No data</div>;

    const { profil, experiences, competences, formations, langues } = data;

    return (
        <div className="w-[210mm] h-[297mm] overflow-hidden bg-white text-slate-800 p-8 mx-auto shadow-xl print:shadow-none print:m-0" id="cv-content">

            {/* HEADER */}
            <header className="border-b-2 border-slate-800 pb-6 mb-6 break-inside-avoid">
                <h1 className="text-4xl font-bold uppercase tracking-wide text-slate-900">
                    {profil.prenom} {profil.nom}
                </h1>
                <h2 className="text-xl text-blue-700 font-semibold mt-2">
                    {profil.titre_principal}
                </h2>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                    {profil.contact?.email && (
                        <div className="flex items-center gap-1">
                            <span>✉</span> {profil.contact.email}
                        </div>
                    )}
                    {profil.contact?.telephone && (
                        <div className="flex items-center gap-1">
                            <span>☎</span> {profil.contact.telephone}
                        </div>
                    )}
                    {profil.localisation && (
                        <div className="flex items-center gap-1">
                            <span>📍</span> {profil.localisation}
                        </div>
                    )}
                    {profil.contact?.linkedin && (
                        <div className="flex items-center gap-1">
                            <span>💼</span>
                            <span className="truncate max-w-[150px]">{profil.contact.linkedin}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* SUMMARY */}
            {profil.elevator_pitch && (
                <section className="mb-6 break-inside-avoid">
                    <p className="text-slate-700 leading-relaxed italic border-l-4 border-slate-200 pl-4">
                        "{profil.elevator_pitch}"
                    </p>
                </section>
            )}

            <div className="grid grid-cols-3 gap-6 break-inside-avoid">

                {/* LEFT COLUMN (Main Content) */}
                <div className="col-span-2 space-y-6">

                    {/* EXPERIENCE */}
                    <section className="break-inside-avoid">
                        <h3 className="text-lg font-bold uppercase border-b border-slate-300 pb-1 mb-3 text-slate-900">
                            Expérience Professionnelle
                        </h3>
                        <div className="space-y-4">
                            {experiences?.map((exp: any, i: number) => (
                                <div key={i} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-slate-800">{exp.poste}</h4>
                                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                            {exp.debut} - {exp.actuel ? "Présent" : exp.fin}
                                        </span>
                                    </div>
                                    <div className="text-sm font-semibold text-blue-700 mb-1">{exp.entreprise}</div>
                                    <ul className="list-disc list-outside ml-4 mt-1 space-y-1">
                                        {exp.realisations?.map((real: any, j: number) => (
                                            <li key={j} className="text-sm text-slate-700 leading-snug">
                                                {real.description || real}
                                                {real.impact && <span className="font-semibold text-slate-900"> — {real.impact}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* PROJECTS (If any, mostly technical) */}
                    {/* Omitted for POC standard template simplicity unless data present */}

                </div>

                {/* RIGHT COLUMN (Sidebar) */}
                <div className="col-span-1 space-y-6">

                    {/* SKILLS */}
                    <section className="break-inside-avoid">
                        <h3 className="text-lg font-bold uppercase border-b border-slate-300 pb-1 mb-3 text-slate-900">
                            Compétences
                        </h3>

                        {/* Technical */}
                        {competences?.techniques && (
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Techniques</h4>
                                <div className="flex flex-wrap gap-2">
                                    {competences.techniques.map((skill: string, i: number) => (
                                        <span key={i} className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Soft Skills */}
                        {competences?.soft_skills && (
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Soft Skills</h4>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    {competences.soft_skills.map((skill: string, i: number) => (
                                        <li key={i}>• {skill}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </section>

                    {/* EDUCATION */}
                    <section className="break-inside-avoid">
                        <h3 className="text-lg font-bold uppercase border-b border-slate-300 pb-1 mb-3 text-slate-900">
                            Formation
                        </h3>
                        <div className="space-y-3">
                            {formations?.map((edu: any, i: number) => (
                                <div key={i}>
                                    <div className="font-bold text-sm text-slate-800">{edu.diplome}</div>
                                    <div className="text-xs text-slate-600">{edu.ecole}</div>
                                    <div className="text-xs text-slate-400">{edu.annee}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* LANGUAGES */}
                    <section className="break-inside-avoid">
                        <h3 className="text-lg font-bold uppercase border-b border-slate-300 pb-1 mb-3 text-slate-900">
                            Langues
                        </h3>
                        <ul className="space-y-2">
                            {Object.entries(langues || {}).map(([lang, level]: any, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700">{lang}</span>
                                    <span className="text-slate-500">{level}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                </div>
            </div>
        </div>
    );
};
