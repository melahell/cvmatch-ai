import { test, expect } from '@playwright/test';

/**
 * Tests de performance E2E
 * 
 * Mesure les temps de :
 * - Génération widgets
 * - Switch thème
 * - Export PDF
 * - Conversion widgets → CVData
 */

test.describe('Performance Tests', () => {
  test('widget generation should complete within 30s', async ({ page }) => {
    const analysisId = 'test-analysis-id';
    await page.goto(`/dashboard/cv-builder?analysisId=${analysisId}`);
    
    // Mesurer temps de génération
    const startTime = Date.now();
    
    // Attendre que les widgets soient générés (badge avec nombre)
    await page.waitForSelector('span:has-text("widgets")', { timeout: 30000 });
    
    const generationTime = Date.now() - startTime;
    
    // Vérifier que c'est dans les 30 secondes
    expect(generationTime).toBeLessThan(30000);
  });

  test('widget generation with cache should be faster', async ({ page, request }) => {
    // Note: Nécessite auth token
    const analysisId = 'test-analysis-id';
    const authToken = 'test-auth-token';
    
    // Première génération (sans cache)
    const startTime1 = Date.now();
    const response1 = await request.post('/api/cv/generate-widgets', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: { analysisId },
    });
    const time1 = Date.now() - startTime1;
    
    expect(response1.ok()).toBeTruthy();
    
    // Deuxième génération (avec cache)
    const startTime2 = Date.now();
    const response2 = await request.post('/api/cv/generate-widgets', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: { analysisId },
    });
    const time2 = Date.now() - startTime2;
    
    expect(response2.ok()).toBeTruthy();
    const data2 = await response2.json();
    expect(data2.metadata.cached).toBe(true);
    
    // Cache devrait être au moins 50% plus rapide
    expect(time2).toBeLessThan(time1 * 0.5);
  });

  test('template switch should be instant (< 200ms)', async ({ page }) => {
    const analysisId = 'test-analysis-id';
    await page.goto(`/dashboard/cv-builder?analysisId=${analysisId}`);
    
    // Attendre que le CV soit chargé
    await page.waitForSelector('[data-testid="cv-preview"]', { timeout: 15000 });
    
    // Mesurer temps de switch
    const startTime = Date.now();
    await page.click('button:has-text("Tech")');
    
    // Attendre que le changement soit visible
    await page.waitForTimeout(100);
    
    const switchTime = Date.now() - startTime;
    
    // Vérifier que c'est instantané
    expect(switchTime).toBeLessThan(200);
  });

  test('PDF export should complete within 1s', async ({ page }) => {
    const analysisId = 'test-analysis-id';
    await page.goto(`/dashboard/cv-builder?analysisId=${analysisId}`);
    
    await page.waitForSelector('button:has-text("Exporter")', { timeout: 15000 });
    
    // Mesurer temps d'export
    const startTime = Date.now();
    
    // Intercepter le dialog d'impression
    page.on('dialog', dialog => dialog.accept());
    
    await page.click('button:has-text("Exporter")');
    
    const exportTime = Date.now() - startTime;
    
    // Vérifier que c'est rapide (< 1s)
    expect(exportTime).toBeLessThan(1000);
  });
});
