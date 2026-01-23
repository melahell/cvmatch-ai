# Format RAG Standard pour Génération de CV

Ce document décrit le format RAG standard utilisé dans la génération de CV.

## Structure de base

Le RAG est stocké dans la table `rag_metadata` dans le champ `completeness_details`.

### Format attendu (RAGComplete)

```typescript
{
  profil: {
    nom: string;
    prenom: string;
    titre_principal: string;
    titres_alternatifs?: string[];
    localisation: string;
    disponibilite?: string;
    mobilite?: string[];
    teletravail?: string;
    tjm?: number;
    salaire_souhaite?: string;
    contact: {
      email: string;
      telephone?: string;
      adresse?: string;
      code_postal?: string;
      ville?: string;
      pays?: string;
      linkedin?: string;
      portfolio?: string;
      github?: string;
      twitter?: string;
    };
    photo_url?: string;
    elevator_pitch: string;
    objectif_carriere?: string;
  },
  experiences: Array<{
    id: string;
    poste: string;
    poste_original?: string;
    entreprise: string;
    type_entreprise?: 'esn' | 'client_final' | 'startup' | 'pme' | 'grand_groupe' | 'public' | 'ong';
    secteur?: string;
    lieu?: string;
    type_contrat?: 'cdi' | 'cdd' | 'freelance' | 'mission' | 'stage' | 'alternance' | 'interim';
    debut: string;  // Format YYYY-MM
    fin: string | null;
    actuel: boolean;
    duree_mois?: number;
    contexte?: string;
    equipe_size?: number;
    budget_gere?: string;
    perimetre?: string;
    realisations: Array<{
      id: string;
      description: string;
      description_courte?: string;
      impact?: string;
      quantification?: {
        type: 'volume' | 'budget' | 'pourcentage' | 'delai' | 'equipe' | 'portee';
        valeur: string;
        unite: string;
        display: string;
      };
      keywords_ats?: string[];
      sources: string[];
    }>;
    technologies: string[];
    outils: string[];
    methodologies: string[];
    clients_references: string[];
    sources: string[];
    last_updated: string;
    merge_count: number;
  }>,
  competences: {
    explicit: {
      techniques: Array<{
        nom: string;
        niveau?: 'debutant' | 'intermediaire' | 'avance' | 'expert';
        annees_experience?: number;
        certifie?: boolean;
        derniere_utilisation?: string;
      }>;
      soft_skills: string[];
      methodologies: string[];
      langages_programmation?: string[];
      frameworks?: string[];
      outils?: string[];
      cloud_devops?: string[];
    };
    inferred: {
      techniques: Array<{
        name: string;
        confidence: number;  // 0-100
        reasoning: string;
        sources: string[];
      }>;
      tools: Array<{
        name: string;
        confidence: number;
        reasoning: string;
        sources: string[];
      }>;
      soft_skills: Array<{
        name: string;
        confidence: number;
        reasoning: string;
        sources: string[];
      }>;
    };
    par_domaine: Record<string, string[]>;  // { "Cloud": ["AWS", "Azure"], "BDD": ["PostgreSQL"] }
  },
  formations: Array<{
    id: string;
    type: 'diplome' | 'certification' | 'formation' | 'mooc';
    titre: string;
    titre_court?: string;
    organisme: string;
    lieu?: string;
    date_debut?: string;
    date_fin?: string;
    annee: string;
    en_cours: boolean;
    mention?: string;
    specialite?: string;
    details?: string;
    sources: string[];
  }>,
  certifications: Array<{
    id: string;
    nom: string;
    organisme: string;
    date_obtention: string;
    date_expiration?: string;
    numero?: string;
    url_verification?: string;
    niveau?: string;
    domaine?: string;
    sources: string[];
  }>,
  langues: Array<{
    langue: string;
    niveau: string;  // "Natif", "Courant", "Professionnel"
    niveau_cecrl?: string;  // A1-C2
    certifications?: string[];
    details?: string;
  }>,
  references: {
    clients: Array<{
      nom: string;
      secteur: string;
      type: 'grand_compte' | 'pme' | 'startup' | 'public' | 'international';
      annees: string[];
      via_entreprise?: string;
      contexte?: string;
      confidentiel: boolean;
    }>;
    projets_marquants: Array<{
      id: string;
      nom: string;
      description: string;
      client?: string;
      employeur?: string;
      annee: string;
      duree?: string;
      technologies: string[];
      methodologies?: string[];
      resultats: string;
      lien?: string;
      sources: string[];
    }>;
    publications?: Array<{
      titre: string;
      type: 'article' | 'livre' | 'conference' | 'brevet';
      date: string;
      lien?: string;
    }>;
    interventions?: Array<{
      titre: string;
      type: 'formation' | 'conference' | 'meetup' | 'podcast';
      date: string;
      lieu?: string;
    }>;
  },
  infos_additionnelles?: {
    centres_interet?: string[];
    benevolat?: Array<{
      role: string;
      organisation: string;
      periode?: string;
    }>;
    permis?: string[];
    habilitations?: string[];
  },
  metadata: {
    version: string;
    created_at: string;
    last_updated: string;
    last_merge_at: string;
    sources_count: number;
    documents_sources: string[];
    completeness_score: number;
    merge_history: Array<{
      date: string;
      source: string;
      action: 'create' | 'merge' | 'update';
      fields_updated: string[];
      experiences_added: number;
      experiences_merged: number;
    }>;
  }
}
```

## Format simplifié (legacy support)

Le système supporte aussi un format simplifié pour compatibilité :

```typescript
{
  nom: string;
  prenom: string;
  titre_principal: string;
  localisation: string;
  elevator_pitch: string;
  photo_url?: string;
  email?: string;
  telephone?: string;
  linkedin?: string;
  contact?: {
    email?: string;
    telephone?: string;
    linkedin?: string;
  };
  experiences: Array<{
    poste: string;
    entreprise: string;
    debut: string;  // ou date_debut
    fin: string | null;  // ou date_fin
    actuel?: boolean;
    realisations: Array<string | {
      description: string;
      impact?: string;
    }>;
    technologies?: string[];
  }>;
  competences: {
    techniques?: string[];  // Format legacy
    soft_skills?: string[];  // Format legacy
    explicit?: {
      techniques: Array<string | { nom: string }>;
      soft_skills: string[];
    };
    inferred?: {
      techniques: Array<{ name: string; confidence: number }>;
      soft_skills: Array<{ name: string; confidence: number }>;
    };
  };
  formations: Array<{
    diplome: string;  // ou titre
    ecole: string;  // ou organisme
    annee: string;
  }>;
}
```

## Normalisation

Le système utilise `normalizeRAGData()` pour convertir automatiquement :
- Format flat → Format nested
- Format legacy → Format moderne
- Ajout d'IDs manquants
- Fusion de doublons

## Utilisation dans la génération de CV

1. **Récupération** : `rag_metadata.completeness_details` depuis Supabase
2. **Normalisation** : `normalizeRAGData(ragData.completeness_details)`
3. **Préparation pour prompt** : `buildRAGForCVPrompt(ragProfile)` (supprime métadonnées, limite inferred)
4. **Optimisation IA** : Envoi à Gemini pour optimisation
5. **Merge** : Fusion des optimisations IA avec le RAG source
6. **Conversion CV** : `normalizeRAGToCV(mergedRaw)` pour format template

## Champs critiques pour génération CV

### Minimum requis
- `profil.nom`
- `profil.prenom`
- `profil.titre_principal`
- `profil.contact.email`
- Au moins 1 expérience avec `poste`, `entreprise`, `debut`

### Recommandé
- `profil.elevator_pitch` (min 50 caractères)
- 3+ expériences avec réalisations
- `competences.explicit.techniques` (10+ compétences)
- `competences.explicit.soft_skills` (5+)
- Formations

## Exemple complet minimal

```json
{
  "profil": {
    "nom": "Dupont",
    "prenom": "Jean",
    "titre_principal": "Développeur Full-Stack",
    "localisation": "Paris, France",
    "contact": {
      "email": "jean.dupont@example.com",
      "telephone": "+33 6 12 34 56 78",
      "linkedin": "https://linkedin.com/in/jeandupont"
    },
    "elevator_pitch": "Développeur Full-Stack avec 5 ans d'expérience..."
  },
  "experiences": [
    {
      "id": "exp_1",
      "poste": "Développeur Full-Stack",
      "entreprise": "TechCorp",
      "debut": "2020-01",
      "fin": null,
      "actuel": true,
      "realisations": [
        {
          "id": "real_1",
          "description": "Développement d'une application web React/Node.js",
          "impact": "Augmentation de 30% du trafic"
        }
      ],
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "sources": ["cv.pdf"]
    }
  ],
  "competences": {
    "explicit": {
      "techniques": [
        { "nom": "React" },
        { "nom": "Node.js" },
        { "nom": "PostgreSQL" }
      ],
      "soft_skills": ["Communication", "Travail d'équipe"]
    },
    "inferred": {
      "techniques": [],
      "tools": [],
      "soft_skills": []
    },
    "par_domaine": {}
  },
  "formations": [
    {
      "id": "form_1",
      "type": "diplome",
      "titre": "Master Informatique",
      "organisme": "Université Paris",
      "annee": "2019",
      "en_cours": false,
      "sources": ["cv.pdf"]
    }
  ],
  "certifications": [],
  "langues": [],
  "references": {
    "clients": [],
    "projets_marquants": []
  },
  "metadata": {
    "version": "2.0.0",
    "created_at": "2024-01-01T00:00:00Z",
    "last_updated": "2024-01-01T00:00:00Z",
    "last_merge_at": "2024-01-01T00:00:00Z",
    "sources_count": 1,
    "documents_sources": ["cv.pdf"],
    "completeness_score": 45,
    "merge_history": []
  }
}
```
