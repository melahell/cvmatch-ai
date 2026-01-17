# 🎯 Optimisations Restantes pour 100% Lighthouse

**État actuel** : 95/100 (moyenne)
**Objectif** : 98-100/100
**Temps estimé** : 2-3 jours de travail

---

## 📊 Détail par Catégorie

### ⚡ Performance: 92 → 98/100 (+6 points) - 4h

#### 1. Mémoïsation React Complète (2h)

**Hooks à optimiser** :
```tsx
// hooks/useRAGData.ts
const ragData = useMemo(() => processRAG(rawData), [rawData])

// hooks/useDashboardData.ts
const stats = useMemo(() => computeStats(data), [data])
const handleRefresh = useCallback(() => refetch(), [refetch])

// hooks/useJobAnalyses.ts
const filteredJobs = useMemo(
  () => jobs.filter(j => j.status === filter),
  [jobs, filter]
)
```

**Composants à mémoïser** :
- `components/dashboard/StatsCard.tsx` - React.memo
- `components/analyze/AnalysisCard.tsx` - React.memo + useCallback
- `components/profile/ExperienceItem.tsx` - React.memo

#### 2. Lazy Loading Restant (1h)

```tsx
// app/dashboard/page.tsx
const DashboardCharts = dynamic(
  () => import('@/components/dashboard/DashboardCharts'),
  { loading: () => <LoadingSpinner />, ssr: false }
)

// app/dashboard/stats/page.tsx
const Recharts = dynamic(() => import('recharts'), { ssr: false })
```

#### 3. Supabase Client Singleton (30min)

```tsx
// lib/supabase.ts
let _client: SupabaseClient | null = null

export const getSupabaseClient = () => {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}
```

Remplacer partout : `createSupabaseClient()` → `getSupabaseClient()`

#### 4. Prefetching avec RSC (30min)

```tsx
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await fetchDashboardData() // Parallèle
  return <DashboardClient data={data} />
}
```

---

### ♿ Accessibility: 95 → 100/100 (+5 points) - 2h

#### 1. Tooltips Textes Tronqués (1h)

**Fichiers à modifier** :
```tsx
// components/tracking/JobCard.tsx:ligne 47
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

<Tooltip>
  <TooltipTrigger asChild>
    <h3 className="font-semibold truncate">{job.job_title}</h3>
  </TooltipTrigger>
  <TooltipContent>{job.job_title}</TooltipContent>
</Tooltip>

// components/cvs/CVCard.tsx:ligne 36
<Tooltip>
  <TooltipTrigger asChild>
    <h3 className="font-semibold truncate">{title}</h3>
  </TooltipTrigger>
  <TooltipContent>{title}</TooltipContent>
</Tooltip>

// components/dashboard/RecentActivity.tsx
// Partout où il y a className="truncate"
```

#### 2. Focus Management Modals (30min)

```tsx
// components/layout/DashboardLayout.tsx:82-93
const triggerRef = useRef<HTMLButtonElement>(null)

<button
  ref={triggerRef}
  onClick={() => setMenuOpen(!menuOpen)}
  aria-expanded={menuOpen}
>

const handleClose = () => {
  setMenuOpen(false)
  setTimeout(() => triggerRef.current?.focus(), 0)
}
```

**Appliquer sur** :
- DashboardLayout (dropdown menu) ✅ À faire
- ExportDataModal
- KeyboardShortcutsModal

#### 3. Aria-labels Complets (30min)

**Fichiers restants** :
```tsx
// app/dashboard/analyze/page.tsx
<button aria-label="Analyser l'offre d'emploi">
  <Search className="w-4 h-4" />
</button>

// app/dashboard/cvs/page.tsx
<button aria-label="Télécharger le CV">
  <Download className="w-4 h-4" />
</button>

// app/dashboard/tracking/page.tsx
<button aria-label="Archiver la candidature">
  <Archive className="w-4 h-4" />
</button>
```

---

### ✅ Best Practices: 95 → 100/100 (+5 points) - 3h

#### 1. Nettoyer console.log (2h)

**Utiliser le script** :
```bash
bash scripts/cleanup-console-logs.sh
```

**Remplacement** :
```tsx
// ❌ Avant
console.log("CV fetched:", data)

// ✅ Après
import { logger } from '@/lib/utils/logger'
logger.debug("CV fetched", { cvId: data.id })
```

**Fichiers prioritaires** (30 fichiers critiques) :
- `components/**/*.tsx` (60 occurrences)
- `app/dashboard/**/*.tsx` (50 occurrences)
- Garder dans : error.tsx, ErrorBoundary.tsx, logger.ts

#### 2. CSP Stricte (30min)

```js
// next.config.js
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs this
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' *.supabase.co",
  ].join('; ')
}
```

#### 3. Vérifier HTTPS (30min)

```bash
# Chercher http:// (devrait être https://)
grep -r "http://" --include="*.ts" --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  . | grep -v "localhost"
```

---

### 🔍 SEO: 96 → 100/100 (+4 points) - 2h

#### 1. Metadata Pages Dashboard (1h)

```tsx
// app/dashboard/analyze/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Analyser une offre - CV Crush",
  description: "Analysez vos chances avec l'IA et générez un CV personnalisé",
}

// app/dashboard/cvs/page.tsx
export const metadata: Metadata = {
  title: "Mes CVs - CV Crush",
  description: "Gérez vos CVs générés et téléchargez-les",
}

// app/dashboard/tracking/page.tsx
export const metadata: Metadata = {
  title: "Suivi candidatures - CV Crush",
  description: "Suivez l'état de vos candidatures",
}

// app/dashboard/profile/page.tsx
export const metadata: Metadata = {
  title: "Mon profil - CV Crush",
  description: "Gérez votre profil professionnel",
}
```

#### 2. Images Alt Descriptifs (30min)

```tsx
// components/profile/PhotoUpload.tsx
<Image
  src={preview}
  alt={`Photo de profil de ${profileName || 'utilisateur'}`}
  width={96}
  height={96}
/>

// components/cv/CVRenderer.tsx
{photoUrl && (
  <img
    src={photoUrl}
    alt={`Photo professionnelle de ${nom} ${prenom}`}
  />
)}
```

#### 3. JSON-LD Étendu (30min)

```tsx
// app/page.client.tsx - Ajouter après le premier script
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Comment fonctionne CV Crush ?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "CV Crush analyse l'offre d'emploi et génère un CV personnalisé..."
    }
  }]
})}
</script>
```

---

## 🚀 Plan d'Exécution Recommandé

### Jour 1 (4h) - Performance + Accessibilité
1. ✅ Mémoïsation React (2h)
2. ✅ Lazy loading restant (1h)
3. ✅ Tooltips (1h)

### Jour 2 (3h) - Best Practices
1. ✅ Nettoyer console.log (2h)
2. ✅ CSP + HTTPS (1h)

### Jour 3 (2h) - SEO
1. ✅ Metadata pages (1h)
2. ✅ Alt text + JSON-LD (1h)

---

## 📦 Scripts Utiles

### Lancer le cleanup console.log
```bash
bash scripts/cleanup-console-logs.sh
```

### Vérifier les images non-HTTPS
```bash
grep -r "http://" app/ components/ --include="*.tsx" | grep -v "localhost"
```

### Compter les optimisations restantes
```bash
# Composants sans React.memo
find components/ -name "*.tsx" -exec grep -L "React.memo" {} \;

# Fichiers avec console.log
grep -r "console\.log" app/ components/ --include="*.tsx" | wc -l
```

---

## 🎯 Résultat Attendu

**Après ces optimisations** :

```
Performance:    92 → 98/100 (+6) 🟢
Accessibility:  95 → 100/100 (+5) 🟢
Best Practices: 95 → 100/100 (+5) 🟢
SEO:           96 → 100/100 (+4) 🟢

Score global: 9.5 → 9.95/10
```

---

## 💡 Conseils

1. **Tester après chaque changement** : `npm run build && npm run start`
2. **Lighthouse CI** : `npm run lighthouse` (si configuré)
3. **Vérifier re-renders** : React DevTools Profiler
4. **Bundle analyzer** : `npm run analyze` (si configuré)

---

**Prêt à démarrer ? Suivez le plan jour par jour ! 🚀**
