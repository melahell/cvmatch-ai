# 5 ÉLÉMENTS UI - RENDRE LE DROIT À L'OUBLI ÉVIDENT

## Problème Actuel

✅ Le CASCADE DELETE est configuré en base de données
❌ MAIS l'utilisateur n'a AUCUN moyen de supprimer ses données lui-même
❌ Pas d'endpoint API `/api/user/delete`
❌ Pas de bouton dans l'interface

**→ Non-conforme RGPD Article 17 (Droit à l'effacement)**

---

## 🎯 5 ÉLÉMENTS À IMPLÉMENTER

### 1️⃣ BOUTON "SUPPRIMER MON COMPTE" DANS SETTINGS

**Localisation:** Page Settings principale

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Paramètres                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Profil                                                       │
│ Confidentialité                                              │
│ Notifications                                                │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ 🗑️ Zone Danger                                              │
│                                                              │
│ Supprimer mon compte                                         │
│ Cette action est irréversible. Toutes vos données seront    │
│ définitivement supprimées (CV, analyses, profil RAG).       │
│                                                              │
│ [ 🗑️ Supprimer mon compte et mes données ]                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Fichier à créer:** `app/settings/page.tsx` (ou modifier existant)

**Code:**
```typescript
<div className="border-t border-red-200 pt-6 mt-6">
  <h3 className="text-red-600 font-semibold mb-2">🗑️ Zone Danger</h3>
  <p className="text-sm text-gray-600 mb-4">
    Supprimer mon compte
  </p>
  <p className="text-xs text-gray-500 mb-4">
    Cette action est irréversible. Toutes vos données seront
    définitivement supprimées (CV, analyses, profil RAG).
  </p>
  <button
    onClick={() => setShowDeleteModal(true)}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    🗑️ Supprimer mon compte et mes données
  </button>
</div>
```

---

### 2️⃣ MODALE DE CONFIRMATION SÉCURISÉE

**Quand:** Après avoir cliqué sur "Supprimer mon compte"

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│                    ⚠️ Confirmer la Suppression              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Vous êtes sur le point de supprimer définitivement votre    │
│ compte et toutes vos données:                                │
│                                                              │
│ ✓ Profil RAG (compétences, expériences)                     │
│ ✓ CVs uploadés et générés                                   │
│ ✓ Analyses de jobs et lettres de motivation                 │
│ ✓ Historique et analytics                                   │
│                                                              │
│ Cette action est IRRÉVERSIBLE.                               │
│                                                              │
│ Pour confirmer, tapez: SUPPRIMER                             │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ [Input field]                                         │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│        [ Annuler ]  [ ⚠️ Supprimer Définitivement ]         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Code:**
```typescript
const [confirmText, setConfirmText] = useState("");

const handleDelete = async () => {
  if (confirmText !== "SUPPRIMER") {
    alert("Veuillez taper SUPPRIMER pour confirmer");
    return;
  }

  const response = await fetch("/api/user/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  if (response.ok) {
    // Déconnexion + redirection
    window.location.href = "/goodbye";
  }
};
```

---

### 3️⃣ ENDPOINT API `/api/user/delete`

**Fichier à créer:** `app/api/user/delete/route.ts`

**Code:**
```typescript
import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    const supabase = createSupabaseClient();

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "userId required" },
                { status: 400 }
            );
        }

        // Log de l'action (audit trail)
        console.log(`[GDPR] User ${userId} requested account deletion`);

        // Supprimer l'utilisateur
        // CASCADE DELETE supprimera automatiquement:
        // - rag_metadata
        // - uploaded_documents
        // - job_analyses
        // - cv_generations
        // - analytics_events
        const { error } = await supabase
            .from("users")
            .delete()
            .eq("id", userId);

        if (error) {
            console.error("Delete Error:", error);
            return NextResponse.json(
                { error: "Delete failed" },
                { status: 500 }
            );
        }

        // Supprimer les fichiers Supabase Storage
        const { data: files } = await supabase
            .storage
            .from("documents")
            .list(userId);

        if (files && files.length > 0) {
            const filePaths = files.map(f => `${userId}/${f.name}`);
            await supabase.storage.from("documents").remove(filePaths);
        }

        console.log(`[GDPR] User ${userId} successfully deleted`);

        return NextResponse.json({
            success: true,
            message: "Account and all data deleted"
        });

    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
```

---

### 4️⃣ SECTION "MES DONNÉES" DANS SETTINGS

**Localisation:** Page Settings > Confidentialité

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔒 Mes Données Personnelles (RGPD)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Vous avez le contrôle total sur vos données:                │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📊 Voir mes données                                   │   │
│ │ Consultez toutes les données que nous stockons       │   │
│ │ sur vous (profil, CVs, analyses)                      │   │
│ │                                       [Voir]          │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 💾 Télécharger mes données                            │   │
│ │ Exportez toutes vos données au format JSON           │   │
│ │ (conforme RGPD Article 20 - Portabilité)             │   │
│ │                                       [Télécharger]   │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 🗑️ Supprimer mes données                              │   │
│ │ Suppression définitive de votre compte et toutes     │   │
│ │ vos données (conforme RGPD Article 17)               │   │
│ │                                       [Supprimer]     │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**3 boutons clairs:**
1. **Voir mes données** → Modal avec preview des données
2. **Télécharger mes données** → Export JSON (Article 20 RGPD)
3. **Supprimer mes données** → Droit à l'oubli (Article 17 RGPD)

---

### 5️⃣ PAGE DE CONFIRMATION POST-SUPPRESSION

**Localisation:** `/goodbye` ou `/account-deleted`

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                        ✅                                    │
│                                                              │
│           Votre compte a été supprimé                        │
│                                                              │
│  Toutes vos données ont été définitivement effacées de      │
│  nos serveurs conformément au RGPD.                          │
│                                                              │
│  Si vous avez des questions, contactez-nous:                │
│  support@cvmatch.ai                                          │
│                                                              │
│                   [ Retour à l'accueil ]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Fichier à créer:** `app/goodbye/page.tsx`

**Code:**
```typescript
export default function GoodbyePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-4">
          Votre compte a été supprimé
        </h1>
        <p className="text-gray-600 mb-6">
          Toutes vos données ont été définitivement effacées de nos
          serveurs conformément au RGPD.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Si vous avez des questions, contactez-nous:
          <a href="mailto:support@cvmatch.ai" className="text-blue-600">
            support@cvmatch.ai
          </a>
        </p>
        <a
          href="/"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
```

---

## 📋 RÉCAPITULATIF DES 5 ÉLÉMENTS

| # | Élément | Localisation | Fichier | Statut |
|---|---------|-------------|---------|--------|
| 1 | Bouton "Supprimer mon compte" | Settings > Zone Danger | `app/settings/page.tsx` | ❌ À créer |
| 2 | Modale de confirmation | Modal popup | `components/DeleteAccountModal.tsx` | ❌ À créer |
| 3 | Endpoint API DELETE | `/api/user/delete` | `app/api/user/delete/route.ts` | ❌ À créer |
| 4 | Section "Mes Données" | Settings > Confidentialité | `app/settings/privacy/page.tsx` | ❌ À créer |
| 5 | Page post-suppression | `/goodbye` | `app/goodbye/page.tsx` | ❌ À créer |

---

## 🚀 ORDRE D'IMPLÉMENTATION

### Étape 1: Backend (30 min)
- [ ] Créer `/app/api/user/delete/route.ts`
- [ ] Tester avec Postman/curl
- [ ] Vérifier que CASCADE DELETE fonctionne
- [ ] Vérifier suppression des fichiers Storage

### Étape 2: UI Minimale (45 min)
- [ ] Ajouter bouton "Zone Danger" dans Settings
- [ ] Créer modale de confirmation basique
- [ ] Connecter au endpoint DELETE

### Étape 3: UI Complète (1h)
- [ ] Créer section "Mes Données" détaillée
- [ ] Ajouter page `/goodbye`
- [ ] Polish UI/UX

### Étape 4: Export RGPD (bonus - 30 min)
- [ ] Créer endpoint `/api/user/export`
- [ ] Bouton "Télécharger mes données"

---

## ✅ CONFORMITÉ RGPD

Avec ces 5 éléments, vous serez conforme:

| Article RGPD | Exigence | Implémenté |
|--------------|----------|------------|
| Article 17 | Droit à l'effacement | ✅ Bouton + API |
| Article 20 | Droit à la portabilité | ⚠️ Bonus (export JSON) |
| Article 15 | Droit d'accès | ✅ Section "Voir mes données" |

---

**Temps total estimé: 2h30 de développement**

Voulez-vous que j'implémente ces éléments maintenant?
