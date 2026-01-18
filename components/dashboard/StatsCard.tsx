import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    value?: number;
    label?: string;
    color?: "blue" | "purple" | "green" | "slate";
    icon?: LucideIcon;
    href?: string;
    children?: React.ReactNode;
}

export function StatsCard({
    value,
    label,
    color = "blue",
    icon: Icon,
    href,
    children
}: StatsCardProps) {
    const colorClasses = {
        blue: "text-blue-600",
        purple: "text-purple-600",
        green: "text-green-600",
        slate: "text-slate-600"
    };

    const content = (
        <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 text-center h-full">
            {children || (
                <>
                    {Icon && <Icon className="w-6 h-6 mb-2 text-slate-600" />}
                    <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 ${colorClasses[color]}`}>
                        {value}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-slate-600">{label}</div>
                </>
            )}
        </CardContent>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full">
                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    {content}
                </Card>
            </Link>
        );
    }

    return <Card className="h-full">{content}</Card>;
}
