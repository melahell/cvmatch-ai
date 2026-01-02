"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugRAGPage() {
    const { userId } = useAuth();
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<any>(null);

    const testRAG = async () => {
        setTesting(true);
        setResult(null);

        try {
            const res = await fetch("/api/debug/test-rag", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            const data = await res.json();
            setResult(data);
        } catch (e: any) {
            setResult({ error: e.message });
        }

        setTesting(false);
    };

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>🔍 Test Génération RAG</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={testRAG} disabled={testing}>
                        {testing ? "Test en cours..." : "Tester Gemini RAG"}
                    </Button>

                    {result && (
                        <div className="mt-6">
                            <h3 className="font-bold mb-2">Résultat :</h3>
                            <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto max-h-[600px]">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
