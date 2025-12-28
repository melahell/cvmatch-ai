
"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error detected:", error);
    }, [error]);

    return (
        <html>
            <body className="antialiased min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Oups, une erreur inattendue est survenue
                        </h2>
                        <p className="text-slate-500">
                            Nos ingénieurs ont été notifiés. Essaie de recharger la page.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-left">
                        <p className="text-xs font-mono text-slate-400 break-all">
                            {error.digest && `Digest: ${error.digest}`}
                        </p>
                    </div>

                    <Button
                        onClick={() => reset()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Recharger l'application
                    </Button>
                </div>
            </body>
        </html>
    );
}
