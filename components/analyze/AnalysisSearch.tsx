"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface AnalysisSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export function AnalysisSearch({ onSearch, placeholder = "Rechercher par poste, entreprise, mots-clés..." }: AnalysisSearchProps) {
    const [query, setQuery] = useState("");

    const handleSearch = (value: string) => {
        setQuery(value);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery("");
        onSearch("");
    };

    return (
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <Input
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
            />
            {query && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={handleClear}
                >
                    <X className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}
