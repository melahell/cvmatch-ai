# Audit Templates → Données (CVData)

## But
Vérifier que chaque section rendue par les templates a bien une source de données dans le pipeline, et identifier les champs qui ne peuvent jamais être correctement affichés si le pipeline ne les produit pas (ou les filtre).

## Contrat `CVData`
Référence type : [templates/index.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/index.ts#L3-L44)

## Garde-fous communs (sections qui peuvent “disparaître”)
### Photo
Tous les templates conditionnent l’affichage de la photo à :
- `includePhoto === true`
- `profil.photo_url` commence par `http://` ou `https://`

Donc une storage ref (`storage:...`) ou une URL vide => la photo ne s’affiche pas (fallback initials/placeholder).

### Clients
Deux zones existent :
- Clients **par expérience** : `experiences[].clients` (optionnel)
- Clients **global** : `clients_references.clients` (optionnel)

Si `fitCVToTemplate()` retire `clients_references` pour tenir en 1 page, la section globale disparaît même si le RAG contient des clients.

## Matrice “Section template → champ → origine pipeline”
### Profil / Contact
- Champs : `profil.{prenom,nom,titre_principal,elevator_pitch,localisation,email,telephone,linkedin,github,portfolio}`
- Origine :
  - V2 widgets : `convertAndSort()` enrichit depuis `ragProfile.profil.contact` et la route V2 complète encore email/tel/linkedin/localisation : [generate-v2](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/cv/generate-v2/route.ts#L333-L341)
  - Rendu depuis RAG brut : `normalizeRAGToCV()` (fallback renderer) : [CVRenderer.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/CVRenderer.tsx#L59-L68)

### Photo
- Champ : `profil.photo_url`
- Origine :
  - V2 server : `getPhotoUrl()` convertit storage ref → signed URL, puis injecte dans `cvData.profil.photo_url` : [generate-v2](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/cv/generate-v2/route.ts#L325-L332)
  - CV Builder client : fetch `GET /api/profile/photo` et injecte la signed URL dans `cvData.profil.photo_url` : [cv-builder/page.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/app/dashboard/cv-builder/page.tsx#L459-L513)
- Zone fragile :
  - si la DB ne contient plus la storage ref, `GET /api/profile/photo` ne peut plus signer → photo absente.

### Expériences
- Champs : `experiences[].{poste,entreprise,date_debut,date_fin,lieu,realisations}`
- Origine :
  - V2 : `buildExperiences()` construit une expérience par widget+RAG, puis fallback sur expériences RAG non couvertes : [ai-adapter.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts#L405-L639)
- Zones fragiles :
  - le fit peut réduire les réalisations (compression).

### Clients par expérience
- Champ : `experiences[].clients`
- Origine :
  - V2 : depuis `ragExp.clients_references|clients|clientsReferences`, nettoyage/dédup et cap : [ai-adapter.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts#L532-L550)
- Zone fragile :
  - le nettoyage peut vider la liste (noms génériques, confidentiel, exclusion entreprise) → la section “Clients : …” disparaît sur l’expérience.

### Références clients (global)
- Champs : `clients_references.clients` et optionnellement `clients_references.secteurs`
- Origine :
  - V2 : agrégation depuis widgets “references” + `ragProfile.references.clients` + clients des expériences, puis nettoyage/dédup : [ai-adapter.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts#L804-L870)
- Zone fragile :
  - le fit peut tronquer/supprimer la zone clients si la page est trop chargée : [adaptive-algorithm.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/adaptive-algorithm.ts#L372-L386)

### `clients_references.secteurs` (grouping)
- Utilisation template : Modern affiche un rendu groupé si `secteurs` existe, sinon fallback liste simple : [ModernTemplate.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/ModernTemplate.tsx#L247-L268)
- Risque historique :
  - si le pipeline ne remplit jamais `secteurs`, ce bloc groupé n’est jamais pris (mais le fallback liste simple reste OK).

### Compétences
- Champs : `competences.techniques`, `competences.soft_skills`
- Origine :
  - V2 : `buildCompetences()` (widgets skills + enrichissement RAG) : [ai-adapter.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts#L332-L334)

### Certifications / Langues / Formations
- Champs : `certifications[]`, `langues[]`, `formations[]`
- Origine :
  - V2 : `buildCertificationsAndReferences()`, `buildLangues()`, `buildFormations()` : [ai-adapter.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts#L335-L356)

## Conclusions pratiques
- Une section “qui ne s’affiche jamais” est presque toujours un problème de **gating** (condition `if`) ou de **format** (ex: photo != http), plus qu’un souci purement visuel.\n- Pour diagnostiquer rapidement les pertes, utiliser le `debug: true` de `/api/cv/generate-v2` (compteurs clients + type de photo par étape).

