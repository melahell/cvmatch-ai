import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analyser une offre - CV Crush",
    description: "Analysez vos chances avec l'IA et générez un CV personnalisé pour chaque offre d'emploi",
};

export default function AnalyzeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
