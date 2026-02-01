/**
 * API Endpoint: Import CV depuis JSON Resume
 * 
 * [CDC Phase 4] Interopérabilité - Import depuis l'écosystème JSON Resume
 * 
 * POST /api/cv/import-json-resume
 * 
 * Body: JSON Resume object
 * 
 * Returns: CVData (format CV-Crush)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase";
import { convertFromJSONResume, isValidJSONResume, JSONResume } from "@/lib/cv/json-resume-converter";
import { logger } from "@/lib/utils/logger";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        // Authentification
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        // Rate limiting
        const rateLimitResult = await checkRateLimit(`json-resume-import:${auth.user.id}`, {
            maxRequests: 10,
            windowMs: 60000, // 10 imports par minute max
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { 
                    error: "Trop de requêtes", 
                    retryAfter: rateLimitResult.retryAfter 
                },
                { status: 429 }
            );
        }

        // Parser le body
        let jsonResume: JSONResume;
        try {
            jsonResume = await request.json();
        } catch {
            return NextResponse.json(
                { error: "JSON invalide" },
                { status: 400 }
            );
        }

        // Valider le JSON Resume
        if (!isValidJSONResume(jsonResume)) {
            return NextResponse.json(
                { 
                    error: "JSON Resume invalide",
                    details: "Le champ 'basics.name' est obligatoire"
                },
                { status: 400 }
            );
        }

        // Convertir en CVData
        const cvData = convertFromJSONResume(jsonResume);

        // Statistiques de l'import
        const stats = {
            hasBasics: !!(cvData as any).profil,
            experiencesCount: (cvData as any).experiences?.length || 0,
            formationsCount: (cvData as any).formations?.length || 0,
            competencesCount: (cvData as any).competences?.length || 0,
            languesCount: (cvData as any).langues?.length || 0,
            certificationsCount: (cvData as any).certifications?.length || 0,
            projetsCount: (cvData as any).projets?.length || 0,
        };

        logger.info("JSON Resume imported successfully", {
            userId: auth.user.id,
            stats,
        });

        return NextResponse.json({
            success: true,
            cvData,
            stats,
            message: "JSON Resume importé avec succès",
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error("JSON Resume import error", { error: message });
        
        return NextResponse.json(
            { error: "Erreur lors de l'import JSON Resume", details: message },
            { status: 500 }
        );
    }
}
