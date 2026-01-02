import { createSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { jobId, tags } = await request.json();

        if (!jobId || !tags) {
            return new Response(JSON.stringify({ error: 'Missing jobId or tags' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const supabase = createSupabaseClient();

        // Update tags (stored as JSON array)
        const { error } = await supabase
            .from('job_analyses')
            .update({ tags: tags })
            .eq('id', jobId);

        if (error) {
            console.error('Tags update error:', error);
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
        console.error('Tags endpoint error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
