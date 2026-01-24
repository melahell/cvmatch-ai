import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mon profil - CV Crush",
    description: "Gérez votre profil professionnel, vos documents et vos compétences",
};

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
