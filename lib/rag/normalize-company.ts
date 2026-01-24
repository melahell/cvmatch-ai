/**
 * Company Name Normalization
 * Handles common abbreviations and variations to prevent duplicate experiences
 */

// Common company name mappings
const COMPANY_ALIASES: Record<string, string> = {
    // German automotive
    "vw": "volkswagen",
    "vw fs": "volkswagen financial services",
    "vwfs": "volkswagen financial services",
    "volkswagen fs": "volkswagen financial services",
    "bmw": "bmw group",
    "mercedes": "mercedes-benz",
    "daimler": "mercedes-benz",

    // French banks
    "bnp": "bnp paribas",
    "bnpp": "bnp paribas",
    "sg": "société générale",
    "socgen": "société générale",
    "societe generale": "société générale",
    "ca": "crédit agricole",
    "credit agricole": "crédit agricole",
    "lcl": "lcl",
    "bpce": "groupe bpce",
    "natixis": "natixis",
    "cic": "crédit mutuel cic",
    "cm": "crédit mutuel",

    // Consulting firms
    "cap": "capgemini",
    "cgi": "cgi",
    "atos": "atos",
    "sopra": "sopra steria",
    "steria": "sopra steria",
    "accenture": "accenture",
    "kpmg": "kpmg",
    "ey": "ernst & young",
    "ernst young": "ernst & young",
    "pwc": "pricewaterhousecoopers",
    "deloitte": "deloitte",
    "mckinsey": "mckinsey & company",
    "bcg": "boston consulting group",

    // Tech giants
    "ms": "microsoft",
    "msft": "microsoft",
    "goog": "google",
    "meta": "meta",
    "fb": "meta",
    "facebook": "meta",
    "amzn": "amazon",
    "aws": "amazon web services",

    // French companies
    "edf": "edf",
    "sncf": "sncf",
    "ratp": "ratp",
    "orange": "orange",
    "sfr": "sfr",
    "bouygues": "bouygues",
    "total": "totalenergies",
    "totalenergies": "totalenergies",
    "axa": "axa",
    "allianz": "allianz",

    // Engineering firms
    "assystem": "assystem",
    "alten": "alten",
    "akka": "akka technologies",
    "altran": "capgemini engineering",
    "segula": "segula technologies",
};

/**
 * Normalize a company name for comparison
 * 
 * @param name - Raw company name from document
 * @returns Normalized, lowercase company name
 * 
 * @example
 * normalizeCompanyName("VW FS") → "volkswagen financial services"
 * normalizeCompanyName("BNP Paribas SA") → "bnp paribas"
 * normalizeCompanyName("  Atos France  ") → "atos"
 */
export function normalizeCompanyName(name: string | undefined | null): string {
    if (!name) return "";

    // Basic cleaning
    let normalized = name
        .toLowerCase()
        .trim()
        // Remove common suffixes
        .replace(/\s*(sa|sas|sarl|inc|ltd|gmbh|ag|corp|corporation|group|groupe|france|uk|germany|deutschland)\s*$/gi, "")
        // Remove extra whitespace
        .replace(/\s+/g, " ")
        .trim();

    // Check for known aliases (exact match)
    if (COMPANY_ALIASES[normalized]) {
        return COMPANY_ALIASES[normalized];
    }

    // Check if any alias is contained in the name (improved matching)
    for (const [alias, canonical] of Object.entries(COMPANY_ALIASES)) {
        // Match if alias is at start of name, is a whole word, or is contained (for acronyms)
        const regex = new RegExp(`^${alias}\\b|\\b${alias}\\b|\\b${alias}$`, "i");
        if (regex.test(normalized)) {
            return canonical;
        }
        // Also check if normalized contains the alias as substring (for partial matches)
        if (normalized.includes(alias) && alias.length >= 3) {
            return canonical;
        }
    }

    return normalized;
}

/**
 * Check if two company names refer to the same company
 * 
 * @example
 * areSameCompany("VW FS", "Volkswagen Financial Services") → true
 * areSameCompany("BNP", "Société Générale") → false
 */
export function areSameCompany(name1: string | undefined, name2: string | undefined): boolean {
    const normalized1 = normalizeCompanyName(name1);
    const normalized2 = normalizeCompanyName(name2);

    if (!normalized1 || !normalized2) return false;

    // Exact match after normalization
    if (normalized1 === normalized2) return true;

    // One contains the other (for partial matches)
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        // Only if the shorter one is at least 4 chars
        const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2;
        return shorter.length >= 4;
    }

    return false;
}

export default normalizeCompanyName;
