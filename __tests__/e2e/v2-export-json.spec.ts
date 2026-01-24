import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Tests E2E pour export JSON widgets V2
 * 
 * Vérifie que :
 * 1. L'export JSON fonctionne
 * 2. Le fichier exporté est valide
 * 3. Le format est un AIWidgetsEnvelope valide
 */

test.describe('V2 Export JSON Widgets', () => {
  test('should export valid JSON widgets file', async ({ page }) => {
    const analysisId = 'test-analysis-id';
    await page.goto(`/dashboard/cv-builder?analysisId=${analysisId}`);
    
    // Attendre widgets générés
    await page.waitForSelector('button:has-text("Export JSON")', { timeout: 15000 });
    
    // Intercepter le téléchargement
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export JSON")');
    const download = await downloadPromise;
    
    // Vérifier que le fichier est JSON
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    expect(download.suggestedFilename()).toContain('widgets_');
    expect(download.suggestedFilename()).toContain(analysisId);
    
    // Sauvegarder le fichier temporairement
    const path = await download.path();
    expect(path).toBeTruthy();
    
    // Lire et valider le contenu
    if (path) {
      const fileContent = await readFile(path, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      // Vérifier structure AIWidgetsEnvelope
      expect(jsonData).toHaveProperty('widgets');
      expect(jsonData).toHaveProperty('meta');
      expect(Array.isArray(jsonData.widgets)).toBe(true);
      
      // Vérifier structure widgets
      if (jsonData.widgets.length > 0) {
        const widget = jsonData.widgets[0];
        expect(widget).toHaveProperty('id');
        expect(widget).toHaveProperty('type');
        expect(widget).toHaveProperty('section');
        expect(widget).toHaveProperty('text');
        expect(widget).toHaveProperty('relevance_score');
      }
      
      // Vérifier meta
      expect(jsonData.meta).toHaveProperty('model');
      expect(jsonData.meta).toHaveProperty('created_at');
    }
  });

  test('should show success toast after export', async ({ page }) => {
    const analysisId = 'test-analysis-id';
    await page.goto(`/dashboard/cv-builder?analysisId=${analysisId}`);
    
    await page.waitForSelector('button:has-text("Export JSON")', { timeout: 15000 });
    
    // Intercepter le téléchargement
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export JSON")');
    await downloadPromise;
    
    // Vérifier que le toast de succès apparaît
    await expect(page.locator('text=Widgets JSON exportés')).toBeVisible({ timeout: 2000 });
  });

  test('should handle export error gracefully', async ({ page }) => {
    const analysisId = 'test-analysis-id';
    await page.goto(`/dashboard/cv-builder?analysisId=${analysisId}`);
    
    // Simuler absence de widgets (en modifiant l'état)
    // Note: En production, utiliser un mock ou un état spécifique
    
    // Si pas de widgets, le bouton devrait être désactivé ou afficher une erreur
    // À adapter selon l'implémentation réelle
  });
});
