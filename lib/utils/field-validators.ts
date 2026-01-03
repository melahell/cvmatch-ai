import { personalInfoSchema, experienceSchema, formationSchema, skillSchema } from "@/lib/validations/profile";

export function validateEmail(email: string): string | null {
    try {
        personalInfoSchema.shape.email.parse(email);
        return null;
    } catch {
        return "Email invalide";
    }
}

export function validatePhone(phone: string): string | null {
    if (!phone) return null; // Optional
    try {
        personalInfoSchema.shape.telephone.parse(phone);
        return null;
    } catch {
        return "Format téléphone invalide (ex: +33 6 12 34 56 78)";
    }
}

export function validateExperienceDates(dateDebut: string, dateFin?: string): string | null {
    if (!dateFin) return null;

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (fin < debut) {
        return "La date de fin doit être après la date de début";
    }

    return null;
}

export function validateURL(url: string): string | null {
    if (!url) return null; // Optional
    try {
        new URL(url);
        return null;
    } catch {
        return "URL invalide (doit commencer par http:// ou https://)";
    }
}

export function validateRequired(value: any, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} est requis`;
    }
    return null;
}
