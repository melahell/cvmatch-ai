# Guide Utilisateur - CV-Crush

Guide complet pour utiliser CV-Crush et générer des CV optimisés avec l'architecture V2.

## Table des Matières

- [Premiers Pas](#premiers-pas)
- [Analyse d'Offre](#analyse-doffre)
- [Génération CV V2](#génération-cv-v2)
- [Édition CV](#édition-cv)
- [Fonctionnalités Avancées](#fonctionnalités-avancées)
- [FAQ](#faq)

---

## Premiers Pas

### 1. Création de Compte

1. Accédez à [CV-Crush](https://cvcrush.com)
2. Cliquez sur "Créer un compte"
3. Remplissez vos informations (email, mot de passe)
4. Confirmez votre email

### 2. Upload de Documents

Pour générer votre profil professionnel (RAG), vous devez uploader vos documents :

1. Allez dans **Profil** → **Documents**
2. Cliquez sur **"Upload Document"**
3. Sélectionnez vos fichiers :
   - CV au format PDF, DOCX, ou TXT
   - Lettres de motivation
   - Certifications
   - Tout document professionnel pertinent

**Conseils** :
- Uploadez plusieurs documents pour enrichir votre profil
- Les formats PDF sont préférés (meilleure extraction)
- Maximum 10 documents par utilisateur

### 3. Génération Profil RAG

Une fois vos documents uploadés :

1. Cliquez sur **"Générer Profil RAG"**
2. Attendez la génération (30-60 secondes)
3. Vérifiez votre **Score de Complétude** :
   - **> 80** : Excellent profil
   - **60-80** : Bon profil
   - **< 60** : Profil à enrichir (uploadez plus de documents)

**Votre profil RAG contient** :
- Expériences professionnelles détaillées
- Compétences techniques et soft skills
- Formations et certifications
- Réalisations quantifiées

---

## Analyse d'Offre

### Comment Analyser une Offre

1. Allez dans **Dashboard** → **Analyser une Offre**
2. Collez la description complète de l'offre d'emploi
3. Cliquez sur **"Analyser"**
4. Attendez l'analyse (10-20 secondes)

### Comprendre le Match Score

Le **Match Score** (0-100) indique votre compatibilité avec l'offre :

- **80-100** : Excellent match, candidature fortement recommandée
- **60-79** : Bon match, candidature recommandée
- **40-59** : Match moyen, préparation nécessaire
- **< 40** : Match faible, amélioration profil requise

### Utiliser les Coaching Tips

L'analyse fournit des **coaching tips** personnalisés :

1. **Points Forts** : Vos atouts pour ce poste
2. **Gaps Identifiés** : Compétences manquantes à mettre en avant
3. **Keywords Manquants** : Mots-clés à ajouter dans votre CV
4. **Stratégie d'Approche** : Comment aborder cette candidature
5. **Points de Vente** : Arguments clés à mettre en avant

**Exemple** :
```
Points Forts :
✅ 8 ans d'expérience React (exactement ce qui est demandé)
✅ Expérience en équipe agile (mentionné dans l'offre)

Gaps :
⚠️ GraphQL non mentionné dans votre profil (requis dans l'offre)
⚠️ Expérience Kubernetes limitée

Keywords Manquants :
- GraphQL
- Kubernetes
- Microservices
```

---

## Génération CV V2

### Différence V1 vs V2

| Aspect | V2 |
|--------|----|
| **Architecture** | Widgets scorés → conversion déterministe → rendu |
| **Contrôle** | Paramètres de conversion + fit template |
| **Traçabilité** | Références RAG + métriques de qualité |
| **Performance** | Cache widgets + fit rapide |
| **Qualité** | Optimisée multi-critères |

### Générer un CV V2

1. Après avoir analysé une offre, cliquez sur **"Générer mon CV"**
2. Attendez la génération (15-30 secondes la première fois, < 1s si cache)
3. Le CV s'affiche avec un badge **"V2 Widgets"**

### Comprendre les Widgets et Scores

Chaque élément de votre CV est un **widget** avec un **score de pertinence** (0-100) :

- **80-100** : Très pertinent, sera inclus
- **60-79** : Pertinent, sera inclus
- **40-59** : Peu pertinent, peut être filtré
- **< 40** : Non pertinent, sera exclu

**Visualisation** :
- Dans le CV Builder, vous pouvez voir les scores de chaque widget
- Les widgets sont triés par score décroissant
- Seuls les widgets avec score ≥ `minScore` sont inclus

### Personnalisation

Dans le CV Builder, vous pouvez ajuster :

1. **Score Minimum** (`minScore`) :
   - **30** : Inclut plus de widgets (profil pauvre)
   - **50** : Standard (défaut)
   - **60** : Plus sélectif (profil riche)
   - **70** : Très sélectif (profil excellent)

2. **Max Expériences** :
   - Limite le nombre d'expériences affichées
   - Défaut : 6 expériences

3. **Max Bullets par Expérience** :
   - Limite les réalisations par expérience
   - Défaut : 6 bullets

**Recommandations** :
- Profil RAG < 50 : `minScore = 30`
- Profil RAG 50-70 : `minScore = 50`
- Profil RAG 70-85 : `minScore = 60`
- Profil RAG > 85 : `minScore = 70`

---

## Édition CV

### Switch Thème Instantané

1. Dans le CV Builder, sélectionnez un template :
   - **Modern** : Design moderne et spacieux
   - **Tech** : Optimisé pour postes techniques
   - **Compact** : Format dense, maximum d'infos
   - **Spacious** : Beaucoup d'espace, design aéré

2. Le changement est **instantané** (< 200ms) grâce au client-side processing
3. Aucune re-génération requise

### Drag & Drop Sections

1. Cliquez sur une section (expérience, compétence, etc.)
2. Glissez-déposez pour réorganiser
3. L'ordre est sauvegardé automatiquement

**Sections réorganisables** :
- Expériences professionnelles
- Compétences
- Formations
- Projets

### Édition Widgets

1. Cliquez sur un widget pour l'éditer
2. Modifiez le texte directement
3. Ajustez le score de pertinence si nécessaire
4. Sauvegardez les modifications

**Types de widgets éditables** :
- Bullets d'expérience
- Compétences
- Résumé professionnel
- Projets

### Export PDF

1. Cliquez sur **"Exporter PDF"**
2. Le PDF est généré instantanément (navigateur)
3. Téléchargez le fichier

**Options d'export** :
- Format A4 standard
- Marges optimisées pour impression
- Couleurs préservées
- Mise en page responsive

---

## Fonctionnalités Avancées

### Export JSON Widgets

Pour analyser les widgets bruts générés par l'IA :

1. Dans le CV Builder, cliquez sur **"Export JSON"**
2. Le fichier `widgets_<analysisId>_<date>.json` est téléchargé
3. Ouvrez avec un éditeur JSON pour analyser

**Contenu du fichier** :
- Tous les widgets générés (même ceux filtrés)
- Scores de pertinence
- Références RAG (sources)
- Métadonnées (modèle utilisé, date)

**Usage** :
- Analyse de la qualité des widgets
- Debugging si problème de contenu
- Traitement externe des données

### Multi-Template Preview

Comparez votre CV sur plusieurs templates simultanément :

1. Cliquez sur **"Comparer Templates"**
2. Sélectionnez 2-3 templates à comparer
3. Visualisez côte à côte
4. Choisissez le meilleur pour votre candidature

**Templates disponibles** :
- Modern Spacious
- Tech Optimized
- Compact ATS
- Classic Professional

### Validation Warnings

Le système détecte automatiquement les problèmes potentiels :

**Types de warnings** :
- ⚠️ **Contenu non validé** : Widget non vérifié contre RAG source
- ⚠️ **Score faible** : Widget avec score < minScore
- ⚠️ **Doublons** : Widgets similaires détectés
- ⚠️ **Données manquantes** : Informations incomplètes

**Actions** :
- Cliquez sur un warning pour voir les détails
- Corrigez les problèmes identifiés
- Régénérez si nécessaire

### Cache et Performance

Le système utilise un cache intelligent :

**Cache Serveur** :
- Widgets mis en cache 24h
- Génération instantanée pour analyses répétées
- Réduction coûts API

**Cache Client** :
- Widgets et CVData en localStorage
- Switch thème instantané
- Pas de re-génération inutile

**Indicateurs** :
- Badge "Cached" si widgets récupérés du cache
- Temps de génération affiché
- Statistiques de performance

---

## FAQ

### Pourquoi mon profil RAG a un score faible ?

**Causes possibles** :
- Documents insuffisants ou de mauvaise qualité
- Informations manquantes (dates, entreprises, réalisations)
- Extraction texte incomplète

**Solutions** :
- Uploadez plus de documents (CV détaillé, lettres de motivation)
- Vérifiez que les PDFs sont lisibles (pas d'images scannées)
- Complétez manuellement les informations manquantes

### Mon CV généré est incomplet

**Causes possibles** :
- `minScore` trop élevé (trop de widgets filtrés)
- Profil RAG incomplet
- Offre d'emploi peu alignée avec votre profil

**Solutions** :
- Réduisez `minScore` (ex: 30 au lieu de 50)
- Enrichissez votre profil RAG
- Vérifiez les widgets filtrés dans l'export JSON

### Le cache ne fonctionne pas

**Vérifications** :
- L'analyse d'offre doit être identique (même `analysisId`)
- Le profil RAG ne doit pas avoir changé
- Attendez quelques secondes entre les requêtes

**Si problème persiste** :
- Vérifiez les logs serveur
- Contactez le support technique

### Comment améliorer mon Match Score ?

**Actions** :
1. Enrichissez votre profil RAG avec plus de documents
2. Mettez à jour vos compétences dans le profil
3. Ajoutez des réalisations quantifiées (chiffres, pourcentages)
4. Utilisez les keywords manquants identifiés dans l'analyse

### Puis-je utiliser V1 et V2 ?

**Oui** :
- V1 : Génération rapide, format standard
- V2 : Génération optimisée, personnalisable, meilleure qualité

**Recommandation** :
- Utilisez V2 pour candidatures importantes
- Utilisez V1 pour génération rapide de base

### Les widgets sont-ils modifiables ?

**Oui** :
- Édition directe dans le CV Builder
- Modification des scores
- Ajout/suppression de widgets
- Réorganisation par drag & drop

**Limitations** :
- Les modifications ne sont pas sauvegardées dans le RAG
- Régénération réinitialise les modifications

---

## Support

Pour toute question ou problème :

1. Consultez la [documentation technique](../ARCHITECTURE_V2.md)
2. Vérifiez les [codes d'erreur API](./API_V2.md)
3. Contactez le support : support@cvcrush.com

---

## Conseils Pro

### Optimiser votre Profil RAG

1. **Quantifiez vos réalisations** :
   - "Augmenté les ventes de 30%"
   - "Géré une équipe de 10 personnes"
   - "Réduit les coûts de 50k€"

2. **Utilisez des keywords techniques** :
   - Technologies précises (React, Node.js, Python)
   - Méthodologies (Agile, Scrum, DevOps)
   - Outils (Jira, Git, Docker)

3. **Détaillez vos responsabilités** :
   - Actions concrètes (développé, géré, optimisé)
   - Contexte (équipe, budget, délais)
   - Résultats mesurables

### Maximiser le Match Score

1. **Analysez plusieurs offres similaires** :
   - Identifiez les keywords récurrents
   - Ajoutez-les à votre profil RAG

2. **Personnalisez par offre** :
   - Ajustez `minScore` selon l'offre
   - Mettez en avant les expériences pertinentes

3. **Utilisez les coaching tips** :
   - Suivez les recommandations d'approche
   - Préparez les points de vente identifiés

---

**Bonne chance dans vos candidatures ! 🚀**
