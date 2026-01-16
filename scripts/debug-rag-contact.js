// Debug script to inspect RAG metadata structure
// Run with: node scripts/debug-rag-contact.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugRAGContact() {
    console.log("=== RAG METADATA CONTACT DEBUG ===\n");

    // Get all users with RAG metadata
    const { data: ragData, error } = await supabase
        .from('rag_metadata')
        .select('user_id, completeness_details')
        .limit(5);

    if (error) {
        console.error("Error fetching RAG:", error);
        return;
    }

    for (const row of ragData) {
        console.log(`\n--- User: ${row.user_id} ---`);
        const profile = row.completeness_details;

        // Check all possible paths for email
        console.log("\n📧 EMAIL PATHS:");
        console.log("  profil.contact.email:", profile?.profil?.contact?.email || "❌ MISSING");
        console.log("  profil.email:", profile?.profil?.email || "❌ MISSING");
        console.log("  contact.email:", profile?.contact?.email || "❌ MISSING");
        console.log("  email:", profile?.email || "❌ MISSING");

        // Check all possible paths for telephone
        console.log("\n📞 TELEPHONE PATHS:");
        console.log("  profil.contact.telephone:", profile?.profil?.contact?.telephone || "❌ MISSING");
        console.log("  profil.telephone:", profile?.profil?.telephone || "❌ MISSING");
        console.log("  contact.telephone:", profile?.contact?.telephone || "❌ MISSING");
        console.log("  telephone:", profile?.telephone || "❌ MISSING");

        // Show top-level keys
        console.log("\n🔑 TOP-LEVEL KEYS:", Object.keys(profile || {}));
        if (profile?.profil) {
            console.log("🔑 PROFIL KEYS:", Object.keys(profile.profil));
            if (profile.profil.contact) {
                console.log("🔑 PROFIL.CONTACT KEYS:", Object.keys(profile.profil.contact));
            }
        }
    }
}

debugRAGContact().catch(console.error);
