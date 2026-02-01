import { describe, it, expect } from "vitest";
import { mergeRAGUserUpdate } from "@/lib/rag/merge-user-update";

describe("mergeRAGUserUpdate", () => {
    it("doit préserver une storage ref photo si l’update contient une URL non-storage", () => {
        const existing = {
            profil: { photo_url: "storage:profile-photos:avatars/user-1/1.jpg", prenom: "G" },
        };
        const incoming = {
            profil: { photo_url: "https://signed.example.com/photo.jpg?token=abc" },
            score: 42,
            topJobs: [],
            photo_url: "https://ui.example.com/photo.jpg",
        };
        const merged = mergeRAGUserUpdate(existing, incoming);
        expect(merged.profil.photo_url).toBe(existing.profil.photo_url);
        expect((merged as any).score).toBeUndefined();
        expect((merged as any).topJobs).toBeUndefined();
        expect((merged as any).photo_url).toBeUndefined();
    });

    it("doit accepter une nouvelle storage ref photo", () => {
        const existing = {
            profil: { photo_url: "storage:profile-photos:avatars/user-1/1.jpg" },
        };
        const incoming = {
            profil: { photo_url: "storage:profile-photos:avatars/user-1/2.jpg" },
        };
        const merged = mergeRAGUserUpdate(existing, incoming);
        expect(merged.profil.photo_url).toBe(incoming.profil.photo_url);
    });
});

