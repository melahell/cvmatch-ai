import { describe, it, expect } from "vitest";
import { convertAndSort } from "@/lib/cv/ai-adapter";

describe("convertAndSort - clients fallback", () => {
    it("doit garder un client même s’il est identique à l’entreprise (fallback)", () => {
        const envelope: any = {
            profil_summary: { prenom: "G", nom: "G", titre_principal: "PMO" },
            job_context: {},
            widgets: [
                {
                    id: "w0",
                    type: "experience_header",
                    section: "experiences",
                    text: "PMO - Société Générale",
                    relevance_score: 10,
                    sources: { rag_experience_id: "exp1" },
                },
            ],
        };
        const ragProfile: any = {
            profil: { prenom: "G", nom: "G", titre_principal: "PMO" },
            experiences: [
                {
                    id: "exp1",
                    poste: "PMO",
                    entreprise: "Société Générale",
                    debut: "2020-01",
                    fin: "2021-01",
                    clients_references: ["Société Générale"],
                    realisations: [{ description: "A" }],
                },
            ],
            references: { clients: [] },
        };

        const cv = convertAndSort(envelope, { ragProfile, minScore: 0 });
        expect(cv.experiences.length).toBeGreaterThan(0);
        expect(cv.experiences[0].clients?.length || 0).toBeGreaterThan(0);
    });

    it("doit produire un grouping secteurs si le RAG fournit des secteurs", () => {
        const envelope: any = {
            profil_summary: { prenom: "G", nom: "G", titre_principal: "PMO" },
            job_context: {},
            widgets: [
                {
                    id: "w0",
                    type: "summary_block",
                    section: "summary",
                    text: "Résumé",
                    relevance_score: 10,
                    sources: { rag_path: "profil" },
                },
            ],
        };
        const ragProfile: any = {
            profil: { prenom: "G", nom: "G", titre_principal: "PMO" },
            experiences: [],
            references: { clients: [{ nom: "Chanel", secteur: "Luxe" }, { nom: "BNP Paribas", secteur: "Finance" }] },
        };

        const cv = convertAndSort(envelope, { ragProfile, minScore: 0 });
        expect(cv.clients_references?.clients || []).toContain("Chanel");
        expect((cv.clients_references?.secteurs || []).length).toBeGreaterThan(0);
    });
});
