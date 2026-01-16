# CV Crush - Cahier des Charges Complet
## Générateur de CV Intelligent avec Analyse de Match IA

---

**Version** : 1.0 - POC  
**Date** : Décembre 2025  
**Auteur** : Gilles GOZLAN  
**Contact** : gozlan.gilles@gmail.com  
**Type** : SaaS B2C Freemium

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Vision & Objectifs](#2-vision--objectifs)
3. [Personas Utilisateurs](#3-personas-utilisateurs)
4. [Architecture Système](#4-architecture-système)
5. [Modèle de Données](#5-modèle-de-données)
6. [Fonctionnalités Détaillées](#6-fonctionnalités-détaillées)
7. [Spécifications Techniques](#7-spécifications-techniques)
8. [Intégration IA (Gemini)](#8-intégration-ia-gemini)
9. [API Endpoints](#9-api-endpoints)
10. [Roadmap & Plan Dev](#10-roadmap--plan-dev)
11. [Métriques de Succès](#11-métriques-de-succès)
12. [Annexes](#12-annexes)

---

## 1. Vue d'Ensemble

### 1.1 Qu'est-ce que CV Crush ?

**CV Crush** est une plateforme SaaS qui révolutionne la recherche d'emploi en utilisant l'IA pour :

- ✅ Structurer automatiquement les données professionnelles (RAG)
- ✅ Analyser le match entre profil et offres d'emploi
- ✅ Générer des CV optimisés et personnalisés en 20 secondes
- ✅ Proposer des pistes de carrière inattendues mais pertinentes

### 1.2 Fonctionnalités Clés POC

| Fonctionnalité | Description |
|----------------|-------------|
| **RAG Generator** | Upload documents, extraction IA, profil structuré auto, score complétude, Top 10 postes possibles |
| **Analyse de Match** | Soumission offre (URL/texte), score 0-100, forces/faiblesses, recommandations |
| **Génération CV** | CV optimisé par offre, 1 template POC, PDF < 30 sec, score ATS |
| **Dashboard & Tracking** | Vue d'ensemble, suivi candidatures, statistiques, historique |

### 1.3 Innovations Clés

#### Top 10 Postes Possibles
Au lieu de chercher bêtement "PMO", l'IA suggère :
- PMO Senior (évident)
- **Transformation Manager** (opportunité cachée)
- **Product Owner Senior** (compétences transférables)
- **Consultant PPM** (freelance lucratif)

→ **Élargit le champ des possibles**

#### RAG Structuré sur GitHub
- Versionning gratuit
- Facilement partageable
- User garde contrôle de ses données
- Exportable en 1 clic

#### Match Score Objectif
Pas de "fake score" pour faire plaisir :
- 78/100 = Très bon match
- 45/100 = Match faible, ne postule pas
- **Honnêteté** = confiance utilisateur

#### Optimisation par Offre
Le CV change selon l'offre :
- Mots-clés ATS adaptés
- Expériences réorganisées
- Quantifications ajustées
- **1 CV ≠ toutes les offres**

### 1.4 Différenciation vs Concurrence

| Feature | CV Crush | Concurrents |
|---------|-----------|-------------|
| Analyse de match | ✅ Score détaillé | ❌ Absent |
| Top 10 opportunités | ✅ IA suggère | ❌ Absent |
| CV par offre | ✅ Auto-optimisé | ⚠️ Manuel |
| RAG structuré | ✅ GitHub | ❌ Propriétaire |
| Transparence IA | ✅ Explications | ⚠️ Black box |
| Prix POC | ✅ Gratuit | 💰 Payant |

---

## 2. Vision & Objectifs

### 2.1 Vision Produit

**CV Crush** est une plateforme intelligente qui transforme la recherche d'emploi en utilisant l'IA pour :

1. Structurer automatiquement les données professionnelles (RAG)
2. Analyser le match entre profil et offres d'emploi
3. Générer des CV optimisés et personnalisés pour chaque candidature
4. Proposer des pistes de carrière inattendues mais pertinentes

### 2.2 Problème Résolu

**Pour les candidats :**
- ❌ Perte de temps à adapter manuellement chaque CV
- ❌ Manque de visibilité sur leur vraie valeur marchande
- ❌ Biais de recherche (cherchent uniquement les postes "évidents")
- ❌ CV mal optimisés pour les ATS (Applicant Tracking Systems)
- ❌ Difficulté à quantifier/valoriser leurs réalisations

**Solution apportée :**
- ✅ Génération automatique de CV adaptés en 20 secondes
- ✅ Analyse de match objective (score 0-100)
- ✅ Découverte de postes pertinents non envisagés (Top 10)
- ✅ Optimisation ATS native
- ✅ Valorisation automatique avec data extraction

### 2.3 Objectifs Business

#### Phase POC (6 semaines)
- 50 utilisateurs beta
- 500+ analyses d'offres effectuées
- 80% de satisfaction utilisateur
- Valider le product-market fit

#### Phase MVP (3 mois)
- 1000+ utilisateurs actifs
- 50 utilisateurs payants (Pro)
- Revenu récurrent : 1000€/mois

#### Phase Scale (6-12 mois)
- 5000+ utilisateurs
- 500 utilisateurs Pro
- Expansion internationale (UK, DE)

---

## 3. Personas Utilisateurs

### 3.1 Persona 1 : "Marc le PMO"

| Attribut | Détail |
|----------|--------|
| **Âge** | 35-50 ans |
| **Profil** | Manager de projets expérimenté, cherche à évoluer |
| **Pain points** | Trop de temps à adapter son CV, ne sait pas valoriser ses soft skills, cherche uniquement "PMO" |
| **Usage** | Upload CV existant, analyse 5-10 offres/mois, génère CV + LM pour les meilleures opportunités |

### 3.2 Persona 2 : "Sarah la Tech Lead"

| Attribut | Détail |
|----------|--------|
| **Âge** | 28-40 ans |
| **Profil** | Lead développeur, veut devenir CTO ou Product |
| **Pain points** | CV trop technique pas assez business, ne sait pas si elle a le profil "management" |
| **Usage** | Upload CV + LinkedIn, compare 20+ offres/mois, utilise le tracking, s'abonne au Pro |

### 3.3 Persona 3 : "Julie en reconversion"

| Attribut | Détail |
|----------|--------|
| **Âge** | 30-45 ans |
| **Profil** | Veut changer de secteur (ex: Pharma → Tech) |
| **Pain points** | Ne sait pas présenter compétences transférables, peur de ne pas matcher |
| **Usage** | Upload docs divers, le Top 10 révèle des postes accessibles, match score rassure |

---

## 4. Architecture Système

### 4.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Landing    │  │  Dashboard   │  │  Onboarding  │          │
│  │     Page     │  │     Main     │  │     Flow     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              API LAYER (Next.js API Routes)                     │
│  /api/rag/generate    /api/match/analyze   /api/cv/generate     │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Gemini API │    │ Vercel KV    │    │ Vercel Blob  │
│  (AI Layer) │    │  (Cache)     │    │ (PDF/DOCX)   │
└─────────────┘    └──────────────┘    └──────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │ Vercel Postgres  │
                   │ (Main Database)  │
                   └──────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  GitHub Repos    │
                   │  (RAG Storage)   │
                   └──────────────────┘
```

### 4.2 Stack Technique Détaillé

#### Frontend
```yaml
Framework: Next.js 14 (App Router)
UI Library: React 18
Styling: Tailwind CSS 3.4
Components: Shadcn/ui + Radix UI
Forms: React Hook Form + Zod
State: Zustand (client) + Server Actions (server)
Charts: Recharts
PDF Preview: React-PDF
Animations: Framer Motion
```

#### Backend
```yaml
Runtime: Node.js 20 (Vercel Edge Functions)
API: Next.js API Routes + Server Actions
Database: Vercel Postgres (PostgreSQL 16)
Cache: Vercel KV (Redis)
File Storage: Vercel Blob Storage
Queue: Vercel Cron (scheduled jobs)
```

#### IA & Processing
```yaml
LLM: Google Gemini 2.0 Flash (rapide, gratuit)
Vision: Gemini Pro Vision (extraction PDF/images)
Embeddings: text-embedding-004 (si besoin de RAG vectoriel)
PDF Generation: Puppeteer + html2pdf
DOCX Generation: docx.js
PDF Parsing: pdf-parse + Gemini Vision
```

#### Infrastructure
```yaml
Hosting: Vercel (Hobby → Pro selon usage)
Domain: Vercel Domains ou Cloudflare
Analytics: Vercel Analytics + Posthog
Monitoring: Vercel Logs + Sentry
Email: Resend (transactionnel)
WhatsApp: Twilio (post-POC)
```

#### Dev Tools
```yaml
Language: TypeScript 5.3
Package Manager: pnpm
Linter: ESLint + Prettier
Testing: Vitest + Playwright
CI/CD: Vercel (auto-deploy)
Version Control: Git + GitHub
```

### 4.3 Coût POC

**0€/mois** - Toutes les limites gratuites sont suffisantes pour le POC

---

## 5. Modèle de Données

### 5.1 Database Schema (PostgreSQL)

#### Table: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  whatsapp VARCHAR(50),
  user_id VARCHAR(100) UNIQUE NOT NULL,
  github_rag_path VARCHAR(500),
  onboarding_completed BOOLEAN DEFAULT false,
  completeness_score INT DEFAULT 0,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);
```

#### Table: `rag_metadata`
```sql
CREATE TABLE rag_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completeness_score INT,
  completeness_details JSON,
  top_10_jobs JSON,
  rag_version INT DEFAULT 1,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rag_user_id ON rag_metadata(user_id);
```

#### Table: `job_analyses`
```sql
CREATE TABLE job_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_url TEXT,
  job_title VARCHAR(500),
  company VARCHAR(255),
  location VARCHAR(255),
  salary_range VARCHAR(100),
  job_description TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  
  -- Match Analysis
  match_score INT,
  match_report JSON,
  strengths JSON,
  gaps JSON,
  recommendations JSON,
  
  -- User Actions
  decision VARCHAR(20),
  cv_generated BOOLEAN DEFAULT false,
  cv_template VARCHAR(50),
  cv_url TEXT,
  cv_generated_at TIMESTAMP,
  
  lm_generated BOOLEAN DEFAULT false,
  lm_url TEXT,
  lm_generated_at TIMESTAMP,
  
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP,
  application_status VARCHAR(50),
  interview_date TIMESTAMP,
  
  notes TEXT,
  tags TEXT[],
  
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_analyses_user_id ON job_analyses(user_id);
CREATE INDEX idx_job_analyses_submitted_at ON job_analyses(submitted_at DESC);
CREATE INDEX idx_job_analyses_match_score ON job_analyses(match_score DESC);
```

#### Table: `cv_generations`
```sql
CREATE TABLE cv_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_analysis_id UUID REFERENCES job_analyses(id) ON DELETE CASCADE,
  template_name VARCHAR(50),
  cv_url TEXT,
  cv_data JSON,
  generation_duration_ms INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cv_generations_user_id ON cv_generations(user_id);
```

### 5.2 RAG Storage (GitHub)

#### Structure de fichiers par utilisateur
```
cv-rag-data/
├── gilles-gozlan/
│   ├── profil.json
│   ├── experiences.json
│   ├── competences.json
│   ├── projets.json
│   ├── formations_certifications.json
│   ├── context.md
│   └── writing_style.json
├── marie-dupont/
│   └── ...
└── README.md
```

#### Pourquoi GitHub pour le RAG ?
- ✅ Versioning gratuit (historique des modifications)
- ✅ Public ou privé (selon choix user)
- ✅ Facile à partager/exporter
- ✅ JSON diff natif (voir les changements)
- ✅ Pas de coût storage additionnel
- ✅ User peut fork/customiser

---

## 6. Fonctionnalités Détaillées

### 6.1 Module 1: Onboarding & RAG Generator

#### 6.1.1 Inscription Utilisateur

**User Flow**
```
Landing Page → [S'inscrire]
   ↓
Formulaire:
├─ Email (requis)
├─ Identifiant unique (auto-généré ou personnalisable)
│  Ex: "gilles-gozlan" (lowercase, tirets uniquement)
└─ WhatsApp (optionnel, pour notifs futures)
   ↓
[Créer mon compte]
   ↓
Email de vérification envoyé
   ↓
Click lien → Compte activé
   ↓
Redirect vers Onboarding RAG
```

**Règles de validation**
- Email : format valide, unique dans la DB
- user_id : 
  - Auto-généré depuis email (ex: john.doe@gmail.com → john-doe)
  - Pattern: `^[a-z0-9-]+$` (lowercase + tirets)
  - Min 3 chars, max 50 chars
  - Unique dans la DB

#### 6.1.2 Upload Documents

**Contraintes**
- Max 10 fichiers
- Max 10MB par fichier
- Max 50MB total
- Formats supportés : `.pdf, .docx, .doc, .txt, .json, .xlsx, .csv`

**Documents suggérés**
- CV actuel (PDF ou DOCX)
- Export LinkedIn (JSON)
- Lettres de motivation précédentes
- Certificats / Diplômes
- Portfolio / Projets (PDF)

#### 6.1.3 Processing & Génération RAG

**Flow Backend**
```
User click [Continuer →]
   ↓
Frontend upload files to /api/rag/upload
   ↓
Pour chaque fichier :
├─ PDF → Gemini Vision API (extraction texte + structure)
├─ DOCX → mammoth.js (extraction texte)
├─ JSON → Direct parse
├─ TXT → Direct read
└─ XLSX → xlsx parser
   ↓
Aggregate tous les textes extraits
   ↓
Gemini Mega Parsing Prompt
   ↓
Validate JSON schema
   ↓
Calculate Completeness Score (0-100)
   ↓
Generate Top 10 Jobs (Gemini)
   ↓
Generate Context.md (Gemini)
   ↓
Commit RAG files to GitHub (private repo)
   ↓
Save metadata to Postgres
   ↓
Return success + redirect Dashboard
```

### 6.2 Module 2: Dashboard Principal

#### Vue d'ensemble
```
┌────────────────────────────────────────────────────────────┐
│  Bonjour Gilles 👋                                         │
│  Voici ton activité de recherche                           │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  MON PROFIL RAG                              87/100 ⭐     │
│  ████████████████████░░░░░                                 │
│                                                            │
│  Prêt pour:                                                │
│  ✅ Postes PMO / Chef de Projet       95%                  │
│  ⚠️ Postes Tech Lead / CTO            68%                  │
│     💡 Améliore : +3 projets GitHub                        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  📈 STATISTIQUES CE MOIS-CI                                │
│                                                            │
│  12 offres     8 CVs       5 postulées   2 entretiens     │
│  analysées     générés                                     │
│                                                            │
│  Match moyen : 74/100  |  Taux conversion : 67%           │
└────────────────────────────────────────────────────────────┘
```

### 6.3 Module 3: Analyse de Match

#### Formulaire de soumission
- Input URL de l'offre OU
- Textarea pour coller le texte
- Notes personnelles (optionnel)

#### Rapport de Match

**Structure**
```
┌────────────────────────────────────────────────────────────┐
│  🎯 RAPPORT DE MATCH                                       │
│                                                            │
│  PMO Senior - Société Générale                             │
│  📍 Paris  |  💰 65-75k€  |  📅 il y a 3 jours             │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          MATCH : 78/100 🎯                           │  │
│  │          ████████████████████░░░░░░                  │  │
│  │          Très bon match !                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  ✅ TES FORCES                                             │
│                                                            │
│  • Expert Planisware certifié        100% match            │
│  • 7 ans Finance                      90% match            │
│  • Portfolio 150+ projets            100% match            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  ⚠️ POINTS À RENFORCER                                     │
│                                                            │
│  • SAFe/Agile                         40% match            │
│    💡 Mentionne tes XP Agile existantes                    │
│                                                            │
│  • Anglais C1 requis                  60% match            │
│    💡 Valorise missions internationales                    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  🤔 DEVRAIS-TU POSTULER ?                                  │
│                                                            │
│  ✅ OUI, excellent profil                                  │
│                                                            │
│  Probabilité entretien : 🟢 Élevée (70%)                   │
│  Effort combler gaps : 🟢 Faible                           │
└────────────────────────────────────────────────────────────┘
```

### 6.4 Module 4: Génération CV

#### Templates disponibles (POC: 1 seul)
| Template | Description | ATS Score |
|----------|-------------|-----------|
| Standard | Sobre, professionnel, ATS-friendly | 95/100 |
| Moderne | 2 pages, sidebar colorée | 80/100 |
| Créatif | Pour design/innovation | 60/100 |
| ATS-Only | Texte pur, maximum parsing | 100/100 |

#### Optimisations appliquées
- ✅ Mots-clés ATS intégrés
- ✅ Quantification renforcée
- ✅ XP pertinente mise en avant
- ✅ Focus sur échelle projets

### 6.5 Module 5: Lettre de Motivation

**Options**
- Ton : formal / professional_warm / casual
- Longueur : short (200-300) / medium (300-400) / long (400-500)

### 6.6 Module 6: Tracking & Historique

**Fonctionnalités**
- Liste des analyses avec filtres
- Mise à jour statut (pending, applied, interviewing, rejected, accepted)
- Ajout de notes
- Tags personnalisés

### 6.7 Module 7: Paramètres & Profil

- Modifier email
- Modifier identifiant
- Gérer WhatsApp
- Export RAG complet
- Supprimer compte (RGPD)

---

## 7. Spécifications Techniques

### 7.1 Structure Projet Next.js 14

```
cvcrush/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── profile/
│   │   ├── analyze/
│   │   │   ├── page.tsx              # Soumettre offre
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Rapport match
│   │   ├── cvs/
│   │   ├── tracking/
│   │   └── settings/
│   ├── onboarding/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Upload docs
│   │   ├── processing/
│   │   └── complete/
│   ├── api/
│   │   ├── auth/
│   │   ├── rag/
│   │   │   ├── upload/
│   │   │   ├── generate/
│   │   │   ├── update/
│   │   │   └── export/
│   │   ├── match/
│   │   │   ├── analyze/
│   │   │   └── [id]/
│   │   ├── cv/
│   │   │   ├── generate/
│   │   │   └── templates/
│   │   ├── lm/
│   │   │   └── generate/
│   │   └── tracking/
│   └── layout.tsx
├── components/
│   ├── ui/                            # Shadcn components
│   ├── dashboard/
│   ├── rag/
│   ├── match/
│   └── cv/
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # Drizzle schema
│   │   └── queries.ts
│   ├── ai/
│   │   ├── gemini.ts
│   │   ├── prompts/
│   │   └── utils.ts
│   ├── github/
│   ├── pdf/
│   └── docx/
├── types/
├── public/
│   └── cv-templates/
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### 7.2 Variables d'Environnement

```bash
# .env.local

# Database
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."

# Vercel KV (Redis)
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."

# AI
GEMINI_API_KEY="..."

# GitHub
GITHUB_TOKEN="ghp_..."
GITHUB_REPO_OWNER="cvcrush"
GITHUB_REPO_NAME="cv-rag-data"

# Auth
NEXTAUTH_URL="https://cv-crush.vercel.app"
NEXTAUTH_SECRET="..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Feature Flags
NEXT_PUBLIC_ENABLE_WHATSAPP="false"
NEXT_PUBLIC_ENABLE_PAYMENTS="false"
```

### 7.3 Testing

#### Unit Tests (Vitest)
```typescript
// __tests__/lib/ai/prompts.test.ts
import { describe, it, expect } from "vitest";
import { buildRAGParsingPrompt } from "@/lib/ai/prompts/rag-parsing";

describe("RAG Parsing Prompt", () => {
  it("should include all documents", () => {
    const docs = ["doc1", "doc2"];
    const prompt = buildRAGParsingPrompt(docs);
    expect(prompt).toContain("doc1");
    expect(prompt).toContain("doc2");
  });
});
```

#### Integration Tests (Playwright)
```typescript
// __tests__/e2e/onboarding.spec.ts
import { test, expect } from "@playwright/test";

test("complete onboarding flow", async ({ page }) => {
  await page.goto("/onboarding");
  
  await page.setInputFiles('input[type="file"]', [
    "./fixtures/cv.pdf",
    "./fixtures/linkedin.json",
  ]);
  
  await page.click('button:has-text("Continuer")');
  
  await expect(page.locator("text=TON PROFIL IA EST PRÊT")).toBeVisible({
    timeout: 60000,
  });
});
```

---

## 8. Intégration IA (Gemini)

### 8.1 Configuration

```typescript
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const models = {
  flash: genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }),
  pro: genAI.getGenerativeModel({ model: "gemini-pro" }),
  vision: genAI.getGenerativeModel({ model: "gemini-pro-vision" }),
};
```

### 8.2 Prompt - Mega RAG Parsing

```
Tu es un expert en extraction et structuration de données professionnelles.

DOCUMENTS FOURNIS :
${allExtractedTexts}

MISSION :
Extrais et structure TOUTES les informations selon ce schéma JSON.

SCHÉMA CIBLE :
{
  "profil": {
    "nom": "string",
    "prenom": "string",
    "titre_principal": "string",
    "titres_alternatifs": ["string"],
    "localisation": "string",
    "contact": {
      "email": "string",
      "telephone": "string",
      "linkedin": "string"
    },
    "elevator_pitch": "string (2-3 phrases max)",
    "mots_cles_secteurs": ["string"],
    "langues": { "langue": "niveau" }
  },
  "experiences": [
    {
      "id": "string",
      "poste": "string",
      "entreprise": "string",
      "debut": "YYYY-MM",
      "fin": "YYYY-MM|null",
      "actuel": boolean,
      "realisations": [
        {
          "description": "string",
          "competences": ["string"],
          "impact": "string (quantifié)"
        }
      ],
      "technologies": ["string"]
    }
  ],
  "competences": {
    "techniques": { "categorie": [...] },
    "metier": { "categorie": [...] },
    "soft_skills": ["string"]
  },
  "formations_certifications": [...],
  "projets": [...]
}

RÈGLES CRITIQUES :
1. DÉDUPLIQUE : Si info apparaît dans plusieurs docs, prends la version la plus complète
2. NORMALISE dates : "Mars 2018" → "2018-03"
3. QUANTIFIE : Cherche TOUS les chiffres (budget, équipe, projets, %)
4. CATÉGORISE : Regroupe compétences techniques par catégorie
5. MOTS-CLÉS : Extrais keywords pour matching ATS

OUTPUT :
JSON valide uniquement. Pas de markdown, pas de ```json.
```

### 8.3 Prompt - Top 10 Jobs

```
Analyse ce profil RAG et identifie les 10 postes les PLUS adaptés.

PROFIL COMPLET :
${JSON.stringify(ragData, null, 2)}

CRITÈRES DE SÉLECTION :
1. Match compétences techniques (40%)
2. Match expérience & années (30%)
3. Transférabilité des compétences (20%)
4. Potentiel marché actuel (10%)

RÈGLES :
- Mélange postes ÉVIDENTS et CACHÉS (opportunités ignorées)
- Variété de secteurs
- Fourchette salariale réaliste France/Europe 2025
- Insight unique pour chaque poste

FORMAT OUTPUT (JSON) :
[
  {
    "rang": 1,
    "titre_poste": "string",
    "match_score": 0-100,
    "salaire_min": number (k€),
    "salaire_max": number (k€),
    "type_contrat": "CDI|Freelance|Mix",
    "secteurs": ["string"],
    "raison": "string (1 phrase)",
    "competences_cles": ["string"]
  }
]
```

### 8.4 Prompt - Match Analysis

```
Tu es un expert RH / Career Coach.

PROFIL DU CANDIDAT :
${JSON.stringify(ragData, null, 2)}

OFFRE D'EMPLOI :
Titre : ${jobTitle}
Entreprise : ${company}
Description complète :
${jobDescription}

MISSION :
Analyse le match entre ce profil et cette offre.

OUTPUT (JSON) :
{
  "match_score": 0-100,
  "match_level": "Excellent|Très bon|Bon|Moyen|Faible",
  "recommendation": "Oui fortement|Oui|Peut-être|Non recommandé",
  "strengths": [
    {
      "point": "string (max 80 chars)",
      "match_percent": 0-100,
      "detail": "string"
    }
  ],
  "gaps": [
    {
      "point": "string",
      "match_percent": 0-100,
      "severity": "Bloquant|Important|Mineur",
      "suggestion": "string"
    }
  ],
  "recommendations": [
    {
      "category": "Resume|Keywords|Experience|Skills",
      "action": "string",
      "impact": "High|Medium|Low"
    }
  ],
  "category_scores": {
    "competences_techniques": 0-100,
    "experience": 0-100,
    "secteur": 0-100,
    "soft_skills": 0-100,
    "langues": 0-100,
    "formation": 0-100
  },
  "probability_interview": "Élevée|Moyenne|Faible",
  "effort_to_close_gaps": "Faible|Moyen|Élevé",
  "missing_keywords": ["string"],
  "key_insight": "string"
}

Sois OBJECTIF et HONNÊTE. Si le match est faible, dis-le clairement.
```

### 8.5 Gestion des Tokens

```typescript
// Gemini Flash : 1M tokens input, 8k output
// Gemini Pro : 30k tokens input, 2k output

export function estimateTokens(text: string): number {
  // Approximation: 1 token ≈ 4 chars
  return Math.ceil(text.length / 4);
}

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokens(text);
  if (estimatedTokens <= maxTokens) return text;
  
  const ratio = maxTokens / estimatedTokens;
  const targetLength = Math.floor(text.length * ratio);
  return text.substring(0, targetLength) + "...";
}
```

### 8.6 Retry Logic

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error("Max retries exceeded");
}
```

---

## 9. API Endpoints

### 9.1 Authentication

#### POST `/api/auth/signup`
```typescript
// Request
{ email: string, user_id?: string, whatsapp?: string }

// Response
{
  success: boolean,
  user: { id: string, email: string, user_id: string },
  verification_email_sent: boolean
}
```

#### POST `/api/auth/login`
```typescript
// Request
{ email: string }

// Response
{ success: boolean, message: "Check your email for login link" }
```

### 9.2 RAG Management

#### POST `/api/rag/upload`
```typescript
// Request: FormData with files[]

// Response
{
  success: boolean,
  files: Array<{
    filename: string,
    size: number,
    type: string,
    extracted_text?: string,
    error?: string
  }>,
  upload_id: string
}
```

#### POST `/api/rag/generate`
```typescript
// Request
{ upload_id: string, user_id: string }

// Response
{
  success: boolean,
  rag: { profil, experiences, competences, formations_certifications, projets },
  metadata: {
    completeness_score: number,
    top_10_jobs: [...],
    context_md: string
  },
  github_path: string
}
```

### 9.3 Match Analysis

#### POST `/api/match/analyze`
```typescript
// Request
{ user_id: string, job_url?: string, job_text?: string, notes?: string }

// Response
{
  success: boolean,
  analysis_id: string,
  job: { title, company, location, salary_range, description },
  match: {
    score: number,
    level: string,
    recommendation: string,
    strengths: [...],
    gaps: [...],
    recommendations: [...],
    category_scores: {...},
    probability_interview: string,
    key_insight: string
  }
}

// Processing Time: ~15-20 seconds
```

### 9.4 CV Generation

#### POST `/api/cv/generate`
```typescript
// Request
{
  user_id: string,
  analysis_id: string,
  template: "standard" | "modern" | "creative" | "ats-only",
  customizations?: { color_scheme?, sections_order?, hide_sections? }
}

// Response
{
  success: boolean,
  cv: {
    id: string,
    url: string,
    template: string,
    generated_at: string,
    expires_at: string
  },
  optimizations_applied: string[]
}

// Processing Time: ~20-30 seconds
```

### 9.5 Tracking & Analytics

#### GET `/api/tracking/jobs`
```typescript
// Query: ?user_id=xxx&status=all|pending|applied&limit=20&offset=0

// Response
{
  jobs: Array<{
    id, job_title, company, match_score, submitted_at,
    cv_generated, applied, status
  }>,
  total: number,
  has_more: boolean
}
```

#### GET `/api/tracking/stats`
```typescript
// Query: ?user_id=xxx&period=week|month|year|all

// Response
{
  stats: {
    total_analyses: number,
    total_cvs_generated: number,
    total_applied: number,
    avg_match_score: number,
    conversion_rate: number,
    top_sectors: [...]
  }
}
```

---

## 10. Roadmap & Plan Dev

### 10.1 Timeline Globale

```
Phase 1 : POC (6 semaines)
├─ Sprint 0 : Setup               (3 jours)
├─ Sprint 1 : RAG Generator       (2 semaines)
├─ Sprint 2 : Dashboard & Profil  (1 semaine)
├─ Sprint 3 : Analyse Match       (1 semaine)
├─ Sprint 4 : Génération CV       (1 semaine)
└─ Sprint 5 : Tracking & Polish   (1 semaine)

Phase 2 : MVP (3 mois)
├─ 4 templates CV
├─ Lettres de motivation
├─ Système de paiement (Stripe)
└─ 500 utilisateurs actifs

Phase 3 : Scale (6 mois)
├─ WhatsApp integration
├─ API publique
├─ Job board scraping auto
└─ 5000+ utilisateurs
```

### 10.2 Détail Sprints POC

#### Sprint 0 : Setup (3 jours)
- [ ] Init repo Next.js 14 + TypeScript
- [ ] Setup Vercel project
- [ ] Config Tailwind + Shadcn/ui
- [ ] Setup Vercel Postgres + KV
- [ ] Setup GitHub repo pour RAG storage
- [ ] Config Gemini API
- [ ] Setup Drizzle ORM + migrations
- [ ] Config ESLint + Prettier

#### Sprint 1 : RAG Generator (2 semaines)
- [ ] Page signup/login avec magic link
- [ ] Page onboarding upload (drag & drop)
- [ ] API `/api/rag/upload`
- [ ] API `/api/rag/generate`
- [ ] Page résultats onboarding (score + Top 10)

#### Sprint 2 : Dashboard & Profil (1 semaine)
- [ ] Layout dashboard (header, sidebar)
- [ ] Page dashboard home (widgets)
- [ ] Page profil RAG (vue détaillée)
- [ ] API `/api/rag/[user_id]` et `/api/rag/update`

#### Sprint 3 : Analyse Match (1 semaine)
- [ ] Page soumission offre (URL ou texte)
- [ ] Scraping job description (Playwright)
- [ ] API `/api/match/analyze`
- [ ] Page rapport match complet

#### Sprint 4 : Génération CV (1 semaine)
- [ ] Créer 1 template HTML/CSS (Standard)
- [ ] API `/api/cv/generate`
- [ ] Génération PDF (Puppeteer)
- [ ] Page visualisation CV + download

#### Sprint 5 : Tracking & Polish (1 semaine)
- [ ] Page tracking candidatures
- [ ] API `/api/tracking/jobs` et `/api/tracking/stats`
- [ ] Widget statistiques dashboard
- [ ] Animations, loading states, responsive

### 10.3 Features Post-POC

**Intelligence**
- Prédiction salaire basé sur profil
- Suggestion formation pour combler gaps
- Coach IA conversationnel (chat)

**Automatisation**
- Scraping automatique job boards
- Alertes emploi personnalisées
- Auto-postulation (avec validation)

**Intégrations**
- LinkedIn auto-sync
- ATS populaires (Greenhouse, Lever)
- WhatsApp bot complet
- API publique

---

## 11. Métriques de Succès

### 11.1 Métriques Produit

| Catégorie | Métrique | Objectif POC |
|-----------|----------|--------------|
| Onboarding | Taux de complétion | > 70% |
| Onboarding | Temps moyen | < 5 minutes |
| Onboarding | Score complétude moyen | > 75% |
| Analyse | Temps analyse | < 20 secondes |
| Analyse | Précision score (validation manuelle) | > 80% |
| CV | Taux conversion analyse → CV | > 60% |
| CV | Temps génération | < 30 secondes |
| Rétention | Taux retour J7 | > 50% |
| Rétention | Taux retour J30 | > 30% |

### 11.2 Métriques Business

| Catégorie | Métrique | Objectif POC |
|-----------|----------|--------------|
| Acquisition | Beta users | 50+ |
| Engagement | DAU/MAU | > 20% |
| Satisfaction | NPS | > 40 |
| PMF | Users "très déçus" si produit disparaît | 5+ |
| Conversion | Users prêts à payer | 5+ |

### 11.3 Métriques Techniques

| Métrique | Objectif |
|----------|----------|
| Temps analyse | < 20 sec |
| Temps génération CV | < 30 sec |
| Uptime | > 99% |
| TTI (Time to Interactive) | < 3s |
| Lighthouse score | > 90 |

---

## 12. Annexes

### 12.1 Checklist Avant Lancement POC

#### Technique
- [ ] Tests E2E passent à 100%
- [ ] Performance : TTI < 3s
- [ ] Lighthouse score > 90
- [ ] Sentry configuré (error tracking)
- [ ] Analytics configurées (Posthog)
- [ ] Backups DB automatiques
- [ ] Rate limiting API

#### Produit
- [ ] Landing page finalisée
- [ ] Onboarding fluide testé
- [ ] Dashboard complet
- [ ] Tous les flows testés manuellement
- [ ] Documentation utilisateur
- [ ] FAQ rédigée

#### Legal
- [ ] CGU/CGV rédigées
- [ ] Politique confidentialité
- [ ] RGPD compliant
- [ ] Mentions légales
- [ ] Cookies consent

### 12.2 Sécurité & Confidentialité

**Classification données :**
- 🔴 **Critique** : Email, WhatsApp, données perso RAG
- 🟡 **Sensible** : CVs générés, lettres de motivation
- 🟢 **Public** : Templates, analytics anonymisées

**Mesures :**
- Encryption at rest (Postgres native)
- Encryption in transit (HTTPS/TLS)
- GitHub repos privés par défaut
- Pas de stockage de mots de passe (OAuth only)
- RGPD compliant (droit à l'oubli via cascade delete)

### 12.3 Glossaire

| Terme | Définition |
|-------|------------|
| **RAG** | Retrieval-Augmented Generation - Données structurées du profil utilisateur |
| **ATS** | Applicant Tracking System - Logiciel de recrutement filtrant les CVs |
| **Match Score** | Score 0-100 indiquant l'adéquation profil/offre |
| **Top 10** | Liste des 10 postes les plus adaptés au profil |
| **Magic Link** | Lien de connexion envoyé par email (sans mot de passe) |
| **POC** | Proof of Concept - Version minimale pour valider le concept |
| **MVP** | Minimum Viable Product - Version utilisable à petite échelle |

### 12.4 Contacts

**Project Owner**
- Nom : Gilles GOZLAN
- Email : gozlan.gilles@gmail.com
- LinkedIn : [gilles-gozlan-0043571b](https://linkedin.com/in/gilles-gozlan-0043571b)

---

## 📄 Licence & Usage

**Statut** : Documentation projet privée  
**Usage** : Interne uniquement  
**Propriétaire** : Gilles GOZLAN  
**Date** : Décembre 2025

---

**Version** : 1.0  
**Dernière mise à jour** : 28 Décembre 2025  
**Statut** : Spécifications finales POC

---

🚀 **Prêt à transformer la recherche d'emploi avec l'IA !**
