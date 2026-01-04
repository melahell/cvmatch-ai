import { createSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = createSupabaseClient();

        const formData = await request.formData();
        const photo = formData.get('photo') as File;
        const userId = formData.get('userId') as string;

        // Get userId from FormData (same pattern as other API routes)
        if (!userId) {
            return NextResponse.json({ error: 'userId requis' }, { status: 401 });
        }

        if (!photo) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
        }

        // Validation server-side
        if (!photo.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 });
        }

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (photo.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Image trop volumineuse (max 2MB)' }, { status: 400 });
        }

        // Delete old photo if exists
        const { data: userData } = await supabase
            .from('users')
            .select('photo_url')
            .eq('id', userId)
            .single();

        if (userData?.photo_url) {
            // Extract path from URL and delete
            const oldPath = userData.photo_url.split('/').pop();
            if (oldPath) {
                await supabase.storage
                    .from('documents')
                    .remove([`photos/${userId}/${oldPath}`]);
            }
        }

        // Upload new photo to Supabase Storage (use 'documents' bucket with photos/ prefix)
        const fileExt = photo.name.split('.').pop();
        const fileName = `photos/${userId}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, photo, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: uploadError.message || 'Échec upload storage' }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(uploadData.path);

        // Store the storage path (for signed URL generation) AND public URL fallback
        const storagePath = uploadData.path;

        // Update photo_url column with storage path (prefixed to identify as path)
        const { error: updateError } = await supabase
            .from('rag_metadata')
            .update({ photo_url: `storage:${storagePath}` })
            .eq('user_id', userId);

        if (updateError) {
            console.error('Update photo_url error:', updateError);
        }

        // Return signed URL valid for 1 hour
        const { data: signedUrlData } = await supabase.storage
            .from('documents')
            .createSignedUrl(storagePath, 3600);

        return NextResponse.json({
            photo_url: signedUrlData?.signedUrl || publicUrl,
            storage_path: storagePath
        });
    } catch (error: any) {
        console.error('Photo upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = createSupabaseClient();

        const formData = await request.formData();
        const userId = formData.get('userId') as string;

        if (!userId) {
            return NextResponse.json({ error: 'userId requis' }, { status: 401 });
        }

        // Get current photo URL
        const { data: userData } = await supabase
            .from('users')
            .select('photo_url')
            .eq('id', userId)
            .single();

        if (userData?.photo_url) {
            // Delete from storage
            const oldPath = userData.photo_url.split('/').pop();
            if (oldPath) {
                await supabase.storage
                    .from('documents')
                    .remove([`photos/${userId}/${oldPath}`]);
            }
        }

        // Update user record
        await supabase
            .from('users')
            .update({ photo_url: null })
            .eq('id', userId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Photo delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}
