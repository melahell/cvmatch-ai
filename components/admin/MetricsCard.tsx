"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    subtitle?: string;
    trend?: {
        value: number;
        label: string;
    };
}

export function MetricsCard({
    title,
    value,
    icon: Icon,
    subtitle,
    trend,
}: MetricsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5" />}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                {subtitle && (
                    <div className="text-sm text-slate-600 mt-2">{subtitle}</div>
                )}
                {trend && (
                    <div className="text-sm mt-2">
                        <span className={trend.value > 0 ? "text-green-600" : "text-red-600"}>
                            {trend.value > 0 ? "+" : ""}
                            {trend.value}%
                        </span>
                        <span className="text-slate-600 ml-1">{trend.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
