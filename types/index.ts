export interface UserProfile {
    profil: {
        prenom: string;
        nom: string;
        titre_principal: string;
        localisation: string;
        elevator_pitch: string;
        contact: {
            email: string;
            telephone: string;
            linkedin?: string;
        };
    };
    experiences: Array<{
        poste: string;
        entreprise: string;
        debut: string;
        fin?: string;
        actuel: boolean;
        realisations: Array<{ description: string; impact: string }>;
        technologies: string[];
    }>;
    competences: {
        techniques: string[];
        soft_skills: string[];
    };
    formations: Array<{
        diplome: string;
        ecole: string;
        annee: string;
    }>;
    langues: Record<string, string>;
}

export interface JobAnalysis {
    id: string;
    user_id: string;
    job_url?: string;
    job_description: string;
    match_score: number;
    match_level: "Excellent" | "Très bon" | "Bon" | "Moyen" | "Faible";
    match_report: {
        match_score: number;
        match_level: string;
        recommendation: string;
        strengths: Array<{ point: string; match_percent: number }>;
        gaps: Array<{ point: string; severity: string; suggestion: string }>;
        missing_keywords: string[];
        key_insight: string;
    };
    submitted_at: string;
    application_status: "pending" | "applied" | "interviewing" | "rejected" | "offer";
    company?: string;
    location?: string;
    job_title?: string;
    cv_generated?: boolean;
    cv_url?: string;
}

export interface CVData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        linkedin: string;
        location: string;
        title: string;
        summary: string;
    };
    skills: {
        hard: string[];
        soft: string[];
        tools: string[];
    };
    experience: Array<{
        title: string;
        company: string;
        dates: string;
        description: string;
        achievements: string[];
    }>;
    education: Array<{
        degree: string;
        school: string;
        year: string;
    }>;
    languages: string[];
    interests: string[];
}
