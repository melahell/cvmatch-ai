import { createSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { jobIds, archived } = await request.json();

        if (!jobIds || !Array.isArray(jobIds)) {
            return new Response(JSON.stringify({ error: 'Invalid job IDs' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const supabase = createSupabaseClient();

        // Update archived status for multiple jobs
        const { error } = await supabase
            .from('job_analyses')
            .update({ archived: archived ?? false })
            .in('id', jobIds);

        if (error) {
            console.error('Archive error:', error);
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
        console.error('Archive endpoint error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
