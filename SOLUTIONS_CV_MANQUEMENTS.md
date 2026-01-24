# Solutions Techniques pour les Manquements CV

**Date** : 24 janvier 2026  
**Version** : 6.4.2  
**Statut** : Analyse complète avec solutions proposées

---

## Analyse des Causes Racines

Basé sur l'audit complet et l'analyse du code, voici les causes racines identifiées et les solutions techniques proposées.

---

## 🔴 PROBLÈME 1 : PHOTO DE PROFIL ABSENTE

### Cause Racine Identifiée

**Problème** : La photo n'est pas récupérée depuis le RAG lors de la génération du CV.

**Analyse** :
1. Dans `app/api/cv/generate/route.ts` ligne 942, on utilise `normalizeRAGData(ragData.completeness_details)`
2. La photo est stockée dans `completeness_details.profil.photo_url` (format `storage:bucket:path`)
3. `normalizeRAGData` peut retourner une structure normalisée où `ragProfil?.photo_url` peut être `undefined` si la structure RAG est "flat" au lieu de "nested"
4. Même si `photoRef` existe, la conversion peut échouer si le format n'est pas reconnu

**Solution Proposée** :

#### Solution 1.1 : Récupération explicite de la photo depuis RAG

**Fichier** : `app/api/cv/generate/route.ts`

**Modification** : Récupérer la photo directement depuis `ragData.completeness_details` avant la normalisation :

```typescript
// Après ligne 941
const ragProfile = normalizeRAGData(ragData.completeness_details);
const ragProfileForPrompt = buildRAGForCVPrompt(ragProfile);

// Récupérer photo_url directement depuis completeness_details (support flat et nested)
const rawCompleteness = ragData.completeness_details as any;
const photoRefFromRAG = rawCompleteness?.profil?.photo_url || rawCompleteness?.photo_url;

// ... reste du code
const ragProfil = (ragProfile as any)?.profil || {};
const ragContact = ragProfil?.contact || {};

// Utiliser photoRefFromRAG au lieu de ragProfil?.photo_url
const photoRef = photoRefFromRAG as string | undefined;
```

#### Solution 1.2 : Fallback vers API photo si absente du RAG

**Fichier** : `app/api/cv/generate/route.ts`

**Modification** : Si `photoRef` est absent, essayer de récupérer via l'API photo :

```typescript
if (includePhoto && !photoRef) {
    // Fallback : récupérer depuis API photo
    try {
        const photoResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/photo`, {
            headers: {
                'Cookie': request.headers.get('cookie') || '',
            },
        });
        if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            if (photoData.photo_url) {
                photoValue = photoData.photo_url;
                logger.debug("Photo retrieved from API fallback", { photoValue });
            }
        }
    } catch (error) {
        logger.warn("Photo API fallback failed", { error });
    }
}
```

#### Solution 1.3 : Améliorer la gestion d'erreur de conversion

**Fichier** : `app/api/cv/generate/route.ts`

**Modification** : Logger plus de détails et gérer différents formats de storage ref :

```typescript
} else {
    // Sinon, convertir storage ref en signed URL
    try {
        // Parser le storage ref (format: "storage:bucket:path" ou juste "bucket/path")
        let parsedRef = photoRef;
        if (!photoRef.startsWith('storage:')) {
            // Si c'est juste un chemin, essayer de deviner le bucket
            if (photoRef.includes('avatars/')) {
                parsedRef = `storage:profile-photos:${photoRef}`;
            } else if (photoRef.includes('photos/')) {
                parsedRef = `storage:documents:${photoRef}`;
            }
        }
        
        const admin = createSupabaseAdminClient();
        const signedUrl = await createSignedUrl(admin, parsedRef, { expiresIn: 3600 });
        photoValue = signedUrl;
        logger.debug("Photo signed URL created", { signedUrl, photoRef, parsedRef });
    } catch (error) {
        logger.error("Photo conversion failed", { 
            error: (error as Error).message, 
            photoRef, 
            stack: (error as Error).stack 
        });
        photoValue = null;
    }
}
```

**Priorité** : CRITIQUE  
**Impact** : Photo visible dans le CV  
**Complexité** : Moyenne

---

## 🔴 PROBLÈME 2 : RÉALISATIONS TRONQUÉES (70-80% PERDUES)

### Cause Racine Identifiée

**Problème** : Triple limitation des réalisations à chaque étape du pipeline.

**Analyse** :
1. RAG extrait 15-20 réalisations ✅
2. `normalizeRAGToCV` limite à 8 réalisations (ligne 585) ❌
3. `adaptCVToThemeUnits` limite à 3-5 selon format ❌
4. Résultat : Seulement 3-5 réalisations affichées

**Solution Proposée** :

#### Solution 2.1 : Augmenter limite dans normalizeData.ts

**Fichier** : `components/cv/normalizeData.ts`

**Modification** : Augmenter `maxRealisationsPerExp` de 8 à 15-20 :

```typescript
const CV_LIMITS = {
    maxExperiences: 10,
    maxRealisationsPerExp: 20,  // Augmenté de 8 à 20
    maxRealisationLength: 999,
    // ... reste
};
```

#### Solution 2.2 : Augmenter limites dans adaptive-algorithm.ts

**Fichier** : `lib/cv/adaptive-algorithm.ts`

**Modification** : Augmenter les limites par format pour garder plus de réalisations :

```typescript
const formatLimits: Record<ExperienceFormat, number> = {
    detailed: 12,   // Augmenté de 5 à 12
    standard: 8,    // Augmenté de 3 à 8
    compact: 3,     // Augmenté de 1 à 3
    minimal: 0,
};
```

#### Solution 2.3 : Prioriser format "detailed" pour plus d'expériences

**Fichier** : `lib/cv/adaptive-algorithm.ts`

**Modification** : Augmenter le nombre d'expériences en format "detailed" :

```typescript
// Dans la fonction qui détermine les formats
// Augmenter min_detailed_experiences de 2 à 3-4
// Cela permettra d'afficher plus de réalisations pour les expériences principales
```

**Priorité** : HAUTE  
**Impact** : 70-80% des informations récupérées  
**Complexité** : Faible (changement de constantes)

---

## 🔴 PROBLÈME 3 : TITRES D'EXPÉRIENCES INUTILES

### Cause Racine Identifiée

**Problème** : Les expériences avec données manquantes (poste, entreprise, dates) sont affichées.

**Solution Proposée** :

#### Solution 3.1 : Filtrer les expériences incomplètes dans normalizeData.ts

**Fichier** : `components/cv/normalizeData.ts`

**Modification** : Ajouter un filtre pour exclure les expériences sans données essentielles :

```typescript
const filteredExperiences = experiences.filter((exp: any) => {
    // Filter out hidden experiences (from CDC compressor)
    const rawExp = (data.experiences || []).find((e: any) => e.poste === exp.poste);
    if (rawExp && (rawExp as any).display === false) return false;
    
    // NOUVEAU : Filtrer les expériences sans données essentielles
    // Au moins 2 des 3 champs doivent être présents (poste, entreprise, date_debut)
    const hasPoste = !!(exp.poste && exp.poste.trim());
    const hasEntreprise = !!(exp.entreprise && exp.entreprise.trim());
    const hasDate = !!(exp.date_debut && exp.date_debut.trim());
    const essentialFieldsCount = [hasPoste, hasEntreprise, hasDate].filter(Boolean).length;
    
    if (essentialFieldsCount < 2) {
        console.warn(`[normalizeRAGToCV] Filtering out incomplete experience`, {
            poste: exp.poste,
            entreprise: exp.entreprise,
            date_debut: exp.date_debut
        });
        return false;
    }
    
    return true;
});
```

#### Solution 3.2 : Masquer les expériences incomplètes dans le template

**Fichier** : `components/cv/templates/ModernTemplate.tsx`

**Modification** : Ajouter une condition pour ne pas rendre les expériences incomplètes :

```typescript
{limitedExperiences
    .filter((exp) => {
        // Ne pas afficher si moins de 2 champs essentiels
        const hasPoste = !!(exp.poste && exp.poste.trim());
        const hasEntreprise = !!(exp.entreprise && exp.entreprise.trim());
        const hasDate = !!(exp.date_debut && exp.date_debut.trim());
        return [hasPoste, hasEntreprise, hasDate].filter(Boolean).length >= 2;
    })
    .map((exp, i) => {
        // ... rendu
    })}
```

**Priorité** : MOYENNE  
**Impact** : Qualité d'affichage  
**Complexité** : Faible

---

## 🔴 PROBLÈME 4 : MOTS COUPÉS À CHAQUE SYLLABE

### Cause Racine Identifiée

**Problème** : CSS manquant pour gérer les coupures de mots, et fonction `sliceText` qui coupe au niveau caractère.

**Solution Proposée** :

#### Solution 4.1 : Améliorer les règles CSS (déjà fait en diagnostic)

**Fichier** : `components/cv/templates/cv-base.css`

**Modification** : Les règles de test sont déjà ajoutées, mais améliorer pour être plus spécifiques :

```css
/* Phase 4 Solution: Prevent word breaking */
.cv-page {
    word-break: normal;
    overflow-wrap: break-word;
    hyphens: none;
}

/* Pour les éléments avec truncate, permettre le retour à la ligne */
.cv-page .truncate {
    white-space: normal;
    overflow-wrap: break-word;
    word-break: break-word;
}

/* Pour les réalisations et textes longs */
.cv-page ul li,
.cv-page p {
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto; /* Permet la césure automatique si nécessaire */
}
```

#### Solution 4.2 : Améliorer la fonction sliceText pour respecter les mots

**Fichier** : `lib/cv/adaptive-algorithm.ts`

**Modification** : Modifier `sliceText` pour couper aux limites de mots :

```typescript
function sliceText(text: string, maxChars: number) {
    if (text.length <= maxChars) return text;
    
    // Couper au dernier espace avant maxChars pour éviter de couper les mots
    const truncated = text.slice(0, Math.max(0, maxChars - 3));
    const lastSpace = truncated.lastIndexOf(' ');
    const lastPeriod = truncated.lastIndexOf('.');
    const breakPoint = Math.max(lastSpace, lastPeriod);
    
    if (breakPoint > maxChars * 0.7) {
        // Si on trouve un bon point de rupture (dans les 70% de la limite)
        const sliced = text.slice(0, breakPoint + 1).trimEnd();
        return sliced ? sliced + "..." : "";
    }
    
    // Sinon, couper au caractère mais essayer de garder les mots complets
    const sliced = truncated.trimEnd();
    return sliced ? sliced + "..." : "";
}
```

#### Solution 4.3 : Remplacer `truncate` par des classes personnalisées

**Fichier** : `components/cv/templates/ModernTemplate.tsx`

**Modification** : Remplacer les classes `truncate` par des classes qui permettent le retour à la ligne :

```typescript
// Au lieu de : className="truncate"
// Utiliser : className="break-words line-clamp-1" ou créer une classe CSS personnalisée
```

**Priorité** : MOYENNE  
**Impact** : Lisibilité  
**Complexité** : Moyenne

---

## 🔴 PROBLÈME 5 : SECTIONS MANQUANTES (Skills/Languages)

### Cause Racine Identifiée

**Problème** : Les compétences peuvent être perdues lors de la normalisation ou ne pas être extraites correctement du RAG.

**Solution Proposée** :

#### Solution 5.1 : Améliorer l'extraction des compétences depuis skill_map

**Fichier** : `components/cv/normalizeData.ts`

**Modification** : S'assurer que `skill_map` est toujours utilisé comme fallback :

```typescript
// S'assurer que skill_map est extrait même si competences existe mais est vide
if ((data as any).skill_map) {
    const skillMap = (data as any).skill_map;
    const allSkills = Object.keys(skillMap);
    
    // Si techniques est vide ou très court, utiliser skill_map
    if (techniques.length < 5) {
        // ... extraction depuis skill_map
    }
}
```

#### Solution 5.2 : Logger et valider la présence des compétences

Les logs sont déjà en place. Si les compétences sont absentes, vérifier :
1. Si elles sont extraites par le RAG
2. Si elles passent la normalisation
3. Si elles sont affichées dans le template

**Priorité** : BASSE (peut être secondaire si les logs montrent que c'est un problème de données RAG)  
**Impact** : Complétude du CV  
**Complexité** : Faible

---

## 🔴 PROBLÈME 6 : RICHESSE DES INFORMATIONS INSUFFISANTE

### Cause Racine Identifiée

**Problème** : Le contexte opérationnel, technologies et outils extraits par le RAG ne sont pas affichés dans le template.

**Solution Proposée** :

#### Solution 6.1 : Normaliser et afficher le contexte opérationnel

**Fichier** : `components/cv/normalizeData.ts`

**Modification** : Extraire et normaliser le contexte des expériences :

```typescript
const experiences = (data.experiences || []).map((exp: any, i: number) => {
    // ... code existant ...
    
    return {
        poste: sanitizeText(exp.poste),
        entreprise: sanitizeText(exp.entreprise),
        date_debut: exp.date_debut || exp.debut || exp.start_date || exp.startDate || exp.dateDebut || exp.date_start || '',
        date_fin: exp.actuel ? undefined : (exp.date_fin || exp.fin || exp.end_date || exp.endDate || exp.dateFin || exp.date_end || undefined),
        lieu: sanitizeText(exp.lieu || exp.localisation),
        realisations,
        // NOUVEAU : Extraire contexte opérationnel
        contexte: sanitizeText(exp.contexte || exp.context || exp.environnement || ''),
        technologies: (exp.technologies || exp.technologies_utilisees || []).map((t: any) => sanitizeText(t)),
        outils: (exp.outils || exp.tools || []).map((o: any) => sanitizeText(o)),
        methodologies: (exp.methodologies || exp.methodes || []).map((m: any) => sanitizeText(m)),
        // ... reste
    };
});
```

#### Solution 6.2 : Afficher le contexte dans le template

**Fichier** : `components/cv/templates/ModernTemplate.tsx`

**Modification** : Ajouter l'affichage du contexte opérationnel et des technologies :

```typescript
{exp.contexte && (
    <p className="text-slate-600 text-[7pt] italic mb-1">
        {sanitizeText(exp.contexte)}
    </p>
)}

{exp.technologies && exp.technologies.length > 0 && (
    <div className="flex flex-wrap gap-1 mb-1">
        {exp.technologies.map((tech: string, idx: number) => (
            <span key={idx} className="text-[6pt] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                {sanitizeText(tech)}
            </span>
        ))}
    </div>
)}
```

**Priorité** : HAUTE (enrichit significativement le CV)  
**Impact** : Richesse des informations  
**Complexité** : Moyenne

---

## 📋 PLAN D'IMPLÉMENTATION RECOMMANDÉ

### Ordre d'Exécution

1. **Solution 2.1 + 2.2** : Augmenter limites réalisations (IMPACT IMMÉDIAT, 70-80% d'amélioration)
2. **Solution 1.1 + 1.2** : Corriger photo (IMPACT VISUEL IMMÉDIAT)
3. **Solution 3.1** : Filtrer expériences incomplètes (QUALITÉ)
4. **Solution 4.1 + 4.2** : Corriger mots coupés (LISIBILITÉ)
5. **Solution 6.1 + 6.2** : Afficher contexte opérationnel (RICHEsSE)
6. **Solution 5.1** : Améliorer compétences (si nécessaire après logs)

### Estimation

- **Temps total** : 2-3 heures
- **Risque** : Faible (modifications ciblées)
- **Tests nécessaires** : Génération d'un CV de test après chaque correction

---

## ✅ VALIDATION

Après implémentation, valider :
1. Photo s'affiche dans le CV généré
2. 12-15 réalisations affichées par expérience principale (au lieu de 3-5)
3. Expériences incomplètes masquées
4. Mots non coupés au milieu
5. Contexte opérationnel et technologies affichés
6. Compétences et langues visibles

---

**Note** : Les logs ajoutés permettront de confirmer les causes racines lors de la prochaine génération de CV. Les solutions proposées sont basées sur l'analyse du code et devraient résoudre la majorité des problèmes identifiés.
