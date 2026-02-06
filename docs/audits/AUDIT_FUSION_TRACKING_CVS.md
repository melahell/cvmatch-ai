# Audit Fusion : Tracking (Candidatures) + CVs

## 📊 Analyse des Deux Pages

### Page `/dashboard/tracking` - Candidatures
**Données** : `job_analyses` (analyses de match offre/profil)
**Fonctionnalités** :
- ✅ Liste des candidatures avec statut (pending, applied, interviewing, offer, rejected)
- ✅ Filtres par statut avec compteurs
- ✅ Tri par date, score, statut
- ✅ Recherche (poste, entreprise, localisation)
- ✅ Vue compacte/détaillée
- ✅ Actions bulk (supprimer, changer statut)
- ✅ Export CSV
- ✅ Barre de progression globale
- ✅ Score de match affiché
- ✅ Lien vers analyse complète

**Composants** :
- `JobCard` (mobile + desktop)
- `BulkToolbar`
- `StatusDropdown`

### Page `/dashboard/cvs` - Mes CVs
**Données** : `cv_generations` (CVs générés)
**Fonctionnalités** :
- ✅ Liste des CVs générés
- ✅ Recherche (poste, entreprise)
- ✅ Tri par date
- ✅ Sélection multiple pour suppression
- ✅ Score de match affiché
- ✅ Lien vers détails du CV
- ✅ Lien vers offre d'origine (si disponible)

**Composants** :
- `CVCard`
- `CVPreview`
- `RenameCVDialog`

---

## 🔗 Relations dans la Base de Données

```sql
job_analyses (1) ──→ (N) cv_generations
  id              job_analysis_id
```

**Relation** :
- Un `job_analysis` peut avoir **plusieurs** `cv_generations` (différents templates)
- Un `cv_generation` est **toujours** lié à un `job_analysis`
- Chaque candidature peut avoir 0, 1 ou plusieurs CVs générés

**Champs pertinents** :
- `job_analyses.cv_generated` (boolean) - Indique si un CV a été généré
- `job_analyses.cv_template` - Template utilisé
- `job_analyses.application_status` - Statut de candidature
- `cv_generations.job_analysis_id` - Lien vers l'analyse

---

## 💡 Opportunités de Fusion Intelligente

### Option 1 : Vue Unifiée "Candidatures" avec CVs Intégrés ⭐ RECOMMANDÉE

**Concept** : Une seule page "Candidatures" qui montre :
- La candidature (job_analysis) comme élément principal
- Le(s) CV(s) généré(s) directement dans la carte de candidature
- Actions contextuelles : "Générer CV", "Voir CV", "Télécharger CV"

**Structure** :
```
┌─────────────────────────────────────────────────┐
│ 📋 Candidature : Product Manager @ Google      │
│ Score: 85% | Statut: Postulé | Il y a 3 jours │
├─────────────────────────────────────────────────┤
│ 📄 CVs générés (2) :                            │
│   • CV Moderne (Classic) - Généré il y a 2j    │
│     [👁️ Voir] [⬇️ Télécharger] [🗑️]           │
│   • CV Tech (TechTemplate) - Généré il y a 1j  │
│     [👁️ Voir] [⬇️ Télécharger] [🗑️]           │
│ [+ Générer un nouveau CV]                      │
└─────────────────────────────────────────────────┘
```

**Avantages** :
- ✅ Vue d'ensemble complète : candidature + CVs en un coup d'œil
- ✅ Workflow naturel : analyser → générer CV → postuler → tracker
- ✅ Pas de navigation entre pages
- ✅ Actions contextuelles évidentes

**Implémentation** :
- Enrichir `JobCard` pour afficher les CVs associés
- Requête join : `job_analyses LEFT JOIN cv_generations`
- Section "CVs" dans chaque carte (expandable si plusieurs CVs)

---

### Option 2 : Vue Kanban avec Colonnes "Candidatures" + "CVs"

**Concept** : Vue en colonnes type Kanban
```
┌──────────────┬──────────────┬──────────────┐
│  À Faire     │  Postulé     │  Entretien   │
│  (3)         │  (5)         │  (2)         │
├──────────────┼──────────────┼──────────────┤
│ 📋 Job 1     │ 📋 Job 3     │ 📋 Job 5     │
│ 📄 CV Moderne│ 📄 CV Tech   │ 📄 CV Classic│
│              │              │              │
│ 📋 Job 2     │ 📋 Job 4     │              │
│ [Générer CV] │ 📄 CV Moderne│              │
└──────────────┴──────────────┴──────────────┘
```

**Avantages** :
- ✅ Visualisation du pipeline de candidature
- ✅ Drag & drop possible (changer statut)
- ✅ CVs visibles dans le contexte

**Inconvénients** :
- ⚠️ Plus complexe à implémenter
- ⚠️ Moins adapté mobile

---

### Option 3 : Onglets Intelligents avec Vue Unifiée

**Concept** : Page avec onglets mais vue unifiée en arrière-plan
```
┌─────────────────────────────────────────────┐
│ [Toutes] [À faire] [Postulé] [Mes CVs]     │
├─────────────────────────────────────────────┤
│ Vue unifiée qui montre :                    │
│ - Candidatures avec CVs intégrés           │
│ - CVs orphelins (sans candidature)         │
│ - Filtres intelligents                     │
└─────────────────────────────────────────────┘
```

**Avantages** :
- ✅ Flexibilité : voir tout ou filtrer
- ✅ Pas de perte de contexte
- ✅ Navigation fluide

---

## 🎯 Recommandation : Option 1 (Vue Unifiée)

### Architecture Proposée

**Page unique** : `/dashboard/applications` (ou garder `/dashboard/tracking`)

**Structure de données enrichie** :
```typescript
interface ApplicationWithCVs {
  // Données job_analysis
  id: string;
  job_title: string;
  company: string;
  match_score: number;
  application_status: string;
  submitted_at: string;
  
  // CVs associés
  cvs: Array<{
    id: string;
    template_name: string;
    created_at: string;
    cv_url?: string;
  }>;
  
  // Métadonnées
  has_cv: boolean;
  cv_count: number;
}
```

**Composant enrichi** : `ApplicationCard` (remplace `JobCard`)
- Section principale : Candidature (comme actuellement)
- Section expandable : Liste des CVs générés
- Actions rapides : "Générer CV", "Voir CV", "Télécharger CV"

**Filtres enrichis** :
- "Toutes" (candidatures + CVs)
- "Avec CV" / "Sans CV"
- "CVs récents" (derniers CVs générés)
- Statuts classiques (pending, applied, etc.)

**Vue "CVs uniquement"** :
- Filtre spécial "CVs" qui montre tous les CVs
- Groupés par candidature ou vue plate
- Permet de voir les CVs orphelins (si candidature supprimée)

---

## 📋 Plan d'Implémentation

### Phase 1 : Enrichissement des Données
1. Modifier `useJobAnalyses` pour inclure les CVs associés (LEFT JOIN)
2. Créer type `ApplicationWithCVs`
3. Adapter les hooks pour charger les CVs avec les candidatures

### Phase 2 : Composant Unifié
1. Créer `ApplicationCard` enrichi (candidature + CVs)
2. Section CVs expandable/collapsible
3. Actions contextuelles (générer, voir, télécharger)

### Phase 3 : Filtres et Navigation
1. Ajouter filtres "Avec CV" / "Sans CV"
2. Vue "CVs uniquement" (optionnelle)
3. Migration de `/dashboard/cvs` vers redirect ou alias

### Phase 4 : Optimisations
1. Lazy loading des CVs (charger à la demande)
2. Cache des CVs
3. Performance (éviter N+1 queries)

---

## 🎨 Exemple de Carte Unifiée

```tsx
<ApplicationCard>
  {/* En-tête Candidature */}
  <CardHeader>
    <h3>Product Manager @ Google</h3>
    <Badge>Score: 85%</Badge>
    <Badge>Postulé</Badge>
  </CardHeader>
  
  {/* Section CVs (expandable) */}
  <CardContent>
    {application.cvs.length > 0 ? (
      <div className="space-y-2">
        {application.cvs.map(cv => (
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span>📄 CV {cv.template_name}</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => viewCV(cv.id)}>
                👁️ Voir
              </Button>
              <Button size="sm" onClick={() => downloadCV(cv.id)}>
                ⬇️ Télécharger
              </Button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <Button onClick={() => generateCV(application.id)}>
        + Générer un CV
      </Button>
    )}
  </CardContent>
</ApplicationCard>
```

---

## ✅ Avantages de la Fusion

1. **Workflow naturel** : Tout au même endroit
2. **Contexte préservé** : Voir candidature + CVs ensemble
3. **Moins de navigation** : Pas besoin d'aller sur "Mes CVs"
4. **Actions rapides** : Générer/Voir CV directement depuis la candidature
5. **Vue d'ensemble** : Comprendre rapidement quelles candidatures ont des CVs

---

## ⚠️ Points d'Attention

1. **Performance** : JOIN peut être lourd si beaucoup de CVs
   - Solution : Lazy loading ou pagination
   
2. **CVs orphelins** : CVs dont la candidature a été supprimée
   - Solution : Afficher dans une section séparée "CVs sans candidature"
   
3. **Migration** : Utilisateurs habitués à `/dashboard/cvs`
   - Solution : Redirect ou garder les deux pages temporairement

---

## 🚀 Prochaines Étapes

1. Valider l'approche (Option 1 recommandée)
2. Implémenter Phase 1 (enrichissement données)
3. Créer composant `ApplicationCard` enrichi
4. Tester avec données réelles
5. Migrer progressivement
