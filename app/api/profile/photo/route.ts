import {
    createSignedUrl,
    createSupabaseAdminClient,
  createSupabaseUserClient,
    parseStorageRef,
    requireSupabaseUser,
} from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getCookieUserId = (): string | null => {
    const value = cookies().get('userId')?.value ?? null;
    if (!value) return null;
    if (!UUID_REGEX.test(value)) return null;
    return value;
};

const getRequestUserId = async (request: Request): Promise<string | null> => {
    const auth = await requireSupabaseUser(request);
    if (auth.user?.id) return auth.user.id;
    return getCookieUserId();
};

export async function GET(request: Request) {
    try {
    const auth = await requireSupabaseUser(request);
    const userId = auth.user?.id ?? getCookieUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé', message: 'Non autorisé' }, { status: 401 });
        }

    let client;
    try {
      client = createSupabaseAdminClient();
    } catch {
      if (!auth.token) {
        return NextResponse.json({ error: 'Non autorisé', message: 'Non autorisé' }, { status: 401 });
      }
      client = createSupabaseUserClient(auth.token);
    }

    const { data: ragRow, error: ragRowError } = await client
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
        const allowedProfilePhotos = path.startsWith(`avatars/${userId}/`);
        const allowedLegacyDocumentsPhotos = path.startsWith(`photos/${userId}/`);

        if (parsed.bucket === 'profile-photos' && !allowedProfilePhotos) {
            return NextResponse.json({ error: 'Chemin photo invalide', message: 'Chemin photo invalide' }, { status: 400 });
        }

        if (parsed.bucket === 'documents' && !allowedLegacyDocumentsPhotos) {
            return NextResponse.json({ error: 'Chemin photo invalide', message: 'Chemin photo invalide' }, { status: 400 });
        }

    const signedUrl = await createSignedUrl(client, `storage:${parsed.bucket}:${path}`);
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
        const admin = createSupabaseAdminClient();

        const userId = await getRequestUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé', message: 'Non autorisé' }, { status: 401 });
        }

        const formData = await request.formData();
        const photo = formData.get('photo') as File;

        if (!photo) {
            return NextResponse.json({ error: 'Aucun fichier fourni', message: 'Aucun fichier fourni' }, { status: 400 });
        }

        if (!photo.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Le fichier doit être une image', message: 'Le fichier doit être une image' }, { status: 400 });
        }

        const MAX_SIZE = 2 * 1024 * 1024;
        if (photo.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Image trop volumineuse (max 2MB)', message: 'Image trop volumineuse (max 2MB)' }, { status: 400 });
        }

        const { data: ragRow, error: ragRowError } = await admin
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

        const bucket = 'profile-photos';

        const rawExt = photo.name.split('.').pop();
        const fileExt = (rawExt && rawExt.length <= 10 ? rawExt : 'jpg').toLowerCase();
        const fileName = `avatars/${userId}/${Date.now()}.${fileExt}`;

        const photoBytes = new Uint8Array(await photo.arrayBuffer());

        const { data: uploadData, error: uploadError } = await admin.storage.from(bucket).upload(fileName, photoBytes, {
            cacheControl: '3600',
            contentType: photo.type,
            upsert: true,
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
            const { error: updateError } = await admin
                .from('rag_metadata')
                .update({ completeness_details: nextDetails })
                .eq('id', ragRow.id);
            if (updateError) {
                const message = updateError.message || 'Erreur DB';
                return NextResponse.json({ error: message, message }, { status: 500 });
            }
        } else {
            const { error: insertError } = await admin
                .from('rag_metadata')
                .insert({ user_id: userId, completeness_details: nextDetails });
            if (insertError) {
                const message = insertError.message || 'Erreur DB';
                return NextResponse.json({ error: message, message }, { status: 500 });
            }
        }

        if (parsedExisting) {
            const canDeleteProfilePhotos =
                parsedExisting.bucket === 'profile-photos' && parsedExisting.path.startsWith(`avatars/${userId}/`);
            const canDeleteLegacyDocumentsPhotos =
                parsedExisting.bucket === 'documents' && parsedExisting.path.startsWith(`photos/${userId}/`);

            if (canDeleteProfilePhotos || canDeleteLegacyDocumentsPhotos) {
                const { error: removeError } = await admin.storage.from(parsedExisting.bucket).remove([parsedExisting.path]);
                if (removeError) {
                    logger.error('Photo remove storage error', { error: removeError.message });
                }
            }
        }

        const signedUrl = await createSignedUrl(admin, storageRef);

        return NextResponse.json({
            photo_url: signedUrl,
            storage_ref: storageRef,
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
        const admin = createSupabaseAdminClient();

        const userId = await getRequestUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé', message: 'Non autorisé' }, { status: 401 });
        }

        const { data: ragRow, error: ragRowError } = await admin
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
            const canDeleteProfilePhotos =
                parsedExisting.bucket === 'profile-photos' && parsedExisting.path.startsWith(`avatars/${userId}/`);
            const canDeleteLegacyDocumentsPhotos =
                parsedExisting.bucket === 'documents' && parsedExisting.path.startsWith(`photos/${userId}/`);

            if (canDeleteProfilePhotos || canDeleteLegacyDocumentsPhotos) {
                const { error: removeError } = await admin.storage.from(parsedExisting.bucket).remove([parsedExisting.path]);
                if (removeError) {
                    logger.error('Photo remove storage error', { error: removeError.message });
                }
            }
        }

        const nextDetails = {
            ...existingDetails,
            profil: {
                ...(existingDetails?.profil || {}),
                photo_url: null,
            },
        };

        const { error: updateError } = await admin
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
