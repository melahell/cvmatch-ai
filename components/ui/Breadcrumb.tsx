"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
    items: Array<{
        label: string;
        href?: string;
    }>;
    className?: string;
}

/**
 * Unified breadcrumb component for all dashboard pages
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav className={cn("flex items-center gap-1 text-sm text-slate-500 mb-4", className)}>
            {items.map((item, index) => (
                <span key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                    {item.href ? (
                        <a href={item.href} className="hover:text-blue-600 transition-colors">
                            {item.label}
                        </a>
                    ) : (
                        <span className="text-slate-700 font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
