/**
 * Builder pour les expériences professionnelles
 * Extrait de ai-adapter.ts pour modularité
 * 
 * [RÉÉCRITURE COMPLÈTE] Construit les expériences depuis les widgets
 * [CDC Phase 3.2] Refactoring architecture
 */

import type { AIWidget } from "../ai-widgets";
import type { RendererResumeSchema } from "../renderer-schema";
import { findRAGExperience, formatDate, normalizeKey, cleanClientList } from "./utils";

// Type pour les options (copié de ai-adapter.ts pour éviter import circulaire)
interface BuildExperiencesOptions {
    maxExperiences: number;
    maxBulletsPerExperience: number;
    limitsBySection?: {
        maxClientsPerExperience?: number;
    };
}

/**
 * [RÉÉCRITURE COMPLÈTE] Construit les expériences depuis les widgets
 *
 * LOGIQUE SIMPLIFIÉE:
 * 1. On prend TOUS les widgets section="experiences"
 * 2. Chaque widget avec un rag_experience_id UNIQUE devient une expérience
 * 3. Les widgets sans rag_experience_id deviennent chacun une expérience
 * 4. On enrichit depuis le RAG pour les métadonnées (dates, entreprise, etc.)
 * 5. AUCUN FILTRAGE - tout est retourné, l'UI filtre via sliders
 */
export function buildExperiences(
    experienceWidgets: AIWidget[],
    opts: BuildExperiencesOptions,
    ragProfile?: any
): RendererResumeSchema["experiences"] {
    // Si aucun widget, retourner tableau vide
    if (experienceWidgets.length === 0) {
        return [];
    }

    // ÉTAPE 1: Grouper les widgets par rag_experience_id
    // Les widgets sans rag_experience_id sont groupés individuellement
    // Normalisation: exp_0, exp_1, etc. sont les IDs canoniques
    const grouped = new Map<string, AIWidget[]>();
    let orphanCounter = 0;

    // Construire une map de normalisation des IDs d'expérience
    // Gemini peut utiliser exp_0, exp_scalepay, ou d'autres formats
    const normalizeExpId = (rawId: string | undefined): string => {
        if (!rawId) return `orphan_${orphanCounter++}`;
        // Déjà au format canonique exp_N
        if (/^exp_\d+$/.test(rawId)) return rawId;
        // Format numérique brut "0", "1", etc.
        if (/^\d+$/.test(rawId)) return `exp_${rawId}`;
        // Autre format custom (exp_scalepay, etc.) - chercher dans le RAG par correspondance
        if (ragProfile?.experiences && Array.isArray(ragProfile.experiences)) {
            for (let i = 0; i < ragProfile.experiences.length; i++) {
                const ragExp = ragProfile.experiences[i];
                const ragId = ragExp.id || `exp_${i}`;
                if (ragId === rawId) return rawId; // ID valide trouvé dans RAG
                // Correspondance par nom d'entreprise dans l'ID custom
                const entreprise = (ragExp.entreprise || ragExp.client || "").toLowerCase().replace(/\s+/g, "_");
                if (entreprise && rawId.toLowerCase().includes(entreprise)) {
                    return ragId; // Normaliser vers l'ID canonique
                }
            }
        }
        return rawId; // Retourner tel quel si pas de normalisation possible
    };

    for (const widget of experienceWidgets) {
        const expId = normalizeExpId(widget.sources.rag_experience_id);
        const existing = grouped.get(expId) || [];
        existing.push(widget);
        grouped.set(expId, existing);
    }

    // ÉTAPE 2: Construire une expérience par groupe
    const experiences: RendererResumeSchema["experiences"] = [];

    for (const [expId, widgets] of grouped.entries()) {
        // Calculer le meilleur score du groupe
        const bestScore = Math.max(...widgets.map(w => w.relevance_score));

        // Collecter tous les textes (headers et bullets)
        const allTexts: string[] = [];
        let headerText: string | undefined;

        for (const widget of widgets) {
            const text = widget.text?.trim();
            if (!text) continue;

            // Le premier widget de type header ou le texte le plus long = header
            if (widget.type === "experience_header" && !headerText) {
                headerText = text;
            } else {
                allTexts.push(text);
            }
        }

        // Si pas de header explicite, utiliser le premier texte comme header
        if (!headerText && allTexts.length > 0) {
            headerText = allTexts.shift();
        }

        // Essayer de trouver l'expérience RAG correspondante
        const ragExp = findRAGExperience(expId, ragProfile, headerText);

        // Déterminer poste et entreprise
        let poste = "";
        let entreprise = "";

        if (headerText) {
            // Essayer de parser "Poste - Entreprise" depuis le header
            const separatorIndex = headerText.indexOf(" - ");
            if (separatorIndex !== -1) {
                poste = headerText.slice(0, separatorIndex).trim();
                entreprise = headerText.slice(separatorIndex + 3).trim();
            } else {
                poste = headerText;
            }
        }

        // Enrichir depuis RAG si disponible
        if (ragExp) {
            if (!poste) poste = ragExp.poste || ragExp.titre || "";
            if (!entreprise) entreprise = ragExp.entreprise || ragExp.client || "";
        }

        // Fallback si toujours vide
        if (!poste) poste = "Expérience";
        if (!entreprise) entreprise = "—";

        // Réalisations = tous les textes restants
        const realisations = allTexts.slice(0, opts.maxBulletsPerExperience);

        // Métadonnées: Priorité Widget > RAG > Fallback

        // 1. Chercher dans les widgets (metadata explicites)
        const widgetMeta = widgets.find(w => w.date_start || w.date_end);

        // 2. Chercher dans RAG
        const ragDateDebut = ragExp ? (ragExp.debut || ragExp.date_debut || ragExp.start_date) : undefined;
        const ragDateFin = ragExp ? (ragExp.fin || ragExp.date_fin || ragExp.end_date) : undefined;
        const ragLieu = ragExp?.lieu || ragExp?.location;
        const ragActuel = ragExp?.actuel || ragExp?.current;

        // 3. Fallback Regex (si tout le reste échoue)
        let regexStart = "";
        let regexEnd = "";
        if (!widgetMeta && !ragDateDebut) {
            // Tentative d'extraction depuis le header "Poste - Entreprise (Jan 2020 - Présent)"
            const dateMatch = headerText?.match(/\((.*?)\)/);
            if (dateMatch) {
                const datePart = dateMatch[1];
                const parts = datePart.split(/[-–—]/).map(s => s.trim());
                if (parts.length >= 1) regexStart = parts[0];
                if (parts.length >= 2) regexEnd = parts[1];
            }
        }

        // Consolidation
        const date_debut = formatDate(widgetMeta?.date_start || ragDateDebut || regexStart);
        const date_fin = formatDate(widgetMeta?.date_end || ragDateFin || regexEnd);
        const lieu = widgetMeta?.location || ragLieu || undefined;
        // La logique actuel est: soit explicite dans widget, soit explicit dans RAG, soit déduit si date_fin est "Présent" ou vide avec actuel=true
        const isCurrent = widgetMeta?.is_current ?? ragActuel ?? (date_fin?.toLowerCase().includes("présent") || date_fin?.toLowerCase().includes("present"));
        const clientsRaw =
            (Array.isArray(ragExp?.clients_references) && ragExp.clients_references) ||
            (Array.isArray(ragExp?.clients) && ragExp.clients) ||
            (Array.isArray(ragExp?.clientsReferences) && ragExp.clientsReferences) ||
            [];
        const maxClientsPerExperience = opts.limitsBySection?.maxClientsPerExperience ?? 6;
        let clients = cleanClientList(clientsRaw, { exclude: [entreprise], max: maxClientsPerExperience });
        if (clients.length === 0 && clientsRaw.length > 0) {
            clients = cleanClientList(clientsRaw, { max: maxClientsPerExperience });
        }

        const experience = {
            poste,
            entreprise,
            date_debut,
            date_fin: isCurrent ? undefined : date_fin,
            actuel: isCurrent,
            lieu,
            realisations,
            clients: clients.length > 0 ? clients : undefined,
            // Métadonnées pour l'UI
            _relevance_score: bestScore,
            _rag_experience_id: expId,
        } as any;

        experiences.push(experience);
    }

    // ÉTAPE 3: FALLBACK - Vérifier si des expériences RAG n'ont pas été couvertes par Gemini
    // C'est le filet de sécurité: si Gemini omet une expérience, on la crée depuis le RAG
    //
    // IMPORTANT: On ne peut PAS comparer par ID car:
    // - Gemini utilise des IDs séquentiels (exp_0, exp_1...) assignés par buildRAGForCVPrompt
    // - Le ragProfile ici vient de useRAGData() avec des IDs hash (exp_a7f3b2)
    // → On compare par poste+entreprise normalisés (robuste et indépendant des IDs)
    if (ragProfile?.experiences && Array.isArray(ragProfile.experiences)) {
        // Construire un Set des expériences déjà couvertes (poste|entreprise normalisés)
        const coveredKeys = new Set(
            experiences.map(e => `${normalizeKey(e.poste)}|${normalizeKey(e.entreprise)}`)
        );

        for (let i = 0; i < ragProfile.experiences.length; i++) {
            const ragExp = ragProfile.experiences[i];
            const ragPoste = normalizeKey(ragExp.poste || ragExp.titre || "");
            const ragEntreprise = normalizeKey(ragExp.entreprise || ragExp.client || "");
            const ragKey = `${ragPoste}|${ragEntreprise}`;

            if (!coveredKeys.has(ragKey) && (ragPoste || ragEntreprise)) {
                const poste = ragExp.poste || ragExp.titre || "Expérience";
                const entreprise = ragExp.entreprise || ragExp.client || "—";
                const realisations: string[] = [];

                if (Array.isArray(ragExp.realisations)) {
                    for (const r of ragExp.realisations) {
                        if (typeof r === "string" && r.trim()) {
                            realisations.push(r.trim());
                        } else if (r && typeof r === "object" && r.description) {
                            realisations.push(r.description);
                        }
                    }
                }

                const date_debut = formatDate(ragExp.debut || ragExp.date_debut || ragExp.start_date || "");
                const date_fin = formatDate(ragExp.fin || ragExp.date_fin || ragExp.end_date || "");
                const lieu = ragExp.lieu || ragExp.location || undefined;
                const actuel = ragExp.actuel || ragExp.current || false;
                const clientsRaw =
                    (Array.isArray(ragExp?.clients_references) && ragExp.clients_references) ||
                    (Array.isArray(ragExp?.clients) && ragExp.clients) ||
                    (Array.isArray(ragExp?.clientsReferences) && ragExp.clientsReferences) ||
                    [];
                const maxClientsPerExperience = opts.limitsBySection?.maxClientsPerExperience ?? 6;
                let clients = cleanClientList(clientsRaw, { exclude: [entreprise], max: maxClientsPerExperience });
                if (clients.length === 0 && clientsRaw.length > 0) {
                    clients = cleanClientList(clientsRaw, { max: maxClientsPerExperience });
                }

                experiences.push({
                    poste,
                    entreprise,
                    date_debut,
                    date_fin: actuel ? undefined : date_fin,
                    actuel,
                    lieu,
                    realisations: realisations.slice(0, opts.maxBulletsPerExperience),
                    clients: clients.length > 0 ? clients : undefined,
                    _relevance_score: 10, // Score bas car non traité par Gemini
                    _rag_experience_id: ragExp.id || `exp_${i}`,
                    _from_fallback: true, // Marqueur pour debug
                } as any);

                coveredKeys.add(ragKey); // Éviter les doublons
            }
        }
    }

    // Trier par score décroissant (cast pour accéder aux métadonnées)
    (experiences as any[]).sort((a, b) => (b._relevance_score || 0) - (a._relevance_score || 0));

    // Appliquer la limite max (mais par défaut = 999, donc pas de limite)
    const limited = experiences.slice(0, opts.maxExperiences);

    return limited;
}
