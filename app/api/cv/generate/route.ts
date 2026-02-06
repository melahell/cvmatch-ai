/**
 * Alias de l'endpoint de génération CV.
 *
 * URL canonique : POST /api/cv/generate-v2
 * Ce route délègue intégralement à generate-v2 (même handler).
 * Conservé pour rétrocompatibilité ; les nouveaux appels doivent cibler /api/cv/generate-v2.
 */
import { POST as POST_V2 } from "@/app/api/cv/generate-v2/route";

export const runtime = "nodejs";

export async function POST(req: Request) {
    return POST_V2(req);
}

