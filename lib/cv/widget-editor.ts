/**
 * Widget Editor - Système d'édition interactive des widgets CV
 *
 * [AMÉLIORATION P3-9] : Éditeur permettant de modifier, réordonner,
 * et personnaliser les widgets générés par l'IA
 *
 * Features:
 * - Édition inline du contenu
 * - Drag & drop pour réordonner
 * - Ajout/suppression de widgets
 * - Historique undo/redo
 * - Validation en temps réel
 * - Sauvegarde auto
 */

import type { AIWidget, AIWidgetsEnvelope } from "./ai-widgets";
import { logger } from "@/lib/utils/logger";

// ============================================================================
// TYPES
// ============================================================================

export interface WidgetEditState {
    id: string;
    widget: AIWidget;
    isDirty: boolean;
    validationErrors: ValidationError[];
    lastModified: number;
}

export interface ValidationError {
    field: string;
    message: string;
    severity: "error" | "warning";
}

export interface EditOperation {
    id: string;
    type: "update" | "add" | "delete" | "move" | "merge" | "split";
    widgetId: string;
    timestamp: number;
    previousState: any;
    newState: any;
}

export interface EditorState {
    widgets: WidgetEditState[];
    selectedWidgetId: string | null;
    history: EditOperation[];
    historyIndex: number;
    isDirty: boolean;
    lastSaved: number;
}

export interface EditorConfig {
    maxHistorySize: number;
    autoSaveIntervalMs: number;
    validationRules: ValidationRule[];
}

export interface ValidationRule {
    field: string;
    type: "required" | "minLength" | "maxLength" | "pattern" | "custom";
    value?: any;
    message: string;
    customValidator?: (value: any, widget: AIWidget) => boolean;
}

export type WidgetChangeHandler = (widgets: AIWidget[], operation: EditOperation) => void;

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: EditorConfig = {
    maxHistorySize: 50,
    autoSaveIntervalMs: 30000,
    validationRules: [
        { field: "content.titre", type: "required", message: "Le titre est requis" },
        { field: "content.titre", type: "maxLength", value: 100, message: "Titre trop long (max 100 caractères)" },
        { field: "content.description", type: "maxLength", value: 500, message: "Description trop longue (max 500 caractères)" },
        { field: "score", type: "custom", message: "Score invalide (0-100)", customValidator: (v) => v >= 0 && v <= 100 },
    ],
};

// ============================================================================
// WIDGET EDITOR CLASS
// ============================================================================

export class WidgetEditor {
    private state: EditorState;
    private config: EditorConfig;
    private changeHandlers: Set<WidgetChangeHandler> = new Set();
    private autoSaveTimer: NodeJS.Timeout | null = null;

    constructor(
        initialWidgets: AIWidget[] = [],
        config: Partial<EditorConfig> = {}
    ) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.state = {
            widgets: initialWidgets.map(w => this.createWidgetState(w)),
            selectedWidgetId: null,
            history: [],
            historyIndex: -1,
            isDirty: false,
            lastSaved: Date.now(),
        };

        // Démarrer l'auto-save
        if (this.config.autoSaveIntervalMs > 0) {
            this.autoSaveTimer = setInterval(() => {
                if (this.state.isDirty) {
                    this.triggerAutoSave();
                }
            }, this.config.autoSaveIntervalMs);
        }
    }

    // ========================================================================
    // WIDGET STATE MANAGEMENT
    // ========================================================================

    private createWidgetState(widget: AIWidget): WidgetEditState {
        return {
            id: widget.id,
            widget: JSON.parse(JSON.stringify(widget)),
            isDirty: false,
            validationErrors: [],
            lastModified: Date.now(),
        };
    }

    private findWidgetIndex(widgetId: string): number {
        return this.state.widgets.findIndex(w => w.id === widgetId);
    }

    // ========================================================================
    // CRUD OPERATIONS
    // ========================================================================

    /**
     * Met à jour un widget
     */
    updateWidget(widgetId: string, updates: Partial<AIWidget>): boolean {
        const index = this.findWidgetIndex(widgetId);
        if (index === -1) return false;

        const previousState = JSON.parse(JSON.stringify(this.state.widgets[index].widget));
        const newWidget = { ...previousState, ...updates };

        // Valider
        const errors = this.validateWidget(newWidget);

        // Appliquer
        this.state.widgets[index] = {
            ...this.state.widgets[index],
            widget: newWidget,
            isDirty: true,
            validationErrors: errors,
            lastModified: Date.now(),
        };

        // Ajouter à l'historique
        this.addToHistory({
            id: `op_${Date.now()}`,
            type: "update",
            widgetId,
            timestamp: Date.now(),
            previousState,
            newState: newWidget,
        });

        this.state.isDirty = true;
        this.notifyChange("update", widgetId);

        return true;
    }

    /**
     * Ajoute un nouveau widget
     */
    addWidget(widget: AIWidget, position?: number): string {
        const newWidget = {
            ...widget,
            id: widget.id || `widget_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        };

        const widgetState = this.createWidgetState(newWidget);
        const errors = this.validateWidget(newWidget);
        widgetState.validationErrors = errors;

        if (position !== undefined && position >= 0 && position <= this.state.widgets.length) {
            this.state.widgets.splice(position, 0, widgetState);
        } else {
            this.state.widgets.push(widgetState);
        }

        this.addToHistory({
            id: `op_${Date.now()}`,
            type: "add",
            widgetId: newWidget.id,
            timestamp: Date.now(),
            previousState: null,
            newState: newWidget,
        });

        this.state.isDirty = true;
        this.notifyChange("add", newWidget.id);

        return newWidget.id;
    }

    /**
     * Supprime un widget
     */
    deleteWidget(widgetId: string): boolean {
        const index = this.findWidgetIndex(widgetId);
        if (index === -1) return false;

        const previousState = this.state.widgets[index].widget;
        this.state.widgets.splice(index, 1);

        this.addToHistory({
            id: `op_${Date.now()}`,
            type: "delete",
            widgetId,
            timestamp: Date.now(),
            previousState,
            newState: null,
        });

        if (this.state.selectedWidgetId === widgetId) {
            this.state.selectedWidgetId = null;
        }

        this.state.isDirty = true;
        this.notifyChange("delete", widgetId);

        return true;
    }

    /**
     * Déplace un widget à une nouvelle position
     */
    moveWidget(widgetId: string, newPosition: number): boolean {
        const currentIndex = this.findWidgetIndex(widgetId);
        if (currentIndex === -1) return false;
        if (newPosition < 0 || newPosition >= this.state.widgets.length) return false;

        const widgetState = this.state.widgets[currentIndex];
        this.state.widgets.splice(currentIndex, 1);
        this.state.widgets.splice(newPosition, 0, widgetState);

        this.addToHistory({
            id: `op_${Date.now()}`,
            type: "move",
            widgetId,
            timestamp: Date.now(),
            previousState: { position: currentIndex },
            newState: { position: newPosition },
        });

        this.state.isDirty = true;
        this.notifyChange("move", widgetId);

        return true;
    }

    // ========================================================================
    // UNDO / REDO
    // ========================================================================

    /**
     * Annule la dernière opération
     */
    undo(): boolean {
        if (!this.canUndo()) return false;

        const operation = this.state.history[this.state.historyIndex];
        this.applyReverseOperation(operation);
        this.state.historyIndex--;

        this.state.isDirty = true;
        return true;
    }

    /**
     * Refait l'opération annulée
     */
    redo(): boolean {
        if (!this.canRedo()) return false;

        this.state.historyIndex++;
        const operation = this.state.history[this.state.historyIndex];
        this.applyOperation(operation);

        this.state.isDirty = true;
        return true;
    }

    canUndo(): boolean {
        return this.state.historyIndex >= 0;
    }

    canRedo(): boolean {
        return this.state.historyIndex < this.state.history.length - 1;
    }

    private addToHistory(operation: EditOperation): void {
        // Supprimer les opérations après l'index courant (on écrase le redo)
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
        }

        this.state.history.push(operation);
        this.state.historyIndex++;

        // Limiter la taille de l'historique
        if (this.state.history.length > this.config.maxHistorySize) {
            this.state.history.shift();
            this.state.historyIndex--;
        }
    }

    private applyOperation(operation: EditOperation): void {
        switch (operation.type) {
            case "update": {
                const index = this.findWidgetIndex(operation.widgetId);
                if (index !== -1) {
                    this.state.widgets[index].widget = operation.newState;
                }
                break;
            }
            case "add": {
                const widgetState = this.createWidgetState(operation.newState);
                this.state.widgets.push(widgetState);
                break;
            }
            case "delete": {
                const index = this.findWidgetIndex(operation.widgetId);
                if (index !== -1) {
                    this.state.widgets.splice(index, 1);
                }
                break;
            }
            case "move": {
                const currentIndex = this.findWidgetIndex(operation.widgetId);
                if (currentIndex !== -1) {
                    const widgetState = this.state.widgets[currentIndex];
                    this.state.widgets.splice(currentIndex, 1);
                    this.state.widgets.splice(operation.newState.position, 0, widgetState);
                }
                break;
            }
        }
    }

    private applyReverseOperation(operation: EditOperation): void {
        switch (operation.type) {
            case "update": {
                const index = this.findWidgetIndex(operation.widgetId);
                if (index !== -1) {
                    this.state.widgets[index].widget = operation.previousState;
                }
                break;
            }
            case "add": {
                const index = this.findWidgetIndex(operation.widgetId);
                if (index !== -1) {
                    this.state.widgets.splice(index, 1);
                }
                break;
            }
            case "delete": {
                const widgetState = this.createWidgetState(operation.previousState);
                this.state.widgets.push(widgetState);
                break;
            }
            case "move": {
                const currentIndex = this.findWidgetIndex(operation.widgetId);
                if (currentIndex !== -1) {
                    const widgetState = this.state.widgets[currentIndex];
                    this.state.widgets.splice(currentIndex, 1);
                    this.state.widgets.splice(operation.previousState.position, 0, widgetState);
                }
                break;
            }
        }
    }

    // ========================================================================
    // VALIDATION
    // ========================================================================

    private validateWidget(widget: AIWidget): ValidationError[] {
        const errors: ValidationError[] = [];

        for (const rule of this.config.validationRules) {
            const value = this.getNestedValue(widget, rule.field);

            switch (rule.type) {
                case "required":
                    if (!value || (typeof value === "string" && value.trim() === "")) {
                        errors.push({ field: rule.field, message: rule.message, severity: "error" });
                    }
                    break;

                case "minLength":
                    if (typeof value === "string" && value.length < rule.value) {
                        errors.push({ field: rule.field, message: rule.message, severity: "warning" });
                    }
                    break;

                case "maxLength":
                    if (typeof value === "string" && value.length > rule.value) {
                        errors.push({ field: rule.field, message: rule.message, severity: "error" });
                    }
                    break;

                case "pattern":
                    if (typeof value === "string" && !new RegExp(rule.value).test(value)) {
                        errors.push({ field: rule.field, message: rule.message, severity: "error" });
                    }
                    break;

                case "custom":
                    if (rule.customValidator && !rule.customValidator(value, widget)) {
                        errors.push({ field: rule.field, message: rule.message, severity: "error" });
                    }
                    break;
            }
        }

        return errors;
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    }

    /**
     * Valide tous les widgets
     */
    validateAll(): { valid: boolean; errors: Record<string, ValidationError[]> } {
        const allErrors: Record<string, ValidationError[]> = {};
        let hasErrors = false;

        for (const widgetState of this.state.widgets) {
            const errors = this.validateWidget(widgetState.widget);
            widgetState.validationErrors = errors;

            if (errors.length > 0) {
                allErrors[widgetState.id] = errors;
                if (errors.some(e => e.severity === "error")) {
                    hasErrors = true;
                }
            }
        }

        return { valid: !hasErrors, errors: allErrors };
    }

    // ========================================================================
    // SELECTION
    // ========================================================================

    selectWidget(widgetId: string | null): void {
        if (widgetId && this.findWidgetIndex(widgetId) === -1) return;
        this.state.selectedWidgetId = widgetId;
    }

    getSelectedWidget(): WidgetEditState | null {
        if (!this.state.selectedWidgetId) return null;
        const index = this.findWidgetIndex(this.state.selectedWidgetId);
        return index !== -1 ? this.state.widgets[index] : null;
    }

    // ========================================================================
    // BATCH OPERATIONS
    // ========================================================================

    /**
     * Fusionne deux widgets en un seul
     */
    mergeWidgets(widgetId1: string, widgetId2: string): string | null {
        const index1 = this.findWidgetIndex(widgetId1);
        const index2 = this.findWidgetIndex(widgetId2);

        if (index1 === -1 || index2 === -1) return null;

        const widget1 = this.state.widgets[index1].widget;
        const widget2 = this.state.widgets[index2].widget;

        // Ne fusionner que des widgets de même section
        if (widget1.section !== widget2.section) return null;

        // Créer le widget fusionné
        const mergedWidget: AIWidget = {
            id: `merged_${Date.now()}`,
            section: widget1.section,
            content: {
                ...widget1.content,
                bullets: [
                    ...(widget1.content?.bullets || []),
                    ...(widget2.content?.bullets || []),
                ],
            },
            score: Math.max(widget1.score || 0, widget2.score || 0),
            quality: {
                grounded: (widget1.quality?.grounded && widget2.quality?.grounded) || false,
                has_metrics: (widget1.quality?.has_metrics || widget2.quality?.has_metrics) || false,
                ats_optimized: (widget1.quality?.ats_optimized && widget2.quality?.ats_optimized) || false,
            },
        };

        // Supprimer les anciens widgets
        this.deleteWidget(widgetId1);
        this.deleteWidget(widgetId2);

        // Ajouter le widget fusionné
        return this.addWidget(mergedWidget, Math.min(index1, index2));
    }

    /**
     * Divise un widget en plusieurs
     */
    splitWidget(widgetId: string, splitPoints: number[]): string[] {
        const index = this.findWidgetIndex(widgetId);
        if (index === -1) return [];

        const widget = this.state.widgets[index].widget;
        const bullets = widget.content?.bullets || [];

        if (bullets.length === 0) return [];

        // Créer les widgets divisés
        const newWidgetIds: string[] = [];
        let currentStart = 0;

        const sortedPoints = [...splitPoints, bullets.length].sort((a, b) => a - b);

        for (const point of sortedPoints) {
            if (point <= currentStart || point > bullets.length) continue;

            const newWidget: AIWidget = {
                id: `split_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                section: widget.section,
                content: {
                    ...widget.content,
                    bullets: bullets.slice(currentStart, point),
                },
                score: widget.score,
                quality: widget.quality,
            };

            const newId = this.addWidget(newWidget, index + newWidgetIds.length + 1);
            newWidgetIds.push(newId);
            currentStart = point;
        }

        // Supprimer l'original
        if (newWidgetIds.length > 0) {
            this.deleteWidget(widgetId);
        }

        return newWidgetIds;
    }

    /**
     * Réordonne les widgets par score
     */
    sortByScore(ascending: boolean = false): void {
        const sorted = [...this.state.widgets].sort((a, b) => {
            const scoreA = a.widget.score || 0;
            const scoreB = b.widget.score || 0;
            return ascending ? scoreA - scoreB : scoreB - scoreA;
        });

        // Enregistrer les mouvements
        const operations: EditOperation[] = [];
        sorted.forEach((ws, newIndex) => {
            const oldIndex = this.state.widgets.findIndex(w => w.id === ws.id);
            if (oldIndex !== newIndex) {
                operations.push({
                    id: `op_${Date.now()}_${newIndex}`,
                    type: "move",
                    widgetId: ws.id,
                    timestamp: Date.now(),
                    previousState: { position: oldIndex },
                    newState: { position: newIndex },
                });
            }
        });

        this.state.widgets = sorted;
        this.state.isDirty = true;
    }

    /**
     * Filtre les widgets par section
     */
    filterBySection(section: string): WidgetEditState[] {
        return this.state.widgets.filter(w => w.widget.section === section);
    }

    // ========================================================================
    // STATE ACCESSORS
    // ========================================================================

    getWidgets(): AIWidget[] {
        return this.state.widgets.map(ws => ws.widget);
    }

    getWidgetStates(): WidgetEditState[] {
        return [...this.state.widgets];
    }

    getWidget(widgetId: string): AIWidget | null {
        const index = this.findWidgetIndex(widgetId);
        return index !== -1 ? this.state.widgets[index].widget : null;
    }

    isDirty(): boolean {
        return this.state.isDirty;
    }

    getHistory(): EditOperation[] {
        return [...this.state.history];
    }

    // ========================================================================
    // EXPORT / IMPORT
    // ========================================================================

    /**
     * Exporte l'état actuel comme envelope de widgets
     */
    exportAsEnvelope(): AIWidgetsEnvelope {
        const widgets = this.getWidgets();
        const avgScore = widgets.reduce((sum, w) => sum + (w.score || 0), 0) / widgets.length;

        return {
            version: "2.0",
            generated_at: new Date().toISOString(),
            widgets,
            metadata: {
                total_widgets: widgets.length,
                sections: [...new Set(widgets.map(w => w.section))],
                average_score: Math.round(avgScore * 10) / 10,
                edited: true,
                edit_count: this.state.history.length,
            },
        };
    }

    /**
     * Importe des widgets depuis une envelope
     */
    importFromEnvelope(envelope: AIWidgetsEnvelope): void {
        this.state.widgets = envelope.widgets.map(w => this.createWidgetState(w));
        this.state.history = [];
        this.state.historyIndex = -1;
        this.state.isDirty = false;
        this.state.selectedWidgetId = null;
    }

    // ========================================================================
    // CHANGE HANDLERS
    // ========================================================================

    onChange(handler: WidgetChangeHandler): () => void {
        this.changeHandlers.add(handler);
        return () => this.changeHandlers.delete(handler);
    }

    private notifyChange(type: EditOperation["type"], widgetId: string): void {
        const widgets = this.getWidgets();
        const operation = this.state.history[this.state.historyIndex];

        for (const handler of this.changeHandlers) {
            try {
                handler(widgets, operation);
            } catch (error) {
                logger.error("[widget-editor] Erreur dans change handler", { error });
            }
        }
    }

    // ========================================================================
    // AUTO-SAVE
    // ========================================================================

    private triggerAutoSave(): void {
        logger.debug("[widget-editor] Auto-save triggered", {
            widgetCount: this.state.widgets.length,
            operationCount: this.state.history.length,
        });

        // Les handlers peuvent implémenter la sauvegarde réelle
        this.state.lastSaved = Date.now();
    }

    markAsSaved(): void {
        this.state.isDirty = false;
        this.state.lastSaved = Date.now();
        this.state.widgets.forEach(ws => {
            ws.isDirty = false;
        });
    }

    // ========================================================================
    // CLEANUP
    // ========================================================================

    destroy(): void {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        this.changeHandlers.clear();
    }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Crée un éditeur à partir d'une envelope de widgets
 */
export function createEditorFromEnvelope(
    envelope: AIWidgetsEnvelope,
    config?: Partial<EditorConfig>
): WidgetEditor {
    return new WidgetEditor(envelope.widgets, config);
}

/**
 * Crée un widget vide pour une section donnée
 */
export function createEmptyWidget(section: string): AIWidget {
    return {
        id: `new_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        section,
        content: {
            titre: "",
            description: "",
            bullets: [],
        },
        score: 50,
        quality: {
            grounded: false,
            has_metrics: false,
            ats_optimized: false,
        },
    };
}
