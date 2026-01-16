"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorRecoveryProps {
    error: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

export function ErrorRecovery({ error, onRetry, onDismiss }: ErrorRecoveryProps) {
    return (
        <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Une erreur est survenue</AlertTitle>
            <AlertDescription className="mt-2">
                <p className="mb-4">{error}</p>
                <div className="flex gap-2">
                    {onRetry && (
                        <Button variant="outline" size="sm" onClick={onRetry}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Réessayer
                        </Button>
                    )}
                    {onDismiss && (
                        <Button variant="ghost" size="sm" onClick={onDismiss}>
                            Ignorer
                        </Button>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
}
