import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Upload } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    const actions = [
        {
            icon: Briefcase,
            label: "Nouvelle Analyse",
            href: "/dashboard/analyze",
            color: "bg-blue-50 text-blue-600 hover:bg-blue-100"
        },
        {
            icon: FileText,
            label: "Générer CV",
            href: "/dashboard/tracking",
            color: "bg-purple-50 text-purple-600 hover:bg-purple-100"
        },
        {
            icon: Upload,
            label: "Upload Doc",
            href: "/dashboard/profile?tab=docs",
            color: "bg-green-50 text-green-600 hover:bg-green-100"
        }
    ];

    return (
        <Card>
            <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">Actions rapides</h3>
                <div className="grid grid-cols-3 gap-2">
                    {actions.map((action) => (
                        <Link key={action.label} href={action.href}>
                            <Button
                                variant="ghost"
                                className={`w-full h-20 flex flex-col items-center justify-center gap-2 ${action.color}`}
                            >
                                <action.icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{action.label}</span>
                            </Button>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
