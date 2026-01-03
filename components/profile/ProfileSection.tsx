import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ReactNode } from "react";

interface ProfileSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
    loading?: boolean;
    className?: string;
}

export function ProfileSection({
    title,
    description,
    children,
    actions,
    loading = false,
    className = ""
}: ProfileSectionProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : (
                    children
                )}
            </CardContent>
            {actions && (
                <CardFooter className="flex justify-end gap-2">
                    {actions}
                </CardFooter>
            )}
        </Card>
    );
}
