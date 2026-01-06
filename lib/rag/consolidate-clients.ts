/**
 * Client Consolidation Module
 * Consolidates client references from multiple sources and enriches with sector information
 */

import type { ClientReference } from "@/types/rag";

/**
 * Known company to sector mapping
 */
const SECTOR_MAPPING: Record<string, string> = {
    // Luxe
    "cartier": "Luxe",
    "chanel": "Luxe",
    "lvmh": "Luxe",
    "hermès": "Luxe",
    "hermes": "Luxe",
    "dior": "Luxe",
    "vuitton": "Luxe",
    "louis vuitton": "Luxe",
    "gucci": "Luxe",
    "prada": "Luxe",
    "bulgari": "Luxe",
    "l'oréal": "Luxe",
    "loreal": "Luxe",
    "estée lauder": "Luxe",
    "estee lauder": "Luxe",

    // Finance
    "bnp": "Finance",
    "bnp paribas": "Finance",
    "paribas": "Finance",
    "société générale": "Finance",
    "societe generale": "Finance",
    "crédit agricole": "Finance",
    "credit agricole": "Finance",
    "axa": "Finance",
    "natixis": "Finance",
    "amundi": "Finance",
    "allianz": "Finance",
    "generali": "Finance",
    "groupama": "Finance",
    "caisse d'epargne": "Finance",
    "la poste": "Finance",
    "banque populaire": "Finance",
    "lcl": "Finance",

    // Tech
    "google": "Tech",
    "microsoft": "Tech",
    "amazon": "Tech",
    "meta": "Tech",
    "facebook": "Tech",
    "apple": "Tech",
    "ibm": "Tech",
    "oracle": "Tech",
    "sap": "Tech",
    "salesforce": "Tech",
    "adobe": "Tech",
    "netflix": "Tech",
    "uber": "Tech",
    "airbnb": "Tech",
    "spotify": "Tech",
    "dassault systemes": "Tech",
    "dassault systèmes": "Tech",
    "capgemini": "Tech",
    "atos": "Tech",
    "sopra steria": "Tech",
    "thales": "Tech",

    // Industrie
    "airbus": "Industrie",
    "renault": "Industrie",
    "psa": "Industrie",
    "peugeot": "Industrie",
    "citroën": "Industrie",
    "citroen": "Industrie",
    "total": "Industrie",
    "totalenergies": "Industrie",
    "schneider": "Industrie",
    "schneider electric": "Industrie",
    "michelin": "Industrie",
    "safran": "Industrie",
    "valeo": "Industrie",
    "saint-gobain": "Industrie",
    "saint gobain": "Industrie",
    "veolia": "Industrie",
    "suez": "Industrie",
    "areva": "Industrie",
    "edf": "Énergie",
    "engie": "Énergie",

    // Santé
    "sanofi": "Santé",
    "novartis": "Santé",
    "roche": "Santé",
    "pfizer": "Santé",
    "merck": "Santé",
    "gsk": "Santé",
    "glaxosmithkline": "Santé",
    "astrazeneca": "Santé",
    "servier": "Santé",
    "ipsen": "Santé",

    // Transport
    "sncf": "Transport",
    "ratp": "Transport",
    "transdev": "Transport",
    "keolis": "Transport",
    "air france": "Transport",
    "klm": "Transport",
    "cma cgm": "Transport",

    // Retail
    "carrefour": "Retail",
    "auchan": "Retail",
    "leclerc": "Retail",
    "casino": "Retail",
    "intermarché": "Retail",
    "intermarche": "Retail",
    "monoprix": "Retail",
    "fnac": "Retail",
    "darty": "Retail",
    "decathlon": "Retail",

    // Telecom
    "orange": "Telecom",
    "bouygues": "Telecom",
    "sfr": "Telecom",
    "free": "Telecom",

    // Conseil
    "mckinsey": "Conseil",
    "bcg": "Conseil",
    "boston consulting": "Conseil",
    "bain": "Conseil",
    "deloitte": "Conseil",
    "pwc": "Conseil",
    "kpmg": "Conseil",
    "ey": "Conseil",
    "ernst & young": "Conseil",
    "accenture": "Conseil",
    "roland berger": "Conseil",
    "oliver wyman": "Conseil",

    // Media
    "tf1": "Media",
    "france télévisions": "Media",
    "france televisions": "Media",
    "canal+": "Media",
    "canal plus": "Media",
    "m6": "Media",
    "lagardère": "Media",
    "lagardere": "Media",
    "vivendi": "Media",
    "havas": "Media",
    "publicis": "Media",
    "wpp": "Media",
};

/**
 * Infers the sector of a company based on its name
 */
function inferSector(companyName: string): string {
    const normalized = companyName.toLowerCase().trim();

    // Direct match
    if (SECTOR_MAPPING[normalized]) {
        return SECTOR_MAPPING[normalized];
    }

    // Partial match (check if company name contains a known keyword)
    for (const [keyword, sector] of Object.entries(SECTOR_MAPPING)) {
        if (normalized.includes(keyword) || keyword.includes(normalized)) {
            return sector;
        }
    }

    // Default
    return "Autre";
}

/**
 * Normalizes company name (fixes common typos, abbreviations, etc.)
 */
function normalizeCompanyName(name: string): string {
    const normalized = name.trim();

    // Common normalizations
    const normalizations: Record<string, string> = {
        "BNP": "BNP Paribas",
        "SG": "Société Générale",
        "CA": "Crédit Agricole",
        "LV": "Louis Vuitton",
        "TF1": "TF1",
        // Add more as needed
    };

    return normalizations[normalized] || normalized;
}

/**
 * Consolidates client references from experiences and references.clients
 */
export function consolidateClients(ragData: any): any {
    const clientsMap = new Map<string, ClientReference>();

    // 1. Extract from references.clients (priority source)
    const referencesClients = ragData?.references?.clients || [];
    referencesClients.forEach((client: any, idx: number) => {
        const nom = typeof client === "string" ? client : client.nom;
        const normalized = normalizeCompanyName(nom);
        const key = normalized.toLowerCase();

        if (!clientsMap.has(key)) {
            clientsMap.set(key, {
                nom: normalized,
                secteur: typeof client === "string" ? inferSector(nom) : (client.secteur || inferSector(nom)),
                sources: [`references-${idx}`]
            });
        } else {
            // Already exists, just add source
            const existing = clientsMap.get(key)!;
            if (!existing.sources) existing.sources = [];
            existing.sources.push(`references-${idx}`);
        }
    });

    // 2. Extract from experiences[].clients_references
    const experiences = ragData?.experiences || [];
    experiences.forEach((exp: any, expIdx: number) => {
        const clientsRefs = exp?.clients_references || [];
        clientsRefs.forEach((clientName: string) => {
            const normalized = normalizeCompanyName(clientName);
            const key = normalized.toLowerCase();

            if (!clientsMap.has(key)) {
                clientsMap.set(key, {
                    nom: normalized,
                    secteur: inferSector(clientName),
                    sources: [`experience-${expIdx}`]
                });
            } else {
                // Already exists, just add source
                const existing = clientsMap.get(key)!;
                if (!existing.sources) existing.sources = [];
                if (!existing.sources.includes(`experience-${expIdx}`)) {
                    existing.sources.push(`experience-${expIdx}`);
                }
            }
        });
    });

    // 3. Rebuild the structure with consolidated clients
    const consolidatedClients = Array.from(clientsMap.values());

    // Sort by number of sources (most mentioned first), then alphabetically
    consolidatedClients.sort((a, b) => {
        const aCount = a.sources?.length || 0;
        const bCount = b.sources?.length || 0;
        if (bCount !== aCount) return bCount - aCount;
        return a.nom.localeCompare(b.nom);
    });

    return {
        ...ragData,
        references: {
            ...ragData.references,
            clients: consolidatedClients
        }
    };
}

/**
 * Gets all unique client names from RAG data
 */
export function getAllClientNames(ragData: any): string[] {
    const clients = new Set<string>();

    // From references
    ragData?.references?.clients?.forEach((client: any) => {
        const nom = typeof client === "string" ? client : client.nom;
        if (nom) clients.add(nom);
    });

    // From experiences
    ragData?.experiences?.forEach((exp: any) => {
        exp?.clients_references?.forEach((name: string) => {
            if (name) clients.add(normalizeCompanyName(name));
        });
    });

    return Array.from(clients).sort();
}

/**
 * Groups clients by sector
 */
export function groupClientsBySector(ragData: any): Record<string, ClientReference[]> {
    const consolidated = consolidateClients(ragData);
    const clients = consolidated.references?.clients || [];

    const grouped: Record<string, ClientReference[]> = {};

    clients.forEach((client: ClientReference) => {
        const sector = client.secteur || "Autre";
        if (!grouped[sector]) {
            grouped[sector] = [];
        }
        grouped[sector].push(client);
    });

    return grouped;
}
