"use client";

import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function ProfileEmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                {icon || <FileText className="w-8 h-8 text-slate-600" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
            {action && (
                <Button onClick={action.onClick} variant="outline">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
