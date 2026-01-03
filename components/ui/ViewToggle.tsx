"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
    view: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex gap-1 border rounded-lg p-1">
            <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewChange("list")}
                className="px-3"
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewChange("grid")}
                className="px-3"
            >
                <LayoutGrid className="w-4 h-4" />
            </Button>
        </div>
    );
}
