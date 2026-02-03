import { describe, it, expect } from "vitest";
import { extractJobTextFromHtml } from "@/lib/job/extract-job-text";

describe("extractJobTextFromHtml", () => {
    it("privilégie JSON-LD JobPosting quand présent", () => {
        const html = `
        <html>
          <head>
            <title>Offre - Exemple</title>
            <meta name="description" content="meta desc courte" />
            <script type="application/ld+json">
              {
                "@context":"https://schema.org",
                "@type":"JobPosting",
                "title":"Senior PM",
                "description":"Nous recherchons un Senior PM. Missions: piloter, cadrer, livrer.",
                "hiringOrganization":{"@type":"Organization","name":"ACME"}
              }
            </script>
          </head>
          <body>
            <main class="content">Ceci est une page avec beaucoup de texte mais moins utile.</main>
          </body>
        </html>
        `;

        const { text, debug } = extractJobTextFromHtml(html, "https://example.com/job/1");
        expect(text).toContain("Nous recherchons un Senior PM");
        expect(debug.jsonld?.jobPostingFound).toBe(true);
        expect(debug.jsonld?.company).toBe("ACME");
        expect(debug.chosen?.source).toBe("jsonld");
    });

    it("fallback sur contenu DOM quand pas de JSON-LD", () => {
        const html = `
        <html>
          <head>
            <meta property="og:description" content="og desc courte" />
          </head>
          <body>
            <div class="jobs-description-content__text">
              Description longue du poste avec responsabilités, stack, et contexte.
            </div>
          </body>
        </html>
        `;

        const { text, debug } = extractJobTextFromHtml(html, "https://boards.example.com/job/2");
        expect(text).toContain("Description longue du poste");
        expect(debug.chosen?.source).toBe("selector");
    });

    it("détecte un blocage probable LinkedIn", () => {
        const html = `
        <html><body>
          <div>Sign in</div>
          <div id="authwall">authwall</div>
        </body></html>
        `;
        const { debug } = extractJobTextFromHtml(html, "https://www.linkedin.com/jobs/view/123");
        expect(debug.isLinkedIn).toBe(true);
        expect(debug.likelyBlocked).toBe(true);
    });
});

