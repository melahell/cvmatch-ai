import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileById, getAllCharacterMetas } from "@/lib/data/demo";

// Generate static params for all available characters
export async function generateStaticParams() {
    const characters = getAllCharacterMetas();
    return characters.map((char) => ({
        character: char.id,
    }));
}

// Generate metadata for each character page
export async function generateMetadata({
    params
}: {
    params: Promise<{ character: string }>
}): Promise<Metadata> {
    const { character } = await params;
    const profile = getProfileById(character);

    if (!profile) {
        return {
            title: "Personnage non trouvé | CV Crush",
        };
    }

    return {
        title: `CV de ${profile.meta.name} généré par IA | CV Crush`,
        description: `Le parcours de ${profile.meta.name} (${profile.meta.title}, ${profile.meta.period}) transformé en CV moderne par IA. Score ${profile.completenessScore}/100, 4 templates, 10 jobs identifiés.`,
        openGraph: {
            title: `CV de ${profile.meta.name} généré par IA`,
            description: `Découvrez comment l'IA transforme le parcours de ${profile.meta.shortName} en CV professionnel prêt pour 2025.`,
            images: [`/og/demo-${character}.png`],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `CV de ${profile.meta.name} | Musée des CVs Impossibles`,
            description: `${profile.meta.title} • Score ${profile.completenessScore}/100 • 4 CVs téléchargeables`,
        },
    };
}

import CharacterProfileClient from "./page.client";

export default async function CharacterProfilePage({
    params
}: {
    params: Promise<{ character: string }>
}) {
    const { character } = await params;
    const profile = getProfileById(character);

    if (!profile) {
        notFound();
    }

    return <CharacterProfileClient profile={profile} />;
}
