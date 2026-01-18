import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ErrorDisplayProps {
    error: Error | string;
    retry?: () => void;
    variant?: 'inline' | 'card' | 'page';
    title?: string;
}

/**
 * Unified error display component
 * Provides consistent error UI across the application
 * 
 * @param error - Error object or error message string
 * @param retry - Optional retry callback function
 * @param variant - Display style: 'inline' (alert), 'card', or 'page' (full-page error)
 * @param title - Optional custom title (defaults based on variant)
 */
export function ErrorDisplay({
    error,
    retry,
    variant = 'inline',
    title
}: ErrorDisplayProps) {
    const message = typeof error === 'string' ? error : error.message;

    // Full-page error display
    if (variant === 'page') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                <XCircle className="h-16 w-16 text-destructive mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                    {title || 'Une erreur est survenue'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                    {message}
                </p>
                {retry && (
                    <Button onClick={retry} variant="primary">
                        Réessayer
                    </Button>
                )}
            </div>
        );
    }

    // Card-style error display
    if (variant === 'card') {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <h4 className="font-semibold">
                            {title || 'Erreur'}
                        </h4>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{message}</p>
                    {retry && (
                        <Button onClick={retry} size="sm" variant="outline">
                            Réessayer
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Inline alert display (default)
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title || 'Erreur'}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
                <span>{message}</span>
                {retry && (
                    <Button onClick={retry} size="sm" variant="ghost" className="ml-4">
                        Réessayer
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}

/**
 * Success message display component
 */
export function SuccessDisplay({
    message,
    title = 'Succès',
    variant = 'inline'
}: {
    message: string;
    title?: string;
    variant?: 'inline' | 'card';
}) {
    if (variant === 'card') {
        return (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                            {title}
                        </h4>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">{title}</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
                {message}
            </AlertDescription>
        </Alert>
    );
}

/**
 * Info message display component
 */
export function InfoDisplay({
    message,
    title = 'Information'
}: {
    message: string;
    title?: string;
}) {
    return (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}
