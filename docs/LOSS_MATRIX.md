# Matrice des pertes (Profil → CV → Rendu)

Objectif : voir, **champ par champ**, où l’information peut se perdre (projection, filtre, quota, adaptation au template, omission d’affichage).

## Légende
- ✅ conservé
- ⚠️ conservé mais potentiellement tronqué/limité
- ❌ perdu (non transporté / filtré / non rendu)
- 🎯 intentionnel (choix produit : tenir sur 1 page / règles thème)
- 🐛 suspect (incohérence / omission / dérive de schéma)

Étapes :
1) **RAG** : `rag_metadata.completeness_details`
2) **CVData (normalisé)** : `normalizeRAGToCV` (V1 & pages qui “normalisent” un CV)
3) **CVData (widgets)** : `convertAndSort` (V2)
4) **Fit/adapt** : `fitCVToTemplate` + `adaptCVToThemeUnits`
5) **Template** : `modern / tech / classic / creative`

Références :
- Normalisation : [normalizeData.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/normalizeData.ts)
- Bridge widgets : [ai-adapter.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/ai-adapter.ts)
- Fit/adapt : [validator.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/validator.ts), [adaptive-algorithm.ts](file:///Users/gillesgozlan/Desktop/CV-Crush/lib/cv/adaptive-algorithm.ts)
- Templates : [templates](file:///Users/gillesgozlan/Desktop/CV-Crush/components/cv/templates)

## 1) Profil / Contact
| Champ | RAG | CVData normalisé | CVData widgets | Fit/adapt | Modern | Tech | Classic | Creative | Note |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| prenom/nom | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| titre_principal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| email/téléphone | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| localisation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| linkedin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🐛 omission template Classic/Creative |
| github | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🐛 omission template Classic/Creative |
| portfolio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🐛 omission template Classic/Creative |
| elevator_pitch | ✅ | ✅ | ✅ | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Peut être tronqué/vidé par adapt units |
| photo_url | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ affichage exige URL HTTP(S) |

## 2) Expériences / Réalisations
| Champ | RAG | CVData normalisé | CVData widgets | Fit/adapt | Modern | Tech | Classic | Creative | Note |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| expériences (liste) | ✅ | ⚠️🎯 | ✅ | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Caps + exclusion si overflow |
| poste/entreprise | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Exp “incomplète” peut être filtrée (normalisation) |
| dates (debut/fin) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| lieu | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | 🐛/choix template (Tech/Creative) |
| realisations[] | ✅ | ⚠️🎯 | ✅ | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Caps + trimming bullets/exp |
| realisation.impact | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Rarement rendu explicitement (souvent fusionné dans description) |
| clients par exp | ✅ | ⚠️ | ⚠️ | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Limites par options + trimming par capacité |
| technologies/contexte | ⚠️ | ✅ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | Modern affiche parfois champs hors schéma ; widgets bridge ne les garde pas |

## 3) Compétences
| Champ | RAG | CVData normalisé | CVData widgets | Fit/adapt | Modern | Tech | Classic | Creative | Note |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| techniques | ✅ | ⚠️🎯 | ⚠️🎯 | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Caps + trimming par capacité |
| soft_skills | ✅ | ⚠️🎯 | ⚠️🎯 | ⚠️🎯 | ✅ | ❌ | ❌ | ✅ | 🐛 omissions Classic/Tech |
| inferred skills | ✅ | ❌🎯 | ❌🎯 | ❌🎯 | ❌ | ❌ | ❌ | ❌ | 🎯 Non destiné au CV final (plutôt profil) |

## 4) Formations / Langues / Certifications
| Champ | RAG | CVData normalisé | CVData widgets | Fit/adapt | Modern | Tech | Classic | Creative | Note |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| formations[] | ✅ | ⚠️🎯 | ⚠️🎯 | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Caps + trimming |
| langues[] | ✅ | ⚠️🎯 | ⚠️🎯 | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Caps + trimming |
| certifications[] | ✅ | ⚠️🎯 | ⚠️🎯 | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Caps + trimming |

## 5) Références clients (global)
| Champ | RAG | CVData normalisé | CVData widgets | Fit/adapt | Modern | Tech | Classic | Creative | Note |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| clients_references.clients | ✅ | ⚠️ | ⚠️ | ⚠️🎯 | ✅ | ✅ | ✅ | ✅ | Trimming par capacité / options |
| clients_references.secteurs | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | Modern seulement (et tronqué) |

## 6) Match offre ↔ profil (job context)
| Champ | Stock DB | CV gen V2 | Widgets V2 | Templates | Risque |
|---|---:|---:|---:|---:|---|
| match_report (strengths/gaps/keywords) | ✅ | ⚠️🐛 | ⚠️🐛 | (peu rendu) | Plusieurs routes lisent `analysis_result?.match_report` au lieu de `match_report` |
| job_description | ⚠️🎯 | ⚠️ | ⚠️ | n/a | Tronqué à 10k au stockage → pertes aval |

## 7) Contexte enrichi / metadata
- `contexte_enrichi` : généralement ❌ dans CVData final (🎯), mais peut être utilisé en amont (prompts/scoring).
- `metadata`, `quality_metrics`, `extraction_metadata` : ❌ dans CVData final (🎯). Utile pour debug/qualité, pas pour rendu CV.
