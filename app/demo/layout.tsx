import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Le Musée des CVs Impossibles | CV Crush",
    description: "Découvrez 10 CVs de personnages historiques générés par IA. De Michel-Ange à Ada Lovelace, voyez la puissance de CV Crush.",
    openGraph: {
        title: "Le Musée des CVs Impossibles | CV Crush",
        description: "Découvrez comment l'IA transforme 10 parcours extraordinaires en CVs et lettres de motivation prêts pour 2025.",
        images: ["/og/demo-museum.png"],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Le Musée des CVs Impossibles",
        description: "10 personnages historiques. 40 CVs générés par IA. 0 inscription requise.",
    },
};

export default function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {children}
        </div>
    );
}
