import { createSignedUrl, createSupabaseAdminClient, createSupabaseUserClient, parseStorageRef, requireSupabaseUser } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function GET(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: 'Non autorisé', message: 'Non autorisé' }, { status: 401 });
        }

        const userId = auth.user.id;
        const supabase = createSupabaseUserClient(auth.token);

        const { data: ragRow, error: ragRowError } = await supabase
            .from('rag_metadata')
            .select('completeness_details')
            .eq('user_id', userId)
            .maybeSingle();

        if (ragRowError) {
            const message = ragRowError.message || 'Erreur DB';
            return NextResponse.json({ error: message, message }, { status: 500 });
        }

        const existingDetails = (ragRow?.completeness_details as any) || {};
        const ref = existingDetails?.profil?.photo_url as string | undefined;
        if (!ref) {
            return NextResponse.json({ photo_url: null });
        }

        if (ref.startsWith('http://') || ref.startsWith('https://')) {
            return NextResponse.json({ photo_url: ref });
        }

        const parsed = parseStorageRef(ref);
        if (!parsed) {
            return NextResponse.json({ photo_url: null });
        }

        const path = parsed.path;
        const allowedProfilePhotos = path.startsWith(`avatars/${userId}/`) || path.startsWith(`photos/${userId}/`);
        const allowedLegacyDocumentsPhotos = path.startsWith(`photos/${userId}/`);

        if (parsed.bucket === 'profile-photos' && !allowedProfilePhotos) {
            return NextResponse.json({ error: 'Chemin photo invalide', message: 'Chemin photo invalide' }, { status: 400 });
        }

        if (parsed.bucket === 'documents' && !allowedLegacyDocumentsPhotos) {
            return NextResponse.json({ error: 'Chemin photo invalide', message: 'Chemin photo invalide' }, { status: 400 });
        }

        const admin = createSupabaseAdminClient();
        const signedUrl = await createSignedUrl(admin, `storage:${parsed.bucket}:${path}`);
        return NextResponse.json({ photo_url: signedUrl });
    } catch (error: any) {
        logger.error('Photo get error', { error: error?.message });
        return NextResponse.json(
            { error: error.message || 'Erreur serveur', message: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: 'Non autorisé', message: 'Non autorisé' }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

        const formData = await request.formData();
        const photo = formData.get('photo') as File;

        if (!photo) {
            return NextResponse.json({ error: 'Aucun fichier fourni', message: 'Aucun fichier fourni' }, { status: 400 });
        }

        // Validation server-side
        if (!photo.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Le fichier doit être une image', message: 'Le fichier doit être une image' }, { status: 400 });
        }

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (photo.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Image trop volumineuse (max 2MB)', message: 'Image trop volumineuse (max 2MB)' }, { status: 400 });
        }

        const { data: ragRow, error: ragRowError } = await supabase
            .from('rag_metadata')
            .select('id, completeness_details')
            .eq('user_id', userId)
            .maybeSingle();

        if (ragRowError) {
            const message = ragRowError.message || 'Erreur DB';
            return NextResponse.json({ error: message, message }, { status: 500 });
        }

        const existingDetails = (ragRow?.completeness_details as any) || {};
        const existingPhotoRef = existingDetails?.profil?.photo_url as string | undefined;
        const parsedExisting = existingPhotoRef ? parseStorageRef(existingPhotoRef) : null;
        if (parsedExisting) {
            await supabase.storage.from(parsedExisting.bucket).remove([parsedExisting.path]);
        }

        const bucket = 'profile-photos';

        const rawExt = photo.name.split('.').pop();
        const fileExt = (rawExt && rawExt.length <= 10 ? rawExt : 'jpg').toLowerCase();
        const fileName = `avatars/${userId}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, photo, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            logger.error('Photo upload storage error', { error: uploadError.message });
            const message = uploadError.message || 'Échec upload storage';
            return NextResponse.json({ error: message, message }, { status: 500 });
        }

        const storagePath = uploadData.path;
        const storageRef = `storage:${bucket}:${storagePath}`;
        const nextDetails = {
            ...existingDetails,
            profil: {
                ...(existingDetails?.profil || {}),
                photo_url: storageRef,
            },
        };

        if (ragRow?.id) {
            const { error: updateError } = await supabase
                .from('rag_metadata')
                .update({ completeness_details: nextDetails })
                .eq('id', ragRow.id);
            if (updateError) {
                const message = updateError.message || 'Erreur DB';
                return NextResponse.json({ error: message, message }, { status: 500 });
            }
        } else {
            const { error: insertError } = await supabase
                .from('rag_metadata')
                .insert({ user_id: userId, completeness_details: nextDetails });
            if (insertError) {
                const message = insertError.message || 'Erreur DB';
                return NextResponse.json({ error: message, message }, { status: 500 });
            }
        }

        const signedUrl = await createSignedUrl(supabase, storageRef);

        return NextResponse.json({
            photo_url: signedUrl,
            storage_ref: storageRef
        });
    } catch (error: any) {
        logger.error('Photo upload error', { error: error?.message });
        return NextResponse.json(
            { error: error.message || 'Erreur serveur', message: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: 'Non autorisé', message: 'Non autorisé' }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);
        const userId = auth.user.id;

        const { data: ragRow, error: ragRowError } = await supabase
            .from('rag_metadata')
            .select('id, completeness_details')
            .eq('user_id', userId)
            .maybeSingle();

        if (ragRowError) {
            const message = ragRowError.message || 'Erreur DB';
            return NextResponse.json({ error: message, message }, { status: 500 });
        }

        if (!ragRow?.id) {
            return NextResponse.json({ success: true });
        }

        const existingDetails = (ragRow?.completeness_details as any) || {};
        const existingPhotoRef = existingDetails?.profil?.photo_url as string | undefined;
        const parsedExisting = existingPhotoRef ? parseStorageRef(existingPhotoRef) : null;
        if (parsedExisting) {
            await supabase.storage.from(parsedExisting.bucket).remove([parsedExisting.path]);
        }

        const nextDetails = {
            ...existingDetails,
            profil: {
                ...(existingDetails?.profil || {}),
                photo_url: null,
            },
        };

        const { error: updateError } = await supabase
            .from('rag_metadata')
            .update({ completeness_details: nextDetails })
            .eq('id', ragRow.id);

        if (updateError) {
            const message = updateError.message || 'Erreur DB';
            return NextResponse.json({ error: message, message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error('Photo delete error', { error: error?.message });
        return NextResponse.json(
            { error: error.message || 'Erreur serveur', message: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}
