import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

interface Recommendation {
    id: string;
    text: string;
    impact: "high" | "medium" | "low";
}

interface RecommendationsProps {
    score: number;
    breakdown?: any[];
}

export function Recommendations({ score, breakdown = [] }: RecommendationsProps) {
    const recommendations: Recommendation[] = [];

    // Generate recommendations based on score and missing items
    if (score < 100) {
        const missingItems = breakdown.filter(item => item.missing);
        missingItems.slice(0, 3).forEach((item, i) => {
            recommendations.push({
                id: `missing-${i}`,
                text: `Ajoutez ${item.missing.toLowerCase()} pour +${Math.floor(Math.random() * 10 + 5)} points`,
                impact: i === 0 ? "high" : "medium"
            });
        });
    }

    if (score < 50) {
        recommendations.push({
            id: "complete-profile",
            text: "Complétez votre profil pour débloquer l'analyse IA",
            impact: "high"
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            id: "perfect",
            text: "Profil optimal ! Lancez des analyses pour trouver votre job",
            impact: "low"
        });
    }

    const impactColors = {
        high: "bg-red-100 text-red-700 border-red-200",
        medium: "bg-amber-100 text-amber-700 border-amber-200",
        low: "bg-green-100 text-green-700 border-green-200"
    };

    return (
        <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm text-blue-900 mb-2">
                            Recommandations
                        </h3>
                        <div className="space-y-2">
                            {recommendations.map((rec) => (
                                <div key={rec.id} className="flex items-start gap-2">
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${impactColors[rec.impact]}`}
                                    >
                                        {rec.impact === "high" ? "Important" : rec.impact === "medium" ? "Utile" : "Bonus"}
                                    </Badge>
                                    <p className="text-xs text-slate-700 flex-1">{rec.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
