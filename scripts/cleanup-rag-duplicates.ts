#!/usr/bin/env tsx

/**
 * RAG Deduplication Cleanup Script
 *
 * This script cleans up existing RAG data by removing duplicates.
 * Run with: npx tsx scripts/cleanup-rag-duplicates.ts <user-email>
 */

import { createClient } from '@supabase/supabase-js';
import { deduplicateRAG } from '../lib/rag/deduplicate';
import { calculateQualityScore } from '../lib/rag/quality-scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupUserRAG(userEmail: string) {
    console.log(`\n🧹 Starting RAG cleanup for: ${userEmail}\n`);

    // 1. Find user by email
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', userEmail)
        .single();

    if (userError || !user) {
        console.error('❌ User not found:', userEmail);
        process.exit(1);
    }

    console.log(`✓ Found user: ${user.email} (${user.id})`);

    // 2. Fetch RAG data
    const { data: ragData, error: ragError } = await supabase
        .from('rag_metadata')
        .select('completeness_details, completeness_score')
        .eq('user_id', user.id)
        .single();

    if (ragError || !ragData) {
        console.error('❌ No RAG data found for this user');
        process.exit(1);
    }

    const originalRAG = ragData.completeness_details;

    // 3. Count before
    const before = {
        experiences: originalRAG?.experiences?.length || 0,
        techniques: originalRAG?.competences?.explicit?.techniques?.length || 0,
        soft_skills: originalRAG?.competences?.explicit?.soft_skills?.length || 0,
        formations: originalRAG?.formations?.length || 0,
        certifications: originalRAG?.certifications?.length || 0
    };

    // Count realisations per experience
    let totalRealisationsBefore = 0;
    if (originalRAG?.experiences) {
        for (const exp of originalRAG.experiences) {
            const count = exp.realisations?.length || 0;
            totalRealisationsBefore += count;
            if (count > 10) {
                console.log(`⚠️  ${exp.entreprise} - ${exp.poste}: ${count} realisations (likely duplicates)`);
            }
        }
    }

    console.log('\n📊 BEFORE Deduplication:');
    console.log('  Experiences:', before.experiences);
    console.log('  Technical Skills:', before.techniques);
    console.log('  Soft Skills:', before.soft_skills);
    console.log('  Formations:', before.formations);
    console.log('  Certifications:', before.certifications);
    console.log('  Total Realisations:', totalRealisationsBefore);

    // 4. Deduplicate
    console.log('\n🔄 Running deduplication...');
    const deduplicatedRAG = deduplicateRAG(originalRAG);

    // 5. Count after
    const after = {
        experiences: deduplicatedRAG?.experiences?.length || 0,
        techniques: deduplicatedRAG?.competences?.explicit?.techniques?.length || 0,
        soft_skills: deduplicatedRAG?.competences?.explicit?.soft_skills?.length || 0,
        formations: deduplicatedRAG?.formations?.length || 0,
        certifications: deduplicatedRAG?.certifications?.length || 0
    };

    let totalRealisationsAfter = 0;
    if (deduplicatedRAG?.experiences) {
        for (const exp of deduplicatedRAG.experiences) {
            totalRealisationsAfter += exp.realisations?.length || 0;
        }
    }

    console.log('\n📊 AFTER Deduplication:');
    console.log('  Experiences:', after.experiences);
    console.log('  Technical Skills:', after.techniques);
    console.log('  Soft Skills:', after.soft_skills);
    console.log('  Formations:', after.formations);
    console.log('  Certifications:', after.certifications);
    console.log('  Total Realisations:', totalRealisationsAfter);

    const reduction = {
        experiences: before.experiences - after.experiences,
        techniques: before.techniques - after.techniques,
        soft_skills: before.soft_skills - after.soft_skills,
        formations: before.formations - after.formations,
        certifications: before.certifications - after.certifications,
        realisations: totalRealisationsBefore - totalRealisationsAfter
    };

    const totalReduction = Object.values(reduction).reduce((a, b) => a + b, 0);

    console.log('\n✨ REDUCTION:');
    console.log('  Experiences:', reduction.experiences);
    console.log('  Technical Skills:', reduction.techniques);
    console.log('  Soft Skills:', reduction.soft_skills);
    console.log('  Formations:', reduction.formations);
    console.log('  Certifications:', reduction.certifications);
    console.log('  Realisations:', reduction.realisations);
    console.log('  TOTAL REMOVED:', totalReduction);

    // 6. Recalculate quality score
    const qualityScore = calculateQualityScore(deduplicatedRAG);
    console.log('\n📈 Quality Score:', qualityScore.overall_score, '/ 100');

    // 7. Save to database
    console.log('\n💾 Saving to database...');
    const { error: updateError } = await supabase
        .from('rag_metadata')
        .update({
            completeness_details: deduplicatedRAG,
            completeness_score: qualityScore.overall_score,
            last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id);

    if (updateError) {
        console.error('❌ Failed to save:', updateError.message);
        process.exit(1);
    }

    console.log('✅ RAG data successfully deduplicated and saved!\n');

    // 8. Show sample of deduplicated experience
    if (deduplicatedRAG?.experiences?.[0]) {
        const firstExp = deduplicatedRAG.experiences[0];
        console.log('📝 Sample Experience (first one):');
        console.log(`   ${firstExp.entreprise} - ${firstExp.poste}`);
        console.log(`   Realisations: ${firstExp.realisations?.length || 0}`);
        if (firstExp.realisations && firstExp.realisations.length > 0) {
            console.log('   First 3:');
            firstExp.realisations.slice(0, 3).forEach((r: any, i: number) => {
                console.log(`   ${i + 1}. ${r.description?.substring(0, 80)}...`);
            });
        }
    }
}

// Get user email from command line
const userEmail = process.argv[2];

if (!userEmail) {
    console.error('❌ Usage: npx tsx scripts/cleanup-rag-duplicates.ts <user-email>');
    process.exit(1);
}

cleanupUserRAG(userEmail).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
