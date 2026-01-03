"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, ArrowLeftRight, Share2, Trash2 } from "lucide-react";

interface QuickActionsMenuProps {
    onView?: () => void;
    onCompare?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
}

export function QuickActionsMenu({ onView, onCompare, onShare, onDelete }: QuickActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onView && (
                    <DropdownMenuItem onClick={onView}>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir les détails
                    </DropdownMenuItem>
                )}
                {onCompare && (
                    <DropdownMenuItem onClick={onCompare}>
                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                        Comparer
                    </DropdownMenuItem>
                )}
                {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Partager
                    </DropdownMenuItem>
                )}
                {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
