export interface AutoSaveDraft {
    mode: "url" | "text" | "file";
    content: string;
    fileName?: string;
    timestamp: number;
}

const DRAFT_KEY = "analyze_draft";

export function saveDraft(draft: Omit<AutoSaveDraft, "timestamp">): void {
    const draftWithTimestamp: AutoSaveDraft = {
        ...draft,
        timestamp: Date.now()
    };

    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftWithTimestamp));
    } catch (e) {
        console.error("Failed to save draft:", e);
    }
}

export function loadDraft(): AutoSaveDraft | null {
    try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (!saved) return null;

        const draft = JSON.parse(saved) as AutoSaveDraft;

        // Expire after 24 hours
        if (Date.now() - draft.timestamp > 24 * 60 * 60 * 1000) {
            clearDraft();
            return null;
        }

        return draft;
    } catch (e) {
        console.error("Failed to load draft:", e);
        return null;
    }
}

export function clearDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
}
