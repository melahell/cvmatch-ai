import { toast } from "sonner";

export function showProfileSuccessFeedback(action: string, details?: {
    itemsAdded?: number;
    itemsUpdated?: number;
    itemsDeleted?: number;
    section?: string;
}): void {
    let message = "";

    switch (action) {
        case "experience_added":
            message = `✅ ${details?.itemsAdded || 1} expérience(s) ajoutée(s)`;
            break;
        case "skill_added":
            message = `✅ ${details?.itemsAdded || 1} compétence(s) ajoutée(s)`;
            break;
        case "formation_added":
            message = `✅ ${details?.itemsAdded || 1} formation(s) ajoutée(s)`;
            break;
        case "profile_updated":
            message = `✅ ${details?.section || "Profil"} mis à jour`;
            break;
        case "photo_uploaded":
            message = "✅ Photo de profil mise à jour";
            break;
        case "item_deleted":
            message = `🗑️ ${details?.itemsDeleted || 1} élément(s) supprimé(s)`;
            break;
        case "bulk_update":
            message = `✅ ${details?.itemsUpdated || 0} éléments mis à jour`;
            break;
        default:
            message = "✅ Modifications enregistrées";
    }

    toast.success(message, {
        duration: 3000,
        position: "top-right"
    });
}

export function showProfileErrorFeedback(error: string): void {
    toast.error(`❌ ${error}`, {
        duration: 5000,
        position: "top-right"
    });
}
