import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Clock, FileText, Upload, Briefcase } from "lucide-react";
import { formatRelativeDate } from "@/lib/formatters";

interface Activity {
    id: string;
    type: "analysis" | "cv" | "upload";
    title: string;
    timestamp: string;
}

interface RecentActivityProps {
    activities?: Activity[];
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "analysis": return <Briefcase className="w-4 h-4" />;
            case "cv": return <FileText className="w-4 h-4" />;
            case "upload": return <Upload className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (activities.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-sm text-slate-600">
                    Aucune activité récente
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-full text-blue-600 flex-shrink-0">
                                {getIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className="text-sm font-medium text-slate-700 truncate" title={activity.title}>
                                                {activity.title}
                                            </p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{activity.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <p className="text-xs text-slate-600">
                                    {formatRelativeDate(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
