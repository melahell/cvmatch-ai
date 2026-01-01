"use client";

import { FileX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                {icon || <FileX className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
            )}
            {actionLabel && (actionHref || onAction) && (
                actionHref ? (
                    <Link href={actionHref}>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            {actionLabel}
                        </Button>
                    </Link>
                ) : (
                    <Button onClick={onAction} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {actionLabel}
                    </Button>
                )
            )}
        </div>
    );
}

export default EmptyState;
