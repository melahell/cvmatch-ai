# Taxonomie des données Profil (RAG)

Ce document liste tous les éléments de données que l’application peut stocker / récupérer / déduire pour construire un **profil utilisateur** (profil RAG), ainsi que les formats réellement rencontrés (canon vs legacy) et les endroits où ces champs sont manipulés.

## 1) Niveaux de “vérité” (provenance)
- **Données utilisateur (éditables)** : champs modifiables depuis l’UI (ex: profil, expériences, formations, langues…).
- **Données extraites (documents)** : issues de l’analyse IA des documents importés.
- **Données déduites (inférées)** : ex: compétences inférées, contexte enrichi.
- **Données calculées / système** : score de complétude, métriques qualité, métadonnées d’extraction, historique de merges, etc.

## 2) Conteneur principal en base (source de vérité)
Le profil RAG est stocké dans `rag_metadata.completeness_details` (JSONB). Champs voisins utiles :
- `rag_metadata.completeness_score` : score global 0–100
- `rag_metadata.custom_notes` : notes utilisateur
- `rag_metadata.top_10_jobs` : suggestions jobs
- `rag_metadata.rag_version`, `last_updated`, `created_at`

Références : [01_tables.sql](file:///Users/gillesgozlan/Desktop/CV-Crush/01_tables.sql)

## 3) Schéma canonique (référence “complète”)
Le schéma le plus complet sert de référence de structure (même si tous les profils n’ont pas tous les champs).

### 3.1 Racine
- `profil`
- `experiences[]`
- `competences`
- `formations[]`
- `certifications[]`
- `langues[]`
- `references`
- `infos_additionnelles`
- `metadata`

Référence : [rag-complete.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/types/rag-complete.ts)

### 3.2 Profil / Identité
**profil**
- `prenom`
- `nom`
- `titre_principal`
- `titres_alternatifs[]`
- `localisation`
- `elevator_pitch`
- `photo_url`

**profil.contact**
- `email`
- `telephone`
- `adresse`
- `code_postal`
- `ville`
- `pays`
- `linkedin`
- `portfolio`
- `github`
- `twitter`

### 3.3 Expériences
**experiences[]**
- identité : `id` (stable)
- contexte : `poste`, `entreprise`, `lieu`, `type_contrat` (selon données), `secteur` (si dispo)
- dates : `debut`, `fin`, `actuel`
- contenu : `realisations[]`
- tags : `technologies[]`, `clients_references[]`
- filtrage : `weight` (`important|inclus|exclu`)

**experiences[].realisations[]**
- identité : `id` (stable)
- contenu : `description`
- optionnel : `impact`

### 3.4 Compétences
**competences.explicit**
- `techniques[]`
- `soft_skills[]`

**competences.inferred**
- `techniques[]` (objets avec `name/confidence/reasoning/sources`)
- `tools[]`
- `soft_skills[]`

**tracking**
- `rejected_inferred[]` (liste des suggestions rejetées pour ne pas reproposer)

### 3.5 Formations
**formations[]**
- `diplome`
- `ecole` / `etablissement` (selon format)
- `annee` ou dates (selon format)
- `weight` (`important|inclus|exclu`)

### 3.6 Certifications
**certifications[]**
- canon : objets (nom, organisme, date_obtention…)
- legacy fréquent : `string[]`

### 3.7 Langues
**langues[]**
- `nom` / `langue`
- `niveau` (CECRL possible A1…C2, Natif)
- `weight` (selon format UI)

### 3.8 Références / Clients / Preuves
**references.clients[]**
- `nom`
- `secteur`
- `sources[]` (optionnel)

**references.projets_marquants[]**, **publications/interventions** (si alimentés)

### 3.9 Infos additionnelles
Zone extensible pour des catégories non “core” (bénévolat, hobbies, centres d’intérêt, etc.), selon les profils.

### 3.10 Métadonnées système
**metadata**
- `version`
- `created_at`
- `last_updated`
- `last_merge_at`
- `documents_sources[]`
- `sources_count`
- `completeness_score`
- `merge_history[]`

## 4) Schéma “legacy” (le plus utilisé dans l’app)
Dans l’application, les types et formats réellement manipulés tolèrent plusieurs représentations (compat).

### 4.1 Racine (legacy)
- `profil?`
- `experiences?`
- `competences?`
- `formations?`
- `langues?` (souvent `Record<string,string>`)
- `projets?`
- `certifications?` (souvent `string[]`)
- `references?`
- `contexte_enrichi?`

### 4.2 Champs calculés (legacy)
- `score` (complétude)
- `breakdown`
- `topJobs`

### 4.3 Qualité / extraction (legacy)
- `quality_metrics` (quantification, count clients/certifs, scores qualité)
- `extraction_metadata` (model Gemini utilisé, date, docs traités, warnings)

Référence : [rag.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/types/rag.ts)

## 5) Mapping canon → legacy → UI/API (principaux)
Cette section liste les clés telles qu’elles existent dans les différents points d’entrée.

### 5.0 Tableau de correspondance (raccourci)
| Catégorie | Canon (chemin) | Legacy / synonymes acceptés | UI (si éditable) | API (écrit/maj) |
|---|---|---|---|---|
| Identité | `profil.prenom`, `profil.nom` | `prenom`, `nom` (flat) | `personalInfoSchema` | `/api/profile/update-item` |
| Titre | `profil.titre_principal` | `titre_principal` (flat) | `personalInfoSchema` | `/api/profile/update-item` |
| Localisation | `profil.localisation` | `localisation` (flat) | `personalInfoSchema` | `/api/profile/update-item` |
| Pitch | `profil.elevator_pitch` | `elevator_pitch` (flat) | (UI variable) | `/api/profile/update-item` |
| Contact | `profil.contact.*` | `contact` (flat) | `personalInfoSchema` | `/api/profile/update-item` |
| Photo | `profil.photo_url` | `photo_url` (flat) | Upload photo | `/api/profile/photo` |
| Expériences | `experiences[]` | `experiences[]` | `experienceSchema` | `/api/profile/update-item` |
| Dates exp. | `experiences[].debut/fin` | `date_debut|debut|start_date|…` / `date_fin|fin|end_date|…` | `experienceSchema` | `/api/profile/update-item` |
| Réalisations | `experiences[].realisations[]` | `string[]` ou `{description,impact}` | (UI: realisation) | `/api/profile/update-item`, `/api/profile/delete-item` |
| Compétences explicites | `competences.explicit.*` | `competences.techniques[]`, `competences.soft_skills[]` | `skillSchema` | `/api/profile/add-skill`, `/api/profile/update-item` |
| Compétences inférées | `competences.inferred.*` | (structures IA) | (UI: accepter/rejeter) | `/api/profile/reject-skill` |
| Formations | `formations[]` | `formations[]` | `formationSchema` | `/api/profile/update-item` |
| Certifications | `certifications[]` | `string[]` | UI “certification” | `/api/profile/update-item`, `/api/profile/delete-item` |
| Langues | `langues[]` | `Record<string,string>` | `languageSchema` | `/api/profile/update-item` |
| Références clients | `references.clients[]` | `string[]` ou `{nom,secteur}` | (UI variable) | `/api/profile/update-item` |
| Contexte enrichi | `contexte_enrichi` | `any` | lecture | `/api/rag/generate` |
| Complétude | `metadata.completeness_score` | `score` (computed) | lecture | `/api/rag/generate` |
| Qualité | `quality_metrics` | `quality_metrics` | lecture | `/api/rag/generate` |
| Extraction | `extraction_metadata` | `extraction_metadata` | lecture | `/api/rag/generate` |
| Jobs suggérés | (hors profil) | `top_10_jobs` | lecture | `/api/rag/suggest-jobs` |
| Notes | (hors profil) | `custom_notes` | UI notes | (écrit via UI profil) |

### 5.1 Profil (UI) → profil.contact (canon)
UI (validation formulaire) : `prenom, nom, email, telephone, adresse, localisation, titre_principal, linkedin, github, site_web`
- `site_web` (UI) mappe le plus souvent vers `profil.contact.portfolio` ou `profil.contact.website` selon conventions.

Référence : [profile.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/validations/profile.ts)

### 5.2 Expériences : clés de dates acceptées (synonymes)
Normalisation accepte (entrée → canonical) :
- début : `date_debut | debut | start_date | startDate | dateDebut | date_start`
- fin : `date_fin | fin | end_date | endDate | dateFin | date_end`

Référence : [normalize-rag.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/utils/normalize-rag.ts)

### 5.3 Compétences : compat “flat” → `competences.explicit`
Si `competences.techniques[]` existe (legacy), elle est fusionnée dans `competences.explicit.techniques[]`.
Si `competences.explicit.techniques[]` est un `string[]`, conversion en objets `{ nom }` (canon).

Référence : [normalize-rag.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/utils/normalize-rag.ts)

### 5.4 Clients / Références
Formats rencontrés :
- `references.clients` : tableau d’objets `{nom, secteur}` ou tableau de `string`
- `experiences[].clients_references` : tableau de `string`

Points d’affichage/usage :
- UI profil (vue) : “Clients & Références”
- CV : zone globale `clients_references.clients` + clients par expérience

### 5.5 Poids (filtrage contenu CV)
Valeurs : `important | inclus | exclu`
Où :
- `experiences[].weight`
- `formations[].weight`
- compétences (UI) via schéma `poids` (selon implémentation)

## 6) Champs observés & ambiguïtés connues
### 6.1 Langues
Deux représentations existent :
- canon : `langues[]` (liste structurée)
- legacy : `Record<string,string>` (ex: `{ "Anglais": "C1" }`)

### 6.2 Certifications
Deux représentations existent :
- canon : objets riches
- legacy : `string[]`

### 6.3 Réalisations
Représentation tolérée :
- `string[]` (ancien) ou `{description, impact}` (plus riche)
La normalisation force des `id` stables et déduplique par description.

### 6.4 Contexte enrichi
Structure non strictement typée dans `rag.ts` (`any`) : il faut la considérer comme une catégorie “déductions” extensible.

### 6.5 Références clients (secteurs)
Deux représentations existent :
- `references.clients[]` peut être un tableau d’objets `{nom, secteur}` (canon/legacy)
- ou un tableau de `string` (legacy) sans secteur

### 6.6 Contact (champs partiels)
Les profils legacy n’ont souvent qu’un sous-ensemble :
- `profil.contact` peut ne contenir que `email/telephone/linkedin`
- d’autres champs (portfolio/github/adresse…) peuvent être absents ou remonter “à la racine” selon certaines sources historiques

### 6.7 Projets / infos additionnelles
Ces catégories existent côté schéma canon, mais ne sont pas garanties :
- `projets[]` et `infos_additionnelles` peuvent être vides ou manquants selon la génération et les documents.

## 7) Points d’entrée applicatifs (où ça se crée/modifie)
- Génération profil depuis docs (écrit `completeness_details`) : `/api/rag/generate`
- Edition profil fine : `/api/profile/update-item`
- Ajout/rejet compétences : `/api/profile/add-skill`, `/api/profile/reject-skill`
- Photo : `/api/profile/photo`
- Suggestions jobs : `/api/rag/suggest-jobs`

## 8) Stratégie de migration recommandée (unification canon)
Objectif : converger vers un format unique proche de `RAGComplete` sans casser les profils existants.

1) **Définir une “sortie canonique” unique** (ex: `RAGComplete`) comme contrat interne.
2) **Normaliser en entrée** (sur lecture DB et sur write) : convertir legacy → canon (langues record → array, certifications string[] → objets minimaux, compétences flat → explicit).
3) **Séparer strictement** :
   - profil “utilisateur” (profil/experiences/competences/formations/langues/certifications/references)
   - méta “système” (metadata/extraction_metadata/quality_metrics)
4) **Garder compat** : conserver un adapter temporaire côté UI/API tant que des clients utilisent encore l’ancien format.
5) **Versionner** : utiliser `rag_version`/`metadata.version` pour migrations progressives et diagnostiquer les formats.

### Rollout conseillé
- **Phase A (lecture safe)** : lecture DB → normalisation → l’UI ne consomme que le format canon.
- **Phase B (écriture safe)** : les endpoints d’édition écrivent uniquement canon + maintiennent (si nécessaire) quelques champs legacy dérivés.
- **Phase C (backfill)** : job de migration DB qui convertit les anciens profils vers canon (idempotent).
- **Phase D (cleanup)** : suppression progressive des branches “legacy” quand `rag_version` ≥ N partout.

---

Références clés :
- Types canon : [rag-complete.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/types/rag-complete.ts)
- Types legacy : [rag.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/types/rag.ts)
- Normalisation : [normalize-rag.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/utils/normalize-rag.ts)
- Base : [01_tables.sql](file:///Users/gillesgozlan/Desktop/CV-Crush/01_tables.sql)
