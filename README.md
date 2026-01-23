# cvcrush
AI-powered CV generator with job matching - Next.js 14 + Supabase + Gemini AI

## Génération CV V2 (Widgets)

CV-Crush propose maintenant une architecture V2 pour la génération de CV, basée sur un système de widgets scorés.

### Architecture V2

L'architecture V2 sépare la génération de contenu (IA) du rendu visuel via un système de "widgets" scorés :

- **Cerveau (IA)** : Génère des widgets de contenu avec scores de pertinence
- **Bridge (Adaptateur)** : Convertit et trie les widgets selon leur pertinence
- **Corps (Renderer)** : Affiche le CV final avec les templates existants

### Avantages V2

- ✅ **Meilleure traçabilité** : Chaque élément de contenu est référencé vers sa source RAG
- ✅ **Contrôle qualité** : Filtrage et tri déterministes basés sur les scores
- ✅ **Flexibilité** : Options configurables (minScore, maxExperiences, etc.)
- ✅ **Métadonnées riches** : Stats détaillées (widgets_total, widgets_filtered)
- ✅ **Testabilité** : Conversion déterministe facilement testable

### Utilisation

1. Analyser une offre d'emploi : `/dashboard/analyze`
2. Cliquer sur "Générer avec V2 (Widgets)" dans la page d'analyse
3. Le CV généré affiche un badge "V2 Widgets" avec les statistiques

### Documentation

Pour plus de détails sur l'architecture V2, consultez [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md).

### Différences V1 vs V2

| Aspect | V1 | V2 |
|--------|----|----|
| Architecture | Monolithique | 3 couches (Cerveau/Bridge/Corps) |
| Génération | Prompt unique → CV direct | Prompt → Widgets → Conversion |
| Contrôle qualité | Dans le prompt | Post-traitement déterministe |
| Métadonnées | Basiques | Riches (scores, widgets) |

