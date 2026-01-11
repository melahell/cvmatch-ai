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

        const { jobIds, archived } = await request.json();

        if (!jobIds || !Array.isArray(jobIds)) {
            return new Response(JSON.stringify({ error: 'Invalid job IDs' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const supabase = createSupabaseUserClient(auth.token);

        const nextStatus = archived ? 'archived' : 'pending';

        const { error } = await supabase
            .from('job_analyses')
            .update({ application_status: nextStatus })
            .in('id', jobIds)
            .eq('user_id', auth.user.id);

        if (error) {
            logger.error('Archive error', { error: error.message, count: jobIds.length, archived });
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true, count: jobIds.length }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        logger.error('Archive endpoint error', { error: error?.message });
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
