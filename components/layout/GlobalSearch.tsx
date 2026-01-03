"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Keyboard shortcut: Cmd+K / Ctrl+K
    useState(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    });

    return (
        <>
            <Button
                variant="outline"
                className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">Rechercher...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Rechercher analyses, documents, jobs..." />
                <CommandList>
                    <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                    <CommandGroup heading="Actions rapides">
                        <CommandItem onSelect={() => { router.push("/dashboard/analyze"); setOpen(false); }}>
                            Nouvelle analyse
                        </CommandItem>
                        <CommandItem onSelect={() => { router.push("/dashboard/tracking"); setOpen(false); }}>
                            Mes candidatures
                        </CommandItem>
                        <CommandItem onSelect={() => { router.push("/dashboard/profile"); setOpen(false); }}>
                            Mon profil
                        </CommandItem>
                    </CommandGroup>
                    {/* TODO: Add dynamic search results for analyses, docs, jobs */}
                </CommandList>
            </CommandDialog>
        </>
    );
}
