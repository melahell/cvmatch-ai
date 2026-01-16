"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CVsSearchAndTagsProps {
    onSearch: (query: string) => void;
    onFilterByTag?: (tag: string) => void;
    availableTags?: string[];
}

export function CVsSearchAndTags({ onSearch, onFilterByTag, availableTags = [] }: CVsSearchAndTagsProps) {
    const [query, setQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const handleSearch = (value: string) => {
        setQuery(value);
        onSearch(value);
    };

    const handleTagClick = (tag: string) => {
        const newTag = selectedTag === tag ? null : tag;
        setSelectedTag(newTag);
        if (onFilterByTag) {
            onFilterByTag(newTag || "");
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Rechercher par titre, entreprise..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <TagIcon className="w-4 h-4 text-slate-400 mt-1" />
                    {availableTags.map(tag => (
                        <Badge
                            key={tag}
                            variant={selectedTag === tag ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
