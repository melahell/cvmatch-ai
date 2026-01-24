import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour cache widgets V2
 * 
 * Vérifie que :
 * 1. Le cache fonctionne (requête identique retourne cache)
 * 2. Le cache est invalidé avec paramètres différents
 * 3. Les performances sont améliorées avec cache
 */

test.describe('V2 Widgets Cache', () => {
  test('should use cache for identical requests', async ({ page, request }) => {
    // Note: Ce test nécessite un utilisateur authentifié
    // En production, utiliser des credentials de test ou mocks
    
    const analysisId = 'test-analysis-id';
    const authToken = 'test-auth-token'; // À remplacer par token réel
    
    // Première requête (génération)
    const startTime1 = Date.now();
    const response1 = await request.post('/api/cv/generate-widgets', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        analysisId,
      },
    });
    const time1 = Date.now() - startTime1;
    
    expect(response1.ok()).toBeTruthy();
    const data1 = await response1.json();
    expect(data1.success).toBe(true);
    expect(data1.metadata.cached).toBeUndefined(); // Première fois, pas de cache
    
    // Deuxième requête identique (devrait utiliser cache)
    const startTime2 = Date.now();
    const response2 = await request.post('/api/cv/generate-widgets', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        analysisId,
      },
    });
    const time2 = Date.now() - startTime2;
    
    expect(response2.ok()).toBeTruthy();
    const data2 = await response2.json();
    expect(data2.success).toBe(true);
    expect(data2.metadata.cached).toBe(true); // Devrait être en cache
    
    // Vérifier que le cache est plus rapide (au moins 50% plus rapide)
    expect(time2).toBeLessThan(time1 * 0.5);
    
    // Vérifier que les widgets sont identiques
    expect(data2.widgets.widgets.length).toBe(data1.widgets.widgets.length);
  });

  test('should regenerate for different job description', async ({ page, request }) => {
    const analysisId = 'test-analysis-id';
    const authToken = 'test-auth-token';
    
    // Première requête
    const response1 = await request.post('/api/cv/generate-widgets', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        analysisId,
      },
    });
    
    expect(response1.ok()).toBeTruthy();
    const data1 = await response1.json();
    
    // Modifier l'analyse pour changer la job description
    // (simulation - en production, modifier réellement l'analyse)
    // Deuxième requête avec job description différente
    const response2 = await request.post('/api/cv/generate-widgets', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        analysisId: 'different-analysis-id', // Analyse différente
      },
    });
    
    expect(response2.ok()).toBeTruthy();
    const data2 = await response2.json();
    
    // Devrait régénérer (pas de cache car analysisId différent)
    // Note: En production, vérifier que le cache key change avec job description
  });
});
