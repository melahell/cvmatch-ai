import { describe, it, expect } from "vitest";
import { preserveUserFieldsOnRegeneration } from "@/lib/rag/preserve-user-fields";

describe("preserveUserFieldsOnRegeneration", () => {
    it("doit préserver photo_url et references.clients si absents du nouveau RAG", () => {
        const prev = {
            profil: { photo_url: "storage:profile-photos:avatars/user-1/1.jpg" },
            references: { clients: [{ nom: "BNP Paribas", secteur: "Finance" }] },
            rejected_inferred: ["x"],
        };
        const next = { profil: { prenom: "G" }, references: {} };
        const out = preserveUserFieldsOnRegeneration(prev, next);
        expect(out.profil.photo_url).toBe(prev.profil.photo_url);
        expect(out.references.clients).toEqual(prev.references.clients);
        expect(out.rejected_inferred).toEqual(prev.rejected_inferred);
    });

    it("ne doit pas écraser des clients/photo déjà présents", () => {
        const prev = {
            profil: { photo_url: "storage:profile-photos:avatars/user-1/1.jpg" },
            references: { clients: [{ nom: "BNP Paribas", secteur: "Finance" }] },
        };
        const next = {
            profil: { photo_url: "storage:profile-photos:avatars/user-1/2.jpg" },
            references: { clients: [{ nom: "Chanel", secteur: "Luxe" }] },
        };
        const out = preserveUserFieldsOnRegeneration(prev, next);
        expect(out.profil.photo_url).toBe(next.profil.photo_url);
        expect(out.references.clients).toEqual(next.references.clients);
    });
});

