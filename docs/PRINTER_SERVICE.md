# Printer service (optionnel)

Objectif : sortir la génération PDF Chromium des routes Next.js pour gagner en stabilité (fonts), en performance et en capacité de scaling, à la manière de Reactive Resume (service “Printer”).

## Approche
- Déployer un service dédié qui expose une API HTTP (ex: `POST /render/pdf`) recevant une URL à rendre (page `/print`) + des headers (Authorization).
- Le service lance Chromium (headless) et renvoie un PDF en streaming.

## Intégration côté CV-Crush
- Conserver les pages `/print` comme source unique de vérité du rendu.
- Utiliser un mode “printer remote” si `PRINTER_ENDPOINT` est défini (connexion CDP/WS à Chrome/Browerless).
- Garder un fallback local (Puppeteer + @sparticuz/chromium) si `PRINTER_ENDPOINT` est absent.
- Si le printer ne peut pas joindre l’app via l’URL publique, définir `PRINTER_APP_URL` (URL interne joignable par le service printer).

## Déploiement
- Variante simple : utiliser un service “Chrome as a service” type Browserless.
- Variante autonome : service Node+Puppeteer dans un container dédié (recommandé si vous voulez contrôler fonts et perf).
