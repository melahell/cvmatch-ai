# Audit Profil → CV (V2)

## Objectif
Identifier les points de perte (clients, photo, sections) depuis `rag_metadata.completeness_details` jusqu’au rendu du template CV (UI/PDF) et rendre le flux observable.

## Flux “forward” (source → rendu)
- **Source de vérité** : `rag_metadata.completeness_details` (JSONB)
- **Normalisation** : `normalizeRAGData()` → structure canon/legacy unifiée
- **Génération widgets** : `generateWidgetsFromRAGAndMatch()` (Gemini)
- **Bridge déterministe** : `convertAndSort()` → `CVData` (templates)
- **Fit 1 page** : `fitCVToTemplate()` + `adaptCVToThemeUnits()` (compression)
- **Rendu template** : `CVRenderer` → `Modern/Tech/Classic/Creative`

## Champs critiques et invariants
### Photo
- DB doit stocker une **storage ref** (`storage:profile-photos:avatars/{userId}/...`) dans `profil.photo_url`.
- Les templates n’affichent une photo que si `profil.photo_url` est **http(s)**.
- Donc la conversion “storage ref → signed URL” doit se faire **au moment du rendu/génération**, sans écrire l’URL signée en base.

### Clients
Deux sorties côté CV :
- `experiences[].clients` (clients par expérience)
- `clients_references.clients` (références globales)

Les templates rendent au minimum `clients_references.clients` si présent.

## Points de perte (où ça casse)
### 1) Écrasement DB
Si on met à jour `rag_metadata.completeness_details` avec un objet partiel, on peut supprimer `profil.photo_url` et/ou `references.clients`.

### 2) Regeneration “from scratch”
En mode régénération, le RAG peut être remplacé par l’extraction IA des documents. Les champs **non présents dans les documents** (photo, parfois références clients manuelles) disparaissent si non préservés.

### 3) Bridge CV (nettoyage/exclusions)
Le bridge déduplique/filtre des noms de clients (noms génériques, confidentiel, exclusions si identiques à l’entreprise, caps).

### 4) Fit (mise en page)
Le fit peut tronquer/supprimer `clients_references` si la zone “clients” est trop petite.

### 5) Rendu template
Les templates masquent la photo si `profil.photo_url` n’est pas http(s).

## Observabilité
Le endpoint `/api/cv/generate-v2` accepte `debug: true` dans le body et renvoie un objet `debug` (compteurs clients + type de photo) pour diagnostiquer rapidement la disparition d’une section.

