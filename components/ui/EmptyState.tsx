"use client";

import { FileX } from "lucide-react";

interface EmptyStateProps {
    icon?: React.ReactNode;
    message: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    message,
    action,
    className = ""
}: EmptyStateProps) {
    return (
        <div className={`text-center py-12 ${className}`}>
            <div className="flex flex-col items-center gap-3">
                <div className="text-slate-600 mb-2">
                    {icon || <FileX className="w-12 h-12" />}
                </div>
                <p className="text-sm text-slate-600 font-medium">{message}</p>
                {action && <div className="mt-2">{action}</div>}
            </div>
        </div>
    );
}

export default EmptyState;
