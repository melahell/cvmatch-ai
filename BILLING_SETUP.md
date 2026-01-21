# Configuration paiements (Stripe) et variables d’environnement

## Objectif
Mettre en place le checkout Stripe, le portail client et le webhook pour synchroniser l’abonnement côté Supabase.

## Variables d’environnement requises
À définir dans votre plateforme d’hébergement et en local si besoin.

```
NEXT_PUBLIC_SITE_URL=https://votre-domaine.tld
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
```

## Où les obtenir dans Stripe

### 1. STRIPE_SECRET_KEY
- Stripe Dashboard → Developers → API keys
- Utiliser la clé secrète Live en production

### 2. STRIPE_PRICE_PRO / STRIPE_PRICE_TEAM
- Stripe Dashboard → Products
- Créer 2 produits d’abonnement (Pro / Team)
- Copier l’ID du Price (price_...)

### 3. STRIPE_WEBHOOK_SECRET
- Stripe Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://votre-domaine.tld/api/billing/webhook`
- Événements à cocher:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copier le secret signé `whsec_...`

## Tests rapides

### 1. Checkout
- Page: `/dashboard/settings`
- Bouton “Passer Pro” → redirection Stripe
- Paiement OK → retour vers `/dashboard/settings?checkout=success`

### 2. Portail client
- Depuis `/dashboard/settings` avec un abonnement actif
- Bouton “Gérer mon abonnement” → redirection Stripe Portal

### 3. Webhook
- Stripe Dashboard → Webhooks → “Send test event”
- Vérifier la ligne `subscription_status` dans table `users`

## Références code
- Checkout: [checkout route](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/billing/checkout/route.ts)
- Portail: [portal route](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/billing/portal/route.ts)
- Webhook: [webhook route](file:///Users/gillesgozlan/Desktop/CV-Crush/app/api/billing/webhook/route.ts)

