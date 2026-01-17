import type { Metadata } from "next";
import LandingPageClient from "./page.client";

export const metadata: Metadata = {
    title: "CV Crush - Créez des CVs IA personnalisés pour chaque offre d'emploi",
    description: "Analysez vos chances de recrutement avec l'IA, générez des CVs sur-mesure optimisés pour chaque offre et suivez vos candidatures. Boostez votre recherche d'emploi avec CV Crush.",
    keywords: ["cv", "ia", "emploi", "recrutement", "candidature", "cv personnalisé", "intelligence artificielle", "recherche emploi"],
    openGraph: {
        title: "CV Crush - CVs IA personnalisés pour maximiser vos chances",
        description: "Analysez vos chances de recrutement avec l'IA et générez des CVs optimisés pour chaque offre d'emploi",
        url: "https://cvcrush.fr",
        siteName: "CV Crush",
        locale: "fr_FR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "CV Crush - CVs IA personnalisés",
        description: "Boostez votre recherche d'emploi avec des CVs optimisés par l'IA",
    },
    alternates: {
        canonical: "https://cvcrush.fr",
    },
};

export default function LandingPage() {
    return <LandingPageClient />;
}
