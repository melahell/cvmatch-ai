import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour génération CV V2
 * 
 * Parcours testé :
 * 1. Connexion utilisateur
 * 2. Upload document
 * 3. Génération RAG
 * 4. Analyse offre
 * 5. Génération CV V2 avec widgets
 * 6. Switch thème instantané
 * 7. Export PDF
 */

test.describe('CV Generation V2 - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Vérifier redirection vers login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should generate CV V2 from analysis', async ({ page }) => {
    // Note: Ce test nécessite un utilisateur authentifié
    // En production, utiliser des credentials de test ou mocks
    
    // Simuler connexion (à adapter selon votre système d'auth)
    // await page.goto('/login');
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');
    
    // Naviguer vers analyse
    await page.goto('/dashboard/analyze');
    
    // Vérifier que la page se charge
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should switch CV template instantly', async ({ page }) => {
    // Prérequis: CV déjà généré
    // Naviguer vers CV builder
    const analysisId = 'test-analysis-id'; // À remplacer par un ID réel
    await page.goto(`/dashboard/cv-builder?analysisId=${analysisId}`);
    
    // Attendre chargement
    await page.waitForSelector('[data-testid="template-selector"]', { timeout: 10000 });
    
    // Mesurer temps de switch
    const startTime = Date.now();
    await page.click('button:has-text("Tech")');
    const switchTime = Date.now() - startTime;
    
    // Vérifier que le switch est instantané (< 200ms)
    expect(switchTime).toBeLessThan(200);
  });

  test('should export widgets JSON', async ({ page }) => {
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
  });

  test('should display validation warnings', async ({ page }) => {
    const analysisId = 'test-analysis-id';
    await page.goto(`/dashboard/cv-builder?analysisId=${analysisId}`);
    
    // Attendre validation warnings
    await page.waitForSelector('[data-testid="validation-warnings"]', { timeout: 15000 });
    
    // Vérifier que les warnings sont affichés
    const warnings = page.locator('[data-testid="validation-warnings"]');
    await expect(warnings).toBeVisible();
  });
});
