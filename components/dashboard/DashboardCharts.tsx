"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardChartsProps {
    scoreHistory?: Array<{ date: string; score: number }>;
    analysesPerMonth?: Array<{ month: string; count: number }>;
}

export function DashboardCharts({ scoreHistory = [], analysesPerMonth = [] }: DashboardChartsProps) {
    // Placeholder data if none provided
    const defaultScoreHistory = [
        { date: "Jan", score: 45 },
        { date: "Fév", score: 52 },
        { date: "Mar", score: 61 },
        { date: "Avr", score: 75 },
    ];

    const dataToUse = scoreHistory.length > 0 ? scoreHistory : defaultScoreHistory;

    return (
        <div className="grid md:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Évolution du score</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={dataToUse}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Analyses par mois</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[200px] text-sm text-slate-600">
                    {analysesPerMonth.length > 0 ? (
                        <p>Graphique à venir</p>
                    ) : (
                        <p>Pas assez de données</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
