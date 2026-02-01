# Audit – Templates CV (champs rendus vs perdus)

Ce document audit les templates situés dans [components/cv/templates](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates) et identifie, pour chaque template, les champs **attendus** (CVData), **rendus**, et **non rendus** (perte d’affichage).

## 1) Schéma commun : CVData
Référence : [CVData](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/index.ts#L3-L44)

Champs principaux :
- `profil` : prénom/nom/titre + contact (email/tel/localisation) + liens (linkedin/github/portfolio) + pitch + photo_url
- `experiences[]` : poste/entreprise/dates/lieu/realisations[]/clients[]
- `competences` : techniques[] + soft_skills?[]
- `formations[]`, `langues[]?`, `certifications[]?`
- `clients_references?` : `clients[]` + `secteurs?[]`
- `jobContext?` : `job_title`, `company`, `match_score` (selon template)

## 2) Modern (`modern`)
Code : [ModernTemplate.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/ModernTemplate.tsx)

Rendu :
- Profil : prénom/nom/titre, email/tel/localisation, linkedin/github/portfolio, pitch
- Expériences : poste/entreprise/dates/lieu/clients/realisations
- Compétences : techniques + soft_skills
- Formations, langues, certifications, clients_references
- Champs hors schéma parfois affichés : `contexte`, `technologies[]`

Pertes/limitations :
- `clients_references.secteurs` tronqué (max 5 groupes) : [ModernTemplate.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/ModernTemplate.tsx#L241-L269)
- Photo : affichée seulement si `includePhoto` et `photo_url` commence par HTTP(S) (sinon fallback initiales)
- `jobContext.match_score` non affiché

## 3) Tech (`tech`)
Code : [TechTemplate.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/TechTemplate.tsx)

Rendu :
- Profil : inclut github/portfolio/linkedin + pitch
- Expériences : poste/entreprise/dates/clients/realisations
- Compétences : techniques (catégorisées) uniquement
- Formations, langues, certifications, clients_references
- JobContext : affiche aussi `match_score` : [TechTemplate.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/TechTemplate.tsx#L311-L319)

Pertes/limitations :
- Photo masquée par défaut (`includePhoto=false`) : [TechTemplate.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/TechTemplate.tsx#L51-L56)
- `experiences.lieu` non rendu
- `competences.soft_skills` non rendu
- Catégorie de compétences “other” non rendue (skills perdus visuellement)

## 4) Classic (`classic`)
Code : [ClassicTemplate.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/ClassicTemplate.tsx)

Rendu :
- Profil : prénom/nom/titre + email/tel/localisation + pitch
- Expériences : poste/entreprise/dates/lieu/clients/realisations
- Compétences : techniques uniquement
- Formations, langues, certifications, clients_references

Pertes/limitations :
- Liens profil (`linkedin/github/portfolio`) non rendus
- `competences.soft_skills` non rendu
- `jobContext.match_score` non rendu

## 5) Creative (`creative`)
Code : [CreativeTemplate.tsx](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates/CreativeTemplate.tsx)

Rendu :
- Profil : prénom/nom/titre + email/tel/localisation + pitch
- Expériences : poste/entreprise/dates/clients/realisations
- Compétences : techniques + soft_skills
- Formations, langues, certifications, clients_references

Pertes/limitations :
- Liens profil (`linkedin/github/portfolio`) non rendus
- `experiences.lieu` non rendu
- `jobContext.match_score` non rendu

## 6) Synthèse des pertes par champ (vue rapide)
- `profil.linkedin/github/portfolio` : rendus Modern/Tech, perdus Classic/Creative
- `competences.soft_skills` : rendus Modern/Creative, perdus Classic/Tech
- `experiences.lieu` : rendus Modern/Classic, perdus Tech/Creative
- `clients_references.secteurs` : rendu Modern (tronqué), perdu ailleurs
- `jobContext.match_score` : rendu Tech uniquement
- `profil.photo_url` : peut être “perdu” (non affiché) si non HTTP(S) sur tous les templates

## 7) Recommandations (pour réduire la perte)
- Uniformiser l’affichage des liens profil (au minimum linkedin + github/portfolio).
- Rendre `soft_skills` au moins en badges dans Classic/Tech (ou optionnel).
- Rendre `lieu` dans Tech/Creative (si fourni).
- Rendre “other” dans Tech (sinon la moitié des skills finissent invisibles).
