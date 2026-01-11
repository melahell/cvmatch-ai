# AUDIT COMPLET - SYSTÈME RAG ET DONNÉES PERSONNELLES

**Date:** 2026-01-09
**Auteur:** Claude (Audit de sécurité)
**Objet:** Audit approfondi du traitement des données personnelles dans CVMatch AI

---

## 🔴 RÉSUMÉ EXÉCUTIF - FINDINGS CRITIQUES

### Question principale: Est-ce que l'email et l'adresse sont stockés lors de l'upload de CV?

**RÉPONSE: OUI ✅ - Les données personnelles suivantes sont EXTRAITES et STOCKÉES:**

| Donnée Personnelle | Extraite? | Stockée? | Envoyée à Google? | Localisation |
|-------------------|-----------|----------|-------------------|--------------|
| **Email** | ✅ OUI | ✅ OUI | ✅ OUI | `rag_metadata.completeness_details.profil.contact.email` |
| **Téléphone** | ✅ OUI | ✅ OUI | ✅ OUI | `rag_metadata.completeness_details.profil.contact.telephone` |
| **LinkedIn** | ✅ OUI | ✅ OUI | ✅ OUI | `rag_metadata.completeness_details.profil.contact.linkedin` |
| **Localisation (adresse)** | ✅ OUI | ✅ OUI | ✅ OUI | `rag_metadata.completeness_details.profil.localisation` |
| **Nom complet** | ✅ OUI | ✅ OUI | ✅ OUI | `rag_metadata.completeness_details.profil.nom/prenom` |
| **Historique emplois** | ✅ OUI | ✅ OUI | ✅ OUI | `rag_metadata.completeness_details.experiences[]` |
| **Formations/Écoles** | ✅ OUI | ✅ OUI | ✅ OUI | `rag_metadata.completeness_details.formations[]` |

### 🚨 Problèmes Critiques Identifiés

1. **Exposition à un tiers (Google Gemini)** - Toutes les données personnelles sont envoyées à Google à CHAQUE analyse
2. **Absence de consentement explicite** - L'utilisateur n'est pas informé que ses données vont chez Google
3. **Clés Supabase hardcodées** - Risque d'exposition si le code source fuite
4. **GitHub Storage non implémenté** - Divergence majeure vs spécifications (données devaient être sur GitHub)
5. **Pas de droit à l'oubli** - Aucun endpoint pour supprimer les données (RGPD non-conforme)
6. **Pas d'audit trail** - Aucune traçabilité des accès aux données sensibles

---

## 📊 FLUX COMPLET DES DONNÉES PERSONNELLES

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. UTILISATEUR UPLOAD CV (PDF/DOCX)                                 │
│    Route: /api/rag/upload                                           │
│    Fichier: app/api/rag/upload/route.ts                             │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. STOCKAGE FICHIER SUPABASE STORAGE                                │
│    Path: documents/{userId}/{timestamp}_{filename}                  │
│    Status: "pending" dans uploaded_documents table                  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. EXTRACTION + ENVOI À GOOGLE GEMINI ❌ POINT CRITIQUE             │
│    Route: /api/rag/generate                                         │
│    Fichier: app/api/rag/generate/route.ts                           │
│                                                                     │
│    a) Télécharge fichier depuis Storage                            │
│    b) Extrait TOUT le texte (pdf-parse / mammoth)                  │
│    c) Combine en allExtractedText                                   │
│    d) ENVOIE TOUT À GOOGLE: models.flash.generateContent()         │
│       → Prompt demande: nom, prenom, email, telephone, linkedin    │
│       → Source: lib/ai/prompts.ts:4-48                             │
│    e) Parse réponse JSON de Gemini                                  │
│    f) Stocke dans rag_metadata.completeness_details (JSONB)        │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. STOCKAGE BASE DE DONNÉES SUPABASE                                │
│    Table: rag_metadata                                              │
│    Colonne: completeness_details (JSONB)                            │
│    Contenu:                                                         │
│    {                                                                │
│      "profil": {                                                    │
│        "nom": "Gozlan",                                             │
│        "prenom": "Gilles",                                          │
│        "localisation": "France",                                    │
│        "contact": {                                                 │
│          "email": "gilles@example.com",      ← STOCKÉ              │
│          "telephone": "+33 6 XX XX XX XX",   ← STOCKÉ              │
│          "linkedin": "linkedin.com/in/..."   ← STOCKÉ              │
│        }                                                            │
│      },                                                             │
│      "experiences": [...],                                          │
│      "formations": [...]                                            │
│    }                                                                │
│                                                                     │
│    Table: uploaded_documents                                        │
│    Colonne: extracted_text (TEXT)                                   │
│    Contenu: Texte complet du CV (incluant toutes les données)      │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. RÉUTILISATION ET RÉENVOI À GOOGLE (CHAQUE OPÉRATION)            │
│                                                                     │
│    ┌──────────────────────────────────────────────────────┐       │
│    │ A) ANALYSE DE MATCH JOB                              │       │
│    │    Route: /api/match/analyze                         │       │
│    │    Ligne 73: getMatchAnalysisPrompt(                 │       │
│    │              ragData.completeness_details, ...)      │       │
│    │    → ENVOIE email + téléphone + linkedin à Gemini    │       │
│    └──────────────────────────────────────────────────────┘       │
│                                                                     │
│    ┌──────────────────────────────────────────────────────┐       │
│    │ B) GÉNÉRATION CV OPTIMISÉ                            │       │
│    │    Route: /api/cv/generate                           │       │
│    │    Ligne 44: getCVOptimizationPrompt(profile, ...)   │       │
│    │    → ENVOIE profil complet avec contacts à Gemini    │       │
│    └──────────────────────────────────────────────────────┘       │
│                                                                     │
│    ┌──────────────────────────────────────────────────────┐       │
│    │ C) GÉNÉRATION LETTRE DE MOTIVATION                   │       │
│    │    Route: /api/lm/generate                           │       │
│    │    Ligne 27: JSON.stringify(                         │       │
│    │              rag.completeness_details.profil)        │       │
│    │    → ENVOIE profil avec email/tel/linkedin à Gemini  │       │
│    └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘

RÉSULTAT: Les données personnelles sont ENVOYÉES À GOOGLE GEMINI:
- 1 fois lors de l'extraction initiale
- + 1 fois par analyse de job
- + 1 fois par génération de CV
- + 1 fois par génération de lettre de motivation

Pour un utilisateur typique (10 jobs analysés):
→ Données envoyées à Google: 1 + 10 + 10 + 10 = 31 fois
```

---

## 🔍 ANALYSE DÉTAILLÉE PAR COMPOSANT

### 1. EXTRACTION DES DONNÉES - `/app/api/rag/generate/route.ts`

**Lignes critiques:**

```typescript
// Ligne 32: Combine TOUT le texte extrait
let allExtractedText = "";

// Ligne 61: Ajoute le texte complet (incluant email, tel, adresse)
allExtractedText += `\n--- DOCUMENT: ${doc.filename} ---\n${text}\n`;

// Ligne 71: Envoie TOUT à Google Gemini
const prompt = getRAGExtractionPrompt(allExtractedText);
const result = await models.flash.generateContent(prompt);  // ← ENVOI À GOOGLE

// Ligne 114-128: Stocke les données extraites en base
completeness_details: ragData,  // Contient email, tel, linkedin
```

**Commentaire révélateur (ligne 114-117):**
```typescript
// Storing full RAG here for simplicity in POC instead of GitHub if simpler,
// but Plan said Github.
// Let's stick to the plan: Plan said GitHub.
// But I don't have GitHub setup logic in this file yet.
// For now, I will store in `completeness_details` column which is JSONB,
// to unblock the flow.
```

**❌ PROBLÈME:** Le plan initial prévoyait GitHub, mais les données sont stockées en DB Supabase.

---

### 2. PROMPT D'EXTRACTION - `/lib/ai/prompts.ts`

**Lignes 4-48: Schéma d'extraction demandé à Gemini**

```typescript
export const getRAGExtractionPrompt = (extractedText: string) => `
Tu es un expert en extraction et structuration de données professionnelles.

DOCUMENTS FOURNIS:
${extractedText}  // ← Texte COMPLET du CV

MISSION:
Extrais et structure TOUTES les informations selon ce schéma JSON.

SCHÉMA CIBLE (JSON uniquement) :
{
  "profil": {
    "nom": "string",
    "prenom": "string",
    "titre_principal": "string",
    "localisation": "string",  // ← ADRESSE
    "contact": {
      "email": "string",        // ← EMAIL EXTRAIT
      "telephone": "string",    // ← TÉLÉPHONE EXTRAIT
      "linkedin": "string"      // ← LINKEDIN EXTRAIT
    },
    "elevator_pitch": "string (2-3 phrases max)"
  },
  "experiences": [...],
  "formations": [...]
}
`;
```

**✅ CONFIRMÉ:** Le prompt demande explicitement l'extraction de email, téléphone et LinkedIn.

---

### 3. STOCKAGE BASE DE DONNÉES - `01_tables.sql`

**Table `users` (lignes 10-22):**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,  -- ← EMAIL STOCKÉ ICI AUSSI
  whatsapp VARCHAR(50),                -- ← TÉLÉPHONE WHATSAPP
  user_id VARCHAR(100),
  github_rag_path VARCHAR(500),        -- ← Non utilisé (NULL pour tous)
  onboarding_completed BOOLEAN,
  ...
);
```

**Table `rag_metadata` (lignes 32-41):**
```sql
CREATE TABLE rag_metadata (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completeness_score INTEGER,
  completeness_details JSONB,  -- ← CONTIENT TOUTES LES DONNÉES PERSO
  top_10_jobs JSONB,
  ...
);
```

**Exemple de contenu `completeness_details`:**
```json
{
  "profil": {
    "nom": "Gozlan",
    "prenom": "Gilles",
    "titre_principal": "Senior PMO & Quality Manager",
    "localisation": "France",
    "contact": {
      "email": "gilles.gozlan@example.com",     // ← STOCKÉ EN CLAIR
      "telephone": "+33 6 12 34 56 78",         // ← STOCKÉ EN CLAIR
      "linkedin": "linkedin.com/in/gilles-gozlan" // ← STOCKÉ EN CLAIR
    },
    "elevator_pitch": "Expert PMO avec 15 ans d'expérience..."
  },
  "experiences": [
    {
      "poste": "PMO & Quality Manager",
      "entreprise": "Volkswagen Financial Services",
      "debut": "2020",
      "fin": "2023",
      "actuel": false,
      "realisations": [...],
      "technologies": [...]
    }
  ],
  "formations": [...],
  "langues": {...}
}
```

**❌ PROBLÈME:** Données en clair dans PostgreSQL (pas de chiffrement applicatif).

---

### 4. ENVOI À GOOGLE GEMINI - Analyse des 4 routes

#### A) Route `/api/match/analyze` - Analyse de Match Job

**Fichier:** `app/api/match/analyze/route.ts`

**Ligne 22-26: Récupération du profil**
```typescript
const { data: ragData, error: dbError } = await supabase
    .from("rag_metadata")
    .select("completeness_details")  // ← Contient email, tel, linkedin
    .eq("user_id", userId)
    .single();
```

**Ligne 73: Envoi à Gemini**
```typescript
const prompt = getMatchAnalysisPrompt(
    ragData.completeness_details,  // ← PROFIL COMPLET ENVOYÉ
    fullJobText
);
const result = await models.flash.generateContent(prompt);  // ← GOOGLE GEMINI
```

**Prompt utilisé (lib/ai/prompts.ts:75-101):**
```typescript
export const getMatchAnalysisPrompt = (userProfile: any, jobText: string) => `
Tu es un expert RH / Career Coach.

PROFIL DU CANDIDAT :
${JSON.stringify(userProfile)}  // ← TOUT LE PROFIL (email, tel, linkedin inclus)

OFFRE D'EMPLOI :
${jobText}
...
`;
```

**❌ IMPACT:** Chaque analyse de job = 1 envoi des données personnelles à Google.

---

#### B) Route `/api/cv/generate` - Génération CV Optimisé

**Fichier:** `app/api/cv/generate/route.ts`

**Ligne 29-37: Récupération du profil**
```typescript
const { data: ragData, error: ragError } = await supabase
    .from("rag_metadata")
    .select("completeness_details")
    .eq("user_id", userId)
    .single();

const profile = ragData.completeness_details;  // ← Profil complet
```

**Ligne 44: Envoi à Gemini**
```typescript
const prompt = getCVOptimizationPrompt(profile, jobDescription);
const result = await models.flash.generateContent(prompt);  // ← GOOGLE GEMINI
```

**Prompt utilisé (lib/ai/prompts.ts:103-129):**
```typescript
export const getCVOptimizationPrompt = (profile: any, jobDescription: string) => `
Tu es un expert en rédaction de CV (CV Writer).

CANDIDAT (JSON) :
${JSON.stringify(profile)}  // ← PROFIL COMPLET avec contact.email, contact.telephone
...
`;
```

**❌ IMPACT:** Chaque génération de CV = 1 envoi des données personnelles à Google.

---

#### C) Route `/api/lm/generate` - Génération Lettre de Motivation

**Fichier:** `app/api/lm/generate/route.ts`

**Ligne 18: Récupération du profil**
```typescript
const { data: rag } = await supabase
    .from("rag_metadata")
    .select("completeness_details")
    .eq("user_id", userId)
    .single();
```

**Ligne 22-28: Envoi à Gemini**
```typescript
const prompt = `
    Tu es un expert en recrutement. Rédige une Lettre de Motivation...

    CANDIDAT:
    ${JSON.stringify(rag.completeness_details.profil)}  // ← PROFIL avec email/tel
    Expériences clés: ${JSON.stringify(rag.completeness_details.experiences.slice(0, 2))}
    ...
`;
const result = await models.flash.generateContent(prompt);  // ← GOOGLE GEMINI
```

**❌ IMPACT:** Chaque génération de lettre = 1 envoi des données personnelles à Google.

---

### 5. GITHUB STORAGE NON IMPLÉMENTÉ

**Fichier:** `lib/github.ts`

**Fonction `pushToGitHub` existe (lignes 13-54):**
```typescript
export async function pushToGitHub(path: string, content: string, message: string) {
    if (!GITHUB_TOKEN) {
        console.warn("GITHUB_TOKEN missing, skipping GitHub sync");
        return null;
    }

    try {
        // Code fonctionnel pour push sur GitHub
        const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: path,
            message: message,
            content: Buffer.from(content).toString('base64'),
            sha: sha,
        });
        return response.data;
    } catch (error) {
        console.error("GitHub Push Error:", error);
        return null;
    }
}
```

**Utilisation dans le code:**
```bash
$ grep -r "pushToGitHub" --include="*.ts" --include="*.tsx"
lib/github.ts:export async function pushToGitHub(path: string, content: string, message: string)
app/api/rag/generate/route.ts:import { pushToGitHub } from "@/lib/github";
```

**❌ PROBLÈME:** La fonction est importée dans `/app/api/rag/generate/route.ts` ligne 3, mais **JAMAIS APPELÉE**.

**Commentaire dans le code (ligne 114-117):**
> "Let's stick to the plan: Plan said Github. But I don't have GitHub setup logic in this file yet. For now, I will store in `completeness_details` column which is JSONB, to unblock the flow."

**❌ CONSÉQUENCE:**
- Les données RAG ne sont PAS versionnées sur GitHub
- L'utilisateur n'a PAS le contrôle de ses données
- Divergence majeure avec le cahier des charges (CDC)

---

### 6. CLÉS SUPABASE HARDCODÉES

**Fichier:** `lib/supabase.ts`

**Lignes 4-6: Clés hardcodées en fallback**
```typescript
// Fallback keys for Vercel environments where variables might be missing temporarily
const FALLBACK_URL = "https://tyaoacdfxigxffdbhqja.supabase.co";
const FALLBACK_KEY = "sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
    //...
```

**🔴 CRITIQUE:** Si le code source est publié ou leaké:
- La clé `sb_publishable_jfSZuKZ5ZzCwdJvNV7nGJQ_t3f79x70` permet l'accès à Supabase
- Les RLS policies protègent par userId, mais la clé reste un risque
- Best practice: JAMAIS de fallback hardcodé

---

### 7. ABSENCE DE DROIT À L'OUBLI (RGPD)

**Recherche de endpoints de suppression:**
```bash
$ grep -r "DELETE" app/api --include="*.ts"
# Aucun résultat pour des endpoints /api/user/delete ou /api/rag/delete
```

**Cascade DELETE configuré en base:**
```sql
-- 01_tables.sql ligne 34
user_id UUID REFERENCES users(id) ON DELETE CASCADE
```

**❌ PROBLÈME:**
- La base de données supporte CASCADE DELETE
- Mais **aucune API** pour permettre à l'utilisateur de déclencher la suppression
- Pas d'interface UI pour supprimer le compte
- L'utilisateur ne peut PAS exercer son droit à l'oubli RGPD

**RGPD Article 17 - Droit à l'effacement:**
> "La personne concernée a le droit d'obtenir du responsable du traitement l'effacement, dans les meilleurs délais, de données à caractère personnel la concernant."

**❌ NON-CONFORMITÉ RGPD**

---

### 8. ABSENCE D'AUDIT TRAIL

**Recherche de logs d'audit:**
```bash
$ grep -r "audit" --include="*.sql"
# Aucune table audit_logs ou similar

$ grep -r "analytics_events" 01_tables.sql
# Table existe mais ne logge que les événements métier, pas les accès données
```

**❌ MANQUE:**
- Pas de log quand un email est lu depuis `rag_metadata`
- Pas de log quand des données sont envoyées à Google Gemini
- Pas de log des modifications de données personnelles
- Pas de log des exports ou consultations

**Impact:** En cas d'incident, impossible de savoir:
- Qui a accédé aux données?
- Quand?
- Combien de fois les données ont été envoyées à Google?

---

## 📋 TABLEAU DE CONFORMITÉ vs SPÉCIFICATIONS

| Spécification CDC | Statut | Commentaire |
|-------------------|--------|-------------|
| RAG stocké sur GitHub | ❌ NON | Fonction existe mais jamais appelée |
| Utilisateur contrôle ses données | ❌ NON | Données en DB Supabase, pas GitHub |
| RGPD - Droit à l'oubli | ❌ NON | Aucun endpoint de suppression |
| RGPD - Consentement explicite | ❌ NON | Pas de consentement pour envoi à Google |
| RLS activé | ✅ OUI | Toutes les tables ont RLS |
| Cascade DELETE | ✅ OUI | Configuré en base (mais pas accessible) |
| Données sensibles chiffrées | ⚠️ PARTIEL | Chiffrement at-rest Supabase, pas applicatif |
| Audit trail | ❌ NON | Pas de logs des accès aux données |
| Authentification OAuth | ✅ OUI | Via Supabase Auth |
| HTTPS | ✅ OUI | Vercel + Supabase utilisent TLS |

**Score de conformité: 4/10** (40%)

---

## 🎯 RECOMMANDATIONS IMMÉDIATES

### Priorité 1 - BLOQUANT PRODUCTION (À faire AVANT mise en prod)

#### 1.1 Supprimer les clés hardcodées
```typescript
// lib/supabase.ts - SUPPRIMER les lignes 4-6
// ❌ const FALLBACK_URL = "https://...";
// ❌ const FALLBACK_KEY = "sb_publishable_...";

export const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase config missing - check environment variables");
    }

    return createClient(supabaseUrl, supabaseKey);
};
```

#### 1.2 Ajouter consentement explicite pour Google Gemini
```typescript
// Ajouter un step dans le onboarding
// app/onboarding/consent/page.tsx (à créer)

"En continuant, j'autorise CVMatch AI à :
☐ Analyser mon CV avec Google Gemini AI pour extraire mes informations professionnelles
☐ Utiliser mes données de profil pour générer des analyses de match personnalisées

Note : Vos données sont traitées conformément à notre Politique de Confidentialité.
Google Gemini traite vos données selon les conditions de Google Cloud Platform."

// Stocker dans users table
ALTER TABLE users ADD COLUMN gemini_consent BOOLEAN DEFAULT false;
```

#### 1.3 Implémenter le droit à l'oubli
```typescript
// app/api/user/delete/route.ts (à créer)
export async function DELETE(req: Request) {
    const supabase = createSupabaseClient();
    const { userId } = await req.json();

    // Vérifier authentification
    // ...

    // Supprimer l'utilisateur (CASCADE supprimera toutes les données)
    const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

    if (error) throw error;

    // Log de l'action
    console.log(`[AUDIT] User ${userId} deleted - GDPR right to be forgotten`);

    return NextResponse.json({ success: true });
}
```

```typescript
// Ajouter UI dans app/settings/page.tsx
<button onClick={deleteAccount} className="text-red-600">
    Supprimer mon compte et toutes mes données
</button>
```

---

### Priorité 2 - SÉCURITÉ DONNÉES (À faire dans les 2 semaines)

#### 2.1 Implémenter GitHub Storage selon CDC
```typescript
// app/api/rag/generate/route.ts - Ligne 131 (après l'insert en DB)

// Push to GitHub as per original plan
const githubPath = `${userId}/rag_profile.json`;
const ragContent = JSON.stringify(ragData, null, 2);
await pushToGitHub(githubPath, ragContent, `Update RAG profile for ${userId}`);

// Update github_rag_path in users table
await supabase
    .from("users")
    .update({ github_rag_path: githubPath })
    .eq("id", userId);
```

#### 2.2 Minimiser les données envoyées à Google
```typescript
// lib/ai/prompts.ts - Créer une fonction de sanitization

export const sanitizeProfileForAI = (profile: any) => {
    return {
        ...profile,
        profil: {
            ...profile.profil,
            contact: {
                email: "***@***.***",        // Masquer
                telephone: "+33 6 ** ** ** **", // Masquer
                linkedin: "[LinkedIn Profile]"  // Masquer
            }
        }
    };
};

// Utiliser dans les prompts:
const sanitized = sanitizeProfileForAI(userProfile);
const prompt = getMatchAnalysisPrompt(sanitized, jobText);
```

**Note:** Vérifier si Gemini a vraiment besoin de l'email/téléphone pour faire l'analyse de match. Probablement PAS NÉCESSAIRE.

#### 2.3 Ajouter audit trail
```sql
-- Créer table audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'email_sent_to_gemini', 'data_read', 'data_updated'
    resource_type VARCHAR(50),    -- 'rag_metadata', 'cv_generation'
    resource_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

```typescript
// lib/audit.ts (à créer)
export async function logAudit(params: {
    userId: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
}) {
    const supabase = createSupabaseClient();
    await supabase.from("audit_logs").insert({
        user_id: params.userId,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent')
    });
}

// Utiliser dans les routes:
await logAudit({
    userId,
    action: 'profile_sent_to_gemini',
    resourceType: 'match_analysis',
    resourceId: analysisId
});
```

---

### Priorité 3 - AMÉLIORATIONS (Dans les 4 semaines)

#### 3.1 Chiffrement applicatif des données sensibles
```typescript
// lib/crypto.ts (à créer)
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':');

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
```

```typescript
// Utiliser lors du stockage:
const encryptedEmail = encrypt(profile.contact.email);
await supabase.from("rag_metadata").insert({
    completeness_details: {
        ...ragData,
        profil: {
            ...ragData.profil,
            contact: {
                email: encryptedEmail,
                telephone: encrypt(ragData.profil.contact.telephone)
            }
        }
    }
});
```

#### 3.2 Ajouter export GDPR
```typescript
// app/api/user/export/route.ts (à créer)
export async function GET(req: Request) {
    const supabase = createSupabaseClient();
    const userId = req.headers.get('x-user-id');

    // Récupérer TOUTES les données de l'utilisateur
    const [user, rag, jobs, cvs, docs] = await Promise.all([
        supabase.from("users").select("*").eq("id", userId).single(),
        supabase.from("rag_metadata").select("*").eq("user_id", userId),
        supabase.from("job_analyses").select("*").eq("user_id", userId),
        supabase.from("cv_generations").select("*").eq("user_id", userId),
        supabase.from("uploaded_documents").select("*").eq("user_id", userId)
    ]);

    const exportData = {
        export_date: new Date().toISOString(),
        user: user.data,
        rag_profile: rag.data,
        job_analyses: jobs.data,
        cv_generations: cvs.data,
        uploaded_documents: docs.data
    };

    // Retourner en JSON
    return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="cvmatch_export_${userId}_${Date.now()}.json"`
        }
    });
}
```

#### 3.3 Masquer les données côté client
```typescript
// app/dashboard/page.tsx - Ligne 42
const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    return `${local[0]}***@${domain}`;
};

const maskPhone = (phone: string) => {
    return phone.replace(/\d(?=\d{4})/g, '*');
};

// Affichage
<p>Email: {maskEmail(profile.contact.email)}</p>
<p>Tel: {maskPhone(profile.contact.telephone)}</p>
```

---

## 📊 ANALYSE DES RISQUES

| Risque | Probabilité | Impact | Sévérité | Mitigation |
|--------|-------------|--------|----------|------------|
| Fuite de clés Supabase hardcodées | Moyenne | Critique | 🔴 Élevé | Supprimer fallbacks |
| Données perso exposées à Google | Très haute | Majeur | 🔴 Élevé | Consentement + minimisation |
| Non-conformité RGPD | Haute | Majeur | 🔴 Élevé | Droit à l'oubli + export |
| Absence audit trail | Moyenne | Moyen | 🟡 Moyen | Implémenter logging |
| GitHub storage non implémenté | Basse | Moyen | 🟡 Moyen | Activer pushToGitHub |
| Données en clair en DB | Basse | Majeur | 🟡 Moyen | Chiffrement applicatif |

---

## 🔍 FICHIERS CRITIQUES IDENTIFIÉS

### Fichiers à modifier en PRIORITÉ:

1. **`lib/supabase.ts`** - Supprimer clés hardcodées
2. **`app/api/rag/generate/route.ts`** - Activer GitHub storage + consentement check
3. **`lib/ai/prompts.ts`** - Minimiser données dans prompts (masquer email/tel)
4. **`app/api/match/analyze/route.ts`** - Ajouter audit log + sanitize data
5. **`app/api/cv/generate/route.ts`** - Ajouter audit log + sanitize data
6. **`app/api/lm/generate/route.ts`** - Ajouter audit log + sanitize data

### Fichiers à créer:

1. **`app/api/user/delete/route.ts`** - Droit à l'oubli
2. **`app/api/user/export/route.ts`** - Export GDPR
3. **`lib/audit.ts`** - Fonctions d'audit logging
4. **`lib/crypto.ts`** - Chiffrement/déchiffrement
5. **`app/onboarding/consent/page.tsx`** - Page de consentement Google Gemini

---

## 📝 CHECKLIST DE MISE EN CONFORMITÉ

### Phase 1 - Bloqueurs Production (0-1 semaine)
- [ ] Supprimer les clés Supabase hardcodées dans `lib/supabase.ts`
- [ ] Ajouter page de consentement pour envoi à Google Gemini
- [ ] Créer endpoint DELETE `/api/user/delete` pour droit à l'oubli
- [ ] Ajouter bouton "Supprimer mon compte" dans Settings
- [ ] Tester le droit à l'oubli (vérifier cascade delete)

### Phase 2 - Sécurité (1-2 semaines)
- [ ] Activer `pushToGitHub()` dans `/api/rag/generate`
- [ ] Créer fonction `sanitizeProfileForAI()` pour masquer email/tel
- [ ] Appliquer sanitization dans tous les prompts Gemini
- [ ] Créer table `audit_logs` en base de données
- [ ] Implémenter fonction `logAudit()` dans `lib/audit.ts`
- [ ] Ajouter logs d'audit dans les 4 routes critiques

### Phase 3 - RGPD (2-4 semaines)
- [ ] Créer endpoint GET `/api/user/export` pour export GDPR
- [ ] Ajouter bouton "Exporter mes données" dans Settings
- [ ] Implémenter chiffrement applicatif (lib/crypto.ts)
- [ ] Chiffrer email/téléphone avant stockage
- [ ] Masquer données sensibles côté client (dashboard)
- [ ] Rédiger Politique de Confidentialité complète
- [ ] Rédiger page CGU/Mentions légales

### Phase 4 - Documentation (4 semaines)
- [ ] Documenter le flux de données dans un schéma
- [ ] Créer documentation développeur sur la sécurité
- [ ] Créer runbook pour incident de sécurité
- [ ] Former l'équipe sur les bonnes pratiques RGPD

---

## 🎓 CONCLUSION

### Réponse à la question initiale:

**"Est-ce que le mail et l'adresse sont stockés quand l'utilisateur crée son RAG?"**

**✅ OUI - Confirmé:**

1. **Email**: Extrait du CV et stocké dans `rag_metadata.completeness_details.profil.contact.email`
2. **Adresse**: Extraite et stockée dans `rag_metadata.completeness_details.profil.localisation`
3. **Téléphone**: Extrait et stocké dans `rag_metadata.completeness_details.profil.contact.telephone`
4. **LinkedIn**: Extrait et stocké dans `rag_metadata.completeness_details.profil.contact.linkedin`

### État actuel du système:

**🔴 Points Critiques:**
- Données personnelles envoyées à Google Gemini **sans consentement explicite**
- Clés Supabase hardcodées en clair dans le code
- Aucun moyen pour l'utilisateur de supprimer ses données (RGPD non-conforme)
- Stockage GitHub non implémenté (divergence CDC)

**🟡 Points à améliorer:**
- Pas d'audit trail des accès aux données
- Données en clair en base (pas de chiffrement applicatif)
- Données sensibles exposées côté client sans masquage

**🟢 Points positifs:**
- RLS activé sur toutes les tables
- Authentification OAuth fonctionnelle
- Cascade DELETE configuré en base
- HTTPS activé (Vercel + Supabase)

### Recommandation finale:

**Le système N'EST PAS PRÊT pour la production** tant que les problèmes de Priorité 1 ne sont pas résolus:
1. Supprimer clés hardcodées
2. Ajouter consentement Google Gemini
3. Implémenter droit à l'oubli

**Estimation:** 3-5 jours de développement pour atteindre un niveau de conformité minimum.

---

**Document généré le:** 2026-01-09
**Version:** 1.0
**Statut:** ⚠️ AUDIT CRITIQUE - ACTION REQUISE
