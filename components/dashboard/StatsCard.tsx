import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

/**
 * StatsCard Component - CV Crush Design System
 *
 * Carte statistique avec design tokens.
 * Utilise Card (design system) + couleurs sémantiques.
 *
 * Features:
 * - Design tokens uniquement (semantic colors)
 * - Hover lift effect
 * - Support Link
 */
interface StatsCardProps {
    value?: number;
    label?: string;
    color?: "primary" | "success" | "warning" | "neutral";
    icon?: LucideIcon;
    href?: string;
    children?: React.ReactNode;
}

export function StatsCard({
    value,
    label,
    color = "primary",
    icon: Icon,
    href,
    children
}: StatsCardProps) {
    // Design tokens - couleurs sémantiques
    const colorClasses = {
        primary: "text-neon-purple",
        success: "text-semantic-success",
        warning: "text-semantic-warning",
        neutral: "text-cvText-secondary"
    };

    const content = (
        <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 text-center h-full">
            {children || (
                <>
                    {Icon && <Icon className="w-6 h-6 mb-2 text-cvText-secondary" />}
                    <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 ${colorClasses[color]}`}>
                        {value}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-cvText-secondary">{label}</div>
                </>
            )}
        </CardContent>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full">
                <Card hover="lift" className="cursor-pointer h-full">
                    {content}
                </Card>
            </Link>
        );
    }

    return <Card className="h-full">{content}</Card>;
}
