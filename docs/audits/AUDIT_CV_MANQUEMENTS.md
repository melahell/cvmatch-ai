# Audit Complet : Manquements CV Généré

**Date** : 24 janvier 2026  
**Version CV** : 6.4.2  
**Template analysé** : Modern Template

---

## 🔴 PROBLÈMES CRITIQUES IDENTIFIÉS

### 1. **PHOTO DE PROFIL ABSENTE**

**Symptôme observé** : Seules les initiales "GG" sont affichées, pas la photo de profil.

**Analyse technique** :

- **Template** (`ModernTemplate.tsx` lignes 49-51) : Vérifie `hasHttpPhoto` qui nécessite que `photo_url` commence par `http://` ou `https://`
- **Génération CV** (`app/api/cv/generate/route.ts` lignes 952-970) : Convertit les storage refs en signed URLs
- **Problème potentiel** :
  - Si `photoRef` est `undefined` ou `null`, `photoValue` reste `null`
  - Si la conversion échoue (catch block), `photoValue = null`
  - Si `photoValue` est `null`, il n'est pas assigné à `mergedRaw.profil.photo_url`
  - Le template ne reçoit donc pas de `photo_url` valide

**Fichiers concernés** :
- `components/cv/templates/ModernTemplate.tsx` (lignes 49-106)
- `app/api/cv/generate/route.ts` (lignes 952-970)
- `components/cv/normalizeData.ts` (ligne 344, 672)

**Hypothèses** :
1. La photo n'est pas dans le RAG (`ragProfil?.photo_url` est undefined)
2. La conversion storage ref → signed URL échoue silencieusement (catch block ligne 965-968)
3. Le `photoValue` est assigné à `mergedRaw.profil.photo_url` (ligne 1079), mais si `photoValue` est `null`, alors `photo_url` devient `undefined`
4. Le template vérifie `hasHttpPhoto` qui nécessite `http://` ou `https://`, donc si `photo_url` est `undefined`, les initiales sont affichées

**Code concerné** :
- Ligne 953 : `let photoValue: string | null = null;` - Initialisé à `null`
- Lignes 955-970 : Logique de conversion (peut laisser `photoValue = null`)
- Ligne 1079 : `photo_url: photoValue || undefined` - Si `photoValue` est `null`, `photo_url` devient `undefined`
- Template ligne 49-51 : Vérifie `hasHttpPhoto` qui échoue si `photo_url` est `undefined`

---

### 2. **EXPÉRIENCES TRONQUÉES / INCOMPLÈTES**

**Symptôme observé** : Les descriptions des expériences sont coupées, les réalisations ne sont pas complètes.

**Analyse technique** :

#### 2.1 Limite dans `normalizeData.ts`
- **Ligne 258** : `maxRealisationsPerExp: 8` - Limite à 8 réalisations par expérience
- **Ligne 585** : `.slice(0, CV_LIMITS.maxRealisationsPerExp)` - Applique la limite
- **Impact** : Même si le RAG extrait 15-20 réalisations, seulement 8 sont conservées

#### 2.2 Limite dans `adaptive-algorithm.ts`
- **Lignes 75-80** : Limites par format :
  - `detailed: 5` réalisations
  - `standard: 3` réalisations
  - `compact: 1` réalisation
  - `minimal: 0` réalisations
- **Ligne 95** : `.slice(0, effectiveLimit)` - Applique la limite selon le format
- **Impact** : Même avec 8 réalisations après normalisation, l'algorithme adaptatif peut réduire à 3-5 selon le format

#### 2.3 Limite dans `validator.ts` (auto-compress)
- **Ligne 210** : `.slice(0, 4)` - Limite à 4 bullets par expérience
- **Impact** : Si `autoCompressCV` est appelé, limite à 4 réalisations

**Fichiers concernés** :
- `components/cv/normalizeData.ts` (lignes 256-266, 580-586)
- `lib/cv/adaptive-algorithm.ts` (lignes 70-96, 347-357)
- `lib/cv/validator.ts` (lignes 206-212)

**Ordre d'exécution** :
1. RAG extrait 15-20 réalisations ✅
2. `normalizeRAGToCV` limite à 8 réalisations ❌
3. `adaptCVToThemeUnits` limite à 3-5 selon format ❌
4. `autoCompressCV` (si appelé) limite à 4 ❌

**Résultat** : Seulement 3-5 réalisations affichées au lieu de 15-20

---

### 3. **SECTIONS MANQUANTES OU INCOMPLÈTES**

**Symptôme observé** : Les sections Skills et Languages ne sont pas clairement visibles dans le CV final.

**Analyse technique** :

#### 3.1 Compétences Techniques
- **Template** (`ModernTemplate.tsx` lignes 157-185) : Affiche les compétences dans la sidebar gauche
- **Normalisation** (`normalizeData.ts` ligne 589) : Limite à 28 compétences techniques (`maxSkills: 28`)
- **Problème potentiel** :
  - Si `limitedSkills` est vide ou peu rempli, la section apparaît vide
  - Les compétences peuvent être filtrées ou perdues lors de la normalisation

#### 3.2 Langues
- **Template** (`ModernTemplate.tsx` lignes 206-223) : Affiche les langues dans la sidebar
- **Normalisation** (`normalizeData.ts` ligne 592) : Limite à 6 langues (`maxLangues: 6`)
- **Problème potentiel** : Même que pour les compétences

**Fichiers concernés** :
- `components/cv/templates/ModernTemplate.tsx` (lignes 157-223)
- `components/cv/normalizeData.ts` (lignes 387-495, 589-592)

---

### 4. **MANQUE DE DÉTAILS STRUCTURELS**

**Symptôme observé** : Dates et entreprises peu visibles, informations structurelles manquantes.

**Analyse technique** :

#### 4.1 Dates des expériences
- **Template** (`ModernTemplate.tsx` ligne 309) : Affiche `{date_debut} - {date_fin || 'Présent'}`
- **Normalisation** (`normalizeData.ts` lignes 350-351) : Normalise les dates depuis plusieurs formats
- **Problème potentiel** :
  - Si `date_debut` ou `date_fin` sont vides, l'affichage est incomplet
  - Les dates peuvent être mal formatées

#### 4.2 Nom de l'entreprise
- **Template** (`ModernTemplate.tsx` ligne 313) : Affiche `{entreprise} • {lieu}`
- **Normalisation** (`normalizeData.ts` ligne 349) : Sanitize `exp.entreprise`
- **Problème potentiel** : Si `entreprise` est vide ou mal normalisé, l'affichage est incomplet

**Fichiers concernés** :
- `components/cv/templates/ModernTemplate.tsx` (lignes 299-315)
- `components/cv/normalizeData.ts` (lignes 347-352)

---

### 5. **RICHESSE DES INFORMATIONS INSUFFISANTE**

**Symptôme observé** : CV "pauvre en informations et incomplet" selon l'utilisateur.

**Analyse technique** :

#### 5.1 Contexte opérationnel manquant
- **RAG Prompt** : Sections "EXTRACTION MAXIMALE" et "EXTRACTION DE CONTEXTE OPÉRATIONNEL" ajoutées ✅
- **Normalisation** : Le champ `contexte` des expériences n'est pas extrait ni affiché
- **Template** : N'affiche pas le contexte opérationnel (process, méthodologies, outils, budget, équipe)

#### 5.2 Technologies et outils
- **RAG** : Extrait `technologies`, `outils`, `methodologies` dans les expériences
- **Normalisation** : Ces champs ne sont pas normalisés ni passés au template
- **Template** : N'affiche pas les technologies utilisées par expérience

#### 5.3 Réalisations détaillées
- **RAG** : Extrait 15-20 réalisations avec contexte
- **Limites** : Réduites à 3-5 par les systèmes de normalisation/adaptation
- **Résultat** : Perte de 70-80% des informations extraites

**Fichiers concernés** :
- `lib/ai/prompts.ts` (sections EXTRACTION MAXIMALE et CONTEXTE OPÉRATIONNEL)
- `components/cv/normalizeData.ts` (normalisation des expériences)
- `components/cv/templates/ModernTemplate.tsx` (affichage des expériences)

---

## 📊 RÉSUMÉ DES LIMITES ACTUELLES

| Étape | Limite Actuelle | Limite RAG | Perte |
|-------|----------------|------------|-------|
| **Réalisations par expérience** | 3-5 (adaptatif) | 15-20 | 70-80% |
| **Réalisations (normalisation)** | 8 | 15-20 | 50% |
| **Compétences techniques** | 28 | Illimité | N/A |
| **Soft skills** | 14 | Illimité | N/A |
| **Formations** | 5 | Illimité | N/A |
| **Langues** | 6 | Illimité | N/A |

---

## 🔍 POINTS À VÉRIFIER EN PROFONDEUR

### A. Flux de la photo
1. Vérifier si `ragProfil?.photo_url` existe dans le RAG
2. Vérifier si la conversion storage ref → signed URL fonctionne
3. Vérifier si `photoValue` est correctement assigné à `mergedRaw.profil.photo_url`
4. Vérifier si le template reçoit bien `photo_url` avec `http://` ou `https://`

### B. Flux des réalisations
1. Vérifier combien de réalisations sont extraites par le RAG
2. Vérifier combien passent après `normalizeRAGToCV`
3. Vérifier combien passent après `adaptCVToThemeUnits`
4. Vérifier le format assigné à chaque expérience (detailed/standard/compact/minimal)

### C. Flux des compétences et langues
1. Vérifier si les compétences sont extraites du RAG
2. Vérifier si elles passent la normalisation
3. Vérifier si elles sont affichées dans le template

### D. Contexte opérationnel
1. Vérifier si le contexte est extrait par le RAG
2. Vérifier s'il est normalisé
3. Vérifier s'il est affiché dans le template

---

## 📝 PROCHAINES ÉTAPES

Une fois que l'utilisateur fournira ses observations détaillées, analyser chaque point en profondeur pour :
1. Identifier la cause racine exacte
2. Proposer une solution technique précise
3. Implémenter la correction
4. Tester et valider

---

### 6. **TITRES D'EXPÉRIENCES INUTILES**

**Symptôme observé** : Les titres des expériences sont affichés même si l'entreprise, le poste ou la période sont manquants, rendant l'information inutile.

**Analyse technique** :

#### 6.1 Affichage inconditionnel
- **Template** (`ModernTemplate.tsx` lignes 289-325) : Affiche toujours `exp.poste`, `exp.entreprise`, `exp.date_debut` même si vides
- **Ligne 301** : `<h4>{sanitizeText(exp.poste)}</h4>` - Affiche même si `exp.poste` est vide
- **Ligne 309** : Affiche les dates même si `exp.date_debut` est vide
- **Ligne 313** : Affiche l'entreprise même si `exp.entreprise` est vide
- **Problème** : Si les 3 informations (poste, entreprise, période) sont manquantes, l'expérience est affichée mais vide/inutile

#### 6.2 Validation manquante
- **Normalisation** (`normalizeData.ts` lignes 347-385) : Normalise les expériences mais ne filtre pas celles avec données manquantes
- **Filtre ligne 380-385** : Filtre uniquement les expériences avec `display: false`, pas celles avec données manquantes
- **Résultat** : Des expériences incomplètes passent jusqu'au template

**Fichiers concernés** :
- `components/cv/templates/ModernTemplate.tsx` (lignes 289-325)
- `components/cv/normalizeData.ts` (lignes 347-385)
- `lib/cv/validator.ts` (ligne 359 - filtre `key === "|||"` mais peut ne pas suffire)

**Code concerné** :
- `ModernTemplate.tsx` ligne 301 : Affiche `exp.poste` sans vérifier si non vide
- `ModernTemplate.tsx` ligne 309 : Affiche dates sans vérifier si `date_debut` existe
- `ModernTemplate.tsx` ligne 313 : Affiche `exp.entreprise` sans vérifier si non vide
- Pas de condition pour masquer l'expérience si les 3 champs sont vides

---

### 7. **MOTS COUPÉS À CHAQUE SYLLABE**

**Symptôme observé** : Certains mots sont coupés à chaque syllabe, rendant le texte illisible.

**Analyse technique** :

#### 7.1 CSS manquant pour gestion des mots
- **CSS Base** (`cv-base.css`) : Pas de règles `word-break`, `hyphens`, `overflow-wrap`
- **Templates** : Utilisent `truncate` (Tailwind) qui peut couper au milieu des mots
- **Problème** : Sans `word-break: break-word` ou `overflow-wrap: break-word`, les navigateurs peuvent couper les mots de manière incorrecte

#### 7.2 Troncature au niveau caractère
- **Adaptive Algorithm** (`adaptive-algorithm.ts` ligne 64-68) : Fonction `sliceText` coupe au niveau caractère
- **Ligne 66** : `text.slice(0, Math.max(0, maxChars - 3))` - Coupe sans respecter les limites de mots
- **Impact** : Si utilisé pour tronquer les réalisations, peut couper au milieu des mots

#### 7.3 Contraintes de largeur
- **Template Modern** : Sidebar de 75mm, contenu principal avec padding
- **Classes Tailwind** : `truncate` applique `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`
- **Problème** : `white-space: nowrap` empêche le retour à la ligne, forçant la troncature au milieu des mots si la largeur est insuffisante

**Fichiers concernés** :
- `components/cv/templates/cv-base.css` (pas de règles word-break)
- `components/cv/templates/ModernTemplate.tsx` (utilisation de `truncate`)
- `lib/cv/adaptive-algorithm.ts` (fonction `sliceText` ligne 64-68)

**Code concerné** :
- `cv-base.css` : Pas de règles pour `word-break` ou `overflow-wrap`
- `ModernTemplate.tsx` lignes 122, 140, 146, 152, 240, 249 : Utilisation de `truncate` qui peut couper les mots
- `adaptive-algorithm.ts` ligne 64-68 : `sliceText` coupe au niveau caractère sans respecter les mots

---

## 🔍 PLAN D'INVESTIGATION SYSTÉMATIQUE

### Phase 1 : Diagnostic Photo (Priorité CRITIQUE)

**Objectif** : Identifier pourquoi la photo ne s'affiche pas

**Étapes** :
1. **Vérifier présence dans RAG**
   - Ajouter logs dans `app/api/cv/generate/route.ts` ligne 952
   - Logger `ragProfil?.photo_url` avant conversion
   - Vérifier si `photoRef` est `undefined`, `null`, ou contient une valeur

2. **Vérifier conversion storage → signed URL**
   - Logger dans le try block (ligne 963) : `signedUrl` après création
   - Logger dans le catch block (ligne 966) : erreur exacte
   - Vérifier si `createSignedUrl` fonctionne correctement

3. **Vérifier assignation à mergedRaw**
   - Logger ligne 1079 : `photoValue` avant assignation
   - Logger après assignation : `mergedRaw.profil.photo_url`
   - Vérifier si `photoValue || undefined` fonctionne correctement

4. **Vérifier réception dans template**
   - Logger dans `ModernTemplate.tsx` ligne 49 : `profil?.photo_url`
   - Logger ligne 50 : résultat de `hasHttpPhoto`
   - Vérifier si l'URL est bien `http://` ou `https://`

**Fichiers à modifier pour diagnostic** :
- `app/api/cv/generate/route.ts` (ajouter logs)
- `components/cv/templates/ModernTemplate.tsx` (ajouter logs)

---

### Phase 2 : Diagnostic Réalisations Tronquées (Priorité HAUTE)

**Objectif** : Identifier où et pourquoi les réalisations sont perdues

**Étapes** :
1. **Vérifier extraction RAG**
   - Logger dans `app/api/cv/generate/route.ts` après récupération RAG
   - Compter `ragProfile.experiences[].realisations.length` pour chaque expérience
   - Vérifier si 15-20 réalisations sont bien extraites

2. **Vérifier normalisation**
   - Logger dans `normalizeData.ts` ligne 353 : `exp.realisations.length` avant filtrage
   - Logger ligne 376 : `realisations.length` après map/sanitize
   - Logger ligne 585 : `realisations.length` après `.slice(0, CV_LIMITS.maxRealisationsPerExp)`
   - Vérifier combien de réalisations passent chaque étape

3. **Vérifier algorithme adaptatif**
   - Logger dans `adaptive-algorithm.ts` ligne 71 : `bullets.length` avant format
   - Logger ligne 83 : `effectiveLimit` calculé
   - Logger ligne 95 : `realisations.length` après `.slice(0, effectiveLimit)`
   - Logger ligne 351 : format assigné à chaque expérience (detailed/standard/compact/minimal)

4. **Vérifier auto-compress**
   - Vérifier si `autoCompressCV` est appelé dans le pipeline
   - Logger dans `validator.ts` ligne 210 : `realisations.length` après `.slice(0, 4)`

**Fichiers à modifier pour diagnostic** :
- `app/api/cv/generate/route.ts` (logs RAG)
- `components/cv/normalizeData.ts` (logs normalisation)
- `lib/cv/adaptive-algorithm.ts` (logs adaptation)
- `lib/cv/validator.ts` (logs auto-compress)

---

### Phase 3 : Diagnostic Titres Inutiles (Priorité MOYENNE)

**Objectif** : Identifier pourquoi les expériences avec données manquantes sont affichées

**Étapes** :
1. **Vérifier données normalisées**
   - Logger dans `normalizeData.ts` ligne 347 : `exp.poste`, `exp.entreprise`, `exp.date_debut` pour chaque expérience
   - Identifier les expériences avec les 3 champs vides ou manquants

2. **Vérifier filtrage**
   - Logger dans `normalizeData.ts` ligne 380 : expériences avant filtre
   - Logger ligne 385 : expériences après filtre
   - Vérifier si le filtre `display: false` est suffisant

3. **Vérifier affichage template**
   - Logger dans `ModernTemplate.tsx` ligne 289 : `exp.poste`, `exp.entreprise`, `exp.date_debut` pour chaque expérience
   - Identifier les expériences affichées avec données manquantes

**Fichiers à modifier pour diagnostic** :
- `components/cv/normalizeData.ts` (logs données)
- `components/cv/templates/ModernTemplate.tsx` (logs affichage)

---

### Phase 4 : Diagnostic Mots Coupés (Priorité MOYENNE)

**Objectif** : Identifier pourquoi les mots sont coupés à chaque syllabe

**Étapes** :
1. **Vérifier CSS appliqué**
   - Inspecter le DOM dans le navigateur
   - Vérifier les styles appliqués aux éléments avec texte tronqué
   - Identifier si `word-break`, `hyphens`, ou `overflow-wrap` sont présents

2. **Vérifier utilisation de `truncate`**
   - Identifier tous les éléments avec classe `truncate` dans les templates
   - Vérifier si la largeur disponible est suffisante
   - Tester avec `word-break: break-word` pour voir si ça résout le problème

3. **Vérifier fonction `sliceText`**
   - Logger dans `adaptive-algorithm.ts` ligne 64 : texte avant/après `sliceText`
   - Vérifier si cette fonction est utilisée pour tronquer les réalisations
   - Tester une version qui respecte les limites de mots

**Fichiers à modifier pour diagnostic** :
- `components/cv/templates/ModernTemplate.tsx` (inspecter classes CSS)
- `lib/cv/adaptive-algorithm.ts` (logs `sliceText`)
- `components/cv/templates/cv-base.css` (tester règles word-break)

---

### Phase 5 : Diagnostic Sections Manquantes (Priorité BASSE)

**Objectif** : Identifier pourquoi Skills et Languages ne sont pas visibles

**Étapes** :
1. **Vérifier extraction compétences**
   - Logger dans `normalizeData.ts` ligne 394 : `skill_map` si présent
   - Logger ligne 418 : `data.competences` structure
   - Logger ligne 589 : `limitedTechniques.length` après normalisation

2. **Vérifier affichage template**
   - Logger dans `ModernTemplate.tsx` ligne 163 : `limitedSkills.length`
   - Vérifier si la section est rendue même si vide

**Fichiers à modifier pour diagnostic** :
- `components/cv/normalizeData.ts` (logs compétences)
- `components/cv/templates/ModernTemplate.tsx` (logs affichage)

---

## 📋 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **Phase 1** : Photo (CRITIQUE - impact visuel immédiat)
2. **Phase 2** : Réalisations (HAUTE - perte de 70-80% des informations)
3. **Phase 3** : Titres inutiles (MOYENNE - qualité d'affichage)
4. **Phase 4** : Mots coupés (MOYENNE - lisibilité)
5. **Phase 5** : Sections manquantes (BASSE - peut être secondaire)

---

**Note** : Cet audit est basé sur l'analyse du code et de l'image fournie. Des vérifications supplémentaires avec des logs et des données réelles seront nécessaires pour confirmer chaque problème.
