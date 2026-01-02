// Fonction helper pour l'upload de photo de profil
export async function uploadProfilePhoto(
    file: File,
    userId: string,
    currentProfile: any,
    supabase: any,
    setProfile: (profile: any) => void
): Promise<boolean> {
    try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return false;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);

        // Update RAG metadata with photo URL
        const updatedProfile = {
            ...currentProfile,
            photo_url: publicUrl
        };

        const { error: updateError } = await supabase
            .from('rag_metadata')
            .update({
                completeness_details: updatedProfile
            })
            .eq('user_id', userId);

        if (updateError) {
            console.error('Update error:', updateError);
            return false;
        }

        // Update local state
        setProfile(updatedProfile);
        return true;
    } catch (error) {
        console.error('Photo upload error:', error);
        return false;
    }
}
