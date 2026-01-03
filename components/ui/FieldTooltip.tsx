"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface FieldTooltipProps {
    content: string;
    children?: React.ReactNode;
}

export function FieldTooltip({ content, children }: FieldTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children || (
                        <button type="button" className="inline-flex items-center ml-1">
                            <Info className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                        </button>
                    )}
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs text-sm">{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
