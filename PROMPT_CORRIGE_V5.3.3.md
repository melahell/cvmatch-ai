# Correction du Prompt RAG - Résolution de la Double Contrainte

## Problème identifié
**Double contrainte (double bind)** : Le prompt demande à la fois :
- "Déploie en 4-8 réalisations avec détails opérationnels"
- "N'invente RIEN qui n'est pas explicitement écrit"

Résultat : L'IA bloque et reste minimaliste par peur de violer les règles.

## Solutions appliquées

### 1. Zone grise autorisée (Inférence contrôlée)
**AVANT** : "⛔ Si une info n'est PAS dans le document → NE L'AJOUTE PAS"
**APRÈS** : "Tu es autorisé à déduire les outils standards et étapes logiques implicites liées à un poste, tant que cela reste cohérent avec le niveau de séniorité. Marque ces éléments comme 'is_inferred: true' avec justification."

### 2. Structure JSON forcée (Schema Enforcement)
**AVANT** : Schéma JSON minimal
**APRÈS** : Structure qui oblige la verbosité avec champs détaillés :
- `actions_detaillees[]` (min 5 items)
- `outils_deduits[]` (avec justification)
- `contexte_operationnel` (texte long)

### 3. Clarification du déploiement
**AVANT** : "Déploie en détails (outils probables)"
**APRÈS** : "Déploie en détails UNIQUEMENT à partir de ce qui est écrit ou logiquement déductible. Pour chaque déduction, fournis une justification."

### 4. Priorité au document le plus riche
**AVANT** : "Priorité au nouveau document"
**APRÈS** : "Si plusieurs documents parlent de la même expérience, agrège TOUS les détails. Le document le plus détaillé prime pour enrichir les autres."
