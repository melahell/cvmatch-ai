/**
 * TEMPLATE ENGINE
 *
 * Génère HTML à partir d'un AdaptedContent et d'un thème.
 * Utilise Handlebars pour la population des templates.
 */

import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { AdaptedContent, ThemeId } from "./types";
import { getTheme } from "./theme-configs";

// Register Handlebars helpers
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

Handlebars.registerHelper("gt", function (a, b) {
  return a > b;
});

Handlebars.registerHelper("join", function (array: string[], separator: string) {
  return array.join(separator);
});

Handlebars.registerHelper("formatDate", function (date: string) {
  if (date === "present" || date === "Présent") {
    return "Présent";
  }
  return date;
});

Handlebars.registerHelper("multiply", function (a: number, b: number) {
  return a * b;
});

Handlebars.registerHelper("toFixed", function (num: number, decimals: number) {
  return num.toFixed(decimals);
});

/**
 * Générer HTML complet à partir d'un CV adapté
 */
export async function generateHTML(
  adaptedContent: AdaptedContent,
  themeId: ThemeId
): Promise<string> {
  const theme = getTheme(themeId);

  // Préparer les données pour le template
  const templateData = prepareTemplateData(adaptedContent, theme);

  // Charger le template correspondant
  const templatePath = path.join(
    process.cwd(),
    "public",
    "cv-templates",
    `${themeId}.hbs`
  );

  let templateSource: string;

  // Si template Handlebars n'existe pas, utiliser template inline
  if (fs.existsSync(templatePath)) {
    templateSource = fs.readFileSync(templatePath, "utf-8");
  } else {
    // Fallback: Utiliser template inline (pour development)
    templateSource = getInlineTemplate(themeId);
  }

  // Compiler et exécuter le template
  const template = Handlebars.compile(templateSource);
  const html = template(templateData);

  return html;
}

/**
 * Préparer les données pour le template Handlebars
 */
function prepareTemplateData(adaptedContent: AdaptedContent, theme: any) {
  const { sections } = adaptedContent;

  return {
    // Métadonnées thème
    theme_id: adaptedContent.theme_id,
    pages: adaptedContent.pages,
    total_units: adaptedContent.total_units_used,

    // Visual config (pour CSS variables)
    unit_to_mm: theme.visual_config.unit_to_mm,
    font_sizes: theme.visual_config.font_sizes,
    colors: theme.visual_config.colors,
    spacing_multiplier: theme.visual_config.spacing_multiplier,

    // Units par section (pour CSS calc)
    header_units: sections.header.units_used,
    summary_units: sections.summary.units_used,
    experiences_total_units: sections.experiences.reduce(
      (sum, e) => sum + e.units_used,
      0
    ),
    skills_total_units: sections.skills.reduce((sum, s) => sum + s.units_used, 0),
    formation_total_units: sections.formation.reduce((sum, f) => sum + f.units_used, 0),

    // Header
    header: {
      format: sections.header.content.format,
      nom: sections.header.content.nom,
      prenom: sections.header.content.prenom,
      titre: sections.header.content.titre,
      email: sections.header.content.contact?.email,
      telephone: sections.header.content.contact?.telephone,
      localisation: sections.header.content.contact?.localisation,
      linkedin: sections.header.content.contact?.linkedin
    },

    // Summary
    summary: sections.summary.content
      ? {
          format: sections.summary.content.format,
          text: sections.summary.content.text
        }
      : null,

    // Experiences
    experiences: sections.experiences.map((exp) => ({
      id: exp.id,
      format: exp.format,
      units_used: exp.units_used,
      company: exp.content.company,
      position: exp.content.position,
      dates: exp.content.dates,
      context: exp.content.context,
      achievements: exp.content.achievements,
      technologies: exp.content.technologies,
      relevance_score: exp.relevance_score,
      // Flags pour templates
      is_detailed: exp.format === "detailed",
      is_standard: exp.format === "standard",
      is_compact: exp.format === "compact",
      is_minimal: exp.format === "minimal"
    })),

    // Skills
    skills: sections.skills.map((skill) => ({
      category: skill.category,
      format: skill.format,
      units_used: skill.units_used,
      items: skill.items
    })),

    // Formation
    formations: sections.formation.map((form) => ({
      id: form.id,
      format: form.format,
      units_used: form.units_used,
      diplome: form.content.diplome,
      ecole: form.content.ecole,
      annee: form.content.annee,
      details: form.content.details,
      localisation: form.content.localisation,
      mention: form.content.mention,
      is_detailed: form.format === "detailed"
    })),

    // Certifications (optional)
    certifications: sections.certifications?.map((cert) => ({
      nom: cert.content.nom,
      organisme: cert.content.organisme,
      date: cert.content.date
    })),

    // Languages (optional)
    languages: sections.languages?.map((lang) => ({
      langue: lang.content.langue,
      niveau: lang.content.niveau
    })),

    // Interests (optional)
    interests: sections.interests
  };
}

/**
 * Template inline Classic (fallback si fichier .hbs n'existe pas)
 */
function getInlineTemplate(themeId: ThemeId): string {
  if (themeId === "classic") {
    return getClassicTemplate();
  } else if (themeId === "modern_spacious") {
    return getModernSpaciousTemplate();
  } else if (themeId === "compact_ats") {
    return getCompactATSTemplate();
  }

  return getClassicTemplate(); // Default fallback
}

/**
 * Template Classic Inline
 */
function getClassicTemplate(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - {{header.prenom}} {{header.nom}}</title>
  <style>
    :root {
      --unit-to-mm: {{unit_to_mm}}mm;
      --color-primary: {{colors.primary}};
      --color-secondary: {{colors.secondary}};
      --color-accent: {{colors.accent}};
      --font-name: {{font_sizes.name}}pt;
      --font-title: {{font_sizes.title}}pt;
      --font-section: {{font_sizes.section_header}}pt;
      --font-body: {{font_sizes.body}}pt;
      --font-small: {{font_sizes.small}}pt;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: var(--font-body);
      color: var(--color-primary);
      line-height: 1.4;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      background: white;
      margin: 0 auto;
    }

    /* HEADER */
    .cv-header {
      height: calc({{header_units}} * var(--unit-to-mm));
      border-bottom: 2px solid var(--color-accent);
      padding-bottom: 3mm;
      margin-bottom: 5mm;
    }

    .cv-header h1 {
      font-size: var(--font-name);
      color: var(--color-primary);
      margin-bottom: 2mm;
    }

    .cv-header .title {
      font-size: var(--font-title);
      color: var(--color-secondary);
      font-weight: 500;
      margin-bottom: 2mm;
    }

    .cv-header .contacts {
      display: flex;
      gap: 8mm;
      font-size: var(--font-small);
      color: var(--color-secondary);
      flex-wrap: wrap;
    }

    /* SUMMARY */
    {{#if summary}}
    .cv-summary {
      min-height: calc({{summary_units}} * var(--unit-to-mm));
      margin-bottom: 6mm;
      padding: 3mm;
      background: #f9f9f9;
      border-left: 3px solid var(--color-accent);
    }

    .cv-summary p {
      text-align: justify;
      line-height: 1.5;
    }
    {{/if}}

    /* SECTIONS */
    .cv-section {
      margin-bottom: 6mm;
      page-break-inside: avoid;
    }

    .cv-section-header {
      font-size: var(--font-section);
      font-weight: bold;
      color: var(--color-primary);
      text-transform: uppercase;
      border-bottom: 1px solid var(--color-accent);
      padding-bottom: 2mm;
      margin-bottom: 4mm;
      letter-spacing: 0.5px;
    }

    /* EXPERIENCES */
    .experience-item {
      margin-bottom: 5mm;
      page-break-inside: avoid;
    }

    .experience-item.detailed,
    .experience-item.standard {
      height: calc({{units_used}} * var(--unit-to-mm));
    }

    .exp-header {
      margin-bottom: 2mm;
    }

    .exp-title {
      font-weight: bold;
      font-size: calc(var(--font-body) + 1pt);
      color: var(--color-primary);
    }

    .exp-company-dates {
      color: var(--color-secondary);
      font-size: var(--font-small);
      margin-top: 1mm;
    }

    .exp-context {
      font-style: italic;
      color: var(--color-secondary);
      margin: 2mm 0;
      line-height: 1.3;
    }

    .exp-achievements {
      list-style: none;
      padding-left: 5mm;
    }

    .exp-achievements li {
      position: relative;
      margin-bottom: 1.5mm;
      line-height: 1.4;
    }

    .exp-achievements li::before {
      content: "▸";
      color: var(--color-accent);
      position: absolute;
      left: -5mm;
      font-weight: bold;
    }

    .exp-technologies {
      font-size: var(--font-small);
      color: var(--color-secondary);
      margin-top: 2mm;
    }

    .experience-item.compact,
    .experience-item.minimal {
      height: calc({{units_used}} * var(--unit-to-mm));
    }

    .experience-item.minimal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px dotted #e0e0e0;
      padding: 2mm 0;
    }

    /* SKILLS */
    .skill-category {
      margin-bottom: 4mm;
    }

    .skill-category-title {
      font-weight: bold;
      color: var(--color-primary);
      margin-bottom: 2mm;
    }

    .skill-items {
      display: flex;
      flex-wrap: wrap;
      gap: 3mm;
    }

    .skill-item {
      background: #f5f5f5;
      padding: 1.5mm 3mm;
      border-radius: 3mm;
      font-size: var(--font-small);
      border-left: 2px solid var(--color-accent);
    }

    /* FORMATION */
    .formation-item {
      margin-bottom: 4mm;
      page-break-inside: avoid;
    }

    .formation-title {
      font-weight: bold;
      color: var(--color-primary);
    }

    .formation-school {
      color: var(--color-secondary);
      font-size: var(--font-small);
      margin-top: 1mm;
    }

    .formation-details {
      font-size: var(--font-small);
      color: var(--color-secondary);
      margin-top: 1mm;
    }

    /* CERTIFICATIONS & LANGUAGES */
    .cert-item, .lang-item {
      margin-bottom: 2mm;
      font-size: var(--font-small);
    }

    @media print {
      .page {
        margin: 0;
        padding: 15mm;
        page-break-after: always;
      }

      body {
        background: white;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- HEADER -->
    <header class="cv-header">
      <h1>{{header.prenom}} {{header.nom}}</h1>
      <div class="title">{{header.titre}}</div>
      {{#if header.email}}
      <div class="contacts">
        {{#if header.email}}<span>✉ {{header.email}}</span>{{/if}}
        {{#if header.telephone}}<span>📞 {{header.telephone}}</span>{{/if}}
        {{#if header.localisation}}<span>📍 {{header.localisation}}</span>{{/if}}
        {{#if header.linkedin}}<span>🔗 {{header.linkedin}}</span>{{/if}}
      </div>
      {{/if}}
    </header>

    <!-- SUMMARY -->
    {{#if summary}}
    <section class="cv-summary">
      <p>{{summary.text}}</p>
    </section>
    {{/if}}

    <!-- EXPERIENCES -->
    <section class="cv-section">
      <h2 class="cv-section-header">Expériences Professionnelles</h2>
      {{#each experiences}}
      <div class="experience-item {{this.format}}">
        {{#if this.is_minimal}}
          <div class="exp-title-company">
            <strong>{{this.position}}</strong> | {{this.company}}
          </div>
          <div class="exp-dates">{{this.dates}}</div>
        {{else}}
          <div class="exp-header">
            <div class="exp-title">{{this.position}}</div>
            <div class="exp-company-dates">{{this.company}} | {{this.dates}}</div>
          </div>
          {{#if this.context}}
          <div class="exp-context">{{this.context}}</div>
          {{/if}}
          {{#if this.achievements}}
          <ul class="exp-achievements">
            {{#each this.achievements}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          {{/if}}
          {{#if this.technologies}}
          <div class="exp-technologies">
            <strong>Technologies:</strong> {{join this.technologies ", "}}
          </div>
          {{/if}}
        {{/if}}
      </div>
      {{/each}}
    </section>

    <!-- SKILLS -->
    {{#if skills}}
    <section class="cv-section">
      <h2 class="cv-section-header">Compétences Techniques</h2>
      {{#each skills}}
      <div class="skill-category">
        <div class="skill-category-title">{{this.category}}</div>
        <div class="skill-items">
          {{#each this.items}}
          <span class="skill-item">{{this}}</span>
          {{/each}}
        </div>
      </div>
      {{/each}}
    </section>
    {{/if}}

    <!-- FORMATION -->
    {{#if formations}}
    <section class="cv-section">
      <h2 class="cv-section-header">Formation</h2>
      {{#each formations}}
      <div class="formation-item">
        <div class="formation-title">{{this.diplome}}</div>
        <div class="formation-school">{{this.ecole}} | {{this.annee}}</div>
        {{#if this.details}}
        <div class="formation-details">{{this.details}}</div>
        {{/if}}
      </div>
      {{/each}}
    </section>
    {{/if}}

    <!-- CERTIFICATIONS -->
    {{#if certifications}}
    <section class="cv-section">
      <h2 class="cv-section-header">Certifications</h2>
      {{#each certifications}}
      <div class="cert-item">{{this.nom}} | {{this.organisme}} | {{this.date}}</div>
      {{/each}}
    </section>
    {{/if}}

    <!-- LANGUAGES -->
    {{#if languages}}
    <section class="cv-section">
      <h2 class="cv-section-header">Langues</h2>
      {{#each languages}}
      <div class="lang-item">{{this.langue}}: {{this.niveau}}</div>
      {{/each}}
    </section>
    {{/if}}

  </div>
</body>
</html>`;
}

/**
 * Template Modern Spacious (placeholder)
 */
function getModernSpaciousTemplate(): string {
  // TODO: Implement modern spacious template
  return getClassicTemplate(); // Fallback for now
}

/**
 * Template Compact ATS (placeholder)
 */
function getCompactATSTemplate(): string {
  // TODO: Implement compact ATS template
  return getClassicTemplate(); // Fallback for now
}

export { prepareTemplateData, getInlineTemplate };
