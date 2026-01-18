"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoCTAProps {
    characterName?: string;
}

export function DemoCTA({ characterName }: DemoCTAProps) {
    const utmParams = characterName
        ? `?utm_source=demo&utm_campaign=museum&character=${encodeURIComponent(characterName)}`
        : "?utm_source=demo&utm_campaign=museum";

    return (
        <section className="py-16 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-3xl mx-4 md:mx-0">
            <div className="text-center px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white mb-4">
                    <Sparkles className="h-4 w-4" />
                    Votre tour !
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Vous aussi, obtenez un profil intelligent en 5 min
                </h2>

                {characterName && (
                    <p className="text-lg text-white/80 mb-6">
                        Comme {characterName}, transformez votre parcours en CV optimisé
                    </p>
                )}

                <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-white text-purple-700 hover:bg-slate-100"
                >
                    <Link href={`/login${utmParams}`}>
                        Créer mon profil gratuitement
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>

                <p className="text-white/60 text-sm mt-4">
                    💡 0€ pendant le POC • Accès immédiat • Comme {characterName || "les grands"}
                </p>
            </div>
        </section>
    );
}
