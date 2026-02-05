import { NextResponse } from "next/server";
import pkg from "@/package.json";

export async function GET() {
    return NextResponse.json({
        version: pkg.version,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
}
