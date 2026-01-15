/**
 * FIXTURES POUR TESTS
 * Données de test représentant différents profils
 */

import { RAGData, JobOffer } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// PROFIL JUNIOR (2 ans d'expérience)
// ═══════════════════════════════════════════════════════════════════════════
export const juniorProfile: RAGData = {
  profil: {
    nom: "Dupont",
    prenom: "Marie",
    titre_principal: "Développeuse Full-Stack Junior",
    elevator_pitch:
      "Développeuse passionnée avec 2 ans d'expérience en JavaScript et React. Spécialisée dans la création d'applications web modernes et performantes.",
    contact: {
      email: "marie.dupont@example.com",
      telephone: "+33 6 12 34 56 78",
      localisation: "Paris, France"
    },
    langues: [
      { langue: "Français", niveau: "Natif" },
      { langue: "Anglais", niveau: "Courant (B2)" }
    ]
  },
  experiences: [
    {
      poste: "Développeuse Full-Stack",
      entreprise: "Startup XYZ",
      date_debut: "2023-01",
      date_fin: "present",
      contexte: "Développement de la plateforme SaaS principale de l'entreprise",
      realisations: [
        {
          description: "Développement d'une API REST avec Node.js gérant 10K requêtes/jour",
          impact_score: 80
        },
        {
          description: "Intégration front-end React avec Redux pour la gestion d'état",
          impact_score: 70
        },
        {
          description: "Mise en place de tests unitaires Jest avec couverture à 85%",
          impact_score: 65
        }
      ],
      technologies_utilisees: ["Node.js", "React", "Redux", "PostgreSQL", "Jest", "Docker"],
      secteur: "tech"
    },
    {
      poste: "Stagiaire Développeuse Web",
      entreprise: "Agence ABC",
      date_debut: "2022-06",
      date_fin: "2022-12",
      contexte: "Stage de fin d'études dans une agence web",
      realisations: [
        { description: "Création de 5 sites WordPress pour clients", impact_score: 50 },
        { description: "Intégration de maquettes Figma en HTML/CSS", impact_score: 45 }
      ],
      technologies_utilisees: ["WordPress", "PHP", "HTML", "CSS", "JavaScript"],
      secteur: "web"
    }
  ],
  competences: {
    explicit: {
      "Langages": ["JavaScript", "TypeScript", "Python", "HTML", "CSS"],
      "Frameworks": ["React", "Node.js", "Express", "Next.js"],
      "Bases de données": ["PostgreSQL", "MongoDB"],
      "Outils": ["Git", "Docker", "VS Code"]
    }
  },
  formations_certifications: {
    formations: [
      {
        diplome: "Master Informatique",
        ecole: "Université Paris-Saclay",
        annee: "2022",
        details: "Spécialisation développement web et mobile",
        mention: "Mention Bien"
      }
    ],
    certifications: [
      {
        nom: "AWS Certified Cloud Practitioner",
        organisme: "Amazon Web Services",
        date: "2023"
      }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFIL SENIOR (15 ans d'expérience)
// ═══════════════════════════════════════════════════════════════════════════
export const seniorProfile: RAGData = {
  profil: {
    nom: "Martin",
    prenom: "Pierre",
    titre_principal: "Lead Developer & Tech Lead",
    elevator_pitch:
      "Tech Lead avec 15 ans d'expérience dans le développement de solutions B2B à forte volumétrie. Expert en architecture microservices et gestion d'équipes techniques. Passion pour l'optimisation de performance et le mentoring.",
    contact: {
      email: "pierre.martin@example.com",
      telephone: "+33 6 98 76 54 32",
      linkedin: "linkedin.com/in/pierremartin",
      localisation: "Lyon, France"
    },
    langues: [
      { langue: "Français", niveau: "Natif" },
      { langue: "Anglais", niveau: "Bilingue (C2)" },
      { langue: "Allemand", niveau: "Intermédiaire (B1)" }
    ]
  },
  experiences: [
    {
      poste: "Tech Lead",
      entreprise: "Enterprise Corp",
      date_debut: "2020-01",
      date_fin: "present",
      contexte:
        "Direction technique d'une équipe de 12 développeurs sur la refonte d'un ERP legacy",
      realisations: [
        {
          description:
            "Migration d'un monolithe Java vers architecture microservices (15 services), réduisant le time-to-market de 40%",
          impact_score: 95
        },
        {
          description:
            "Mise en place d'une CI/CD complète (GitLab CI, Kubernetes) augmentant la fréquence de déploiement de 5x",
          impact_score: 90
        },
        {
          description:
            "Optimisation des performances BDD permettant de gérer 500K transactions/jour (+300%)",
          impact_score: 88
        },
        {
          description: "Mentoring de 5 développeurs junior, 3 promus senior en 2 ans",
          impact_score: 75
        }
      ],
      technologies_utilisees: [
        "Java",
        "Spring Boot",
        "Kubernetes",
        "PostgreSQL",
        "Redis",
        "Kafka",
        "AWS"
      ],
      secteur: "finance"
    },
    {
      poste: "Senior Developer",
      entreprise: "Tech Solutions SA",
      date_debut: "2016-03",
      date_fin: "2019-12",
      contexte: "Développement de solutions SaaS B2B pour le secteur bancaire",
      realisations: [
        {
          description:
            "Développement d'une plateforme de paiement temps-réel gérant 2M transactions/mois",
          impact_score: 92
        },
        {
          description:
            "Réduction de la latence API de 500ms à 50ms via optimisation cache Redis",
          impact_score: 85
        },
        {
          description: "Lead développeur sur 3 projets clients majeurs (BNP, Société Générale)",
          impact_score: 80
        }
      ],
      technologies_utilisees: ["Node.js", "React", "PostgreSQL", "Redis", "Docker"],
      secteur: "finance"
    },
    {
      poste: "Full-Stack Developer",
      entreprise: "Digital Agency",
      date_debut: "2013-01",
      date_fin: "2016-02",
      contexte: "Développement web pour clients e-commerce",
      realisations: [
        {
          description: "Création de 20+ sites e-commerce Magento avec intégrations ERP",
          impact_score: 70
        },
        {
          description:
            "Développement d'un framework interne réutilisé sur 15 projets clients",
          impact_score: 75
        }
      ],
      technologies_utilisees: ["PHP", "Magento", "MySQL", "JavaScript", "jQuery"],
      secteur: "e-commerce"
    },
    {
      poste: "Développeur Backend",
      entreprise: "WebServices Inc",
      date_debut: "2010-06",
      date_fin: "2012-12",
      realisations: [{ description: "Développement API REST et intégrations tierces" }],
      technologies_utilisees: ["PHP", "MySQL", "REST"],
      secteur: "web"
    },
    {
      poste: "Développeur Junior",
      entreprise: "StartCorp",
      date_debut: "2009-01",
      date_fin: "2010-05",
      realisations: [{ description: "Maintenance applicative et corrections bugs" }],
      technologies_utilisees: ["PHP", "MySQL", "HTML", "CSS"],
      secteur: "web"
    }
  ],
  competences: {
    explicit: {
      "Langages": ["Java", "JavaScript", "TypeScript", "Python", "PHP", "SQL"],
      "Frameworks Backend": ["Spring Boot", "Node.js", "Express", "NestJS"],
      "Frameworks Frontend": ["React", "Vue.js", "Angular"],
      "Bases de données": ["PostgreSQL", "MySQL", "MongoDB", "Redis"],
      "Cloud & DevOps": ["AWS", "Docker", "Kubernetes", "GitLab CI", "Terraform"],
      "Architecture": ["Microservices", "Event-Driven", "REST", "GraphQL"]
    }
  },
  formations_certifications: {
    formations: [
      {
        diplome: "Master Génie Logiciel",
        ecole: "École Centrale Lyon",
        annee: "2008",
        mention: "Mention Très Bien"
      }
    ],
    certifications: [
      {
        nom: "AWS Solutions Architect Professional",
        organisme: "Amazon Web Services",
        date: "2021"
      },
      {
        nom: "Certified Kubernetes Administrator (CKA)",
        organisme: "CNCF",
        date: "2020"
      },
      {
        nom: "PSM I - Professional Scrum Master",
        organisme: "Scrum.org",
        date: "2018"
      }
    ]
  },
  projets: [
    {
      nom: "OpenAPI Generator",
      description:
        "Contributeur open-source sur un générateur de clients API utilisé par 10K+ projets",
      technologies: ["Java", "OpenAPI", "Maven"],
      lien: "github.com/openapitools/openapi-generator"
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// JOB OFFERS
// ═══════════════════════════════════════════════════════════════════════════
export const techLeadJobOffer: JobOffer = {
  id: "job_tech_lead_123",
  title: "Tech Lead Java/Microservices",
  company: "FinTech Pro",
  description:
    "Nous recherchons un Tech Lead expérimenté pour diriger notre équipe backend. Responsabilités: architecture microservices, mentoring, revue de code.",
  required_skills: [
    "Java",
    "Spring Boot",
    "Microservices",
    "Kubernetes",
    "PostgreSQL",
    "Redis",
    "Leadership"
  ],
  secteur: "finance",
  match_analysis: {
    match_score: 92,
    strengths: [
      "15 ans d'expérience alignés avec le poste",
      "Expertise microservices démontrée chez Enterprise Corp",
      "Experience management d'équipe (12 développeurs)"
    ],
    gaps: ["Pas d'expérience Kafka mentionnée"],
    missing_keywords: ["Kafka", "Event Sourcing"]
  }
};

export const fullStackJobOffer: JobOffer = {
  id: "job_fullstack_456",
  title: "Développeur Full-Stack React/Node.js",
  company: "Startup Innovante",
  description:
    "Rejoignez notre équipe produit pour développer notre SaaS en React et Node.js. Stack moderne, méthodologie agile.",
  required_skills: [
    "React",
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "Docker",
    "REST API"
  ],
  secteur: "tech"
};
