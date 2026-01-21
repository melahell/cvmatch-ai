import { NextResponse } from 'next/server';
import { getBearerToken, requireSupabaseUser } from '@/lib/supabase';
import { logger } from '@/lib/utils/logger';

// Phase 3 Item 6: Batch analysis of multiple URLs
export async function POST(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const bearer = getBearerToken(request);

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
                    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/match/analyze`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
                        },
                        body: JSON.stringify({
                            jobUrl: url
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
        logger.error('Batch analysis error', { error: error?.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
