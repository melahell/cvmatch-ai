import { NextResponse } from "next/server";
import packageJson from "@/package.json";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        version: packageJson.version,
        server_time: new Date().toISOString(),
        vercel: {
            env: process.env.VERCEL_ENV ?? null,
            url: process.env.VERCEL_URL ?? null,
            deployment_id: process.env.VERCEL_DEPLOYMENT_ID ?? null,
            git: {
                provider: process.env.VERCEL_GIT_PROVIDER ?? null,
                commit_sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
                commit_message: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? null,
                commit_ref: process.env.VERCEL_GIT_COMMIT_REF ?? null,
            },
        },
    });
}
