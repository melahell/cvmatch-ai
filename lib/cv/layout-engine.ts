
import { CVData } from "../../components/cv/templates";
import { getThemeConfig, CVThemeConfig } from "./theme-configs";
import { getUnitHeight, ContentUnitType } from "./content-units-reference";
import { CVAdaptationResult } from "./adaptive-algorithm";

/**
 * A4 physical height in millimeters
 */
const A4_HEIGHT_MM = 297;

/**
 * Layout Engine Result
 */
export interface LayoutSimulationResult {
    totalPages: number;
    unitsPerPage: number;
    contentHeightMm: number;
    overflows: boolean;
    pageBreaks: number[]; // Indices of items where breaks occur (if we were flat listing)
    fillRatio: number; // 0 to 1 (how full is the last page)
}

/**
 * Calculates how many units fit on a single A4 page for a given theme.
 */
export function getUnitsPerPage(themeName: string): number {
    const theme = getThemeConfig(themeName);
    const unitToMm = theme.visual_config.unit_to_mm;
    // Safety check to avoid division by zero
    if (!unitToMm || unitToMm <= 0) return 70; // Fallback

    // We assume some margins are NOT part of the "printable" unit space? 
    // Actually theme.zones.margins has capacity_units.
    // Let's assume the full 297mm is available but usually margins take ~20-30mm.
    // However, adaptive-algorithm treats margins as consumed units.
    // So we map full A4 height to units.
    return Math.floor(A4_HEIGHT_MM / unitToMm);
}

/**
 * Simulates the layout to determine page count and breaks.
 * 
 * @param cvResult The result from adaptive-algorithm (contains used units)
 * @param themeName The active theme
 */
export function simulateLayout(cvResult: CVAdaptationResult, themeName: string): LayoutSimulationResult {
    const theme = getThemeConfig(themeName);
    const unitsPerPage = getUnitsPerPage(themeName);

    const totalUnits = cvResult.totalUnitsUsed;

    // Simple page calculation
    const totalPages = Math.ceil(totalUnits / unitsPerPage);

    // Physical height
    const contentHeightMm = totalUnits * theme.visual_config.unit_to_mm;

    // Fill ratio of the last page
    const unitsInLastPage = totalUnits % unitsPerPage;
    const fillRatio = unitsInLastPage === 0 ? 1 : unitsInLastPage / unitsPerPage;

    // Check strict overflow (if theme supports max 2 pages for example)
    const maxSupported = theme.page_config.supports_two_pages ? 2 : 1;
    const overflows = totalPages > maxSupported;

    return {
        totalPages,
        unitsPerPage,
        contentHeightMm,
        overflows,
        pageBreaks: [], // TODO: implementations detailed breakdown if needed
        fillRatio
    };
}

/**
 * Calculates CSS variables for dynamic spacing (Vertical Rhythm).
 * 
 * If the page is "too full" or "too empty", we adjust the spacing.
 */
export function getDynamicSpacingVariables(layout: LayoutSimulationResult, themeName: string): Record<string, string> {
    const theme = getThemeConfig(themeName);
    const baseMm = theme.visual_config.unit_to_mm;

    // If we are slightly overflowing (e.g. 1.1 pages), we can shrink spacing
    // If we are very empty (e.g. 0.6 pages), we can expand

    let multiplier = 1.0;

    if (layout.totalPages === 1 && layout.fillRatio > 0.95) {
        multiplier = 0.9; // Shrink slightly to ensure fit
    } else if (layout.totalPages === 1 && layout.fillRatio < 0.75) {
        multiplier = 1.15; // Expand to fill white space
    } else if (layout.overflows && layout.fillRatio < 0.2) {
        // Just barely spilled to next page? Maybe aggressive shrink?
        // For now, let adaptive algorithm handle content removal.
        multiplier = 0.85;
    }

    // Base unit in px (assuming 1mm ~ 3.78px)
    const mmToPx = 3.78;
    const baseUnitPx = baseMm * mmToPx * multiplier;

    return {
        "--unit-base": `${baseUnitPx.toFixed(2)}px`,
        "--spacing-section": `${(baseUnitPx * 2).toFixed(2)}px`, // 2 units
        "--spacing-item": `${(baseUnitPx * 1).toFixed(2)}px`,    // 1 unit
        "--spacing-bullet": `${(baseUnitPx * 0.5).toFixed(2)}px`, // 0.5 unit
    };
}
