import { POST as POST_V2 } from "@/app/api/cv/generate-v2/route";

export const runtime = "nodejs";

export async function POST(req: Request) {
    return POST_V2(req);
}

