import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, requireSupabaseUser } from "@/lib/supabase";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/**
 * POST /api/rag/validate-contexte
 * Valider ou rejeter une déduction du contexte enrichi
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { type, item_id, action, confidence } = body;

        if (!type || !item_id || !action) {
            return NextResponse.json(
                { error: "type, item_id et action requis" },
                { status: 400 }
            );
        }

        if (!["responsabilite", "competence", "environnement"].includes(type)) {
            return NextResponse.json({ error: "Type invalide" }, { status: 400 });
        }

        if (!["validate", "reject"].includes(action)) {
            return NextResponse.json({ error: "Action invalide" }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();

        // Récupérer RAG data de l'utilisateur
        const { data: ragData, error: ragError } = await supabase
            .from("rag_data")
            .select("*")
            .eq("user_id", auth.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json(
                { error: "RAG data non trouvée" },
                { status: 404 }
            );
        }

        // Mettre à jour rag_metadata
        const metadata = ragData.rag_metadata || {};
        const rejectedInferred = metadata.rejected_inferred || [];

        if (action === "reject") {
            // Ajouter à rejected_inferred
            rejectedInferred.push({
                type,
                item_id,
                rejected_at: new Date().toISOString(),
            });

            await supabase
                .from("rag_data")
                .update({
                    rag_metadata: {
                        ...metadata,
                        rejected_inferred: rejectedInferred,
                    },
                })
                .eq("id", ragData.id);
        } else if (action === "validate") {
            // Ajouter à validated dans completeness_details
            const completenessDetails = metadata.completeness_details || {};
            const contexteEnrichi = completenessDetails.contexte_enrichi || {};
            const validated = contexteEnrichi.validated || [];

            validated.push({
                type,
                item_id,
                validated_at: new Date().toISOString(),
            });

            await supabase
                .from("rag_data")
                .update({
                    rag_metadata: {
                        ...metadata,
                        completeness_details: {
                            ...completenessDetails,
                            contexte_enrichi: {
                                ...contexteEnrichi,
                                validated,
                            },
                        },
                    },
                })
                .eq("id", ragData.id);
        }

        logger.info("Contexte enrichi validé/rejeté", {
            userId: auth.user.id,
            type,
            action,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error("Error validating contexte", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/rag/validate-contexte
 * Ajuster le confidence score d'une déduction
 */
export async function PUT(request: NextRequest) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { type, item_id, confidence } = body;

        if (!type || !item_id || confidence === undefined) {
            return NextResponse.json(
                { error: "type, item_id et confidence requis" },
                { status: 400 }
            );
        }

        if (confidence < 60 || confidence > 100) {
            return NextResponse.json(
                { error: "Confidence doit être entre 60 et 100" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdminClient();

        // Récupérer RAG data
        const { data: ragData, error: ragError } = await supabase
            .from("rag_data")
            .select("*")
            .eq("user_id", auth.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json(
                { error: "RAG data non trouvée" },
                { status: 404 }
            );
        }

        // Mettre à jour confidence dans contexte enrichi
        const metadata = ragData.rag_metadata || {};
        const completenessDetails = metadata.completeness_details || {};
        const contexteEnrichi = completenessDetails.contexte_enrichi || {};

        // Mettre à jour confidence selon type
        if (type === "responsabilite" && contexteEnrichi.responsabilites_implicites) {
            const item = contexteEnrichi.responsabilites_implicites.find(
                (r: any) => r.id === item_id || r.description === item_id
            );
            if (item) {
                item.confidence_score = confidence;
            }
        } else if (type === "competence" && contexteEnrichi.competences_tacites) {
            const item = contexteEnrichi.competences_tacites.find(
                (c: any) => c.id === item_id || c.nom === item_id
            );
            if (item) {
                item.confidence_score = confidence;
            }
        } else if (type === "environnement" && contexteEnrichi.environnement_travail) {
            contexteEnrichi.environnement_travail.confidence_score = confidence;
        }

        await supabase
            .from("rag_data")
            .update({
                rag_metadata: {
                    ...metadata,
                    completeness_details: {
                        ...completenessDetails,
                        contexte_enrichi: contexteEnrichi,
                    },
                },
            })
            .eq("id", ragData.id);

        logger.info("Confidence score ajusté", {
            userId: auth.user.id,
            type,
            item_id,
            confidence,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error("Error adjusting confidence", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/rag/validate-contexte
 * Supprimer une déduction du contexte enrichi
 */
export async function DELETE(request: NextRequest) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { type, item_id } = body;

        if (!type || !item_id) {
            return NextResponse.json(
                { error: "type et item_id requis" },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdminClient();

        // Récupérer RAG data
        const { data: ragData, error: ragError } = await supabase
            .from("rag_data")
            .select("*")
            .eq("user_id", auth.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (ragError || !ragData) {
            return NextResponse.json(
                { error: "RAG data non trouvée" },
                { status: 404 }
            );
        }

        // Supprimer de contexte enrichi
        const metadata = ragData.rag_metadata || {};
        const completenessDetails = metadata.completeness_details || {};
        const contexteEnrichi = completenessDetails.contexte_enrichi || {};

        if (type === "responsabilite" && contexteEnrichi.responsabilites_implicites) {
            contexteEnrichi.responsabilites_implicites = contexteEnrichi.responsabilites_implicites.filter(
                (r: any) => r.id !== item_id && r.description !== item_id
            );
        } else if (type === "competence" && contexteEnrichi.competences_tacites) {
            contexteEnrichi.competences_tacites = contexteEnrichi.competences_tacites.filter(
                (c: any) => c.id !== item_id && c.nom !== item_id
            );
        } else if (type === "environnement") {
            contexteEnrichi.environnement_travail = undefined;
        }

        await supabase
            .from("rag_data")
            .update({
                rag_metadata: {
                    ...metadata,
                    completeness_details: {
                        ...completenessDetails,
                        contexte_enrichi: contexteEnrichi,
                    },
                },
            })
            .eq("id", ragData.id);

        logger.info("Déduction supprimée", {
            userId: auth.user.id,
            type,
            item_id,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error("Error deleting deduction", { error });
        return NextResponse.json(
            { error: error.message || "Erreur serveur" },
            { status: 500 }
        );
    }
}
