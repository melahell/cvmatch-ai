# 10 PROPOSITIONS - CONSENTEMENT GOOGLE GEMINI

## Question: Comment gérer le consentement explicite pour l'envoi des données à Google Gemini?

---

## ✅ PROPOSITION 1: Banner de Consentement à l'Onboarding (RECOMMANDÉ)

**Quand:** Lors du premier upload de CV, avant l'extraction

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Analyse IA de votre CV                                   │
│                                                              │
│ Pour extraire et analyser votre CV, nous utilisons Google   │
│ Gemini AI. Vos données (nom, expériences, compétences)      │
│ seront traitées par Google Cloud Platform.                  │
│                                                              │
│ ☐ J'accepte que mes données CV soient analysées par        │
│   Google Gemini pour améliorer mon profil                   │
│                                                              │
│ [En savoir plus sur la protection des données]              │
│                                                              │
│ [ Annuler ]  [ ✓ Accepter et Continuer ]                   │
└─────────────────────────────────────────────────────────────┘
```

**Implémentation:**
- Ajouter `gemini_consent: BOOLEAN` dans table `users`
- Bloquer `/api/rag/generate` si `gemini_consent = false`
- Afficher popup avant l'extraction

**Avantages:** ✅ Conforme RGPD, ✅ Clair, ✅ Non-intrusif
**Inconvénients:** ⚠️ Friction dans l'onboarding

---

## 🔄 PROPOSITION 2: Opt-Out avec Consentement par Défaut

**Quand:** À l'inscription, consentement pré-coché mais révocable

**UI:**
```
Paramètres > Confidentialité

Intelligence Artificielle
☑ Autoriser l'analyse IA de mon profil avec Google Gemini
  Pour améliorer la qualité des analyses de match et CV générés

  [En savoir plus] [Révoquer le consentement]
```

**Implémentation:**
- `gemini_consent = true` par défaut lors de la création user
- Toggle dans Settings pour révoquer
- Si révoqué → basculer sur extraction manuelle ou mode dégradé

**Avantages:** ✅ Pas de friction, ✅ Transparence
**Inconvénients:** ❌ Opt-out moins conforme RGPD (doit être opt-in)

---

## 📄 PROPOSITION 3: Consentement dans les CGU/Politique de Confidentialité

**Quand:** À l'inscription, checkbox "J'accepte les CGU"

**UI:**
```
☐ J'accepte les Conditions Générales d'Utilisation et la
  Politique de Confidentialité, incluant le traitement de mes
  données par Google Gemini AI

[Lire les CGU] [Lire la Politique de Confidentialité]
```

**Implémentation:**
- Consentement global dans les CGU
- Section dédiée "Traitement par des tiers (Google Gemini)"
- `gemini_consent = true` si CGU acceptées

**Avantages:** ✅ Simple, ✅ Standard
**Inconvénients:** ❌ Peu visible, ❌ Consentement "noyé" dans les CGU

---

## 🎯 PROPOSITION 4: Consentement Granulaire par Fonctionnalité

**Quand:** Avant chaque action nécessitant Gemini

**UI:**
```
Vous êtes sur le point d'analyser une offre d'emploi

Cette analyse nécessite l'envoi de votre profil à Google Gemini.
Les données suivantes seront partagées:
• Nom et prénom
• Expériences professionnelles (entreprises, postes, dates)
• Compétences techniques
• Formations

Vos coordonnées (email, téléphone) NE SONT PAS partagées.

☐ Autoriser pour cette analyse uniquement
☐ Toujours autoriser (ne plus me demander)

[ Analyser sans IA (mode manuel) ]  [ Autoriser et Analyser ]
```

**Implémentation:**
- Popup modale avant `/api/match/analyze`
- Choix granulaire: "cette fois" vs "toujours"
- Option fallback sans IA

**Avantages:** ✅ Transparence maximale, ✅ Contrôle utilisateur
**Inconvénients:** ❌ Trop de friction, ❌ UX dégradée

---

## 🔐 PROPOSITION 5: Consentement avec Anonymisation

**Quand:** Consentement global + anonymisation automatique

**UI:**
```
🔒 Protection de vos données

CVMatch utilise l'IA pour analyser votre profil. Pour protéger
votre vie privée:

✓ Vos coordonnées (email, téléphone) sont MASQUÉES avant envoi
✓ Seules vos compétences et expériences sont analysées
✓ Aucune donnée n'est conservée par Google après traitement

☐ J'autorise l'analyse IA anonymisée de mon profil

[En savoir plus sur notre protection des données]
```

**Implémentation:**
- Fonction `sanitizeProfileForAI()` qui masque email/tel/linkedin
- Envoi uniquement des données professionnelles anonymisées
- Consentement simplifié car données anonymes

**Avantages:** ✅ Meilleure protection, ✅ Moins contraignant RGPD
**Inconvénients:** ⚠️ Nécessite dev de la fonction d'anonymisation

---

## ⚡ PROPOSITION 6: Consentement Progressif (Lazy Consent)

**Quand:** Demander le consentement au moment du besoin

**Flux:**
1. User upload CV → Extraction locale (regex simple) sans Gemini
2. User clique "Analyser un job" → Popup: "Pour des analyses IA précises, autoriser Google Gemini?"
3. User accepte → Toutes les futures analyses utilisent Gemini

**UI:**
```
🚀 Débloquez les analyses IA avancées

Pour obtenir des analyses de match plus précises et des CV
optimisés, nous recommandons d'activer Google Gemini AI.

Actuellement: Extraction basique activée ✓
Avec Gemini:  Analyses IA avancées 🔒

[ Continuer sans IA ]  [ Activer Gemini AI ]
```

**Avantages:** ✅ Pas de friction initiale, ✅ Upsell naturel
**Inconvénients:** ⚠️ Double implémentation (avec/sans Gemini)

---

## 📊 PROPOSITION 7: Consentement avec Transparence Temps Réel

**Quand:** Consentement global + dashboard de transparence

**UI Settings:**
```
Historique d'utilisation de l'IA

Vos données ont été envoyées à Google Gemini:
• 15 jan 2026 - Analyse job "Senior PMO Volkswagen" ✓
• 14 jan 2026 - Génération CV optimisé ✓
• 12 jan 2026 - Extraction profil initial ✓

Total: 3 requêtes ce mois-ci

[Révoquer l'accès Gemini] [Supprimer l'historique]
```

**Implémentation:**
- Table `gemini_api_logs` avec historique des appels
- Dashboard pour voir quand les données ont été envoyées
- Révocation possible à tout moment

**Avantages:** ✅ Transparence totale, ✅ Confiance utilisateur
**Inconvénients:** ⚠️ Complexité dev (logging détaillé)

---

## 🎨 PROPOSITION 8: Consentement Visuel/Ludique

**Quand:** Onboarding interactif avec illustration

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│                    🧠 Votre Assistant IA                     │
│                                                              │
│         [VOUS] ──→ 📄 CV ──→ 🤖 Gemini ──→ ✨ Analyse       │
│                                                              │
│  Gemini analyse votre CV pour:                              │
│  ✓ Extraire vos compétences                                 │
│  ✓ Identifier vos points forts                              │
│  ✓ Générer des CV optimisés ATS                             │
│                                                              │
│  🔒 Vos données sont traitées selon les standards Google    │
│     Cloud Platform (certifié ISO 27001, SOC 2, RGPD)        │
│                                                              │
│  [ Non merci ]  [ 🚀 Activer mon assistant IA ]            │
└─────────────────────────────────────────────────────────────┘
```

**Avantages:** ✅ UX engageante, ✅ Pédagogique
**Inconvénients:** ⚠️ Design + dev

---

## 🏢 PROPOSITION 9: Consentement avec Alternative Locale

**Quand:** Offrir un choix: Gemini Cloud vs Traitement Local

**UI:**
```
Choisissez votre mode d'analyse:

○ ☁️ Analyse Cloud (Google Gemini) - RECOMMANDÉ
  • Analyses IA ultra-précises
  • CV optimisés pour ATS
  • Suggestions de carrière avancées
  ⚠️ Nécessite l'envoi de vos données à Google Cloud

○ 💻 Analyse Locale (sur votre navigateur)
  • Vos données restent sur votre appareil
  • Extraction basique par regex
  • Pas d'analyse IA avancée

[Continuer]
```

**Implémentation:**
- Mode "local": Extraction regex simple côté client
- Mode "cloud": Google Gemini API
- Toggle dans Settings pour changer

**Avantages:** ✅ Choix utilisateur, ✅ Privacy-friendly
**Inconvénients:** ❌ Double implémentation complexe

---

## 📱 PROPOSITION 10: Consentement Mobile-First (Bottom Sheet)

**Quand:** Onboarding mobile avec bottom sheet moderne

**UI (Mobile):**
```
        ╔═════════════════════════════════╗
        ║                                 ║
        ║    [Swipe up for more info]    ║
╔═══════╩═════════════════════════════════╩═══════╗
║                                                  ║
║  🤖 Analyse IA avec Google Gemini               ║
║                                                  ║
║  Pour analyser votre CV et générer des insights ║
║                                                  ║
║  ✓ Analyses rapides et précises                 ║
║  ✓ Conforme RGPD                                ║
║  ✓ Données supprimables à tout moment           ║
║                                                  ║
║  [Tap: Swipe up to read Privacy Policy]         ║
║                                                  ║
║            [ Autoriser l'IA ]                   ║
║            [ Continuer sans IA ]                ║
╚══════════════════════════════════════════════════╝
```

**Avantages:** ✅ UX mobile native, ✅ Moderne
**Inconvénients:** ⚠️ Design mobile-specific

---

## 🏆 RECOMMANDATION FINALE

**Combiner PROPOSITION 1 + PROPOSITION 5 + PROPOSITION 7:**

1. **Banner de consentement à l'onboarding** (Prop 1)
2. **Anonymisation automatique** email/tel/linkedin (Prop 5)
3. **Dashboard de transparence** dans Settings (Prop 7)

**Pourquoi?**
- ✅ Conforme RGPD (opt-in explicite)
- ✅ Protection renforcée (anonymisation)
- ✅ Transparence totale (historique visible)
- ✅ UX acceptable (1 seule popup à l'onboarding)

---

## Implémentation Recommandée

### Schéma BDD
```sql
ALTER TABLE users ADD COLUMN gemini_consent BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN gemini_consent_date TIMESTAMP;

CREATE TABLE gemini_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100), -- 'rag_extraction', 'job_analysis', 'cv_generation', 'lm_generation'
    data_sent JSONB,     -- Quelles données ont été envoyées (anonymisées)
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Route à modifier
```typescript
// app/api/rag/generate/route.ts - Ajouter avant l'appel Gemini
const { data: user } = await supabase
    .from("users")
    .select("gemini_consent")
    .eq("id", userId)
    .single();

if (!user?.gemini_consent) {
    return NextResponse.json({
        error: "consent_required",
        message: "Veuillez autoriser l'analyse IA dans vos paramètres"
    }, { status: 403 });
}

// Anonymiser avant envoi
const sanitizedProfile = sanitizeProfileForAI(ragData);

// Logger l'action
await supabase.from("gemini_api_logs").insert({
    user_id: userId,
    action: 'rag_extraction',
    data_sent: { fields: ['profil', 'experiences', 'competences'] }
});
```

---

**Quelle proposition préférez-vous?**
