import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Suivi candidatures - CV Crush",
    description: "Suivez l'état de vos candidatures et gérez vos offres d'emploi analysées",
};

export default function TrackingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
