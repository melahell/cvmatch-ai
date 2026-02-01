# Audit Photo (Profil → UI → CV)

## Contrat attendu
- **DB** (`rag_metadata.completeness_details.profil.photo_url`) : doit contenir une *storage ref* stable, ex. `storage:profile-photos:avatars/{userId}/...`.
- **UI** : utilise une *signed URL* (http) uniquement pour l’affichage (non persistée).
- **CV** : les templates n’affichent la photo que si `profil.photo_url` est http(s). Le serveur (ou l’UI) doit donc convertir la storage ref en signed URL au moment de la génération/rendu.

## Endpoints
- Upload : `/api/profile/photo` (POST) écrit la storage ref en DB et renvoie une signed URL (affichage immédiat).
- Lecture : `/api/profile/photo` (GET) lit la storage ref en DB et renvoie une signed URL.

## Points de perte historiques
- Écrasement de `profil.photo_url` en state UI avec une signed URL, puis sauvegarde de ce JSON en base.
- Écrasement complet de `completeness_details` via `/api/rag/update` ou updates directes sans merge.

## Correctif visé
- Ne jamais persister une signed URL dans `profil.photo_url`.
- Toute sauvegarde “profil” doit faire un merge serveur et préserver `profil.photo_url` si la nouvelle valeur n’est pas une storage ref.

