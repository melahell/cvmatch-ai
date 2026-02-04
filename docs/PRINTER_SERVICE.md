# Printer service (optionnel)

Objectif : sortir la génération PDF Chromium des routes Next.js pour gagner en stabilité (fonts), en performance et en capacité de scaling, à la manière de Reactive Resume (service “Printer”).

## Approche
- Déployer un service dédié qui expose une API HTTP (ex: `POST /render/pdf`) recevant une URL à rendre (page `/print`) + des headers (Authorization).
- Le service lance Chromium (headless) et renvoie un PDF en streaming.

## Intégration côté CV-Crush
- Conserver les pages `/print` comme source unique de vérité du rendu.
- Remplacer la génération Puppeteer dans les routes Next par un appel HTTP vers le service Printer si `PRINTER_URL` est défini.
- Garder un fallback local (Puppeteer direct) si `PRINTER_URL` est absent.

## Déploiement
- Variante simple : utiliser un service “Chrome as a service” type Browserless.
- Variante autonome : service Node+Puppeteer dans un container dédié (recommandé si vous voulez contrôler fonts et perf).

