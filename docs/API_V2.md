# API V2 - Documentation Complète

Documentation des endpoints API pour l'architecture V2 de génération de CV avec widgets.

## Table des Matières

- [Authentification](#authentification)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [POST /api/cv/generate-widgets](#post-apicvgenerate-widgets)
  - [POST /api/cv/generate-v2](#post-apicvgenerate-v2)
- [Cache Widgets](#cache-widgets)
- [Types et Schémas](#types-et-schémas)
- [Codes d'Erreur](#codes-derreur)
- [Exemples](#exemples)

---

## Authentification

Tous les endpoints V2 requièrent une authentification via Bearer token.

**Header requis** :
```
Authorization: Bearer <access_token>
```

Le token est obtenu via l'authentification Supabase côté client.

---

## Rate Limiting

Le rate limiting est appliqué selon le tier de l'utilisateur :

| Tier | Limite | Fenêtre |
|------|--------|---------|
| Free | 10 requêtes | 1 heure |
| Pro | 50 requêtes | 1 heure |
| Team | 200 requêtes | 1 heure |

**Response en cas de limite atteinte** :
```json
{
  "error": "Rate limit exceeded",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600,
  "resetAt": "2026-01-23T12:00:00Z"
}
```

**Status Code** : `429 Too Many Requests`

---

## Endpoints

### POST /api/cv/generate-widgets

Génère uniquement les widgets AI depuis le profil RAG et l'analyse d'offre. Cette endpoint est optimisée pour l'architecture "Frankenstein" client-side où la conversion et le rendu sont effectués côté client.

#### Description

- **Génère** : Widgets AI scorés (format `AIWidgetsEnvelope`)
- **Ne fait PAS** : Conversion widgets → CVData, fit template, sauvegarde CV
- **Cache** : Automatique (24h TTL)
- **Usage** : Pour architecture client-side où le client gère la conversion

#### Request

**URL** : `/api/cv/generate-widgets`

**Method** : `POST`

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```typescript
{
  analysisId: string;  // ID de l'analyse d'offre (requis)
  jobId?: string;      // ID de l'offre (optionnel)
}
```

**Exemple** :
```json
{
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "jobId": "optional-job-id"
}
```

#### Response

**Success (200)** :
```typescript
{
  success: true;
  widgets: AIWidgetsEnvelope;
  metadata: {
    analysisId: string;
    jobId?: string;
    generatedAt: string;           // ISO 8601
    widgetsCount: number;
    model: string;                  // "gemini-3-pro-preview"
    ragCompletenessScore: number;   // 0-100
    optimalMinScore: number;        // Score minimum recommandé
    cached?: boolean;               // true si récupéré du cache
  };
  jobOfferContext: JobOfferContext; // Contexte pour scoring avancé
}
```

**Exemple** :
```json
{
  "success": true,
  "widgets": {
    "profil_summary": {
      "prenom": "Jean",
      "nom": "Dupont",
      "titre_principal": "Développeur Full Stack Senior",
      "localisation": "Paris, France",
      "elevator_pitch": "8 ans d'expérience..."
    },
    "widgets": [
      {
        "id": "widget_1",
        "type": "experience_bullet",
        "section": "experiences",
        "text": "Développement d'une application React avec 50k+ utilisateurs",
        "relevance_score": 85,
        "sources": {
          "rag_experience_id": "exp_0",
          "rag_realisation_id": "real_5"
        }
      }
    ],
    "meta": {
      "model": "gemini-3-pro-preview",
      "created_at": "2026-01-23T10:00:00Z"
    }
  },
  "metadata": {
    "analysisId": "550e8400-e29b-41d4-a716-446655440000",
    "generatedAt": "2026-01-23T10:00:00Z",
    "widgetsCount": 25,
    "model": "gemini-3-pro-preview",
    "ragCompletenessScore": 78,
    "optimalMinScore": 60,
    "cached": false
  },
  "jobOfferContext": {
    "title": "Développeur Full Stack",
    "company": "Tech Corp",
    "keywords": ["React", "Node.js", "TypeScript"],
    "missing_keywords": ["GraphQL"]
  }
}
```

**Cache Hit** :
Si les widgets sont récupérés du cache, `metadata.cached` sera `true` et le temps de réponse sera < 500ms.

#### Codes d'Erreur

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Token manquant ou invalide |
| `MISSING_ANALYSIS_ID` | 400 | `analysisId` manquant dans le body |
| `ANALYSIS_NOT_FOUND` | 404 | Analyse d'offre introuvable |
| `RAG_PROFILE_NOT_FOUND` | 404 | Profil RAG introuvable |
| `RAG_INCOMPLETE` | 400 | Profil RAG incomplet |
| `RAG_NORMALIZATION_FAILED` | 500 | Erreur normalisation RAG |
| `WIDGETS_GENERATION_FAILED` | 500 | Échec génération widgets |
| `WIDGETS_GENERATION_ERROR` | 500 | Erreur lors de l'appel Gemini |
| `RATE_LIMIT_EXCEEDED` | 429 | Limite de requêtes atteinte |
| `INTERNAL_ERROR` | 500 | Erreur serveur inattendue |

---

### POST /api/cv/generate-v2

Génère un CV complet V2 (widgets → CVData → template fitting → sauvegarde). Cette endpoint effectue tout le pipeline côté serveur.

#### Description

- **Génère** : Widgets AI → Conversion → Template fitting → CV final
- **Sauvegarde** : CV dans `cv_generations` avec métadonnées V2
- **Retourne** : CVData complet prêt pour affichage
- **Usage** : Pour génération complète côté serveur

#### Request

**URL** : `/api/cv/generate-v2`

**Method** : `POST`

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```typescript
{
  analysisId: string;      // ID de l'analyse d'offre (requis)
  template?: string;        // Nom du template (défaut: "modern")
  includePhoto?: boolean;  // Inclure photo (défaut: false)
  minScore?: number;       // Score minimum widgets (défaut: 50)
  maxExperiences?: number; // Max expériences (défaut: 6)
  maxBulletsPerExperience?: number; // Max bullets par exp (défaut: 6)
}
```

**Templates disponibles** :
- `modern` (défaut)
- `tech`
- `compact`
- `spacious`

**Exemple** :
```json
{
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "template": "tech",
  "includePhoto": true,
  "minScore": 60,
  "maxExperiences": 5
}
```

#### Response

**Success (200)** :
```typescript
{
  success: true;
  cvId: string;              // ID du CV généré
  cvData: CVData;            // Données CV complètes
  metadata: {
    generator_type: "v2_widgets";
    widgets_total: number;
    widgets_filtered: number;
    generator_model: string;
    generator_version: string;
    relevance_scoring_applied: boolean;
    advanced_scoring_applied: boolean;
  };
  template: string;
  includePhoto: boolean;
}
```

**Exemple** :
```json
{
  "success": true,
  "cvId": "cv_123456",
  "cvData": {
    "profil": {
      "nom": "Dupont",
      "prenom": "Jean",
      "titre": "Développeur Full Stack Senior"
    },
    "experiences": [...],
    "competences": {...}
  },
  "metadata": {
    "generator_type": "v2_widgets",
    "widgets_total": 25,
    "widgets_filtered": 18,
    "generator_model": "gemini-3-pro-preview",
    "generator_version": "6.2.5",
    "relevance_scoring_applied": true,
    "advanced_scoring_applied": true
  },
  "template": "tech",
  "includePhoto": true
}
```

#### Codes d'Erreur

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Token manquant ou invalide |
| `MISSING_ANALYSIS_ID` | 400 | `analysisId` manquant |
| `ANALYSIS_NOT_FOUND` | 404 | Analyse introuvable |
| `RAG_PROFILE_NOT_FOUND` | 404 | Profil RAG introuvable |
| `WIDGETS_GENERATION_ERROR` | 500 | Erreur génération widgets |
| `WIDGETS_CONVERSION_ERROR` | 500 | Erreur conversion widgets |
| `CV_TEMPLATE_FITTING_ERROR` | 500 | Erreur template fitting |
| `CV_SAVE_ERROR` | 500 | Erreur sauvegarde CV |
| `RATE_LIMIT_EXCEEDED` | 429 | Limite atteinte |
| `INTERNAL_ERROR` | 500 | Erreur serveur |

---

## Cache Widgets

### Architecture

Le cache widgets est géré automatiquement par l'endpoint `/api/cv/generate-widgets`.

**Table Supabase** : `widget_cache`

**Structure** :
```sql
CREATE TABLE widget_cache (
  id UUID PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  widgets JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
```

### Clé de Cache

La clé de cache est générée à partir de :
- `analysisId` : ID de l'analyse d'offre
- `ragCompletenessScore` : Score de complétude RAG (0-100)
- `jobDescriptionHash` : Hash SHA256 de la description d'offre (normalisée)

**Format** : `sha256(analysisId:ragScore:jobDescriptionHash)`

**Exemple** :
```
analysisId: "550e8400-..."
ragScore: 78
jobDescriptionHash: "a1b2c3d4..."
→ cache_key: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
```

### TTL et Invalidation

- **TTL** : 24 heures
- **Invalidation** : Automatique après expiration
- **Vérification** : À chaque requête, vérification `expires_at > NOW()`

### Performance

| Scénario | Temps Réponse |
|----------|---------------|
| Cache Hit | < 500ms |
| Cache Miss (Génération) | 15-30s |
| **Gain** | **30-60x plus rapide** |

### Utilisation

Le cache est **transparent** : aucune action requise côté client. L'endpoint gère automatiquement :
1. Vérification cache avant génération
2. Sauvegarde cache après génération réussie
3. Retour flag `cached: true` si cache hit

---

## Types et Schémas

### AIWidgetsEnvelope

```typescript
interface AIWidgetsEnvelope {
  profil_summary?: {
    prenom?: string;
    nom?: string;
    titre_principal?: string;
    localisation?: string;
    elevator_pitch?: string;
  };
  job_context?: {
    company?: string;
    job_title?: string;
    match_score?: number;
    keywords?: string[];
  };
  widgets: AIWidget[];
  meta?: {
    model?: string;
    created_at?: string;
    locale?: string;
    version?: string;
  };
}
```

### AIWidget

```typescript
interface AIWidget {
  id: string;
  type: "summary_block" | "experience_bullet" | "experience_header" | 
        "skill_item" | "skill_group" | "education_item" | 
        "project_item" | "language_item" | "meta_note";
  section: "header" | "summary" | "experiences" | "skills" | 
          "education" | "projects" | "languages" | "references" | "meta";
  text: string;
  relevance_score: number;  // 0-100
  sources?: {
    rag_experience_id?: string;
    rag_realisation_id?: string;
    rag_path?: string;
  };
  quality?: {
    has_numbers?: boolean;
    length?: number;
    grounded?: boolean;
  };
}
```

### JobOfferContext

```typescript
interface JobOfferContext {
  title?: string;
  company?: string;
  location?: string;
  keywords: string[];
  missing_keywords?: string[];
  description?: string;
}
```

---

## Codes d'Erreur

Tous les codes d'erreur retournent un format standardisé :

```typescript
{
  error: string;           // Message d'erreur lisible
  errorCode: string;      // Code d'erreur unique
  details?: string;        // Détails techniques (optionnel)
  userMessage?: string;    // Message utilisateur-friendly (optionnel)
}
```

**Codes d'erreur** :

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentification requise |
| `MISSING_ANALYSIS_ID` | Paramètre `analysisId` manquant |
| `ANALYSIS_NOT_FOUND` | Analyse d'offre introuvable |
| `RAG_PROFILE_NOT_FOUND` | Profil RAG introuvable |
| `RAG_INCOMPLETE` | Profil RAG incomplet |
| `RAG_NORMALIZATION_FAILED` | Erreur normalisation RAG |
| `WIDGETS_GENERATION_FAILED` | Échec génération widgets |
| `WIDGETS_GENERATION_ERROR` | Erreur lors de l'appel Gemini |
| `WIDGETS_CONVERSION_ERROR` | Erreur conversion widgets |
| `CV_TEMPLATE_FITTING_ERROR` | Erreur template fitting |
| `CV_SAVE_ERROR` | Erreur sauvegarde CV |
| `RATE_LIMIT_EXCEEDED` | Limite de requêtes atteinte |
| `INTERNAL_ERROR` | Erreur serveur inattendue |

---

## Exemples

### Exemple 1 : Génération Widgets avec Cache

```typescript
// Première requête (génération)
const response1 = await fetch('/api/cv/generate-widgets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    analysisId: '550e8400-e29b-41d4-a716-446655440000'
  })
});

const data1 = await response1.json();
console.log('Cached:', data1.metadata.cached); // false
console.log('Widgets:', data1.widgets.widgets.length); // 25

// Deuxième requête identique (cache hit)
const response2 = await fetch('/api/cv/generate-widgets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    analysisId: '550e8400-e29b-41d4-a716-446655440000'
  })
});

const data2 = await response2.json();
console.log('Cached:', data2.metadata.cached); // true
console.log('Widgets:', data2.widgets.widgets.length); // 25 (identique)
```

### Exemple 2 : Génération CV Complet V2

```typescript
const response = await fetch('/api/cv/generate-v2', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    analysisId: '550e8400-e29b-41d4-a716-446655440000',
    template: 'tech',
    includePhoto: true,
    minScore: 60,
    maxExperiences: 5
  })
});

const data = await response.json();
console.log('CV ID:', data.cvId);
console.log('Widgets total:', data.metadata.widgets_total);
console.log('Widgets filtrés:', data.metadata.widgets_filtered);
```

### Exemple 3 : Gestion Erreurs

```typescript
try {
  const response = await fetch('/api/cv/generate-widgets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ analysisId: 'invalid-id' })
  });

  if (!response.ok) {
    const error = await response.json();
    
    switch (error.errorCode) {
      case 'ANALYSIS_NOT_FOUND':
        console.error('Analyse introuvable');
        break;
      case 'RAG_PROFILE_NOT_FOUND':
        console.error('Profil RAG manquant');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error(`Limite atteinte. Réessayer après ${error.retryAfter}s`);
        break;
      default:
        console.error('Erreur:', error.userMessage || error.error);
    }
  }
} catch (error) {
  console.error('Erreur réseau:', error);
}
```

---

## Notes Importantes

1. **Cache** : Le cache est automatique et transparent. Aucune action requise.
2. **Rate Limiting** : Respecter les limites selon le tier pour éviter les erreurs 429.
3. **Validation** : Tous les widgets sont validés avec Zod avant retour.
4. **Performance** : Utiliser `/api/cv/generate-widgets` pour architecture client-side optimale.
5. **Advanced Scoring** : Disponible via `jobOfferContext` dans la réponse.

---

## Support

Pour questions ou problèmes :
- Consulter [ARCHITECTURE_V2.md](../ARCHITECTURE_V2.md) pour détails techniques
- Vérifier les logs serveur pour debugging
- Contacter le support technique si erreurs persistantes
