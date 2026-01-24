import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mes CVs - CV Crush",
    description: "Gérez vos CVs générés et téléchargez-les dans différents formats",
};

export default function CVsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
