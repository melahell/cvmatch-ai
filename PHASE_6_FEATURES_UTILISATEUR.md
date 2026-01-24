# Phase 6 : Features Utilisateur Avancées

**Version** : 6.3.0+  
**Date** : Janvier 2026  
**Statut** : Plan d'exécution  
**Priorité** : Moyenne  
**Durée estimée** : 2-3 jours

---

## Objectif

Ajouter des fonctionnalités utilisateur avancées pour améliorer l'expérience et la flexibilité du produit après validation qualité (Phase 5).

---

## État Actuel

### Fonctionnalités Existantes

- **Édition CV** : Page `app/dashboard/cvs/[id]/edit/page.tsx` existe avec édition basique
- **Export PDF** : Implémenté via `PDFExportButton`
- **Export JSON** : Partiellement implémenté dans CV Builder
- **Contexte Enrichi** : Génération fonctionnelle, mais pas d'interface utilisateur

### Gaps Identifiés

1. **Édition CV** : Pas de versioning, pas de diff visuel, pas d'historique
2. **Export Multi-Formats** : Seul PDF disponible, pas de Word/Markdown
3. **Contexte Enrichi** : Pas d'interface pour valider/rejeter les déductions

---

## Plan d'Exécution Détaillé

### Jour 1 : Amélioration Édition CV + Versioning (6-8h)

#### 1.1 Système de Versioning CV

**Fichier** : `lib/cv/cv-history.ts` (nouveau)

**Fonctionnalités** :
- Sauvegarde automatique versions lors modifications
- Historique max 10 versions par CV
- Métadonnées : timestamp, auteur, description changement
- API rollback à version précédente

**Structure** :
```typescript
interface CVVersion {
    id: string;
    cv_id: string;
    version_number: number;
    cv_data: any;
    metadata: {
        created_at: string;
        created_by: string;
        change_description?: string;
        is_current: boolean;
    };
}
```

**Fonctions** :
- `saveCVVersion(cvId, cvData, description?)` : Sauvegarde nouvelle version
- `getCVVersions(cvId)` : Liste toutes les versions
- `getCVVersion(cvId, versionNumber)` : Récupère version spécifique
- `rollbackToVersion(cvId, versionNumber)` : Restaure version précédente
- `deleteOldVersions(cvId, keepLast = 10)` : Nettoie anciennes versions

#### 1.2 Diff Viewer

**Fichier** : `components/cv/DiffViewer.tsx` (nouveau)

**Fonctionnalités** :
- Comparaison visuelle avant/après modifications
- Highlighting changements (ajouts, suppressions, modifications)
- Diff par section (profil, expériences, compétences)
- Toggle vue unifiée / split view

**Technologies** :
- `diff` library ou `react-diff-viewer`
- Color coding : vert (ajout), rouge (suppression), jaune (modification)

#### 1.3 Amélioration Page Édition

**Fichier** : `app/dashboard/cvs/[id]/edit/page.tsx` (modifier)

**Améliorations** :
- Ajouter onglet "Historique" avec liste versions
- Bouton "Voir diff" pour comparer avec version précédente
- Indicateur "Modifications non sauvegardées"
- Bouton "Rollback" pour restaurer version précédente
- Auto-save avec versioning automatique (toutes les 30s ou après X modifications)

**Interface** :
- Tabs : "Édition", "Preview", "Historique", "Diff"
- Badge "Non sauvegardé" si modifications en cours
- Dropdown versions avec preview

#### 1.4 API Versioning

**Fichier** : `app/api/cv/[id]/versions/route.ts` (nouveau)

**Endpoints** :
- `GET /api/cv/[id]/versions` : Liste versions
- `GET /api/cv/[id]/versions/[version]` : Récupère version
- `POST /api/cv/[id]/versions` : Crée nouvelle version
- `POST /api/cv/[id]/rollback` : Rollback à version

---

### Jour 2 : Export Multi-Formats (4-6h)

#### 2.1 Export Word (.docx)

**Fichier** : `lib/cv/export-word.ts` (nouveau)

**Technologie** : `docx` library (npm install docx)

**Fonctionnalités** :
- Conversion CVData → Document Word
- Formatage préservé (titres, listes, sections)
- Styles appliqués (couleurs, polices selon template)
- Images intégrées (photo profil si présente)

**Structure** :
```typescript
export async function exportCVToWord(
    cvData: RendererResumeSchema,
    template: string
): Promise<Buffer> {
    // Créer document Word avec docx
    // Appliquer styles selon template
    // Retourner Buffer pour téléchargement
}
```

#### 2.2 Export Markdown

**Fichier** : `lib/cv/export-markdown.ts` (nouveau)

**Fonctionnalités** :
- Conversion CVData → Markdown structuré
- Formatage : titres (#), listes (-), sections
- Compatible GitHub, GitLab, etc.

**Structure** :
```typescript
export function exportCVToMarkdown(
    cvData: RendererResumeSchema
): string {
    // Convertir chaque section en Markdown
    // Retourner string Markdown
}
```

#### 2.3 Export JSON Structuré

**Fichier** : `lib/cv/export-json.ts` (nouveau)

**Fonctionnalités** :
- Export CVData complet + widgets + métadonnées
- Format JSON validé avec schéma
- Inclure : cv_data, widgets, template, job_analysis_id, metadata

**Structure** :
```typescript
export function exportCVToJSON(
    cvData: RendererResumeSchema,
    widgets?: AIWidgetsEnvelope,
    metadata?: any
): string {
    return JSON.stringify({
        version: "1.0",
        cv_data: cvData,
        widgets: widgets,
        metadata: metadata,
        exported_at: new Date().toISOString()
    }, null, 2);
}
```

#### 2.4 Menu Export Multi-Formats

**Fichier** : `components/cv/ExportMenu.tsx` (nouveau)

**Fonctionnalités** :
- Dropdown avec options : PDF, Word, Markdown, JSON
- Téléchargement direct au clic
- Preview format (optionnel) avant export
- Indicateur format sélectionné

**Interface** :
- Button "Exporter" avec dropdown
- Icônes par format (FileText, File, Code, FileJson)
- Toast confirmation après export

**Intégration** :
- Ajouter dans `app/dashboard/cv/[id]/page.tsx`
- Ajouter dans `app/dashboard/cv-builder/page.tsx`

---

### Jour 3 : Interface Contexte Enrichi (6-8h)

#### 3.1 Page Contexte Enrichi

**Fichier** : `app/dashboard/profile/context-enrichi/page.tsx` (nouveau)

**Fonctionnalités** :
- Affichage section "Contexte Enrichi" dans profil
- Liste responsabilités implicites avec justifications
- Liste compétences tacites avec confidences
- Environnement travail déduit

**Navigation** :
- Onglet dans `app/dashboard/profile/page.tsx`
- Route : `/dashboard/profile?tab=context-enrichi`

#### 3.2 Visualisation Contexte

**Fichier** : `components/profile/ContexteEnrichiViewer.tsx` (nouveau)

**Fonctionnalités** :
- Cards pour chaque responsabilité implicite
- Cards pour chaque compétence tacite
- Affichage justification (phrase source)
- Badge confidence score (60-100)
- Indicateur impact sur match scores

**Interface** :
- Section "Responsabilités Implicites"
- Section "Compétences Tacites"
- Section "Environnement Travail"
- Stats globales (X validées, Y rejetées, Z en attente)

#### 3.3 Édition/Validation Contexte

**Fichier** : `components/profile/ContexteEnrichiEditor.tsx` (nouveau)

**Fonctionnalités** :
- Boutons "Valider" / "Rejeter" pour chaque déduction
- Ajustement confidence score (slider)
- Suppression déduction si rejetée
- Impact visible sur match scores (avant/après)

**Interface** :
- Card avec :
  - Description déduction
  - Justification (phrase source)
  - Confidence score (badge + slider)
  - Actions : Valider / Rejeter / Ajuster
- Toast confirmation après action

#### 3.4 API Validation Contexte

**Fichier** : `app/api/rag/validate-contexte/route.ts` (nouveau)

**Endpoints** :
- `POST /api/rag/validate-contexte` : Valider/rejeter déduction
- `PUT /api/rag/validate-contexte/[id]` : Ajuster confidence
- `DELETE /api/rag/validate-contexte/[id]` : Supprimer déduction

**Logique** :
- Sauvegarder validations dans `rag_metadata.rejected_inferred` (déjà existant)
- Mettre à jour contexte enrichi avec validations
- Recalculer match scores si nécessaire

---

## Fichiers à Créer/Modifier

### Créations

**Versioning** :
- `lib/cv/cv-history.ts`
- `components/cv/DiffViewer.tsx`
- `app/api/cv/[id]/versions/route.ts`

**Export** :
- `lib/cv/export-word.ts`
- `lib/cv/export-markdown.ts`
- `lib/cv/export-json.ts`
- `components/cv/ExportMenu.tsx`

**Contexte Enrichi** :
- `app/dashboard/profile/context-enrichi/page.tsx`
- `components/profile/ContexteEnrichiViewer.tsx`
- `components/profile/ContexteEnrichiEditor.tsx`
- `app/api/rag/validate-contexte/route.ts`

### Modifications

- `app/dashboard/cvs/[id]/edit/page.tsx` : Ajouter versioning + diff
- `app/dashboard/cv/[id]/page.tsx` : Ajouter ExportMenu
- `app/dashboard/cv-builder/page.tsx` : Ajouter ExportMenu
- `app/dashboard/profile/page.tsx` : Ajouter onglet contexte enrichi

---

## Métriques de Succès

- **Édition** : Interface complète fonctionnelle avec versioning
- **Exports** : 4 formats disponibles (PDF, Word, Markdown, JSON)
- **Contexte** : Interface validation opérationnelle
- **UX** : Feedback utilisateur positif
- **Performance** : Exports < 2s, versioning transparent

---

## Dépendances Techniques

### Packages à Installer

```bash
npm install docx  # Pour export Word
npm install @types/docx  # Types TypeScript
```

### Base de Données

**Table `cv_versions` (à créer)** :
```sql
CREATE TABLE cv_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES cv_generations(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    cv_data JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(cv_id, version_number)
);

CREATE INDEX idx_cv_versions_cv_id ON cv_versions(cv_id);
CREATE INDEX idx_cv_versions_created_at ON cv_versions(created_at DESC);
```

---

## Ordre d'Exécution Recommandé

1. **Matin Jour 1** : Système versioning (cv-history.ts + API)
2. **Après-midi Jour 1** : Diff Viewer + Intégration édition
3. **Matin Jour 2** : Export Word + Markdown
4. **Après-midi Jour 2** : Export JSON + ExportMenu
5. **Matin Jour 3** : Interface contexte enrichi (Viewer)
6. **Après-midi Jour 3** : Édition/Validation contexte + API

**Timeline Total** : 2-3 jours

---

## Notes Importantes

- **Backward Compatibility** : Tous les changements doivent être rétrocompatibles
- **Migration** : Table `cv_versions` à créer, pas de migration données
- **Performance** : Versioning ne doit pas ralentir édition (< 100ms overhead)
- **Coûts** : Export Word nécessite bibliothèque externe (docx)

---

## Prochaines Phases

Après Phase 6 :
- **Phase 7** : Optimisations UX Avancées (skeleton screens, animations, real-time)
- **Phase 8** : Monitoring et Observabilité (tracking, dashboard admin, alertes)
