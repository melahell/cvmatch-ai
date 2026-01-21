
ok ca fonctionne. On va parler des page d'avant connexion a l'app. Audit ca et fait moi un retour. Ensuite je te ferais le mien

Thought for <1s

Je vais faire un audit complet des pages avant connexion (landing page, login, onboarding).

Audit Pages Pré-Connexion
Rédigé un rapport d'audit complet des 3 pages pré-connexion (landing, login, onboarding) avec analyse des points forts/faibles, cohérence design system, responsive et 9 actions prioritaires classées.

Files Edited
Audit Pages Pre Connexion
Progress Updates
1
Analyse des pages landing, login, onboarding

2
Rédaction du rapport d'audit

3
Attente retour utilisateur

Voici mon audit des pages pré-connexion. À toi de me faire ton retour pour qu'on compare nos analyses !

Audit Pages Pre Connexion
Open
Audit complet des 3 pages pré-connexion (landing, login, onboarding) avec analyse des points forts, points faibles, cohérence design system, responsive et actions prioritaires classées par importance.
tu as raison. Gardes tes remarques en tete et je te présente mon cahier des charges:
# CDC 06 - MUSÉE DES CVs IMPOSSIBLES
## Cahier des Charges Complet

**Version** : 1.0  
**Date** : 18 janvier 2026  
**Projet** : CVMatch AI  
**Feature** : Page de démonstration interactive  
**Auteur** : Gilles GOZLAN

---

## 📑 TABLE DES MATIÈRES

1. [Vision & Objectifs](#1-vision--objectifs)
2. [Scope Fonctionnel](#2-scope-fonctionnel)
3. [Architecture de l'Information](#3-architecture-de-linformation)
4. [Spécifications des Personnages](#4-spécifications-des-personnages)
5. [Structure des Données](#5-structure-des-données)
6. [Wireframes & Schémas](#6-wireframes--schémas)
7. [User Flows](#7-user-flows)
8. [Spécifications Techniques](#8-spécifications-techniques)
9. [Contenu & Rédaction](#9-contenu--rédaction)
10. [SEO & Marketing](#10-seo--marketing)
11. [Métriques de Succès](#11-métriques-de-succès)
12. [Roadmap d'Implémentation](#12-roadmap-dimplémentation)

---

## 1. VISION & OBJECTIFS

### 1.1 Concept

**Le Musée des CVs Impossibles** est une page de démonstration interactive qui présente les capacités de CVMatch AI à travers 10 profils de personnages historiques célèbres.

**Promesse** : "Si l'IA peut générer un CV parfait pour Michel-Ange, imaginez ce qu'elle peut faire pour vous."

### 1.2 Objectifs Business

| Objectif | Description | KPI Cible |
|----------|-------------|-----------|
| **Acquisition** | Générer du trafic organique et viral | 10k visiteurs/mois (6 mois) |
| **Conversion** | Transformer visiteurs en utilisateurs | Taux conversion 15% |
| **Crédibilité** | Démontrer expertise technique | NPS > 8/10 |
| **Viralité** | Partages sociaux massifs | 500 partages/mois |
| **SEO** | Positionner CVMatch AI | Top 3 "CV IA" |

### 1.3 Objectifs Utilisateurs

**Problème résolu** : Les utilisateurs ne comprennent pas ce que "génération de CV par IA" signifie concrètement.

**Solution** : Montrer des exemples concrets, impressionnants et ludiques qui :
- Démontrent la sophistication de l'IA
- Illustrent la diversité des profils gérés
- Prouvent la qualité des outputs (CVs + lettres)
- Inspirent confiance dans le produit

### 1.4 Principes de Design

1. **Show, don't tell** : Pas de blabla marketing, que des démos concrètes
2. **Ludique mais crédible** : Fun sans être puéril
3. **Accessible sans friction** : 0 inscription requise
4. **Viral by design** : Conçu pour être partagé
5. **Mobile-first** : 60%+ trafic mobile attendu

---

## 2. SCOPE FONCTIONNEL

### 2.1 Features Core (MVP)

#### ✅ In Scope

| Feature | Description | Priorité |
|---------|-------------|----------|
| **Galerie 10 personnages** | Grid interactif des profils | P0 |
| **Page profil détaillée** | Vue complète par personnage | P0 |
| **CVs multi-templates** | 4 templates par personnage | P0 |
| **Top 10 des postes** | Jobs 2025 avec scoring | P0 |
| **Lettres de motivation** | 3 lettres par personnage | P0 |
| **Téléchargement PDFs** | CVs + lettres en PDF | P0 |
| **Responsive design** | Mobile + Desktop | P0 |
| **SEO optimization** | Meta tags + OG images | P0 |
| **Partage social** | Boutons Twitter/LinkedIn | P1 |
| **Analytics** | Tracking comportement | P1 |

#### ❌ Out of Scope (v1)

- Génération dynamique temps réel (tout est pré-généré)
- Upload de profils custom par utilisateurs
- Personnalisation des templates
- Système de favoris/sauvegarde
- Commentaires ou notations
- Traduction multilingue (français uniquement v1)
- API publique pour accès aux données

### 2.2 User Stories

**US-01** : En tant que visiteur curieux, je veux voir la liste des personnages disponibles pour choisir celui qui m'intéresse.

**US-02** : En tant que visiteur, je veux voir le CV complet d'un personnage pour comprendre comment l'IA structure l'information.

**US-03** : En tant que visiteur, je veux télécharger les CVs en PDF pour voir la qualité finale du rendu.

**US-04** : En tant que visiteur, je veux voir les lettres de motivation générées pour évaluer la pertinence de l'IA.

**US-05** : En tant que visiteur, je veux partager un profil sur les réseaux sociaux pour montrer à mes contacts.

**US-06** : En tant que visiteur convaincu, je veux m'inscrire facilement pour créer mon propre profil.

---

## 3. ARCHITECTURE DE L'INFORMATION

### 3.1 Sitemap

```
CVMatch AI
│
└── /demo (Le Musée des CVs Impossibles)
    │
    ├── Page d'accueil musée
    │   ├── Hero Section
    │   ├── Galerie 10 personnages
    │   └── CTA inscription
    │
    └── /demo/[character]
        ├── Header profil
        ├── Profil RAG (score + métadonnées)
        ├── CVs générés (4 templates)
        ├── Top 10 des postes
        ├── Lettres de motivation (3)
        └── CTA inscription
```

### 3.2 Structure URL

| Page | URL | Type |
|------|-----|------|
| Musée accueil | `/demo` | Statique |
| Profil Michel-Ange | `/demo/michelangelo` | Statique générée |
| Profil Marie Curie | `/demo/curie` | Statique générée |
| ... | `/demo/[character]` | ... |
| PDF CV | `/demo-cvs/michelangelo-standard.pdf` | Fichier statique |
| PDF Lettre | `/demo-letters/michelangelo-vatican.pdf` | Fichier statique |

### 3.3 Navigation Flow

```
Landing Page CVMatch AI
         ↓
    [Lien menu "Démo"]
         ↓
   /demo (Musée accueil)
         ↓
   [Clic sur personnage]
         ↓
   /demo/michelangelo
         ↓
   [Télécharge CV ou lettre]
         OU
   [Clic "Créer mon profil"]
         ↓
   /signup?utm_source=demo&character=michelangelo
```

---

## 4. SPÉCIFICATIONS DES PERSONNAGES

### 4.1 Critères de Sélection

| Critère | Justification |
|---------|---------------|
| **Domaine public** | Aucun droit d'image ou de propriété intellectuelle |
| **Reconnaissance universelle** | Noms connus internationalement |
| **Diversité métiers** | Art, Science, Tech, Politique pour showcaser polyvalence IA |
| **Diversité genres** | 40% femmes minimum |
| **Diversité époques** | Antiquité → XXe siècle |
| **Diversité origines** | Représentation géographique variée |
| **Complexité profil** | Parcours riches qui challengent l'IA |
| **Relocalisabilité 2025** | Compétences transposables au marché actuel |

### 4.2 Les 10 Personnages Sélectionnés

| # | Nom | Époque | Métier | Genre | Origine | Pourquoi intéressant |
|---|-----|--------|--------|-------|---------|---------------------|
| 1 | **Michel-Ange Buonarroti** | 1475-1564 | Sculpteur/Peintre | H | Italie | Freelance multi-casquettes, projets monumentaux |
| 2 | **Marie Curie** | 1867-1934 | Physicienne/Chimiste | F | Pologne/France | Double Nobel, femme académique, recherche |
| 3 | **Ada Lovelace** | 1815-1852 | Mathématicienne | F | UK | Première programmeuse, tech avant l'heure |
| 4 | **Léonard de Vinci** | 1452-1519 | Inventeur/Artiste | H | Italie | Renaissance man ultime, innovation |
| 5 | **Joséphine Baker** | 1906-1975 | Artiste/Résistante | F | USA/France | Reconversion, parcours atypique, résilience |
| 6 | **Albert Einstein** | 1879-1955 | Physicien | H | Allemagne/USA | Académique → icône, Nobel, vulgarisation |
| 7 | **Cléopâtre VII** | 69-30 av. J.-C. | Leader politique | F | Égypte | Management, diplomatie, leadership |
| 8 | **Nikola Tesla** | 1856-1943 | Ingénieur/Inventeur | H | Serbie/USA | Innovation, brevets, R&D, entrepreneuriat |
| 9 | **Frida Kahlo** | 1907-1954 | Artiste | F | Mexique | Artiste indépendante, marque personnelle |
| 10 | **Alan Turing** | 1912-1954 | Mathématicien/Cryptographe | H | UK | Tech, guerre, intelligence artificielle |

**Répartition** :
- Genres : 4 femmes (40%), 6 hommes (60%)
- Époques : 1 Antiquité, 4 Renaissance, 5 Moderne (XIXe-XXe)
- Métiers : 4 Art, 3 Science, 2 Tech, 1 Politique
- Origines : 3 Italie, 2 UK, 2 USA, 1 Pologne, 1 Égypte, 1 Mexique

### 4.3 Profondeur de Contenu par Personnage

| Élément | Quantité | Détails |
|---------|----------|---------|
| **Données RAG** | 1 profil complet | JSON structuré avec tous les champs |
| **Expériences** | 3-5 majeures | Celles qui définissent le personnage |
| **Compétences techniques** | 8-15 | Avec niveaux de maîtrise |
| **Soft skills** | 6-10 | Identifiées à partir du parcours |
| **Formations** | 2-4 | Éducation formelle + auto-formation |
| **Projets notables** | 2-5 | Réalisations marquantes |
| **CVs générés** | 4 templates | Standard, Moderne, Créatif, ATS Only |
| **Top 10 jobs** | 10 postes 2025 | Avec scoring, salaires, descriptions |
| **Lettres motivation** | 3 lettres | Pour Top 3 des jobs, tons variés |

---

## 5. STRUCTURE DES DONNÉES

### 5.1 Schéma de Données Profil

```
DemoProfile
├── Métadonnées
│   ├── id (string, slug unique)
│   ├── name (string, nom complet)
│   ├── period (string, dates naissance-décès)
│   ├── title (string, titre professionnel principal)
│   ├── icon (string, emoji représentatif)
│   ├── completeness_score (number, 0-100)
│   └── generation_time_ms (number, temps génération simulé)
│
├── RAG Data
│   ├── profil
│   │   ├── nom, prenom
│   │   ├── titre_principal
│   │   ├── titres_alternatifs (array)
│   │   ├── localisation
│   │   ├── contact (email fictif, portfolio, etc.)
│   │   ├── elevator_pitch (150-200 mots)
│   │   ├── mots_cles_secteurs (array)
│   │   └── langues (object)
│   │
│   ├── experiences (array)
│   │   └── [0...n]
│   │       ├── id
│   │       ├── poste
│   │       ├── entreprise
│   │       ├── localisation
│   │       ├── debut, fin (dates)
│   │       ├── actuel (boolean)
│   │       ├── secteur
│   │       ├── type_contrat
│   │       ├── realisations (array)
│   │       │   └── [0...n]
│   │       │       ├── description
│   │       │       ├── competences (array)
│   │       │       ├── impact
│   │       │       └── mots_cles (array)
│   │       ├── technologies (array)
│   │       ├── clients_cles (array)
│   │       └── pertinence (object: management, technique, business)
│   │
│   ├── competences
│   │   ├── techniques (object groupé par catégorie)
│   │   │   └── [Catégorie]
│   │   │       └── [0...n]
│   │   │           ├── nom
│   │   │           ├── niveau (Expert/Avancé/Intermédiaire)
│   │   │           ├── pourcentage (0-100)
│   │   │           ├── annees_experience
│   │   │           ├── certification (nullable)
│   │   │           ├── contexte
│   │   │           └── mots_cles (array)
│   │   ├── metier (object groupé par catégorie)
│   │   └── soft_skills (array strings)
│   │
│   ├── formations_certifications (array)
│   │   └── [0...n]
│   │       ├── type (formation/certification)
│   │       ├── titre
│   │       ├── organisme
│   │       ├── date_debut, date_fin
│   │       ├── en_cours (boolean)
│   │       ├── details
│   │       └── niveau (nullable)
│   │
│   └── projets (array)
│       └── [0...n]
│           ├── titre
│           ├── description
│           ├── periode
│           ├── role
│           ├── technologies (array)
│           ├── impact
│           ├── url (nullable)
│           └── contexte (Professionnel/Personnel)
│
├── CVs
│   └── [template_name]
│       ├── url (chemin PDF)
│       └── preview_url (chemin image preview)
│
├── Top 10 Jobs
│   └── [0...9]
│       ├── rang (1-10)
│       ├── titre_poste
│       ├── match_score (0-100)
│       ├── salaire_min, salaire_max
│       ├── devise (EUR)
│       ├── type_contrat (CDI/CDD/Freelance)
│       ├── secteurs (array)
│       ├── localisation
│       ├── raison (pourquoi ce match)
│       ├── competences_cles (array)
│       └── job_description (texte détaillé)
│
└── Cover Letters
    └── [0...2] (Top 3 jobs uniquement)
        ├── job_id (référence au job)
        ├── job_title
        ├── match_score
        └── letter
            ├── tone (formal/professional_warm/creative)
            ├── word_count (250-400 mots)
            ├── content (markdown)
            └── pdf_url (chemin PDF)
```

### 5.2 Templates de CVs

| Template | Style | Usage | Particularités |
|----------|-------|-------|----------------|
| **Standard** | Classique professionnel | Tous secteurs, ATS-friendly | Colonnes traditionnelles, typo sobre |
| **Moderne** | Contemporain épuré | Startups, tech, scale-ups | Design minimaliste, espaces blancs |
| **Créatif** | Original coloré | Créatifs, marketing, design | Layout non-standard, touches couleur |
| **ATS Only** | Texte pur | Optimisation maximale ATS | 0 design, que du texte structuré |

### 5.3 Tons des Lettres de Motivation

| Ton | Quand l'utiliser | Caractéristiques |
|-----|------------------|------------------|
| **Formal** | Institutions, grandes entreprises, postes corporate | Vouvoiement, formules classiques, structure rigide |
| **Professional Warm** | PME, scale-ups, postes managériaux | Équilibre pro/humain, vouvoiement souple |
| **Creative** | Startups, agences créatives, freelance | Style + personnel, storytelling, tu possible |

---

## 6. WIREFRAMES & SCHÉMAS

### 6.1 Page d'Accueil Musée (`/demo`)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo CVMatch AI]                    [Navigation]   [Essayer →]    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          HERO SECTION                               │
│                                                                     │
│                  🏛️ Le Musée des CVs Impossibles                   │
│                                                                     │
│            Découvrez comment l'IA transforme 10 parcours            │
│            extraordinaires en CVs et lettres de motivation          │
│                        prêts pour 2025                              │
│                                                                     │
│                  [⬇ Découvrir les personnages]                     │
│                                                                     │
│  💡 Démonstration gratuite • 0 inscription • 40 CVs à télécharger  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    GALERIE DES PERSONNAGES                          │
│                                                                     │
│  Sélectionnez un personnage pour voir son profil complet           │
│                                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │   🎨    │  │   🔬    │  │   💻    │  │   🖌️    │  │   💃    │ │
│  │         │  │         │  │         │  │         │  │         │ │
│  │ Michel- │  │  Marie  │  │   Ada   │  │ Léonard │  │Joséphine│ │
│  │  Ange   │  │  Curie  │  │Lovelace │  │de Vinci │  │  Baker  │ │
│  │         │  │         │  │         │  │         │  │         │ │
│  │1475-1564│  │1867-1934│  │1815-1852│  │1452-1519│  │1906-1975│ │
│  │         │  │         │  │         │  │         │  │         │ │
│  │Sculpteur│  │Physicien│  │Mathéma- │  │Inventeur│  │ Artiste │ │
│  │& Peintre│  │& Chimiste│ │ticienne │  │& Artiste│  │Résistant│ │
│  │         │  │         │  │         │  │         │  │         │ │
│  │[Voir le │  │[Voir le │  │[Voir le │  │[Voir le │  │[Voir le │ │
│  │ profil] │  │ profil] │  │ profil] │  │ profil] │  │ profil] │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
│                                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │   🧠    │  │   👑    │  │   ⚡    │  │   🎨    │  │   🔐    │ │
│  │         │  │         │  │         │  │         │  │         │ │
│  │ Albert  │  │Cléopâtre│  │ Nikola  │  │  Frida  │  │  Alan   │ │
│  │Einstein │  │   VII   │  │  Tesla  │  │  Kahlo  │  │ Turing  │ │
│  │         │  │         │  │         │  │         │  │         │ │
│  │1879-1955│  │69-30 av.│  │1856-1943│  │1907-1954│  │1912-1954│ │
│  │         │  │   J.-C. │  │         │  │         │  │         │ │
│  │Physicien│  │  Leader │  │Ingénieur│  │ Artiste │  │Mathéma- │ │
│  │         │  │Politique│  │Inventeur│  │         │  │ticien   │ │
│  │         │  │         │  │         │  │         │  │         │ │
│  │[Voir le │  │[Voir le │  │[Voir le │  │[Voir le │  │[Voir le │ │
│  │ profil] │  │ profil] │  │ profil] │  │ profil] │  │ profil] │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        SECTION PÉDAGOGIQUE                          │
│                                                                     │
│                     Comment ça fonctionne ?                         │
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │    ÉTAPE 1  │    │    ÉTAPE 2  │    │    ÉTAPE 3  │            │
│  │             │    │             │    │             │            │
│  │ L'IA analyse│ ➜  │ Génère 4 CVs│ ➜  │  Propose 10 │            │
│  │  le profil  │    │  + 3 lettres│    │ jobs adaptés│            │
│  │             │    │             │    │             │            │
│  │  0.8 sec    │    │   2.3 sec   │    │   1.5 sec   │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│                                                                     │
│  Total : moins de 5 secondes pour un profil complet                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          CTA SECTION                                │
│                                                                     │
│          Impressionné par les capacités de l'IA ?                   │
│          Créez VOTRE profil intelligent en 5 minutes                │
│                                                                     │
│                  [Essayer gratuitement →]                           │
│                                                                     │
│        💡 Aucune carte bancaire • Accès immédiat • 50 places       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                            FOOTER                                   │
│  [À propos] [Contact] [CGU] [Confidentialité]                      │
│  © 2026 CVMatch AI • Made with 🤖 in France                        │
└─────────────────────────────────────────────────────────────────────┘
```

**Dimensions clés** :
- Hero : 100vh (plein écran)
- Cards personnages : 280x400px
- Spacing entre cards : 24px
- Section pédago : 60vh
- CTA final : 40vh

---

### 6.2 Page Profil Personnage (`/demo/michelangelo`)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo CVMatch AI]                    [Navigation]   [Essayer →]    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ← Retour à la galerie              MICHEL-ANGE BUONARROTI          │
│                                    Sculpteur & Peintre Monumental   │
│                                    1475-1564 • Florence, Italie     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        SECTION PROFIL RAG                           │
│                                                                     │
│  📊 PROFIL INTELLIGENT GÉNÉRÉ                   Score: 94/100 ⭐    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ ✅ Profil complet et structuré                                 ││
│  │ ✅ 3 expériences majeures identifiées                          ││
│  │ ✅ 12 compétences techniques extraites                         ││
│  │ ✅ 8 soft skills détectées                                     ││
│  │ ✅ Portfolio iconique reconnu                                  ││
│  │                                                                ││
│  │ ⏱️ Généré en : 0.8 secondes                                    ││
│  │ 📄 Complétude : Excellent (94%)                                ││
│  │ 🎯 Prêt pour génération CV                                     ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  [Voir le détail du profil RAG ▼]                                  │
│                                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                     │
│  RÉSUMÉ DU PARCOURS                                                 │
│  Artiste polyvalent avec 40+ ans d'expérience en sculpture         │
│  monumentale, peinture à fresque et architecture. Reconnu pour     │
│  livraison de projets d'envergure sous contraintes budgétaires...  │
│                                                [Lire la suite ▼]   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      SECTION CVs GÉNÉRÉS                            │
│                                                                     │
│  📄 4 CVs PROFESSIONNELS (Téléchargement instantané)               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │   STANDARD   │  │   MODERNE    │  │   CRÉATIF    │  │   ATS  ││
│  │              │  │              │  │              │  │  ONLY  ││
│  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │  │┌──────┐││
│  │  │        │  │  │  │        │  │  │  │        │  │  ││      │││
│  │  │ [Mini  │  │  │  │ [Mini  │  │  │  │ [Mini  │  │  ││[Mini]│││
│  │  │Preview]│  │  │  │Preview]│  │  │  │Preview]│  │  ││      │││
│  │  │        │  │  │  │        │  │  │  │        │  │  ││      │││
│  │  │  PDF   │  │  │  │  PDF   │  │  │  │  PDF   │  │  ││ PDF │││
│  │  │ A4 1p  │  │  │  │ A4 1p  │  │  │  │ A4 1p  │  │  ││A4 1p│││
│  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │  │└──────┘││
│  │              │  │              │  │              │  │        ││
│  │ Professionnel│  │Design épuré, │  │Layout unique,│  │Texte pur││
│  │classique ATS │  │espaces blancs│  │touches de    │  │optimisé ││
│  │compatible    │  │généreux      │  │couleur       │  │ATS 100% ││
│  │              │  │              │  │              │  │        ││
│  │ Recommandé ⭐│  │              │  │ Recommandé ⭐│  │        ││
│  │              │  │              │  │              │  │        ││
│  │[⬇ Télécharger│  │[⬇ Télécharger│  │[⬇ Télécharger│  │[⬇ PDF] ││
│  │     PDF]     │  │     PDF]     │  │     PDF]     │  │        ││
│  │              │  │              │  │              │  │        ││
│  │ [👁️ Aperçu]  │  │ [👁️ Aperçu]  │  │ [👁️ Aperçu]  │  │[👁️View]││
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────┘│
│                                                                     │
│  💡 Les templates Standard et Créatif sont les plus adaptés à      │
│     ce profil artistique avec expériences iconiques                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    SECTION TOP 10 DES POSTES                        │
│                                                                     │
│  🎯 TOP 10 DES OPPORTUNITÉS (Marché 2025)                          │
│                                                                     │
│  L'IA a analysé 10,000+ offres d'emploi pour identifier les        │
│  postes les plus pertinents pour ce profil                         │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ #1  Directeur Artistique - Musées du Vatican     97% Match ⭐  ││
│  │                                                                ││
│  │     💰 80,000 - 120,000 € | CDI | 📍 Rome, Italie             ││
│  │     🏢 Patrimoine • Musées • Art religieux                     ││
│  │                                                                ││
│  │     💡 Pourquoi ce match :                                     ││
│  │     Expertise inégalée du Vatican + portfolio iconique =       ││
│  │     candidat idéal pour ce poste prestigieux                   ││
│  │                                                                ││
│  │     🔑 Compétences clés valorisées :                           ││
│  │     • Conservation patrimoine                                  ││
│  │     • Direction artistique                                     ││
│  │     • Gestion collections                                      ││
│  │     • Relations institutionnelles papales                      ││
│  │                                                                ││
│  │     [Lire la description complète ▼]                           ││
│  │     [Voir la lettre de motivation →]                           ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ #2  Sculpteur Monumental - Atelier d'Art          94% Match ⭐ ││
│  │                                                                ││
│  │     💰 60,000 - 90,000 € | Freelance | 📍 Florence            ││
│  │     🏢 Art contemporain • Sculpture • Commandes publiques      ││
│  │                                                                ││
│  │     💡 Portfolio exceptionnel + maîtrise marbre = profil       ││
│  │        recherché pour commandes prestigieuses                  ││
│  │                                                                ││
│  │     [Lire la description complète ▼]                           ││
│  │     [Voir la lettre de motivation →]                           ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ #3  Restaurateur Chef de Projet - UNESCO          92% Match   ││
│  │     [Détails masqués] [Voir ▼]                                 ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  [Voir les 7 autres postes ▼]                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                 SECTION LETTRES DE MOTIVATION                       │
│                                                                     │
│  📧 3 LETTRES GÉNÉRÉES PAR L'IA (Top 3 des postes)                 │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ LETTRE #1 : Directeur Artistique - Musées du Vatican          ││
│  │                                                                ││
│  │ Match : 97/100  |  Ton : Formal  |  384 mots                  ││
│  │                                                                ││
│  │ ┌────────────────────────────────────────────────────────────┐││
│  │ │ Madame, Monsieur,                                          │││
│  │ │                                                            │││
│  │ │ Fort de quarante années d'expérience au service de l'art   │││
│  │ │ sacré et de ma collaboration étroite avec le Vatican lors  │││
│  │ │ de la réalisation du plafond de la Chapelle Sixtine, je    │││
│  │ │ souhaite apporter mon expertise unique au poste de         │││
│  │ │ Directeur Artistique des Musées du Vatican.                │││
│  │ │                                                            │││
│  │ │ Mon parcours artistique m'a permis de développer une       │││
│  │ │ compréhension profonde des enjeux liés à la conservation   │││
│  │ │ et à la mise en valeur du patrimoine religieux...          │││
│  │ │                                            [Lire la suite ▼]││
│  │ └────────────────────────────────────────────────────────────┘││
│  │                                                                ││
│  │ [⬇ Télécharger en PDF]  [📋 Copier le texte]                  ││
│  │                                                                ││
│  │ 💡 Cette lettre utilise un ton formel adapté aux institutions ││
│  │    prestigieuses et met en avant l'expérience Vatican         ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ LETTRE #2 : Sculpteur Monumental - Atelier Florence           ││
│  │                                                                ││
│  │ Match : 94/100  |  Ton : Professional Warm  |  298 mots       ││
│  │                                                                ││
│  │ [Voir la lettre complète ▼]                                   ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ LETTRE #3 : Restaurateur Chef de Projet UNESCO                ││
│  │                                                                ││
│  │ Match : 92/100  |  Ton : Formal Professional  |  356 mots     ││
│  │                                                                ││
│  │ [Voir la lettre complète ▼]                                   ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     CTA SECTION (Sticky)                            │
│                                                                     │
│         Vous aussi, obtenez un profil intelligent en 5 min          │
│                                                                     │
│            [Créer mon profil gratuitement →]                        │
│                                                                     │
│   💡 0€ pendant le POC • Accès immédiat • Comme Michel-Ange       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                            FOOTER                                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Dimensions clés** :
- Header personnage : 120px height
- Cards CVs : 320x480px
- Jobs cards : full width, 180px height collapsed
- Lettres : full width, 600px height expanded
- CTA sticky : 80px height, fixed bottom

---

### 6.3 Architecture de Fichiers

```
/mnt/project/
│
├── lib/
│   └── data/
│       └── demo-profiles/
│           ├── index.ts (export all profiles)
│           ├── michelangelo.json
│           ├── curie.json
│           ├── lovelace.json
│           ├── davinci.json
│           ├── baker.json
│           ├── einstein.json
│           ├── cleopatra.json
│           ├── tesla.json
│           ├── kahlo.json
│           └── turing.json
│
├── public/
│   ├── demo-cvs/
│   │   ├── previews/ (images 800x1131px - ratio A4)
│   │   │   ├── michelangelo-standard.png
│   │   │   ├── michelangelo-moderne.png
│   │   │   ├── michelangelo-creatif.png
│   │   │   ├── michelangelo-ats.png
│   │   │   └── ... (36 autres images)
│   │   │
│   │   ├── michelangelo-standard.pdf
│   │   ├── michelangelo-moderne.pdf
│   │   ├── michelangelo-creatif.pdf
│   │   ├── michelangelo-ats.pdf
│   │   └── ... (36 autres PDFs)
│   │
│   ├── demo-letters/
│   │   ├── michelangelo-vatican-director.pdf
│   │   ├── michelangelo-sculptor-florence.pdf
│   │   ├── michelangelo-unesco-restoration.pdf
│   │   └── ... (27 autres PDFs)
│   │
│   └── demo-og-images/ (OpenGraph pour partage social)
│       ├── michelangelo.png (1200x630px)
│       ├── curie.png
│       └── ... (8 autres images)
│
└── app/
    └── demo/
        ├── page.tsx (galerie)
        ├── layout.tsx
        └── [character]/
            └── page.tsx (profil détaillé)
```

**Tailles fichiers estimées** :
- JSON profil : ~15-25 KB
- PDF CV : ~150-300 KB
- PDF Lettre : ~50-100 KB
- Image preview CV : ~200-400 KB
- Image OG : ~100-150 KB

**Total par personnage** : ~2-3 MB  
**Total projet** : ~20-30 MB

---

## 7. USER FLOWS

### 7.1 Flow Principal : Découverte

```
                    START
                      │
                      ▼
        ┌─────────────────────────┐
        │  Arrive sur /demo       │
        │  (via menu ou landing)  │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Voit Hero Section      │
        │  + Galerie 10 persos    │
        └─────────────────────────┘
                      │
                      ▼
              [Scroll ou clic]
                      │
                      ▼
        ┌─────────────────────────┐
        │  Parcourt les cards     │
        │  Lit les descriptions   │
        └─────────────────────────┘
                      │
                      ▼
          [Sélectionne un perso]
                      │
                      ▼
        ┌─────────────────────────┐
        │  Arrive sur /demo/xxx   │
        │  (page profil détaillée)│
        └─────────────────────────┘
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
    ┌───────────────┐   ┌───────────────┐
    │ Scroll & Lit  │   │ Télécharge CV │
    │ le contenu    │   │ ou lettre     │
    └───────────────┘   └───────────────┘
            │                   │
            ▼                   ▼
    ┌───────────────┐   ┌───────────────┐
    │ Découvre      │   │ Ouvre PDF     │
    │ Top 10 jobs   │   │ Évalue qualité│
    └───────────────┘   └───────────────┘
            │                   │
            └─────────┬─────────┘
                      ▼
        ┌─────────────────────────┐
        │  Convaincu par qualité  │
        │  Clique CTA "Essayer"   │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Redirection /signup    │
        │  avec utm_source=demo   │
        └─────────────────────────┘
                      │
                      ▼
                     END
```

### 7.2 Flow Alternatif : Partage Social

```
        Utilisateur sur /demo/michelangelo
                      │
                      ▼
        ┌─────────────────────────┐
        │  Lit le contenu         │
        │  Trouve ça cool         │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Clique bouton partage  │
        │  (Twitter ou LinkedIn)  │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Popup partage réseau   │
        │  avec message pré-rempli│
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Publie sur son profil  │
        │  avec OG image          │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Ses contacts voient    │
        │  et cliquent le lien    │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Arrivent sur page demo │
        │  → Effet viral          │
        └─────────────────────────┘
                      │
                      ▼
                     END
```

### 7.3 Flow Téléchargement

```
        Sur page /demo/michelangelo
                      │
                      ▼
        ┌─────────────────────────┐
        │  Scroll jusqu'aux CVs   │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Compare les 4 templates│
        │  Lit les descriptions   │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Clique "Aperçu" sur un │
        │  template qui l'intéresse│
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Modal s'ouvre avec     │
        │  preview haute résolution│
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Clique "Télécharger"   │
        │  dans le modal          │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  PDF se télécharge      │
        │  (attribution tracking) │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  Ouvre le PDF           │
        │  Évalue la qualité      │
        └─────────────────────────┘
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
    ┌───────────────┐   ┌───────────────┐
    │ Satisfait     │   │ Non satisfait │
    │ → Télécharge  │   │ → Essaye un   │
    │ d'autres CVs  │   │ autre template│
    └───────────────┘   └───────────────┘
            │                   │
            └─────────┬─────────┘
                      ▼
        ┌─────────────────────────┐
        │  Clique CTA inscription │
        └─────────────────────────┘
                      │
                      ▼
                     END
```

---

## 8. SPÉCIFICATIONS TECHNIQUES

### 8.1 Stack Technique (Rappel CVMatch AI)

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js | 14.x (App Router) |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **Database** | Supabase | Latest |
| **Hosting** | Vercel | Latest |
| **PDF Generation** | Puppeteer | 21.x |
| **Analytics** | Posthog | Latest |

### 8.2 Pré-Génération vs Génération Dynamique

#### Phase POC : **100% Pré-généré**

| Élément | Approche | Raison |
|---------|----------|--------|
| **JSON Profils** | Statique | Contrôle qualité total |
| **PDFs CVs** | Pré-générés | 0 coût API Gemini |
| **PDFs Lettres** | Pré-générés | 0 latence utilisateur |
| **Images previews** | Pré-générées | Performance optimale |
| **Top 10 Jobs** | Statique (JSON) | Cohérence garantie |

**Avantages** :
- ✅ Coût : 0€ API calls
- ✅ Performance : Instantané
- ✅ Qualité : Contrôle manuel complet
- ✅ SEO : Tout indexable immédiatement

**Inconvénient** :
- ❌ Pas de "wow effect" génération temps réel
- ❌ Maintenance si modification templates

#### Phase Post-POC : **Hybride possible**

Garder profils JSON statiques MAIS régénérer CVs/lettres dynamiquement si :
- Nouveau template ajouté
- Modification prompts Gemini
- Utilisateur veut voir "en live"

### 8.3 Génération des Contenus (Workflow)

```
ÉTAPE 1 : DONNÉES SOURCES
└─> Recherche historique manuelle
    └─> Validation sources (Wikipedia, biographies, musées)
        └─> Structuration en JSON selon schéma défini

ÉTAPE 2 : PROFILS RAG (JSON)
└─> Rédaction manuelle ou assistée IA (Claude/Gemini)
    └─> Validation qualité (complétude, précision)
        └─> Stockage dans /lib/data/demo-profiles/

ÉTAPE 3 : TOP 10 JOBS
└─> Recherche offres d'emploi réelles 2025 similaires
    └─> Adaptation au profil historique
        └─> Scoring manuel avec justification
            └─> Ajout descriptions jobs détaillées

ÉTAPE 4 : CVs PDFs
└─> Injection RAG dans template HTML/CSS
    └─> Génération PDF via Puppeteer (headless Chrome)
        └─> Génération preview PNG (screenshot)
            └─> Stockage dans /public/demo-cvs/

ÉTAPE 5 : LETTRES MOTIVATION
└─> Génération assistée Gemini (avec prompt structuré)
    └─> Révision manuelle + ajustements
        └─> Génération PDF via Puppeteer
            └─> Stockage dans /public/demo-letters/

ÉTAPE 6 : IMAGES OG
└─> Design dans Figma ou Canva
    └─> Export 1200x630px
        └─> Optimisation (compression)
            └─> Stockage dans /public/demo-og-images/

ÉTAPE 7 : DÉPLOIEMENT
└─> Commit sur GitHub
    └─> Auto-deploy Vercel
        └─> Tests manuels
            └─> Annonce publique
```

### 8.4 Performance Requirements

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Core Web Vitals |
| **FID (First Input Delay)** | < 100ms | Core Web Vitals |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Core Web Vitals |
| **Time to Interactive** | < 3s | Lighthouse |
| **PDF Download Speed** | < 1s | Monitoring custom |
| **Mobile Score Lighthouse** | > 90 | Lighthouse CI |
| **Desktop Score Lighthouse** | > 95 | Lighthouse CI |

### 8.5 SEO Requirements

#### Meta Tags (Par page)

**Page Galerie** (`/demo`) :
```
title: "Le Musée des CVs Impossibles | CVMatch AI"
description: "Découvrez 10 CVs de personnages historiques générés par IA. De Michel-Ange à Ada Lovelace, voyez la puissance de CVMatch AI."
canonical: "https://cvmatch.ai/demo"
og:image: "/demo-og-images/demo-home.png"
```

**Page Profil** (`/demo/michelangelo`) :
```
title: "CV de Michel-Ange généré par IA | CVMatch AI"
description: "Le parcours de Michel-Ange (Sculpteur & Peintre, 1475-1564) transformé en CV moderne par IA. Score 94/100, 4 templates, 10 jobs identifiés."
canonical: "https://cvmatch.ai/demo/michelangelo"
og:image: "/demo-og-images/michelangelo.png"
og:type: "article"
article:published_time: [date de publication]
```

#### Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "CV de Michel-Ange Buonarroti",
  "description": "CV professionnel généré par IA pour le sculpteur et peintre Michel-Ange",
  "creator": {
    "@type": "Organization",
    "name": "CVMatch AI"
  },
  "about": {
    "@type": "Person",
    "name": "Michelangelo Buonarroti",
    "jobTitle": "Sculpteur & Peintre",
    "birthDate": "1475",
    "deathDate": "1564"
  },
  "datePublished": "2026-01-18",
  "inLanguage": "fr-FR"
}
```

#### Sitemap.xml

```xml
<url>
  <loc>https://cvmatch.ai/demo</loc>
  <lastmod>2026-01-18</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://cvmatch.ai/demo/michelangelo</loc>
  <lastmod>2026-01-18</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
<!-- ... 9 autres personnages ... -->
```

---

## 9. CONTENU & RÉDACTION

### 9.1 Tone of Voice

**Général** :
- 🎯 Professionnel mais accessible
- 🎨 Créatif sans être puéril
- 🧠 Pédagogique sans être condescendant
- 😊 Enthousiaste mais crédible

**À faire** :
✅ Utiliser "nous" ou forme passive
✅ Phrases courtes et percutantes
✅ Données factuelles avec sources
✅ Humour subtil si pertinent
✅ Vocabulaire RH/recrutement professionnel

**À éviter** :
❌ Jargon technique excessif
❌ Ton marketing agressif
❌ Blagues douteuses ou déplacées
❌ Promesses irréalistes
❌ Comparaisons avec vrais concurrents

### 9.2 Textes Clés

#### Hero Section

**Titre H1** :
```
🏛️ Le Musée des CVs Impossibles
```

**Sous-titre** :
```
Découvrez comment l'IA transforme 10 parcours extraordinaires
en CVs et lettres de motivation prêts pour 2025
```

**Baseline** :
```
💡 Démonstration gratuite • 0 inscription • 40 CVs à télécharger
```

#### Section Pédagogique

**Titre** :
```
Comment ça fonctionne ?
```

**Étape 1** :
```
L'IA analyse le profil
Extraction automatique des expériences, compétences et réalisations
⏱️ 0.8 secondes
```

**Étape 2** :
```
Génère 4 CVs + 3 lettres
Adaptation à différents templates et tons professionnels
⏱️ 2.3 secondes
```

**Étape 3** :
```
Propose 10 jobs adaptés
Matching intelligent avec le marché de l'emploi 2025
⏱️ 1.5 secondes
```

**Conclusion** :
```
Total : moins de 5 secondes pour un profil complet
```

#### CTA Final

**Titre** :
```
Impressionné par les capacités de l'IA ?
```

**Sous-titre** :
```
Créez VOTRE profil intelligent en 5 minutes
```

**Bouton** :
```
Essayer gratuitement →
```

**Reassurance** :
```
💡 Aucune carte bancaire • Accès immédiat • 50 places POC
```

### 9.3 Copy pour Personnages

**Format Card Galerie** :
```
[Emoji]
[Prénom ou nom court]
[Dates]
[Métier principal]
[Bouton "Voir le profil"]
```

**Exemple** :
```
🎨
Michel-Ange
1475-1564
Sculpteur & Peintre
[Voir le profil]
```

### 9.4 Copy Boutons Partage

**Twitter** :
```
Regardez le CV de [Personnage] généré par IA ! 🤖
L'IA a transformé son parcours en CV moderne avec score [X]/100.
Découvrez Le Musée des CVs Impossibles 👉 https://cvmatch.ai/demo/[character]
#CVMatchAI #IA #RecrutementInnovant
```

**LinkedIn** :
```
🏛️ Le Musée des CVs Impossibles : quand l'IA rencontre l'Histoire

Je viens de découvrir comment CVMatch AI transforme le parcours de [Personnage] en CV professionnel adapté au marché 2025.

Résultat : [X]/100 de complétude, 4 templates, et 10 opportunités identifiées.

Si l'IA peut structurer la carrière de [Personnage], imaginez ce qu'elle peut faire pour vous ! 

👉 https://cvmatch.ai/demo/[character]

#RH #Recrutement #IA #Innovation #CVMatchAI
```

---

## 10. SEO & MARKETING

### 10.1 Stratégie SEO

#### Mots-Clés Cibles

**Primaires** :
- "CV généré par IA"
- "création CV intelligence artificielle"
- "générateur CV IA gratuit"
- "CV automatique IA"

**Secondaires** :
- "CV Michel-Ange"
- "CV Marie Curie"
- "CV personnages historiques"
- "exemple CV IA"
- "démo CV intelligence artificielle"

**Long-tail** :
- "comment l'IA génère un CV"
- "voir exemple CV créé par IA"
- "CV professionnel automatique gratuit"
- "transformation parcours en CV par IA"

#### Backlinks Strategy

**Cibles prioritaires** :
1. **Blogs tech** : Blog du Modérateur, Siècle Digital, FrenchWeb
2. **Médias RH** : MyRHLine, Culture RH, Focus RH
3. **Reddit** : r/france, r/emploi, r/recrutement
4. **Product Hunt** : Launch avec le Musée comme feature highlight
5. **LinkedIn** : Posts viraux de Gilles avec screenshots

**Anchor texts recommandés** :
- "Musée des CVs Impossibles"
- "démo CVMatch AI"
- "CVs générés par IA"
- "voir des exemples"

### 10.2 Stratégie de Lancement

#### Phase 1 : Pre-Launch (J-7)

**Objectif** : Créer de l'anticipation

- **J-7** : Teaser LinkedIn Gilles : "Je construis quelque chose de fou... 🏛️"
- **J-5** : Tweet mystère : "Si Michel-Ange avait eu l'IA..."
- **J-3** : Post LinkedIn avec screenshot flouté
- **J-1** : Countdown Instagram Stories

#### Phase 2 : Launch Day (J0)

**Objectif** : Maximum visibility

**Matin (9h)** :
- Publication page /demo en production
- Post LinkedIn long-form de Gilles (storytelling)
- Tweet thread explicatif
- Post Reddit r/france
- Email newsletter (si liste existante)

**Midi (12h)** :
- Republication avec premiers retours users
- Partage dans groupes Facebook RH/Tech
- Post sur Product Hunt (si éligible)

**Soir (18h)** :
- Bilan J0 avec chiffres (visiteurs, téléchargements)
- Stories Instagram/LinkedIn avec analytics
- Engagement avec tous les commentaires

#### Phase 3 : Post-Launch (J+1 à J+30)

**Objectif** : Sustain momentum

**Semaine 1** :
- 1 post LinkedIn par jour sur un personnage différent
- Partage screenshots users sur Twitter
- Outreach journalistes tech/RH

**Semaine 2-4** :
- Guest posts sur blogs partenaires
- Apparition podcast tech/RH si possible
- Optimisation SEO basée sur analytics
- A/B testing CTAs

### 10.3 Contenu Viral (Idées)

#### Posts LinkedIn Engageants

**Format 1 : Before/After**
```
❌ AVANT : CV Word 4 pages, format confus
✅ APRÈS : CV IA 1 page, score 94/100, 10 jobs matchés

L'IA vient de transformer le parcours de Michel-Ange.
Voici ce qu'elle a trouvé 👇
[Screenshot impressionnant]
```

**Format 2 : Question rhétorique**
```
Si l'IA peut générer un CV pour Michel-Ange
qui a vécu au XVIe siècle...

Qu'est-ce qu'elle peut faire pour VOUS
qui vivez en 2025 avec LinkedIn, emails, et portfolios ?

Réponse : https://cvmatch.ai/demo 🏛️
```

**Format 3 : Stats choc**
```
Michel-Ange : 40 ans d'expérience
L'IA : 0.8 secondes pour structurer son profil

Marie Curie : 2 Prix Nobel
L'IA : 10 opportunités modernes identifiées

Alan Turing : Génie incompris
L'IA : CV ATS-compliant 92/100

Le Musée des CVs Impossibles est ouvert 👉
```

#### Twitter Threads

**Thread Type 1 : Educational**
```
1/ 🧵 J'ai demandé à l'IA de générer un CV pour 10 personnages historiques.

Les résultats sont fascinants. Voici ce que j'ai appris 👇

2/ Michel-Ange (Sculpteur, 1475-1564)
→ Score de complétude : 94/100
→ Poste recommandé 2025 : Directeur Artistique Musées du Vatican
→ Salaire estimé : 80-120k€

L'IA comprend la transposition des compétences.

3/ Marie Curie (Physicienne, 1867-1934)
→ Double Prix Nobel
→ L'IA a identifié : "Résilience face obstacles institutionnels"
→ Top match : Chief Scientific Officer - Startup HealthTech

L'IA détecte les soft skills implicites.

[...suite thread 10 tweets...]

11/ Conclusion : L'IA ne remplace pas votre expertise.
Elle la STRUCTURE, l'OPTIMISE, et la VALORISE.

Voir tous les profils : https://cvmatch.ai/demo

12/ Quel personnage vous a le + surpris ? Commentez 👇
```

### 10.4 Analytics & Tracking

#### Events à Tracker (Posthog)

| Event Name | Trigger | Données capturées |
|------------|---------|-------------------|
| `demo_page_view` | Arrive sur /demo | Referrer, device |
| `character_card_click` | Clic sur personnage galerie | Character ID |
| `character_profile_view` | Arrive sur /demo/[char] | Character ID, scroll depth |
| `cv_preview_open` | Clic aperçu CV | Character, template |
| `cv_download` | Télécharge PDF CV | Character, template |
| `letter_view` | Lit lettre motivation | Character, job rank |
| `letter_download` | Télécharge lettre | Character, job rank |
| `top10_expand` | Développe job description | Character, job rank |
| `cta_click` | Clic "Essayer gratuitement" | Location (galerie ou profil) |
| `share_button_click` | Clic partage social | Platform (Twitter/LinkedIn), character |

#### Funnels à Monitorer

**Funnel Conversion Principale** :
```
1. Visite /demo                    (100%)
2. Clic sur un personnage          (40-60%)
3. Scroll profil (>50%)            (60-80% du step 2)
4. Télécharge ≥1 CV                (30-50% du step 3)
5. Clique CTA inscription          (15-25% du step 4)
6. S'inscrit effectivement         (60-80% du step 5)
```

**Funnel Viral** :
```
1. Visite /demo/[char]             (100%)
2. Lit ≥2 sections                 (50-70%)
3. Clique bouton partage           (5-10% du step 2)
4. Partage effectivement           (70-90% du step 3)
```

#### KPIs Semaine 1

| KPI | Cible | Mesure |
|-----|-------|--------|
| **Visiteurs uniques** | 500 | Google Analytics |
| **Pages vues** | 2000 | Google Analytics |
| **Taux rebond** | < 60% | Google Analytics |
| **Temps moyen page** | > 2min | Google Analytics |
| **CVs téléchargés** | 200 | Posthog custom |
| **Partages sociaux** | 50 | Posthog + social APIs |
| **Inscriptions depuis demo** | 25 (5% conv) | Supabase attribution |

---

## 11. MÉTRIQUES DE SUCCÈS

### 11.1 Objectifs Quantitatifs

#### À 1 Mois

| Métrique | Objectif | Stretch Goal |
|----------|----------|--------------|
| **Visiteurs uniques /demo** | 2,000 | 5,000 |
| **Pages vues totales** | 8,000 | 15,000 |
| **CVs téléchargés** | 1,000 | 2,500 |
| **Lettres téléchargées** | 300 | 800 |
| **Partages sociaux** | 100 | 300 |
| **Backlinks obtenus** | 10 | 25 |
| **Inscriptions attribution demo** | 100 | 250 |
| **Taux conversion demo→signup** | 5% | 10% |

#### À 3 Mois

| Métrique | Objectif | Stretch Goal |
|----------|----------|--------------|
| **Visiteurs uniques /demo** | 8,000 | 15,000 |
| **Ranking Google "CV IA"** | Top 10 | Top 5 |
| **Domain Authority** | +5 points | +10 points |
| **Trafic organique** | 40% du total | 60% du total |
| **Inscriptions cumulées** | 500 | 1,000 |

#### À 6 Mois

| Métrique | Objectif | Stretch Goal |
|----------|----------|--------------|
| **Visiteurs uniques /demo** | 20,000 | 40,000 |
| **CVs téléchargés cumulés** | 10,000 | 25,000 |
| **Virality coefficient** | 1.2 | 1.5 |
| **Inscriptions cumulées** | 2,000 | 5,000 |
| **Revenue depuis cohorte demo** | 5,000€ | 15,000€ |

### 11.2 Objectifs Qualitatifs

| Critère | Indicateur de Succès |
|---------|---------------------|
| **Qualité perçue** | NPS > 8/10 sur enquête post-visite |
| **Compréhension produit** | 80%+ comprennent ce que fait CVMatch AI après visite |
| **Crédibilité technique** | Mentions positives "qualité IA" dans feedbacks |
| **Effet mémorabilité** | 50%+ se souviennent du "Musée" 1 semaine après |
| **Bouche-à-oreille** | 30%+ disent qu'ils recommanderaient à un ami |

### 11.3 Red Flags (Signaux d'Alerte)

| Problème | Seuil Critique | Action Corrective |
|----------|----------------|-------------------|
| **Taux rebond > 75%** | Après 1 semaine | Revoir Hero Section / UX |
| **Temps page < 1min** | Après 1 semaine | Améliorer engagement contenu |
| **0 téléchargements** | Par personnage sur 1 mois | Revoir qualité CVs de ce perso |
| **Taux conv < 2%** | Après 1 mois | Revoir CTAs et proposition valeur |
| **0 partages sociaux** | Après 2 semaines | Améliorer share copy et OG images |

---

## 12. ROADMAP D'IMPLÉMENTATION

### 12.1 Phases de Développement

#### 🟢 Phase 1 : Création Contenus (Semaines 1-3)

**Objectif** : Produire les 10 profils complets

| Tâche | Durée estimée | Owner |
|-------|---------------|-------|
| Recherche historique 10 persos | 5 jours | Gilles |
| Rédaction JSON RAG (10x) | 8 jours | Gilles + IA assist |
| Génération Top 10 Jobs (10x) | 4 jours | Gilles |
| Génération Lettres (30x) | 5 jours | IA + révision Gilles |

**Livrables** :
- ✅ 10 fichiers JSON profils complets
- ✅ 10 fichiers JSON Top 10 Jobs
- ✅ 30 lettres motivation en Markdown

---

#### 🟡 Phase 2 : Génération Assets (Semaine 4)

**Objectif** : Produire tous les PDFs et images

| Tâche | Durée estimée | Owner |
|-------|---------------|-------|
| Setup templates CVs (4x) | 2 jours | Gilles + Trae.ai |
| Génération 40 CVs PDF | 1 jour | Script automatique |
| Génération 40 previews PNG | 1 jour | Script automatique |
| Génération 30 lettres PDF | 0.5 jour | Script automatique |
| Création 10 OG images | 2 jours | Gilles (Figma) |

**Livrables** :
- ✅ 40 PDFs CVs (4 templates x 10 persos)
- ✅ 40 images preview CVs
- ✅ 30 PDFs lettres
- ✅ 10 images OG pour social

---

#### 🔵 Phase 3 : Développement Front (Semaines 5-6)

**Objectif** : Coder les pages /demo

| Tâche | Durée estimée | Owner |
|-------|---------------|-------|
| Page galerie /demo | 2 jours | Trae.ai |
| Page profil /demo/[char] | 3 jours | Trae.ai |
| Composants réutilisables | 2 jours | Trae.ai |
| Responsive mobile | 2 jours | Trae.ai |
| Tests manuels cross-browser | 1 jour | Gilles |

**Livrables** :
- ✅ Page /demo fonctionnelle
- ✅ 10 pages /demo/[character] fonctionnelles
- ✅ Composants React réutilisables
- ✅ Design responsive validé

---

#### 🟣 Phase 4 : SEO & Analytics (Semaine 7)

**Objectif** : Optimiser pour search et tracking

| Tâche | Durée estimée | Owner |
|-------|---------------|-------|
| Meta tags dynamiques | 1 jour | Trae.ai |
| Structured data JSON-LD | 1 jour | Trae.ai |
| Sitemap.xml | 0.5 jour | Trae.ai |
| Setup Posthog events | 1 jour | Trae.ai |
| Setup Google Analytics | 0.5 jour | Gilles |
| Boutons partage social | 1 jour | Trae.ai |

**Livrables** :
- ✅ SEO on-page complet
- ✅ Tracking analytics opérationnel
- ✅ Boutons partage fonctionnels

---

#### 🟠 Phase 5 : Testing & QA (Semaine 8)

**Objectif** : Garantir qualité avant lancement

| Tâche | Durée estimée | Owner |
|-------|---------------|-------|
| Tests fonctionnels (tous flows) | 2 jours | Gilles |
| Tests performance (Lighthouse) | 1 jour | Gilles |
| Tests SEO (checklist) | 1 jour | Gilles |
| Corrections bugs | 2 jours | Trae.ai |
| Tests finaux pré-launch | 1 jour | Gilles |

**Checklist QA** :
- [ ] Tous les liens fonctionnent
- [ ] Tous les PDFs se téléchargent
- [ ] Tous les boutons cliquables
- [ ] Images OG s'affichent sur Twitter/LinkedIn
- [ ] Mobile responsive parfait
- [ ] Lighthouse score > 90 mobile
- [ ] 0 erreurs console JavaScript
- [ ] Analytics tracking fonctionne

---

#### 🔴 Phase 6 : Launch (Semaine 9)

**Objectif** : Mise en production et promotion

**J-1** :
- Freeze code (plus de modifs)
- Préparation posts réseaux sociaux
- Brief presse si applicable

**J0 (Launch Day)** :
- 9h : Déploiement production
- 9h30 : Post LinkedIn Gilles
- 10h : Tweet + Thread
- 11h : Post Reddit
- 12h : Monitoring analytics en temps réel
- 18h : Bilan J0 et ajustements si needed

**J+1 à J+7** :
- Posts quotidiens sur personnages
- Engagement communauté
- Monitoring analytics
- Ajustements mineurs si bugs

---

### 12.2 Timeline Visuel

```
SEMAINES 1-2-3          SEMAINE 4           SEMAINES 5-6-7      SEMAINE 8         SEMAINE 9
┌─────────────┐        ┌──────────┐        ┌─────────────┐      ┌─────────┐      ┌────────┐
│  CONTENUS   │   ➜    │  ASSETS  │   ➜    │    DEV      │  ➜   │   QA    │  ➜   │ LAUNCH │
│             │        │          │        │             │      │         │      │        │
│ • Recherche │        │ • PDFs   │        │ • Front     │      │ • Tests │      │ • Prod │
│ • JSON RAG  │        │ • Images │        │ • SEO       │      │ • Debug │      │ • Promo│
│ • Jobs      │        │ • OG     │        │ • Analytics │      │ • Perf  │      │        │
│ • Lettres   │        │          │        │             │      │         │      │        │
└─────────────┘        └──────────┘        └─────────────┘      └─────────┘      └────────┘

    21 jours               7 jours             21 jours           7 jours         7 jours
```

**Total : 9 semaines (≈ 2 mois)**

---

### 12.3 Ressources Requises

| Ressource | Quantité | Coût Estimé |
|-----------|----------|-------------|
| **Temps Gilles** | 80-100h | 0€ (sweat equity) |
| **Temps Trae.ai** | 40-60h | 0€ (inclus POC) |
| **Figma Pro** (OG images) | 1 mois | 0€ (gratuit ou existant) |
| **Hébergement Vercel** | Illimité | 0€ (free tier OK) |
| **Storage Supabase** | ~30 MB | 0€ (free tier OK) |
| **APIs Gemini** | 0 calls (pré-gen) | 0€ |
| **Domaine cvmatch.ai** | 1 an | 12€ (déjà payé?) |

**Total : 0-12€**

---

### 12.4 Risques & Mitigation

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Qualité contenu insuffisante** | Moyenne | Élevé | Révision manuelle systématique + feedback beta users |
| **Temps dev sous-estimé** | Moyenne | Moyen | Buffer 1 semaine dans planning |
| **Bugs bloquants launch** | Faible | Élevé | Phase QA dédiée + tests exhaustifs |
| **Trafic 0 post-launch** | Faible | Élevé | Plan promo détaillé + outreach presse |
| **Controverse perso historique** | Faible | Moyen | Sélection prudente persos + disclaimer respectueux |
| **Overload serveur** | Très faible | Moyen | Vercel auto-scale + CDN Cloudflare |

---

### 12.5 Post-Launch Roadmap

#### Version 1.1 (M+1)

- [ ] Ajout 5 nouveaux personnages (si succès)
- [ ] Page "Making of" (coulisses création)
- [ ] Intégration feedback users
- [ ] A/B testing CTAs

#### Version 1.2 (M+3)

- [ ] Génération dynamique temps réel (mode "Custom")
- [ ] Utilisateur peut uploader profil fictif
- [ ] Comparaison side-by-side 2 personnages
- [ ] Export ZIP (tous CVs d'un perso)

#### Version 2.0 (M+6)

- [ ] Traduction EN (version internationale)
- [ ] 25 personnages totaux
- [ ] API publique (pour devs)
- [ ] Gamification (quiz "Quel perso es-tu?")

---

## 13. ANNEXES

### 13.1 Checklist Pré-Launch

#### Contenu

- [ ] 10 profils JSON validés et complets
- [ ] 40 CVs PDF générés et vérifiés
- [ ] 30 lettres PDF générées et relues
- [ ] 10 images OG créées et optimisées
- [ ] Tous les textes UI rédigés et validés

#### Technique

- [ ] Page /demo déployée en staging
- [ ] 10 pages /demo/[char] fonctionnelles
- [ ] Tous les liens testés
- [ ] Mobile responsive validé
- [ ] Performance Lighthouse > 90
- [ ] SEO on-page complet
- [ ] Analytics configuré et testé
- [ ] Boutons partage fonctionnels

#### Légal & Compliance

- [ ] Disclaimer personnages historiques ajouté
- [ ] RGPD : pas de données perso collectées
- [ ] CGU mentionnent la page demo
- [ ] Politique cookies à jour

#### Marketing

- [ ] Posts réseaux sociaux rédigés
- [ ] Images promo créées
- [ ] Email newsletter rédigé (si liste)
- [ ] Outreach journalistes préparé
- [ ] Plan de lancement finalisé

---

### 13.2 Glossaire

| Terme | Définition |
|-------|------------|
| **RAG** | Retrieval-Augmented Generation - Profil structuré utilisateur |
| **ATS** | Applicant Tracking System - Logiciel de gestion candidatures |
| **OG Image** | Open Graph Image - Image preview réseaux sociaux |
| **LCP** | Largest Contentful Paint - Métrique performance web |
| **JSON-LD** | Format de structured data pour SEO |
| **POC** | Proof of Concept - Phase de validation produit |
| **MVP** | Minimum Viable Product - Version minimale fonctionnelle |
| **NPS** | Net Promoter Score - Indicateur satisfaction client |

---

### 13.3 Références & Sources

#### Inspiration Design

- **Humaan.com/demo** : Page démo interactive
- **Stripe.com/payments** : Showcase produit élégant
- **Linear.app** : Design minimaliste et performant
- **Notion.so/templates** : Galerie de templates

#### Benchmarks SEO

- **Canva.com/templates** : SEO multi-pages produits
- **Resume.io** : Landing pages CV
- **Zety.com** : Contenu éducatif SEO

#### Standards Techniques

- **Web.dev/vitals** : Core Web Vitals guidelines
- **Schema.org/Person** : Structured data personnes
- **OpenGraph Protocol** : OG tags best practices

---

### 13.4 Contact & Support

**Product Owner** : Gilles GOZLAN  
**Email** : [email pro]  
**LinkedIn** : [profil LinkedIn]

**Questions fréquentes** :
- Modifications du CDC : Versionning avec dates
- Feedback implémentation : GitHub Issues ou direct Slack
- Revues de code : Avant chaque merge sur main

---

## FIN DU CAHIER DES CHARGES

**Prochaines étapes** :
1. Validation CDC par Gilles ✅
2. Début Phase 1 : Création contenus
3. Point de suivi hebdomadaire
4. Ajustements itératifs si needed

**Document vivant** : Ce CDC sera mis à jour au fur et à mesure des learnings et ajustements du projet.

---

**Version** : 1.0  
**Dernière mise à jour** : 18 janvier 2026  
**Statut** : ✅ Prêt pour implémentation
