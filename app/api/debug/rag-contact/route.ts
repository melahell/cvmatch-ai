// TEMPORARY DEBUG ENDPOINT - DELETE AFTER USE
import { createSupabaseUserClient, requireSupabaseUser } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const auth = await requireSupabaseUser(request);
    if (auth.error || !auth.user || !auth.token) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = createSupabaseUserClient(auth.token);
    const userId = auth.user.id;

    // Get RAG metadata
    const { data: ragData, error: ragError } = await supabase
        .from("rag_metadata")
        .select("completeness_details, custom_notes")
        .eq("user_id", userId)
        .single();

    if (ragError) {
        return NextResponse.json({ error: ragError.message, ragError }, { status: 500 });
    }

    const profile = ragData?.completeness_details;

    // Check ALL possible paths for email/telephone
    const debug = {
        user_id: userId,
        top_level_keys: Object.keys(profile || {}),
        profil_keys: profile?.profil ? Object.keys(profile.profil) : null,
        profil_contact_keys: profile?.profil?.contact ? Object.keys(profile.profil.contact) : null,

        email_paths: {
            "profil.contact.email": profile?.profil?.contact?.email || null,
            "profil.email": profile?.profil?.email || null,
            "contact.email": profile?.contact?.email || null,
            "email": profile?.email || null,
        },

        telephone_paths: {
            "profil.contact.telephone": profile?.profil?.contact?.telephone || null,
            "profil.telephone": profile?.profil?.telephone || null,
            "contact.telephone": profile?.contact?.telephone || null,
            "telephone": profile?.telephone || null,
        },

        // Also show what the profile.profil actually looks like
        profil_sample: profile?.profil ? {
            nom: profile.profil.nom,
            prenom: profile.profil.prenom,
            titre_principal: profile.profil.titre_principal?.substring(0, 50),
            contact: profile.profil.contact,
            email: profile.profil.email,
            telephone: profile.profil.telephone,
        } : null,

        // Raw data (limited)
        raw_completeness_details_keys: Object.keys(profile || {}).slice(0, 15)
    };

    return NextResponse.json(debug);
}
