import { load } from "cheerio";

export type JobExtractionSource =
    | "jsonld"
    | "selector"
    | "meta_description"
    | "meta_og_description"
    | "title";

export interface JobExtractionDebug {
    url?: string;
    isLinkedIn?: boolean;
    likelyBlocked?: boolean;
    candidates: Array<{ source: JobExtractionSource; length: number }>;
    chosen?: { source: JobExtractionSource; length: number };
    meta?: {
        title?: string | null;
        description?: string | null;
        ogTitle?: string | null;
        ogDescription?: string | null;
    };
    jsonld?: {
        jobPostingFound: boolean;
        title?: string | null;
        company?: string | null;
        descriptionLength?: number;
    };
}

function normalizeWhitespace(input: string): string {
    return input.replace(/\s+/g, " ").trim();
}

function detectLikelyLinkedInBlock(html: string, url?: string): boolean {
    const u = (url ?? "").toLowerCase();
    if (!u.includes("linkedin.com")) return false;
    const h = html.toLowerCase();
    return (
        h.includes("authwall") ||
        h.includes("voyager-web") ||
        h.includes("sign in") ||
        h.includes("s’identifier") ||
        h.includes("connexion") ||
        h.includes("join now")
    );
}

function safeJsonParse(raw: string): any | null {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function coerceJobPostingFromJsonLd(payload: any): {
    title?: string;
    company?: string;
    description?: string;
} | null {
    const candidates: any[] = [];

    const pushCandidate = (node: any) => {
        if (!node) return;
        candidates.push(node);
        if (Array.isArray(node["@graph"])) candidates.push(...node["@graph"]);
    };

    if (Array.isArray(payload)) payload.forEach(pushCandidate);
    else pushCandidate(payload);

    const isJobPosting = (node: any) => {
        const t = node?.["@type"];
        if (!t) return false;
        if (typeof t === "string") return t.toLowerCase() === "jobposting";
        if (Array.isArray(t)) return t.map((x) => String(x).toLowerCase()).includes("jobposting");
        return false;
    };

    const jobPosting = candidates.find(isJobPosting);
    if (!jobPosting) return null;

    const title = typeof jobPosting.title === "string" ? jobPosting.title : undefined;
    const description = typeof jobPosting.description === "string" ? jobPosting.description : undefined;

    const hiringOrg = jobPosting.hiringOrganization;
    const company =
        typeof hiringOrg?.name === "string"
            ? hiringOrg.name
            : typeof jobPosting.company === "string"
                ? jobPosting.company
                : undefined;

    return { title, company, description };
}

export function extractJobTextFromHtml(html: string, url?: string): { text: string; debug: JobExtractionDebug } {
    const $ = load(html);
    const metaDescription = $('meta[name="description"]').attr("content") ?? null;
    const ogTitle = $('meta[property="og:title"]').attr("content") ?? null;
    const ogDescription = $('meta[property="og:description"]').attr("content") ?? null;
    const title = $("title").text()?.trim() || null;

    const jsonLdNodes = $('script[type="application/ld+json"]')
        .toArray()
        .map((el) => $(el).text())
        .map((raw) => safeJsonParse(raw))
        .filter(Boolean);

    const jobPosting = jsonLdNodes.map(coerceJobPostingFromJsonLd).find(Boolean) ?? null;
    const jsonLdDescription = jobPosting?.description ? normalizeWhitespace(jobPosting.description) : "";

    $("script, style, nav, header, footer, aside").remove();

    const selectors = [
        '[class*="description"]',
        '[data-test*="description"]',
        ".jobs-description-content__text",
        ".show-more-less-html__markup",
        "article",
        "main",
        ".content",
        "body",
    ];

    let selectorText = "";
    for (const sel of selectors) {
        const found = normalizeWhitespace($(sel).text());
        if (found && found.length > selectorText.length) selectorText = found;
    }

    const candidateList: Array<{ source: JobExtractionSource; text: string }> = [
        { source: "jsonld", text: jsonLdDescription },
        { source: "selector", text: selectorText },
        { source: "meta_og_description", text: normalizeWhitespace(ogDescription ?? "") },
        { source: "meta_description", text: normalizeWhitespace(metaDescription ?? "") },
        { source: "title", text: normalizeWhitespace(ogTitle ?? title ?? "") },
    ];
    const candidates = candidateList.filter((c) => c.text.length > 0);

    const chosen = candidates.slice().sort((a, b) => b.text.length - a.text.length)[0] ?? null;

    const debug: JobExtractionDebug = {
        url,
        isLinkedIn: (url ?? "").toLowerCase().includes("linkedin.com") || undefined,
        likelyBlocked: detectLikelyLinkedInBlock(html, url) || undefined,
        candidates: candidates.map((c) => ({ source: c.source, length: c.text.length })),
        chosen: chosen ? { source: chosen.source, length: chosen.text.length } : undefined,
        meta: {
            title,
            description: metaDescription,
            ogTitle,
            ogDescription,
        },
        jsonld: {
            jobPostingFound: !!jobPosting,
            title: jobPosting?.title ?? null,
            company: jobPosting?.company ?? null,
            descriptionLength: jobPosting?.description ? normalizeWhitespace(jobPosting.description).length : undefined,
        },
    };

    return { text: chosen?.text ?? "", debug };
}
