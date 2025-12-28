
"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Segment Error:", error);
    }, [error]);

    return (
        <div className="container mx-auto py-20 px-4 flex items-center justify-center min-h-[50vh]">
            <Card className="max-w-lg w-full shadow-lg border-red-100">
                <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={24} />
                    </div>
                    <CardTitle className="text-xl text-red-600">Erreur de chargement</CardTitle>
                    <CardDescription>
                        Nous n'avons pas pu charger cette section correctement.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <p className="text-sm text-slate-500">
                        {error.message || "Une erreur inconnue s'est produite."}
                    </p>
                    <Button onClick={() => reset()} variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Réessayer
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
