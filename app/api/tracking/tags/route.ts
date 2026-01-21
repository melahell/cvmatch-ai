import { createSupabaseUserClient, requireSupabaseUser } from '@/lib/supabase';
import { logger } from '@/lib/utils/logger';

export async function POST(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return new Response(JSON.stringify({ error: 'Non autorisé' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { jobId, tags } = await request.json();

        if (!jobId || !tags) {
            return new Response(JSON.stringify({ error: 'Missing jobId or tags' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const supabase = createSupabaseUserClient(auth.token);

        // Update tags (stored as JSON array)
        const { error } = await supabase
            .from('job_analyses')
            .update({ tags: tags })
            .eq('id', jobId)
            .eq('user_id', auth.user.id);

        if (error) {
            logger.error('Tags update error', { error: error.message, jobId });
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        logger.error('Tags endpoint error', { error: error?.message });
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
