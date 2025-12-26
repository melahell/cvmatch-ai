import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CVMatch AI - CV intelligent avec analyse de match",
    description: "Génère le CV parfait pour chaque offre d'emploi grâce à l'IA",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
          <html lang="fr">
                <body className="antialiased">{children}</body>body>
          </html>html>
        );
}</html>
