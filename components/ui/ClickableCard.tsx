import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ReactNode } from "react";

interface ClickableCardProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export function ClickableCard({
    href,
    children,
    className = ""
}: ClickableCardProps) {
    return (
        <Link href={href} className="block h-full">
            <Card className={`cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${className}`}>
                {children}
            </Card>
        </Link>
    );
}
