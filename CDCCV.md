# CDC_06 - SYSTÈME DE ZONES ADAPTATIVES CV
## CVMatch AI - Architecture des Templates CV Multi-Thèmes

**Version** : 1.0  
**Date** : Janvier 2025  
**Auteur** : Gilles GOZLAN  
**Statut** : Spécification technique - Prêt pour implémentation

---

## 📋 TABLE DES MATIÈRES

1. [Contexte & Problématique](#contexte)
2. [Vision & Objectifs](#vision)
3. [Architecture Conceptuelle](#architecture)
4. [Spécifications Détaillées](#specifications)
5. [Implémentation Technique](#implementation)
6. [Exemples & Cas d'Usage](#exemples)
7. [Tests & Validation](#tests)
8. [Roadmap d'Implémentation](#roadmap)

---

## 1️⃣ CONTEXTE & PROBLÉMATIQUE {#contexte}

### 1.1 Situation Actuelle

CVMatch AI génère des CV optimisés à partir de données RAG structurées. Actuellement :

**❌ PROBLÈME** : Pas de système normalisé pour gérer la répartition du contenu
- Les règles sont sémantiques (`max_detailed_experiences: 4`) mais pas spatiales
- Impossible de créer plusieurs thèmes visuels sans risque de débordement
- Pas de garantie que le contenu "rentre" dans une page A4
- Difficile d'adapter automatiquement le format selon l'espace disponible

**🎯 CONSÉQUENCE** : 
```
Thème "Classic" (marges normales)
├─ 4 expériences détaillées = ✅ ça rentre

Thème "Modern" (grandes marges + header avec photo)
├─ 4 expériences détaillées = ❌ DÉBORDEMENT !
└─ Solution actuelle : bricolage manuel par thème
```

### 1.2 Besoin Fonctionnel

**Il faut un système qui :**
1. Définit l'espace disponible de chaque zone d'un CV (header, expériences, etc)
2. Connaît la "hauteur" de chaque type de contenu (expérience détaillée vs compacte)
3. Adapte automatiquement le format du contenu selon l'espace disponible
4. Garantit qu'un CV ne dépasse jamais 1-2 pages selon configuration
5. Fonctionne de manière identique sur tous les thèmes

---

## 2️⃣ VISION & OBJECTIFS {#vision}

### 2.1 Concept Central : "Content Units"

Au lieu de raisonner en pixels/mm (fragile), on utilise une **unité abstraite** :

```
1 UNIT = Hauteur de base normalisée (environ 4mm sur A4)

Page A4 = 297mm ≈ 200 UNITS (après marges)
```

Chaque élément de contenu a une hauteur en UNITS :
- Expérience détaillée = 20 units
- Expérience compacte = 8 units
- Ligne de compétence = 2 units
- etc.

### 2.2 Architecture en 3 Couches

```
┌─────────────────────────────────────────────────────────┐
│                    COUCHE 1 : CONFIG                    │
│  Définition des capacités par thème + hauteurs types   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  COUCHE 2 : ALGORITHME                  │
│     Calcul adaptatif : quoi mettre, dans quel format   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   COUCHE 3 : TEMPLATES                  │
│      HTML/CSS avec variables CSS basées sur units      │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Objectifs Mesurables

**Performance**
- ✅ 0% de débordement sur page A4 (validation automatique)
- ✅ 100% des thèmes compatibles avec tous les profils (junior à senior)
- ✅ Adaptation automatique en <500ms

**Maintenabilité**
- ✅ Nouveau thème = modifier 1 seul fichier de config
- ✅ Ajuster espacement = changer 1 constante
- ✅ 0 calcul pixel manuel dans les templates

**Flexibilité**
- ✅ Support 1 à 2 pages selon préférence utilisateur
- ✅ Priorisation intelligente (expériences récentes/pertinentes)
- ✅ Dégradation gracieuse (détaillé → standard → compact)

---

## 3️⃣ ARCHITECTURE CONCEPTUELLE {#architecture}

### 3.1 Entités Principales

#### A. ContentUnit

Représente la hauteur normalisée d'un type de contenu.

```typescript
interface ContentUnit {
  type: ContentUnitType;
  height_units: number;
  description: string;
}

type ContentUnitType = 
  // HEADER
  | "header_minimal"           // Nom + titre
  | "header_with_contacts"     // + email, tel, location
  | "header_with_photo"        // + photo
  
  // SUMMARY
  | "summary_short"            // 2 lignes
  | "summary_standard"         // 3-4 lignes
  | "summary_elevator"         // 5-6 lignes (pitch complet)
  
  // EXPERIENCES
  | "experience_detailed"      // Contexte + 4-5 réalisations
  | "experience_standard"      // 2-3 réalisations
  | "experience_compact"       // 1 ligne descriptive
  | "experience_minimal"       // Titre + dates seulement
  
  // COMPÉTENCES
  | "skill_category_full"      // Catégorie + 8-10 items avec niveaux
  | "skill_category_standard"  // Catégorie + 5-7 items
  | "skill_category_compact"   // Tags visuels uniquement
  
  // FORMATION
  | "formation_detailed"       // Avec cours/projets/mentions
  | "formation_standard"       // Titre + école + date
  | "formation_minimal"        // Titre + date
  
  // AUTRES
  | "project_full"             // Description + techno + lien
  | "project_compact"          // Titre + 1 ligne
  | "certification"            // Titre + date
  | "language"                 // Langue + niveau
  | "achievement_bullet"       // 1 bullet point
  | "interest_item"            // 1 centre d'intérêt
```

#### B. ZoneConfig

Définit l'espace alloué à une section du CV.

```typescript
interface ZoneConfig {
  name: CVZoneName;
  capacity_units: number;     // Espace total disponible
  min_units: number;          // Minimum requis (validation)
  flex: boolean;              // Peut emprunter/prêter espace ?
  flex_priority: number;      // Priorité si redistribution (1-10)
  overflow_strategy: "hide" | "compact" | "split_page";
}

type CVZoneName = 
  | "header"
  | "summary" 
  | "experiences"
  | "skills"
  | "formation"
  | "projects"
  | "certifications"
  | "languages"
  | "interests"
  | "footer"
  | "margins"
```

#### C. CVThemeConfig

Configuration complète d'un thème visuel.

```typescript
interface CVThemeConfig {
  id: string;
  name: string;
  description: string;
  
  // Métadonnées
  page_config: {
    total_height_units: number;      // Ex: 200 pour A4
    supports_two_pages: boolean;
    two_pages_threshold: number;     // Units min pour passer à 2 pages
  };
  
  // Configuration des zones
  zones: Record<CVZoneName, ZoneConfig>;
  
  // Règles d'adaptation
  adaptive_rules: {
    min_detailed_experiences: number;
    prefer_detailed_for_recent: boolean;
    compact_after_years: number;
    skills_display_mode: "auto" | "full" | "compact";
    max_bullet_points_per_exp: number;
  };
  
  // Métadonnées visuelles (pour HTML/CSS)
  visual_config: {
    unit_to_mm: number;              // Conversion unit → mm
    font_sizes: Record<string, number>;
    colors: Record<string, string>;
    spacing_multiplier: number;
  };
}
```

#### D. AdaptedContent

Résultat de l'algorithme d'adaptation.

```typescript
interface AdaptedContent {
  theme_id: string;
  total_units_used: number;
  pages: number;
  
  sections: {
    header: AdaptedSection;
    summary: AdaptedSection;
    experiences: AdaptedExperience[];
    skills: AdaptedSkillCategory[];
    formation: AdaptedFormation[];
    projects?: AdaptedProject[];
    certifications?: AdaptedCertification[];
    languages?: AdaptedLanguage[];
    interests?: string[];
    footer?: AdaptedSection;
  };
  
  warnings: string[];  // "Experience X truncated", etc.
}

interface AdaptedExperience {
  id: string;
  format: "detailed" | "standard" | "compact" | "minimal";
  units_used: number;
  content: {
    company: string;
    position: string;
    dates: string;
    context?: string;          // Seulement si detailed
    achievements: string[];    // Nombre varie selon format
    technologies?: string[];
  };
}
```

### 3.2 Flux de Données

```
┌──────────────┐
│  RAG Data    │ (Données brutes utilisateur)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Job Offer   │ (Pour scoring de pertinence)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ User Prefs   │ (Préférences utilisateur)
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────────┐
│     ALGORITHME D'ADAPTATION              │
│                                          │
│  1. Score de pertinence par élément      │
│  2. Tri par priorité                     │
│  3. Allocation dans zones                │
│  4. Dégradation de format si nécessaire  │
│  5. Validation des contraintes           │
└──────┬───────────────────────────────────┘
       │
       ↓
┌──────────────┐
│  Adapted     │ (Contenu optimisé pour le thème)
│  Content     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  HTML/CSS    │ (Template avec variables CSS)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Puppeteer    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  PDF Final   │
└──────────────┘
```

---

## 4️⃣ SPÉCIFICATIONS DÉTAILLÉES {#specifications}

### 4.1 Référentiel des Content Units

Fichier : `lib/cv/content-units-reference.ts`

```typescript
/**
 * RÉFÉRENTIEL DES HAUTEURS NORMALISÉES
 * 
 * Ces valeurs sont calibrées empiriquement :
 * - 1 UNIT ≈ 4mm sur A4 (avec police standard 10-11pt)
 * - Page A4 (297mm) ≈ 200 UNITS utilisables
 * - Ajuster ces valeurs après tests PDF réels
 */

export const CONTENT_UNITS_REFERENCE = {
  
  // ────────────────────────────────────────────────────────
  // HEADER
  // ────────────────────────────────────────────────────────
  header_minimal: {
    height_units: 8,
    description: "Nom (grande police) + titre professionnel",
    typical_content: "2 lignes"
  },
  
  header_with_contacts: {
    height_units: 12,
    description: "header_minimal + email + téléphone + localisation",
    typical_content: "3-4 lignes"
  },
  
  header_with_photo: {
    height_units: 20,
    description: "header_with_contacts + photo professionnelle carrée",
    typical_content: "Photo 4x4cm + infos"
  },
  
  // ────────────────────────────────────────────────────────
  // SUMMARY / PITCH
  // ────────────────────────────────────────────────────────
  summary_short: {
    height_units: 5,
    description: "Pitch 2 lignes maximum",
    typical_content: "30-40 mots"
  },
  
  summary_standard: {
    height_units: 8,
    description: "Pitch 3-4 lignes",
    typical_content: "50-70 mots"
  },
  
  summary_elevator: {
    height_units: 12,
    description: "Pitch complet 5-6 lignes",
    typical_content: "80-100 mots"
  },
  
  // ────────────────────────────────────────────────────────
  // EXPÉRIENCES PROFESSIONNELLES
  // ────────────────────────────────────────────────────────
  experience_detailed: {
    height_units: 22,
    description: "Format complet : contexte entreprise + 4-5 réalisations chiffrées",
    typical_content: [
      "Titre poste (gras)",
      "Entreprise + dates (1 ligne)",
      "Contexte mission (2-3 lignes)",
      "4-5 bullet points réalisations",
      "Technologies/outils (1 ligne)"
    ].join("\n")
  },
  
  experience_standard: {
    height_units: 15,
    description: "Format équilibré : 2-3 réalisations principales",
    typical_content: [
      "Titre poste (gras)",
      "Entreprise + dates (1 ligne)",
      "2-3 bullet points réalisations",
      "Technologies/outils (1 ligne)"
    ].join("\n")
  },
  
  experience_compact: {
    height_units: 8,
    description: "Format condensé : description synthétique",
    typical_content: [
      "Titre poste (gras)",
      "Entreprise + dates (1 ligne)",
      "1 ligne descriptive des responsabilités",
      "Technologies principales"
    ].join("\n")
  },
  
  experience_minimal: {
    height_units: 4,
    description: "Format titre uniquement (pour expériences anciennes)",
    typical_content: "Titre poste | Entreprise | Dates (1 ligne)"
  },
  
  // ────────────────────────────────────────────────────────
  // COMPÉTENCES TECHNIQUES
  // ────────────────────────────────────────────────────────
  skill_category_full: {
    height_units: 7,
    description: "Catégorie complète avec niveaux",
    typical_content: [
      "Titre catégorie (gras)",
      "8-10 compétences avec barres de niveau",
      "ou notation étoiles"
    ].join("\n")
  },
  
  skill_category_standard: {
    height_units: 5,
    description: "Catégorie standard sans niveaux détaillés",
    typical_content: [
      "Titre catégorie (gras)",
      "5-7 compétences, niveaux texte (Expert, Avancé, etc)"
    ].join("\n")
  },
  
  skill_category_compact: {
    height_units: 3,
    description: "Tags visuels uniquement",
    typical_content: "Badges/tags colorés en ligne"
  },
  
  // ────────────────────────────────────────────────────────
  // FORMATION & CERTIFICATIONS
  // ────────────────────────────────────────────────────────
  formation_detailed: {
    height_units: 10,
    description: "Formation avec détails",
    typical_content: [
      "Diplôme (gras)",
      "École/Université",
      "Dates + localisation",
      "Cours principaux ou projets (2-3 lignes)",
      "Mention/distinctions"
    ].join("\n")
  },
  
  formation_standard: {
    height_units: 6,
    description: "Formation standard",
    typical_content: [
      "Diplôme (gras)",
      "École/Université",
      "Dates"
    ].join("\n")
  },
  
  formation_minimal: {
    height_units: 3,
    description: "Formation condensée",
    typical_content: "Diplôme | École | Année (1 ligne)"
  },
  
  certification: {
    height_units: 3,
    description: "Certification unique",
    typical_content: "Nom certification | Organisme | Date (1 ligne)"
  },
  
  // ────────────────────────────────────────────────────────
  // PROJETS
  // ────────────────────────────────────────────────────────
  project_full: {
    height_units: 10,
    description: "Projet détaillé",
    typical_content: [
      "Nom projet (gras) + lien",
      "Description (2-3 lignes)",
      "Technologies",
      "Résultats/impact"
    ].join("\n")
  },
  
  project_compact: {
    height_units: 4,
    description: "Projet condensé",
    typical_content: [
      "Nom projet (gras)",
      "1 ligne description + techno"
    ].join("\n")
  },
  
  // ────────────────────────────────────────────────────────
  // AUTRES SECTIONS
  // ────────────────────────────────────────────────────────
  language: {
    height_units: 2,
    description: "Langue unique",
    typical_content: "Langue : Niveau (ex: Anglais : Courant - B2)"
  },
  
  achievement_bullet: {
    height_units: 2,
    description: "Bullet point unique",
    typical_content: "• Réalisation chiffrée (1 ligne)"
  },
  
  interest_item: {
    height_units: 2,
    description: "Centre d'intérêt",
    typical_content: "Hobby/intérêt avec bref descriptif"
  },
  
  footer: {
    height_units: 5,
    description: "Pied de page",
    typical_content: "Liens réseaux sociaux ou note légale"
  }
  
} as const;

export type ContentUnitType = keyof typeof CONTENT_UNITS_REFERENCE;
```

### 4.2 Configuration des Thèmes

Fichier : `lib/cv/theme-configs.ts`

```typescript
import { CVThemeConfig } from "./types";

/**
 * CONFIGURATIONS DES THÈMES CV
 * 
 * Chaque thème définit :
 * - La capacité de chaque zone (en units)
 * - Les règles d'adaptation automatique
 * - Les paramètres visuels (conversion units → CSS)
 */

export const CV_THEMES: Record<string, CVThemeConfig> = {
  
  // ═══════════════════════════════════════════════════════
  // THÈME "CLASSIC"
  // ═══════════════════════════════════════════════════════
  classic: {
    id: "classic",
    name: "Classic Professional",
    description: "Template sobre et professionnel, marges standards",
    
    page_config: {
      total_height_units: 200,
      supports_two_pages: true,
      two_pages_threshold: 210  // Passe à 2 pages si >210 units nécessaires
    },
    
    zones: {
      header: {
        name: "header",
        capacity_units: 12,
        min_units: 8,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      summary: {
        name: "summary",
        capacity_units: 10,
        min_units: 5,
        flex: true,
        flex_priority: 5,
        overflow_strategy: "compact"
      },
      
      experiences: {
        name: "experiences",
        capacity_units: 100,
        min_units: 50,
        flex: true,
        flex_priority: 10,  // Priorité MAX
        overflow_strategy: "compact"
      },
      
      skills: {
        name: "skills",
        capacity_units: 28,
        min_units: 15,
        flex: true,
        flex_priority: 7,
        overflow_strategy: "compact"
      },
      
      formation: {
        name: "formation",
        capacity_units: 24,
        min_units: 12,
        flex: true,
        flex_priority: 6,
        overflow_strategy: "compact"
      },
      
      projects: {
        name: "projects",
        capacity_units: 0,  // Optionnel
        min_units: 0,
        flex: true,
        flex_priority: 4,
        overflow_strategy: "hide"
      },
      
      certifications: {
        name: "certifications",
        capacity_units: 12,
        min_units: 0,
        flex: true,
        flex_priority: 3,
        overflow_strategy: "compact"
      },
      
      languages: {
        name: "languages",
        capacity_units: 6,
        min_units: 0,
        flex: true,
        flex_priority: 2,
        overflow_strategy: "compact"
      },
      
      interests: {
        name: "interests",
        capacity_units: 0,  // Optionnel, seulement si espace restant
        min_units: 0,
        flex: true,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      footer: {
        name: "footer",
        capacity_units: 5,
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      margins: {
        name: "margins",
        capacity_units: 15,
        min_units: 15,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      }
    },
    
    adaptive_rules: {
      min_detailed_experiences: 2,
      prefer_detailed_for_recent: true,
      compact_after_years: 10,
      skills_display_mode: "auto",
      max_bullet_points_per_exp: 5
    },
    
    visual_config: {
      unit_to_mm: 4.0,  // 1 unit = 4mm
      font_sizes: {
        name: 24,
        title: 14,
        section_header: 13,
        body: 10,
        small: 9
      },
      colors: {
        primary: "#2C3E50",
        secondary: "#7F8C8D",
        accent: "#3498DB"
      },
      spacing_multiplier: 1.0
    }
  },
  
  // ═══════════════════════════════════════════════════════
  // THÈME "MODERN SPACIOUS"
  // ═══════════════════════════════════════════════════════
  modern_spacious: {
    id: "modern_spacious",
    name: "Modern & Spacious",
    description: "Design moderne avec grandes marges et respirations",
    
    page_config: {
      total_height_units: 200,
      supports_two_pages: true,
      two_pages_threshold: 200  // Plus facilement 2 pages
    },
    
    zones: {
      header: {
        name: "header",
        capacity_units: 20,  // Header plus grand avec photo
        min_units: 12,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      summary: {
        name: "summary",
        capacity_units: 15,  // Pitch long encouragé
        min_units: 8,
        flex: true,
        flex_priority: 5,
        overflow_strategy: "compact"
      },
      
      experiences: {
        name: "experiences",
        capacity_units: 75,  // MOINS d'espace qu'en classic !
        min_units: 45,
        flex: true,
        flex_priority: 10,
        overflow_strategy: "compact"
      },
      
      skills: {
        name: "skills",
        capacity_units: 25,
        min_units: 15,
        flex: true,
        flex_priority: 7,
        overflow_strategy: "compact"
      },
      
      formation: {
        name: "formation",
        capacity_units: 20,
        min_units: 10,
        flex: true,
        flex_priority: 6,
        overflow_strategy: "compact"
      },
      
      projects: {
        name: "projects",
        capacity_units: 15,  // Projets mis en avant
        min_units: 0,
        flex: true,
        flex_priority: 8,
        overflow_strategy: "compact"
      },
      
      certifications: {
        name: "certifications",
        capacity_units: 10,
        min_units: 0,
        flex: true,
        flex_priority: 3,
        overflow_strategy: "compact"
      },
      
      languages: {
        name: "languages",
        capacity_units: 8,
        min_units: 0,
        flex: true,
        flex_priority: 2,
        overflow_strategy: "compact"
      },
      
      interests: {
        name: "interests",
        capacity_units: 8,  // Centres d'intérêt valorisés
        min_units: 0,
        flex: true,
        flex_priority: 4,
        overflow_strategy: "hide"
      },
      
      footer: {
        name: "footer",
        capacity_units: 8,
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      margins: {
        name: "margins",
        capacity_units: 30,  // Grandes marges !
        min_units: 30,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      }
    },
    
    adaptive_rules: {
      min_detailed_experiences: 2,
      prefer_detailed_for_recent: true,
      compact_after_years: 8,  // Compacte plus tôt
      skills_display_mode: "auto",
      max_bullet_points_per_exp: 4
    },
    
    visual_config: {
      unit_to_mm: 4.2,  // Légèrement plus grand
      font_sizes: {
        name: 28,
        title: 16,
        section_header: 14,
        body: 11,
        small: 10
      },
      colors: {
        primary: "#1A1A2E",
        secondary: "#16213E",
        accent: "#0F3460"
      },
      spacing_multiplier: 1.3  // Plus d'espace entre éléments
    }
  },
  
  // ═══════════════════════════════════════════════════════
  // THÈME "COMPACT ATS"
  // ═══════════════════════════════════════════════════════
  compact_ats: {
    id: "compact_ats",
    name: "Compact ATS-Optimized",
    description: "Maximum d'information, optimisé pour parsing ATS",
    
    page_config: {
      total_height_units: 200,
      supports_two_pages: false,  // TOUJOURS 1 page
      two_pages_threshold: 999
    },
    
    zones: {
      header: {
        name: "header",
        capacity_units: 8,  // Header minimal
        min_units: 8,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      summary: {
        name: "summary",
        capacity_units: 7,  // Pitch court
        min_units: 5,
        flex: true,
        flex_priority: 4,
        overflow_strategy: "compact"
      },
      
      experiences: {
        name: "experiences",
        capacity_units: 110,  // MAX d'espace pour expériences !
        min_units: 70,
        flex: true,
        flex_priority: 10,
        overflow_strategy: "compact"
      },
      
      skills: {
        name: "skills",
        capacity_units: 30,  // Compétences importantes pour ATS
        min_units: 20,
        flex: true,
        flex_priority: 9,
        overflow_strategy: "compact"
      },
      
      formation: {
        name: "formation",
        capacity_units: 18,
        min_units: 9,
        flex: true,
        flex_priority: 5,
        overflow_strategy: "compact"
      },
      
      projects: {
        name: "projects",
        capacity_units: 0,  // Pas de projets, focus XP
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      certifications: {
        name: "certifications",
        capacity_units: 12,
        min_units: 0,
        flex: true,
        flex_priority: 6,
        overflow_strategy: "compact"
      },
      
      languages: {
        name: "languages",
        capacity_units: 4,
        min_units: 0,
        flex: true,
        flex_priority: 3,
        overflow_strategy: "compact"
      },
      
      interests: {
        name: "interests",
        capacity_units: 0,  // Jamais d'intérêts en ATS
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      footer: {
        name: "footer",
        capacity_units: 0,
        min_units: 0,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      },
      
      margins: {
        name: "margins",
        capacity_units: 12,  // Marges minimales
        min_units: 12,
        flex: false,
        flex_priority: 1,
        overflow_strategy: "hide"
      }
    },
    
    adaptive_rules: {
      min_detailed_experiences: 3,  // Plus d'expériences détaillées
      prefer_detailed_for_recent: true,
      compact_after_years: 12,
      skills_display_mode: "full",  // Toujours liste complète
      max_bullet_points_per_exp: 4
    },
    
    visual_config: {
      unit_to_mm: 3.8,  // Légèrement plus compact
      font_sizes: {
        name: 20,
        title: 12,
        section_header: 11,
        body: 9,
        small: 8
      },
      colors: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#666666"
      },
      spacing_multiplier: 0.8  // Moins d'espace
    }
  }
  
};

export type ThemeId = keyof typeof CV_THEMES;
```

### 4.3 Algorithme d'Adaptation

Fichier : `lib/cv/adaptive-algorithm.ts`

```typescript
import { RAGData, JobOffer, UserPreferences } from "../types";
import { CV_THEMES, ThemeId } from "./theme-configs";
import { CONTENT_UNITS_REFERENCE } from "./content-units-reference";
import { AdaptedContent, AdaptedExperience } from "./types";

/**
 * ALGORITHME PRINCIPAL D'ADAPTATION
 * 
 * Prend en entrée :
 * - Données RAG brutes
 * - Offre d'emploi (pour scoring)
 * - Thème choisi
 * - Préférences utilisateur
 * 
 * Retourne :
 * - Contenu adapté au thème avec formats optimisés
 */

export function generateAdaptiveCV(
  ragData: RAGData,
  jobOffer: JobOffer | null,
  themeId: ThemeId,
  userPrefs: UserPreferences
): AdaptedContent {
  
  const theme = CV_THEMES[themeId];
  const warnings: string[] = [];
  
  // ────────────────────────────────────────────────────────
  // ÉTAPE 1 : SCORING & TRI
  // ────────────────────────────────────────────────────────
  const scoredExperiences = ragData.experiences
    .map(exp => ({
      ...exp,
      relevance_score: jobOffer 
        ? calculateRelevanceScore(exp, jobOffer) 
        : calculateDefaultScore(exp),
      priority: calculatePriority(exp, userPrefs)
    }))
    .sort((a, b) => {
      // Tri par pertinence puis par date
      if (a.relevance_score !== b.relevance_score) {
        return b.relevance_score - a.relevance_score;
      }
      return new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime();
    });
  
  // ────────────────────────────────────────────────────────
  // ÉTAPE 2 : ALLOCATION HEADER
  // ────────────────────────────────────────────────────────
  const header = allocateHeader(
    ragData.profil,
    theme.zones.header.capacity_units,
    userPrefs
  );
  
  // ────────────────────────────────────────────────────────
  // ÉTAPE 3 : ALLOCATION SUMMARY
  // ────────────────────────────────────────────────────────
  const summary = allocateSummary(
    ragData.profil,
    theme.zones.summary.capacity_units,
    theme.adaptive_rules
  );
  
  // ────────────────────────────────────────────────────────
  // ÉTAPE 4 : ALLOCATION EXPÉRIENCES (CŒUR DE L'ALGO)
  // ────────────────────────────────────────────────────────
  const {
    experiences,
    units_used: exp_units_used,
    warnings: exp_warnings
  } = allocateExperiences(
    scoredExperiences,
    theme.zones.experiences.capacity_units,
    theme.adaptive_rules,
    userPrefs
  );
  
  warnings.push(...exp_warnings);
  
  // ────────────────────────────────────────────────────────
  // ÉTAPE 5 : ALLOCATION COMPÉTENCES
  // ────────────────────────────────────────────────────────
  const skills = allocateSkills(
    ragData.competences,
    theme.zones.skills.capacity_units,
    theme.adaptive_rules,
    jobOffer
  );
  
  // ────────────────────────────────────────────────────────
  // ÉTAPE 6 : ALLOCATION FORMATION
  // ────────────────────────────────────────────────────────
  const formation = allocateFormation(
    ragData.formations_certifications.formations || [],
    theme.zones.formation.capacity_units,
    theme.adaptive_rules
  );
  
  // ────────────────────────────────────────────────────────
  // ÉTAPE 7 : CALCUL TOTAL & VALIDATION
  // ────────────────────────────────────────────────────────
  const total_units_used = 
    header.units_used +
    summary.units_used +
    exp_units_used +
    skills.units_used +
    formation.units_used +
    theme.zones.margins.capacity_units;
  
  // Check si dépasse capacité 1 page
  let pages = 1;
  if (total_units_used > theme.page_config.total_height_units) {
    if (theme.page_config.supports_two_pages) {
      pages = 2;
    } else {
      warnings.push(
        `⚠️ Content overflow: ${total_units_used} units > ${theme.page_config.total_height_units} (theme does not support 2 pages)`
      );
    }
  }
  
  // ────────────────────────────────────────────────────────
  // ÉTAPE 8 : ALLOCATION SECTIONS OPTIONNELLES
  // ────────────────────────────────────────────────────────
  const remaining_units = theme.page_config.total_height_units - total_units_used;
  
  let certifications = undefined;
  let languages = undefined;
  let projects = undefined;
  let interests = undefined;
  
  if (remaining_units > 0) {
    // Allouer dans l'ordre de priorité flex
    const optionalSections = [
      { name: "certifications", data: ragData.formations_certifications.certifications },
      { name: "languages", data: ragData.profil.langues },
      { name: "projects", data: ragData.projets },
      { name: "interests", data: userPrefs.interests }
    ].sort((a, b) => {
      const priorityA = theme.zones[a.name as keyof typeof theme.zones]?.flex_priority || 0;
      const priorityB = theme.zones[b.name as keyof typeof theme.zones]?.flex_priority || 0;
      return priorityB - priorityA;
    });
    
    // TODO: Implémenter allocation sections optionnelles
  }
  
  // ────────────────────────────────────────────────────────
  // RETOUR
  // ────────────────────────────────────────────────────────
  return {
    theme_id: themeId,
    total_units_used,
    pages,
    sections: {
      header,
      summary,
      experiences,
      skills,
      formation,
      certifications,
      languages,
      projects,
      interests
    },
    warnings
  };
}

/**
 * ALLOCATION DES EXPÉRIENCES
 * 
 * Cœur de l'algorithme :
 * - Remplit la zone avec les expériences les plus pertinentes
 * - Adapte le format (detailed → standard → compact) selon l'espace
 * - Garantit min_detailed_experiences
 */
function allocateExperiences(
  scoredExperiences: any[],
  capacity_units: number,
  rules: any,
  userPrefs: UserPreferences
): {
  experiences: AdaptedExperience[];
  units_used: number;
  warnings: string[];
} {
  
  const result: AdaptedExperience[] = [];
  const warnings: string[] = [];
  let remaining_capacity = capacity_units;
  let detailed_count = 0;
  
  const now = new Date();
  
  for (let i = 0; i < scoredExperiences.length; i++) {
    const exp = scoredExperiences[i];
    
    // Calculer ancienneté
    const exp_end = exp.date_fin === "present" ? now : new Date(exp.date_fin);
    const years_ago = (now.getTime() - exp_end.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Déterminer le format optimal
    let format: "detailed" | "standard" | "compact" | "minimal";
    let units_needed: number;
    
    // RÈGLE 1 : Forcer "detailed" pour les X premières expériences
    if (
      detailed_count < rules.min_detailed_experiences &&
      remaining_capacity >= CONTENT_UNITS_REFERENCE.experience_detailed.height_units
    ) {
      format = "detailed";
      units_needed = CONTENT_UNITS_REFERENCE.experience_detailed.height_units;
      detailed_count++;
    }
    // RÈGLE 2 : Compact après X années
    else if (years_ago > rules.compact_after_years) {
      if (remaining_capacity >= CONTENT_UNITS_REFERENCE.experience_compact.height_units) {
        format = "compact";
        units_needed = CONTENT_UNITS_REFERENCE.experience_compact.height_units;
      } else if (remaining_capacity >= CONTENT_UNITS_REFERENCE.experience_minimal.height_units) {
        format = "minimal";
        units_needed = CONTENT_UNITS_REFERENCE.experience_minimal.height_units;
      } else {
        warnings.push(`⚠️ Experience "${exp.poste}" at ${exp.entreprise} excluded (no space)`);
        break;
      }
    }
    // RÈGLE 3 : Adapter selon espace disponible
    else {
      if (remaining_capacity >= CONTENT_UNITS_REFERENCE.experience_detailed.height_units) {
        format = "detailed";
        units_needed = CONTENT_UNITS_REFERENCE.experience_detailed.height_units;
        detailed_count++;
      } else if (remaining_capacity >= CONTENT_UNITS_REFERENCE.experience_standard.height_units) {
        format = "standard";
        units_needed = CONTENT_UNITS_REFERENCE.experience_standard.height_units;
      } else if (remaining_capacity >= CONTENT_UNITS_REFERENCE.experience_compact.height_units) {
        format = "compact";
        units_needed = CONTENT_UNITS_REFERENCE.experience_compact.height_units;
      } else if (remaining_capacity >= CONTENT_UNITS_REFERENCE.experience_minimal.height_units) {
        format = "minimal";
        units_needed = CONTENT_UNITS_REFERENCE.experience_minimal.height_units;
      } else {
        warnings.push(`⚠️ Experience "${exp.poste}" at ${exp.entreprise} excluded (no space)`);
        break;
      }
    }
    
    // Construire le contenu adapté
    const adapted: AdaptedExperience = {
      id: exp.id || `exp_${i}`,
      format,
      units_used: units_needed,
      content: {
        company: exp.entreprise,
        position: exp.poste,
        dates: `${exp.date_debut} - ${exp.date_fin === "present" ? "Présent" : exp.date_fin}`,
        context: format === "detailed" ? exp.contexte : undefined,
        achievements: selectAchievements(exp.realisations, format, rules),
        technologies: exp.technologies_utilisees
      }
    };
    
    result.push(adapted);
    remaining_capacity -= units_needed;
    
    // Stop si plus de place
    if (remaining_capacity < CONTENT_UNITS_REFERENCE.experience_minimal.height_units) {
      if (i < scoredExperiences.length - 1) {
        warnings.push(`⚠️ ${scoredExperiences.length - i - 1} older experiences excluded`);
      }
      break;
    }
  }
  
  return {
    experiences: result,
    units_used: capacity_units - remaining_capacity,
    warnings
  };
}

/**
 * SÉLECTION DES RÉALISATIONS selon le format
 */
function selectAchievements(
  allAchievements: any[],
  format: "detailed" | "standard" | "compact" | "minimal",
  rules: any
): string[] {
  
  if (!allAchievements || allAchievements.length === 0) {
    return [];
  }
  
  // Trier par impact (si score disponible)
  const sorted = [...allAchievements].sort((a, b) => {
    const scoreA = a.impact_score || 0;
    const scoreB = b.impact_score || 0;
    return scoreB - scoreA;
  });
  
  switch (format) {
    case "detailed":
      return sorted.slice(0, Math.min(5, rules.max_bullet_points_per_exp))
        .map(a => a.description);
    
    case "standard":
      return sorted.slice(0, 3).map(a => a.description);
    
    case "compact":
      // Synthèse en 1 phrase
      return [summarizeAchievements(sorted.slice(0, 3))];
    
    case "minimal":
      return [];
  }
}

/**
 * CALCUL SCORE DE PERTINENCE
 */
function calculateRelevanceScore(exp: any, jobOffer: JobOffer): number {
  let score = 0;
  
  // Match titre poste
  const titleMatch = calculateTextSimilarity(exp.poste, jobOffer.title);
  score += titleMatch * 40;
  
  // Match compétences techniques
  const techMatch = calculateArrayOverlap(
    exp.technologies_utilisees || [],
    jobOffer.required_skills || []
  );
  score += techMatch * 30;
  
  // Bonus si expérience récente
  const yearsAgo = calculateYearsAgo(exp.date_fin);
  if (yearsAgo < 2) score += 20;
  else if (yearsAgo < 5) score += 10;
  
  // Match secteur
  if (exp.secteur === jobOffer.secteur) {
    score += 10;
  }
  
  return Math.min(100, score);
}

// ... autres fonctions utilitaires
```

### 4.4 Intégration dans les Templates HTML

Fichier : `public/cv-templates/classic.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - {{nom}}</title>
  <style>
    /* ═══════════════════════════════════════════════════════ */
    /* SYSTÈME DE UNITS                                        */
    /* ═══════════════════════════════════════════════════════ */
    :root {
      /* Conversion unit → CSS */
      --unit-to-mm: {{unit_to_mm}}mm;
      
      /* Hauteurs calculées dynamiquement */
      --header-height: calc({{header_units}} * var(--unit-to-mm));
      --summary-height: calc({{summary_units}} * var(--unit-to-mm));
      --experiences-height: calc({{experiences_units}} * var(--unit-to-mm));
      --skills-height: calc({{skills_units}} * var(--unit-to-mm));
      --formation-height: calc({{formation_units}} * var(--unit-to-mm));
      
      /* Couleurs */
      --color-primary: {{colors.primary}};
      --color-secondary: {{colors.secondary}};
      --color-accent: {{colors.accent}};
      
      /* Tailles de police */
      --font-name: {{font_sizes.name}}pt;
      --font-title: {{font_sizes.title}}pt;
      --font-section: {{font_sizes.section_header}}pt;
      --font-body: {{font_sizes.body}}pt;
      --font-small: {{font_sizes.small}}pt;
    }
    
    /* ═══════════════════════════════════════════════════════ */
    /* BASE                                                     */
    /* ═══════════════════════════════════════════════════════ */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: var(--font-body);
      color: var(--color-primary);
      line-height: 1.4;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      background: white;
    }
    
    /* ═══════════════════════════════════════════════════════ */
    /* HEADER                                                   */
    /* ═══════════════════════════════════════════════════════ */
    .cv-header {
      height: var(--header-height);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-bottom: 2px solid var(--color-accent);
      padding-bottom: 5mm;
      margin-bottom: 5mm;
    }
    
    .cv-header h1 {
      font-size: var(--font-name);
      color: var(--color-primary);
      margin-bottom: 2mm;
    }
    
    .cv-header .title {
      font-size: var(--font-title);
      color: var(--color-secondary);
      font-weight: 500;
    }
    
    .cv-header .contacts {
      display: flex;
      gap: 10mm;
      font-size: var(--font-small);
      color: var(--color-secondary);
    }
    
    /* ═══════════════════════════════════════════════════════ */
    /* SUMMARY                                                  */
    /* ═══════════════════════════════════════════════════════ */
    .cv-summary {
      min-height: var(--summary-height);
      margin-bottom: 8mm;
    }
    
    .cv-summary p {
      text-align: justify;
      line-height: 1.5;
    }
    
    /* ═══════════════════════════════════════════════════════ */
    /* SECTIONS                                                 */
    /* ═══════════════════════════════════════════════════════ */
    .cv-section {
      margin-bottom: 8mm;
    }
    
    .cv-section-header {
      font-size: var(--font-section);
      font-weight: bold;
      color: var(--color-primary);
      text-transform: uppercase;
      border-bottom: 1px solid var(--color-accent);
      padding-bottom: 2mm;
      margin-bottom: 4mm;
      letter-spacing: 0.5px;
    }
    
    /* ═══════════════════════════════════════════════════════ */
    /* EXPÉRIENCES                                              */
    /* ═══════════════════════════════════════════════════════ */
    .cv-section-experiences {
      min-height: var(--experiences-height);
    }
    
    .experience-item {
      margin-bottom: 6mm;
      page-break-inside: avoid;
    }
    
    /* Format DETAILED */
    .experience-item.detailed {
      height: calc(22 * var(--unit-to-mm));
    }
    
    .experience-item.detailed .exp-header {
      margin-bottom: 2mm;
    }
    
    .experience-item.detailed .exp-title {
      font-weight: bold;
      font-size: calc(var(--font-body) + 1pt);
      color: var(--color-primary);
    }
    
    .experience-item.detailed .exp-company-dates {
      color: var(--color-secondary);
      font-size: var(--font-small);
      margin-top: 1mm;
    }
    
    .experience-item.detailed .exp-context {
      font-style: italic;
      color: var(--color-secondary);
      margin: 2mm 0;
      line-height: 1.3;
    }
    
    .experience-item.detailed .exp-achievements {
      list-style: none;
      padding-left: 5mm;
    }
    
    .experience-item.detailed .exp-achievements li {
      position: relative;
      margin-bottom: 1.5mm;
      line-height: 1.4;
    }
    
    .experience-item.detailed .exp-achievements li::before {
      content: "▸";
      color: var(--color-accent);
      position: absolute;
      left: -5mm;
      font-weight: bold;
    }
    
    .experience-item.detailed .exp-technologies {
      font-size: var(--font-small);
      color: var(--color-secondary);
      margin-top: 2mm;
    }
    
    /* Format STANDARD */
    .experience-item.standard {
      height: calc(15 * var(--unit-to-mm));
    }
    
    .experience-item.standard .exp-context {
      display: none;
    }
    
    /* Format COMPACT */
    .experience-item.compact {
      height: calc(8 * var(--unit-to-mm));
    }
    
    .experience-item.compact .exp-achievements {
      display: none;
    }
    
    .experience-item.compact .exp-description {
      color: var(--color-secondary);
      margin-top: 1mm;
      line-height: 1.3;
    }
    
    /* Format MINIMAL */
    .experience-item.minimal {
      height: calc(4 * var(--unit-to-mm));
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px dotted #e0e0e0;
      padding: 2mm 0;
    }
    
    .experience-item.minimal .exp-title-company {
      font-weight: 500;
    }
    
    .experience-item.minimal .exp-dates {
      color: var(--color-secondary);
      font-size: var(--font-small);
    }
    
    /* ═══════════════════════════════════════════════════════ */
    /* COMPÉTENCES                                              */
    /* ═══════════════════════════════════════════════════════ */
    .cv-section-skills {
      min-height: var(--skills-height);
    }
    
    .skill-category {
      margin-bottom: 4mm;
    }
    
    .skill-category-title {
      font-weight: bold;
      color: var(--color-primary);
      margin-bottom: 2mm;
    }
    
    .skill-items {
      display: flex;
      flex-wrap: wrap;
      gap: 3mm;
    }
    
    .skill-item {
      background: #f5f5f5;
      padding: 1.5mm 3mm;
      border-radius: 3mm;
      font-size: var(--font-small);
      border-left: 2px solid var(--color-accent);
    }
    
    /* ═══════════════════════════════════════════════════════ */
    /* FORMATION                                                */
    /* ═══════════════════════════════════════════════════════ */
    .cv-section-formation {
      min-height: var(--formation-height);
    }
    
    .formation-item {
      margin-bottom: 4mm;
    }
    
    .formation-item.detailed {
      height: calc(10 * var(--unit-to-mm));
    }
    
    .formation-item.standard {
      height: calc(6 * var(--unit-to-mm));
    }
    
    .formation-item.minimal {
      height: calc(3 * var(--unit-to-mm));
    }
    
    .formation-title {
      font-weight: bold;
      color: var(--color-primary);
    }
    
    .formation-school {
      color: var(--color-secondary);
      font-size: var(--font-small);
    }
    
    /* ═══════════════════════════════════════════════════════ */
    /* PRINT                                                    */
    /* ═══════════════════════════════════════════════════════ */
    @media print {
      .page {
        margin: 0;
        padding: 15mm;
        page-break-after: always;
      }
      
      .experience-item,
      .formation-item,
      .skill-category {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    
    <!-- HEADER -->
    <header class="cv-header">
      <div>
        <h1>{{nom}} {{prenom}}</h1>
        <div class="title">{{titre}}</div>
      </div>
      <div class="contacts">
        <span>{{email}}</span>
        <span>{{telephone}}</span>
        <span>{{localisation}}</span>
      </div>
    </header>
    
    <!-- SUMMARY -->
    <section class="cv-summary">
      <p>{{summary_text}}</p>
    </section>
    
    <!-- EXPÉRIENCES -->
    <section class="cv-section cv-section-experiences">
      <h2 class="cv-section-header">Expériences Professionnelles</h2>
      
      {{#each experiences}}
      <div class="experience-item {{this.format}}">
        {{#if (eq this.format "minimal")}}
          <div class="exp-title-company">
            <strong>{{this.content.position}}</strong> | {{this.content.company}}
          </div>
          <div class="exp-dates">{{this.content.dates}}</div>
        {{else}}
          <div class="exp-header">
            <div class="exp-title">{{this.content.position}}</div>
            <div class="exp-company-dates">
              {{this.content.company}} | {{this.content.dates}}
            </div>
          </div>
          
          {{#if this.content.context}}
          <div class="exp-context">{{this.content.context}}</div>
          {{/if}}
          
          {{#if this.content.achievements}}
          <ul class="exp-achievements">
            {{#each this.content.achievements}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          {{/if}}
          
          {{#if this.content.technologies}}
          <div class="exp-technologies">
            <strong>Technologies:</strong> {{join this.content.technologies ", "}}
          </div>
          {{/if}}
        {{/if}}
      </div>
      {{/each}}
    </section>
    
    <!-- COMPÉTENCES -->
    <section class="cv-section cv-section-skills">
      <h2 class="cv-section-header">Compétences Techniques</h2>
      
      {{#each skills}}
      <div class="skill-category">
        <div class="skill-category-title">{{this.category}}</div>
        <div class="skill-items">
          {{#each this.items}}
          <span class="skill-item">{{this}}</span>
          {{/each}}
        </div>
      </div>
      {{/each}}
    </section>
    
    <!-- FORMATION -->
    <section class="cv-section cv-section-formation">
      <h2 class="cv-section-header">Formation</h2>
      
      {{#each formations}}
      <div class="formation-item {{this.format}}">
        <div class="formation-title">{{this.diplome}}</div>
        <div class="formation-school">
          {{this.ecole}} | {{this.annee}}
        </div>
        {{#if this.details}}
        <div class="formation-details">{{this.details}}</div>
        {{/if}}
      </div>
      {{/each}}
    </section>
    
  </div>
</body>
</html>
```

---

## 5️⃣ IMPLÉMENTATION TECHNIQUE {#implementation}

### 5.1 Structure des Fichiers

```
lib/cv/
├── types.ts                          # Tous les types TypeScript
├── content-units-reference.ts        # Référentiel hauteurs
├── theme-configs.ts                  # Config des thèmes
├── adaptive-algorithm.ts             # Algorithme principal
├── utils/
│   ├── scoring.ts                    # Calculs de pertinence
│   ├── allocation.ts                 # Fonctions d'allocation
│   ├── validation.ts                 # Validations
│   └── text-utils.ts                 # Utilitaires texte
└── templates/
    ├── template-engine.ts            # Handlebars setup
    └── helpers.ts                    # Handlebars helpers

public/cv-templates/
├── classic.html
├── modern_spacious.html
└── compact_ats.html
```

### 5.2 API Endpoints Modifiés

#### POST `/api/cv/generate`

```typescript
// app/api/cv/generate/route.ts

import { generateAdaptiveCV } from "@/lib/cv/adaptive-algorithm";
import { generateCVPDF } from "@/lib/pdf/generator";
import { getAllRAGFiles } from "@/lib/github/rag-storage";

export async function POST(req: Request) {
  const { user_id, job_id, theme_id, user_prefs } = await req.json();
  
  // 1. Load RAG data
  const ragData = await getAllRAGFiles(user_id);
  
  // 2. Load job offer (si fourni)
  const jobOffer = job_id ? await getJobOffer(job_id) : null;
  
  // 3. Run adaptive algorithm
  const adaptedContent = generateAdaptiveCV(
    ragData,
    jobOffer,
    theme_id,
    user_prefs
  );
  
  // 4. Check warnings
  if (adaptedContent.warnings.length > 0) {
    console.warn("CV Generation Warnings:", adaptedContent.warnings);
  }
  
  // 5. Generate HTML from template
  const html = await populateTemplate(theme_id, adaptedContent);
  
  // 6. Generate PDF
  const pdf = await generateCVPDF(html);
  
  // 7. Upload to Blob Storage
  const url = await uploadPDF(pdf, user_id);
  
  return Response.json({
    success: true,
    url,
    metadata: {
      pages: adaptedContent.pages,
      total_units: adaptedContent.total_units_used,
      warnings: adaptedContent.warnings
    }
  });
}
```

### 5.3 Tests Unitaires

Fichier : `lib/cv/__tests__/adaptive-algorithm.test.ts`

```typescript
import { generateAdaptiveCV } from "../adaptive-algorithm";
import { CV_THEMES } from "../theme-configs";
import { mockRAGData, mockJobOffer } from "./fixtures";

describe("Adaptive CV Algorithm", () => {
  
  it("should respect zone capacities for classic theme", () => {
    const result = generateAdaptiveCV(
      mockRAGData,
      mockJobOffer,
      "classic",
      {}
    );
    
    // Header ne doit pas dépasser 12 units
    expect(result.sections.header.units_used).toBeLessThanOrEqual(12);
    
    // Expériences ne doivent pas dépasser 100 units
    const exp_units = result.sections.experiences.reduce(
      (sum, exp) => sum + exp.units_used,
      0
    );
    expect(exp_units).toBeLessThanOrEqual(100);
    
    // Total ne doit pas dépasser 200 units (1 page)
    expect(result.total_units_used).toBeLessThanOrEqual(200);
  });
  
  it("should adapt experience format based on space", () => {
    const result = generateAdaptiveCV(
      mockRAGData,
      null,
      "compact_ats",
      {}
    );
    
    // Devrait avoir au moins 3 expériences détaillées (min_detailed_experiences)
    const detailedCount = result.sections.experiences.filter(
      exp => exp.format === "detailed"
    ).length;
    expect(detailedCount).toBeGreaterThanOrEqual(3);
  });
  
  it("should prioritize recent and relevant experiences", () => {
    const result = generateAdaptiveCV(
      mockRAGData,
      mockJobOffer,
      "classic",
      {}
    );
    
    // Première expérience devrait être en format detailed
    expect(result.sections.experiences[0].format).toBe("detailed");
    
    // Expériences récentes devraient venir en premier
    const dates = result.sections.experiences.map(exp => 
      new Date(exp.content.dates.split(" - ")[0])
    );
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
    }
  });
  
  it("should compact experiences older than threshold", () => {
    const result = generateAdaptiveCV(
      mockRAGData,
      null,
      "classic",
      {}
    );
    
    // Expériences > 10 ans devraient être compactes
    const oldExperiences = result.sections.experiences.filter(exp => {
      const endDate = new Date(exp.content.dates.split(" - ")[1]);
      const yearsAgo = (new Date().getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return yearsAgo > 10;
    });
    
    oldExperiences.forEach(exp => {
      expect(["compact", "minimal"]).toContain(exp.format);
    });
  });
  
  it("should generate warnings when content overflows", () => {
    // Mock avec beaucoup d'expériences
    const hugeRAGData = {
      ...mockRAGData,
      experiences: Array(20).fill(mockRAGData.experiences[0])
    };
    
    const result = generateAdaptiveCV(
      hugeRAGData,
      null,
      "compact_ats",
      {}
    );
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes("excluded"))).toBe(true);
  });
  
});
```

---

## 6️⃣ EXEMPLES & CAS D'USAGE {#exemples}

### Cas 1 : Junior (2 ans d'expérience)

**Input :**
```json
{
  "experiences": [
    {
      "poste": "Développeur Full-Stack",
      "entreprise": "Startup XYZ",
      "date_debut": "2023-01",
      "date_fin": "present",
      "realisations": [
        { "description": "Développement API REST avec Node.js" },
        { "description": "Intégration front-end React" },
        { "description": "Tests unitaires Jest" }
      ]
    },
    {
      "poste": "Stagiaire Développeur",
      "entreprise": "Agence ABC",
      "date_debut": "2022-06",
      "date_fin": "2022-12",
      "realisations": [
        { "description": "Création sites WordPress" }
      ]
    }
  ]
}
```

**Output (Thème Classic) :**
```
┌─────────────────────────────────────────┐
│ Header: 12 units                        │
├─────────────────────────────────────────┤
│ Summary: 8 units (standard)             │
├─────────────────────────────────────────┤
│ EXPÉRIENCES: 37 units                   │
│                                         │
│ ► Développeur Full-Stack                │
│   Startup XYZ | 2023 - Présent          │
│   Format: DETAILED (22 units)           │
│   • 3 réalisations complètes            │
│                                         │
│ ► Stagiaire Développeur                 │
│   Agence ABC | 2022                     │
│   Format: STANDARD (15 units)           │
│   • 1 réalisation                       │
│                                         │
├─────────────────────────────────────────┤
│ COMPÉTENCES: 28 units (full)            │
├─────────────────────────────────────────┤
│ FORMATION: 24 units (detailed)          │
├─────────────────────────────────────────┤
│ Margins: 15 units                       │
└─────────────────────────────────────────┘
TOTAL: 124/200 units ✅ (62% utilisé)
```

### Cas 2 : Senior (15 ans d'expérience)

**Input :**
```json
{
  "experiences": [
    // 8 expériences de 2009 à 2024
  ]
}
```

**Output (Thème Classic) :**
```
┌─────────────────────────────────────────┐
│ Header: 12 units                        │
├─────────────────────────────────────────┤
│ Summary: 10 units (elevator pitch)      │
├─────────────────────────────────────────┤
│ EXPÉRIENCES: 98 units                   │
│                                         │
│ ► PMO Senior (2023-present)             │
│   Format: DETAILED (22 units)           │
│                                         │
│ ► Chef de Projet (2020-2023)            │
│   Format: DETAILED (22 units)           │
│                                         │
│ ► Consultant (2016-2020)                │
│   Format: STANDARD (15 units)           │
│                                         │
│ ► Chef de Projet (2015-2016)            │
│   Format: STANDARD (15 units)           │
│                                         │
│ ► Responsable Technique (2013-2015)     │
│   Format: COMPACT (8 units)             │
│                                         │
│ ► 3 expériences 2009-2013               │
│   Format: MINIMAL (4 units each = 12)   │
│                                         │
├─────────────────────────────────────────┤
│ COMPÉTENCES: 28 units                   │
├─────────────────────────────────────────┤
│ FORMATION: 18 units (compact)           │
├─────────────────────────────────────────┤
│ CERTIFICATIONS: 12 units                │
├─────────────────────────────────────────┤
│ Margins: 15 units                       │
└─────────────────────────────────────────┘
TOTAL: 193/200 units ✅ (96% utilisé)
```

### Cas 3 : Même Senior sur Thème "Modern Spacious"

**Output :**
```
┌─────────────────────────────────────────┐
│ Header WITH PHOTO: 20 units             │
├─────────────────────────────────────────┤
│ Summary: 15 units (elevator)            │
├─────────────────────────────────────────┤
│ EXPÉRIENCES: 75 units (⚠️ moins!)       │
│                                         │
│ ► PMO Senior                            │
│   Format: DETAILED (22 units)           │
│                                         │
│ ► Chef de Projet                        │
│   Format: DETAILED (22 units)           │
│                                         │
│ ► Consultant                            │
│   Format: STANDARD (15 units)           │
│                                         │
│ ► 5 expériences                         │
│   Format: MINIMAL (4 units × 4 = 16)    │
│                                         │
├─────────────────────────────────────────┤
│ COMPÉTENCES: 25 units                   │
├─────────────────────────────────────────┤
│ FORMATION: 20 units                     │
├─────────────────────────────────────────┤
│ PROJETS: 15 units (mis en avant!)       │
├─────────────────────────────────────────┤
│ Margins: 30 units (grandes marges)      │
└─────────────────────────────────────────┘
TOTAL: 200/200 units ✅

⚠️ Warnings:
- 1 experience excluded (no space)
```

---

## 7️⃣ TESTS & VALIDATION {#tests}

### 7.1 Tests Automatisés

```typescript
// tests/cv-generation.e2e.test.ts

describe("CV Generation E2E", () => {
  
  const testCases = [
    {
      name: "Junior Profile",
      rag: loadFixture("junior-2-years.json"),
      themes: ["classic", "modern_spacious", "compact_ats"],
      expectedPages: 1,
      expectedWarnings: 0
    },
    {
      name: "Mid-Level Profile",
      rag: loadFixture("mid-5-years.json"),
      themes: ["classic", "modern_spacious", "compact_ats"],
      expectedPages: 1,
      expectedWarnings: 0
    },
    {
      name: "Senior Profile",
      rag: loadFixture("senior-15-years.json"),
      themes: ["classic", "modern_spacious"],
      expectedPages: 1,
      expectedWarnings: [0, 1]  // Peut avoir 1 warning pour modern
    },
    {
      name: "Executive Profile",
      rag: loadFixture("executive-25-years.json"),
      themes: ["classic"],
      expectedPages: 2,  // Devrait passer à 2 pages
      expectedWarnings: null  // Ignore warnings count
    }
  ];
  
  testCases.forEach(testCase => {
    testCase.themes.forEach(theme => {
      it(`${testCase.name} - ${theme} theme`, async () => {
        const result = generateAdaptiveCV(
          testCase.rag,
          null,
          theme,
          {}
        );
        
        // Validation pages
        if (testCase.expectedPages) {
          expect(result.pages).toBe(testCase.expectedPages);
        }
        
        // Validation warnings
        if (Array.isArray(testCase.expectedWarnings)) {
          expect(testCase.expectedWarnings).toContain(result.warnings.length);
        } else if (testCase.expectedWarnings !== null) {
          expect(result.warnings.length).toBe(testCase.expectedWarnings);
        }
        
        // Validation overflow
        const theme_config = CV_THEMES[theme];
        const max_units = theme_config.page_config.total_height_units * result.pages;
        expect(result.total_units_used).toBeLessThanOrEqual(max_units);
        
        // Validation min expériences détaillées
        const detailed = result.sections.experiences.filter(
          e => e.format === "detailed"
        ).length;
        expect(detailed).toBeGreaterThanOrEqual(
          theme_config.adaptive_rules.min_detailed_experiences
        );
      });
    });
  });
  
});
```

### 7.2 Tests Visuels (Puppeteer Screenshots)

```typescript
// tests/visual-regression.test.ts

describe("Visual Regression Tests", () => {
  
  it("should match screenshot for classic theme", async () => {
    const html = await generateHTML("classic", mockAdaptedContent);
    const screenshot = await takeScreenshot(html);
    
    expect(screenshot).toMatchImageSnapshot({
      customDiffConfig: { threshold: 0.1 },
      customSnapshotIdentifier: "classic-theme-v1"
    });
  });
  
  // ... autres thèmes
  
});
```

### 7.3 Calibration Units

Script à exécuter après implémentation initiale :

```typescript
// scripts/calibrate-units.ts

/**
 * Génère des PDFs de test avec différentes valeurs de unit_to_mm
 * pour calibrer empiriquement la correspondance 1 unit = X mm
 */

async function calibrateUnits() {
  const testContent = {
    // Contenu standardisé pour mesure
    experiences: [
      { format: "detailed", /* ... */ },
      { format: "standard", /* ... */ },
      { format: "compact", /* ... */ }
    ]
  };
  
  const testValues = [3.5, 3.8, 4.0, 4.2, 4.5];  // mm par unit
  
  for (const value of testValues) {
    const html = await generateHTML("classic", testContent, {
      unit_to_mm: value
    });
    
    const pdf = await generateCVPDF(html);
    
    await fs.writeFile(
      `calibration/test_${value}mm.pdf`,
      pdf
    );
  }
  
  console.log("✅ Generated calibration PDFs");
  console.log("📏 Manually measure heights and adjust CONTENT_UNITS_REFERENCE");
}
```

---

## 8️⃣ ROADMAP D'IMPLÉMENTATION {#roadmap}

### Phase 1 : Foundation (1 semaine)

**Sprint 1.1 : Types & Config (2 jours)**
- [ ] Créer `lib/cv/types.ts` avec toutes les interfaces
- [ ] Créer `lib/cv/content-units-reference.ts`
- [ ] Créer `lib/cv/theme-configs.ts` avec 3 thèmes
- [ ] Tests : Validation TypeScript, aucune erreur de compilation

**Sprint 1.2 : Algorithme Core (3 jours)**
- [ ] Créer `lib/cv/adaptive-algorithm.ts`
- [ ] Implémenter fonction `generateAdaptiveCV()`
- [ ] Implémenter fonction `allocateExperiences()`
- [ ] Implémenter fonctions scoring/prioritization
- [ ] Tests unitaires : 10+ scénarios

### Phase 2 : Templates (1 semaine)

**Sprint 2.1 : Template Engine (2 jours)**
- [ ] Setup Handlebars avec helpers personnalisés
- [ ] Créer fonction `populateTemplate()`
- [ ] Gérer variables CSS dynamiques

**Sprint 2.2 : HTML/CSS (3 jours)**
- [ ] Convertir template "classic" avec système units
- [ ] Créer template "modern_spacious"
- [ ] Créer template "compact_ats"
- [ ] Tests : Génération PDF pour chaque thème

### Phase 3 : Calibration & Tests (3 jours)

**Sprint 3.1 : Calibration (1 jour)**
- [ ] Exécuter script `calibrate-units.ts`
- [ ] Mesurer manuellement PDFs générés
- [ ] Ajuster valeurs dans `content-units-reference.ts`
- [ ] Valider : 200 units ≈ 1 page A4

**Sprint 3.2 : Tests E2E (2 jours)**
- [ ] Créer fixtures (junior, mid, senior, executive)
- [ ] Tests E2E complets
- [ ] Tests visuels (screenshots)
- [ ] Validation : 0% débordement sur 20+ scénarios

### Phase 4 : Intégration API (2 jours)

- [ ] Modifier `/api/cv/generate` pour utiliser nouveau système
- [ ] Ajouter endpoint `/api/cv/preview` (sans génération PDF)
- [ ] Documenter API
- [ ] Tests : Génération bout-en-bout depuis API

### Phase 5 : UI & Polish (1 semaine)

**Sprint 5.1 : Sélecteur de Thème (2 jours)**
- [ ] UI pour choisir thème dans dashboard
- [ ] Preview des 3 thèmes côte à côte
- [ ] Affichage warnings/metadata

**Sprint 5.2 : Monitoring (1 jour)**
- [ ] Logger warnings dans Posthog
- [ ] Dashboard admin : stats par thème
- [ ] Alertes si taux overflow > 5%

**Sprint 5.3 : Documentation (2 jours)**
- [ ] Guide développeur : ajouter un nouveau thème
- [ ] Guide développeur : ajuster un content unit
- [ ] Diagrammes d'architecture
- [ ] Vidéo démo interne

---

## 9️⃣ MAINTENANCE & ÉVOLUTION

### 9.1 Ajouter un Nouveau Thème

1. Créer nouvelle entrée dans `CV_THEMES`
2. Définir capacités de chaque zone
3. Créer template HTML/CSS correspondant
4. Tester avec fixtures junior/mid/senior
5. Ajuster `unit_to_mm` si nécessaire

**Temps estimé** : 4-6 heures

### 9.2 Ajuster un Content Unit

1. Modifier valeur dans `CONTENT_UNITS_REFERENCE`
2. Relancer script calibration
3. Valider visuellement sur PDFs de test
4. Mettre à jour tests si seuils changent

**Temps estimé** : 30 minutes

### 9.3 Optimiser Algorithme

Pistes d'amélioration futures :

- **Score ML** : Utiliser embedding similarity pour matching
- **User Feedback Loop** : Apprendre des CVs manuellement édités
- **A/B Testing** : Tester différentes stratégies d'allocation
- **Flex Advanced** : Algorithme de redistribution plus sophistiqué

---

## 🎯 CRITÈRES DE SUCCÈS

### Critères Fonctionnels

✅ **100% de compatibilité thèmes**
- Tous les profils (junior à executive) fonctionnent sur tous les thèmes
- Débordements détectés et gérés automatiquement

✅ **Adaptation intelligente**
- Expériences récentes/pertinentes priorisées
- Format dégradé (detailed → compact) selon espace
- Warnings clairs quand contenu exclu

✅ **Performance**
- Algorithme < 500ms
- Génération PDF complète < 30s
- 0 calcul pixel manuel dans templates

### Critères Techniques

✅ **Code Quality**
- 100% TypeScript strict
- 80%+ test coverage
- 0 warning ESLint

✅ **Maintenabilité**
- Nouveau thème = 1 fichier config
- Documentation complète
- Diagrammes d'architecture à jour

✅ **Monitoring**
- Warnings loggés dans Posthog
- Dashboard admin fonctionnel
- Alertes automatiques si problèmes

---

## 📚 ANNEXES

### Annexe A : Glossaire

- **Unit** : Unité abstraite de hauteur (≈ 4mm sur A4)
- **Zone** : Section du CV (header, experiences, etc)
- **Capacity** : Espace total alloué à une zone (en units)
- **Format** : Niveau de détail d'un contenu (detailed, standard, compact, minimal)
- **Flex** : Capacité d'une zone à prêter/emprunter de l'espace
- **Overflow** : Dépassement de capacité d'une zone ou page
- **Adaptive** : Se dit d'un contenu qui change de format selon l'espace

### Annexe B : Références

- [Puppeteer Documentation](https://pptr.dev/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [CSS Paged Media](https://www.w3.org/TR/css-page-3/)

### Annexe C : Contact & Support

**Auteur** : Gilles GOZLAN  
**Email** : gozlan.gilles@gmail.com  
**GitHub** : [CVMatch AI Repository]  

Pour toute question sur cette spécification, ouvrir une issue sur GitHub avec le tag `[CDC-06]`.

---

**FIN DU CDC_06**

Version : 1.0  
Date : Janvier 2025  
Statut : ✅ Prêt pour implémentation
