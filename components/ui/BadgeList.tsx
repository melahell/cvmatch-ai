import { Badge } from "@/components/ui/badge";

interface BadgeListProps {
    items: any[];
    maxItems?: number;
    // Aligned with Badge component variants
    variant?: "primary" | "success" | "warning" | "error" | "info" | "neutral" | "outline";
    className?: string;
    extractLabel?: (item: any) => string;
}

export function BadgeList({
    items,
    maxItems = 5,
    variant = "neutral", // Changed from "secondary" to valid Badge variant
    className = "",
    extractLabel = (item) => typeof item === "string" ? item : item.nom || item.name || String(item)
}: BadgeListProps) {
    const visible = items.slice(0, maxItems);
    const remaining = items.length - maxItems;

    return (
        <div className={`flex flex-wrap gap-1 ${className}`}>
            {visible.map((item, i) => (
                <Badge key={i} variant={variant} className="text-xs">
                    {extractLabel(item)}
                </Badge>
            ))}
            {remaining > 0 && (
                <Badge variant="outline" className="text-xs">
                    +{remaining}
                </Badge>
            )}
        </div>
    );
}
