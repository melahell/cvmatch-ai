/**
 * TESTS UNITAIRES - ALGORITHME ADAPTATIF
 */

import { describe, it, expect } from "@jest/globals";
import { generateAdaptiveCV, recommendTheme } from "../adaptive-algorithm";
import { getTheme } from "../theme-configs";
import { juniorProfile, seniorProfile, techLeadJobOffer, fullStackJobOffer } from "./fixtures";

describe("Algorithme Adaptatif CV", () => {
  // ═══════════════════════════════════════════════════════════
  // TESTS BASIQUES
  // ═══════════════════════════════════════════════════════════

  describe("Génération basique", () => {
    it("devrait générer un CV pour profil junior avec thème classic", () => {
      const result = generateAdaptiveCV(juniorProfile, null, "classic", {});

      expect(result).toBeDefined();
      expect(result.theme_id).toBe("classic");
      expect(result.pages).toBe(1);
      expect(result.sections.experiences.length).toBeGreaterThan(0);
      expect(result.sections.skills.length).toBeGreaterThan(0);
      expect(result.sections.formation.length).toBeGreaterThan(0);
    });

    it("devrait générer un CV pour profil senior avec thème classic", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "classic", {});

      expect(result).toBeDefined();
      expect(result.theme_id).toBe("classic");
      expect(result.sections.experiences.length).toBeGreaterThan(0);
    });

    it("devrait générer un CV avec les 3 thèmes", () => {
      const themes = ["classic", "modern_spacious", "compact_ats"] as const;

      for (const theme of themes) {
        const result = generateAdaptiveCV(juniorProfile, null, theme, {});
        expect(result.theme_id).toBe(theme);
        expect(result.total_units_used).toBeGreaterThan(0);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS CAPACITÉ & DÉBORDEMENT
  // ═══════════════════════════════════════════════════════════

  describe("Validation capacité", () => {
    it("devrait respecter la capacité totale du thème classic", () => {
      const result = generateAdaptiveCV(juniorProfile, null, "classic", {});
      const theme = getTheme("classic");

      expect(result.total_units_used).toBeLessThanOrEqual(
        theme.page_config.total_height_units * result.pages
      );
    });

    it("devrait respecter la capacité totale du thème modern_spacious", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "modern_spacious", {});
      const theme = getTheme("modern_spacious");

      expect(result.total_units_used).toBeLessThanOrEqual(
        theme.page_config.total_height_units * result.pages
      );
    });

    it("devrait respecter la capacité totale du thème compact_ats", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "compact_ats", {});
      const theme = getTheme("compact_ats");

      // compact_ats ne supporte que 1 page
      expect(result.pages).toBe(1);
      expect(result.total_units_used).toBeLessThanOrEqual(
        theme.page_config.total_height_units
      );
    });

    it("devrait passer à 2 pages si nécessaire pour thème classic", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "classic", {});

      // Profil senior avec 5+ expériences peut nécessiter 2 pages
      if (result.pages === 2) {
        expect(result.total_units_used).toBeGreaterThan(200);
        expect(result.total_units_used).toBeLessThanOrEqual(400);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS ADAPTATION FORMAT
  // ═══════════════════════════════════════════════════════════

  describe("Adaptation des formats", () => {
    it("devrait avoir au moins min_detailed_experiences en format detailed", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "classic", {});
      const theme = getTheme("classic");

      const detailedCount = result.sections.experiences.filter(
        (exp) => exp.format === "detailed"
      ).length;

      expect(detailedCount).toBeGreaterThanOrEqual(
        theme.adaptive_rules.min_detailed_experiences
      );
    });

    it("devrait compacter les expériences anciennes (>10 ans)", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "classic", {});

      // Les 2 dernières expériences du senior profile sont > 10 ans
      const oldExperiences = result.sections.experiences.slice(-2);

      oldExperiences.forEach((exp) => {
        expect(["compact", "minimal"]).toContain(exp.format);
      });
    });

    it("devrait adapter le nombre d'expériences selon le thème", () => {
      const classicResult = generateAdaptiveCV(seniorProfile, null, "classic", {});
      const modernResult = generateAdaptiveCV(seniorProfile, null, "modern_spacious", {});

      // modern_spacious a MOINS d'espace pour expériences (75 vs 100 units)
      // Donc devrait avoir moins d'expériences ou plus de formats compacts
      const classicDetailed = classicResult.sections.experiences.filter(
        (e) => e.format === "detailed"
      ).length;
      const modernDetailed = modernResult.sections.experiences.filter(
        (e) => e.format === "detailed"
      ).length;

      // Modern spacious peut avoir moins d'expériences détaillées
      expect(modernDetailed).toBeLessThanOrEqual(classicDetailed);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS SCORING & TRI
  // ═══════════════════════════════════════════════════════════

  describe("Scoring et priorisation", () => {
    it("devrait prioriser les expériences les plus pertinentes avec job offer", () => {
      const result = generateAdaptiveCV(
        seniorProfile,
        techLeadJobOffer,
        "classic",
        {}
      );

      // La première expérience devrait avoir le meilleur score
      const scores = result.sections.experiences.map((exp) => exp.relevance_score);

      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    });

    it("devrait scorer plus haut les expériences récentes sans job offer", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "classic", {});

      // La première expérience (la plus récente) devrait avoir un bon score
      expect(result.sections.experiences[0].relevance_score).toBeGreaterThan(50);
    });

    it("devrait donner format detailed aux expériences les plus pertinentes", () => {
      const result = generateAdaptiveCV(
        seniorProfile,
        techLeadJobOffer,
        "classic",
        {}
      );

      // Les 2 premières expériences devraient être detailed
      expect(result.sections.experiences[0].format).toBe("detailed");
      expect(result.sections.experiences[1].format).toBe("detailed");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS SECTIONS OPTIONNELLES
  // ═══════════════════════════════════════════════════════════

  describe("Sections optionnelles", () => {
    it("devrait inclure les certifications si définies", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "classic", {});

      expect(result.sections.certifications).toBeDefined();
      expect(result.sections.certifications!.length).toBeGreaterThan(0);
    });

    it("devrait inclure les langues si définies", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "classic", {});

      expect(result.sections.languages).toBeDefined();
      expect(result.sections.languages!.length).toBeGreaterThan(0);
    });

    it("ne devrait pas inclure les intérêts par défaut si pas d'espace", () => {
      const result = generateAdaptiveCV(seniorProfile, null, "compact_ats", {});

      // compact_ats n'alloue pas d'espace pour interests
      expect(result.sections.interests).toBeUndefined();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS PRÉFÉRENCES UTILISATEUR
  // ═══════════════════════════════════════════════════════════

  describe("Préférences utilisateur", () => {
    it("devrait inclure photo dans header si demandé", () => {
      const result = generateAdaptiveCV(juniorProfile, null, "modern_spacious", {
        include_photo: true
      });

      expect(result.sections.header.content.format).toBe("with_photo");
      expect(result.sections.header.units_used).toBe(20);
    });

    it("ne devrait pas inclure photo si non demandé", () => {
      const result = generateAdaptiveCV(juniorProfile, null, "classic", {
        include_photo: false
      });

      expect(result.sections.header.content.format).not.toBe("with_photo");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS WARNINGS
  // ═══════════════════════════════════════════════════════════

  describe("Warnings", () => {
    it("devrait générer des warnings si contenu exclu", () => {
      // Profil senior sur compact_ats devrait exclure certaines expériences
      const result = generateAdaptiveCV(seniorProfile, null, "compact_ats", {});

      // Devrait avoir au moins un warning (expériences ou formations exclues)
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("ne devrait pas générer de warnings pour profil junior sur classic", () => {
      const result = generateAdaptiveCV(juniorProfile, null, "classic", {});

      // Profil junior devrait tout rentrer facilement
      expect(result.warnings.length).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS RECOMMANDATION THÈME
  // ═══════════════════════════════════════════════════════════

  describe("Recommandation de thème", () => {
    it("devrait recommander compact_ats pour profil junior", () => {
      const recommended = recommendTheme(juniorProfile);
      expect(recommended).toBe("compact_ats");
    });

    it("devrait recommander classic ou modern_spacious pour profil senior", () => {
      const recommended = recommendTheme(seniorProfile);
      expect(["classic", "modern_spacious"]).toContain(recommended);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TESTS EDGE CASES
  // ═══════════════════════════════════════════════════════════

  describe("Edge cases", () => {
    it("devrait gérer un profil sans expériences", () => {
      const emptyProfile = {
        ...juniorProfile,
        experiences: []
      };

      const result = generateAdaptiveCV(emptyProfile, null, "classic", {});

      expect(result.sections.experiences.length).toBe(0);
      expect(result.warnings.some((w) => w.includes("No experiences"))).toBe(true);
    });

    it("devrait gérer un profil sans elevator_pitch", () => {
      const noPitchProfile = {
        ...juniorProfile,
        profil: {
          ...juniorProfile.profil,
          elevator_pitch: undefined
        }
      };

      const result = generateAdaptiveCV(noPitchProfile, null, "classic", {});

      expect(result.sections.summary.units_used).toBe(0);
    });

    it("devrait gérer une expérience sans réalisations", () => {
      const noAchievementsProfile = {
        ...juniorProfile,
        experiences: [
          {
            ...juniorProfile.experiences[0],
            realisations: []
          }
        ]
      };

      const result = generateAdaptiveCV(noAchievementsProfile, null, "classic", {});

      expect(result.sections.experiences.length).toBeGreaterThan(0);
      expect(result.sections.experiences[0].content.achievements.length).toBe(0);
    });
  });
});
