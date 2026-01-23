📋 CAHIER DES CHARGES : "AI-DRIVEN RESUME RENDERER"
1. L'Objectif
Créer une Single Page App (SPA) ultra-légère qui affiche un CV interactif (Drag & Drop) à partir d'un JSON généré par ton IA. Philosophie : 100% Client-side (Pas de serveur, pas de base de données). Le "Backend", c'est ton prompt Gemini.

2. L'Architecture "Frankenstein"
Cerveau (IA) : Gemini génère un JSON contenant tes données + scores de pertinence.

Corps (Visuel) : Le composant "Artboard" volé à Reactive Resume.

Squelette (App) : Une simple app React + Vite (générée par Cursor).

3. Fonctionnalités Clés
Import JSON : Une zone de texte pour coller le JSON que ton IA t'a craché.

Mapping Automatique : Un script (invisible) transforme ton JSON "Widgets Scored" en JSON "Reactive Resume".

Auto-Sorting : Le script injecte les éléments dans l'ordre décroissant de tes scores (les meilleurs en haut).

Rendu Visuel : Affichage immédiat du CV sur format A4.

Interactivité : Drag & Drop des sections si l'IA s'est trompée de priorité.

Export : Bouton "Imprimer en PDF" (natif navigateur, grâce au CSS de Reactive Resume).

⚔️ PLAN DE BATAILLE (Comment pomper le repo avec Cursor)
Tu ne vas pas coder. Tu vas piloter Cursor pour qu'il fasse l'extraction chirurgicale.

Étape 1 : Préparation du Terrain
Va sur GitHub, télécharge le code de Reactive Resume (Bouton "Code" -> "Download ZIP").

Dézippe-le dans un dossier SOURCE_RX.

Crée un nouveau dossier vide MON_CV_IA.

Ouvre MON_CV_IA dans Cursor.

Étape 2 : Initialisation du Projet "Receveur"
Dans le chat de Cursor (Ctrl+L), tape :

"Initialise un projet React moderne avec Vite et TailwindCSS. Je veux une structure minimale. Supprime tout le code d'exemple. Le fond de la page doit être gris foncé (#1a1a1a) pour faire ressortir une future page A4 blanche."

Étape 3 : Le Braquage (L'Extraction)
C'est l'étape critique. Reactive Resume est un "Monorepo" (plein de projets imbriqués). La pépite visuelle se trouve généralement dans libs/artboard ou libs/ui.

Prompt pour Cursor (après avoir glissé le dossier SOURCE_RX dans la fenêtre de Cursor pour qu'il ait le contexte, ou en lui demandant de scanner les fichiers clés) :

"Agis comme un expert React Senior. J'ai le code source de Reactive Resume. Je veux extraire UNIQUEMENT le moteur de rendu du CV pour l'utiliser en local sans backend.

Analyse le dossier source. Je cherche les composants qui gèrent l'affichage du CV (souvent appelés Artboard, Page, ou Template).

1. Identifie le composant racine qui prend un JSON de CV en 'props' et l'affiche. 2. Copie ce composant et toutes ses dépendances (composants enfants, types, utils) dans mon dossier src/components/resume-renderer. 3. Si une dépendance est trop complexe (liée au backend ou à l'auth), remplace-la par une version simplifiée (mock). 4. Installe les librairies tierces nécessaires (ex: dnd-kit pour le drag & drop) s'il les utilise."

(Note : Si c'est trop gros, demande-lui de se concentrer sur un template spécifique, par exemple le template "Onyx" ou "Bronzo", c'est plus facile à voler qu'un moteur générique complet).

Étape 4 : Le "Bridge" (Ton Algorithme de Tri)
Une fois que tu as le composant visuel qui marche (même avec des fausses données), il faut le brancher à ton IA.

Prompt pour Cursor :

"Ok, le rendu visuel fonctionne. Maintenant, créons le cerveau.

Crée un fichier src/utils/ai-adapter.js. Je vais te fournir deux structures JSON : 1. AI_WIDGETS_SCHEMA : Le format que mon IA génère (avec les relevance_score et les zones). 2. RX_RESUME_SCHEMA : Le format attendu par le composant Reactive Resume que nous avons extrait.

Écris une fonction convertAndSort(aiJson) qui : 1. Trie les widgets de l'IA par relevance_score décroissant. 2. Mappe ces widgets vers le format Reactive Resume. 3. Si un widget a un score < 50, ne l'inclus pas (ou mets-le dans une section 'Autre'). 4. Renvoie le JSON final prêt à être affiché."

Étape 5 : L'Assemblage Final
Prompt pour Cursor :

"Dans App.jsx, crée une interface simple : 1. À gauche : Une zone de texte (Textarea) pour coller le JSON de l'IA. 2. Un bouton 'Générer le CV'. 3. À droite : Le composant ResumeRenderer qui affiche le résultat. Quand je clique sur le bouton, lance la fonction convertAndSort et mets à jour le CV."

Pourquoi ça va marcher ?
Tu ne codes pas le PDF : Tu utilises le CSS Print de Reactive Resume (déjà parfait).

Tu ne codes pas le Design : Tu utilises leurs templates (déjà beaux).

Tu ne gères que la donnée : Ton seul "travail" est de définir les règles de tri (Step 4), ce qui est facile.