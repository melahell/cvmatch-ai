import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface Goal {
    id: string;
    type: "applications" | "analyses" | "cv";
    target: number;
    current: number;
    deadline: string;
    label: string;
}

interface GoalTrackerProps {
    goals: Goal[];
}

export function GoalTracker({ goals }: GoalTrackerProps) {
    if (goals.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-sm">Objectifs de la semaine</h3>
                </div>
                <div className="space-y-3">
                    {goals.map((goal) => {
                        const progress = (goal.current / goal.target) * 100;
                        const isComplete = progress >= 100;

                        return (
                            <div key={goal.id} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-600">{goal.label}</span>
                                    <span className={isComplete ? "text-green-600 font-semibold" : "text-slate-600"}>
                                        {goal.current} / {goal.target}
                                    </span>
                                </div>
                                <Progress value={Math.min(progress, 100)} className="h-2" />
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
