import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

// Phase 3 Item 6: Batch analysis of multiple URLs
export async function POST(request: Request) {
    try {
        const supabase = createSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { urls } = await request.json();

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json({ error: 'URLs manquantes' }, { status: 400 });
        }

        if (urls.length > 10) {
            return NextResponse.json({ error: 'Maximum 10 URLs à la fois' }, { status: 400 });
        }

        // Process each URL
        const results = await Promise.all(
            urls.map(async (url: string) => {
                try {
                    // Call existing analyze API for each URL
                    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/match/analyze`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: user.id,
                            mode: 'url',
                            url
                        })
                    });

                    if (!response.ok) {
                        return { url, status: 'error', error: 'Failed to analyze' };
                    }

                    const data = await response.json();
                    return { url, status: 'success', analysis_id: data.analysis_id };
                } catch (error) {
                    return { url, status: 'error', error: 'Network error' };
                }
            })
        );

        return NextResponse.json({
            processed: results.length,
            results
        });
    } catch (error: any) {
        console.error('Batch analysis error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
