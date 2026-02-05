import crypto from "crypto";

export function createRequestId(): string {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return crypto.randomBytes(16).toString("hex");
}

