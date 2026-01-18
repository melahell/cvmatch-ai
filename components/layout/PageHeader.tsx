"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string;
    backLabel?: string;
    actions?: React.ReactNode;
}

export function PageHeader({
    title,
    subtitle,
    backHref,
    backLabel = "Retour",
    actions
}: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                {backHref && (
                    <Link href={backHref}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {backLabel}
                        </Button>
                    </Link>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-slate-600">{subtitle}</p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

export default PageHeader;
