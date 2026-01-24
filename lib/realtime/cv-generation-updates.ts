/**
 * Real-Time Updates pour génération CV
 * Utilise Supabase Realtime pour updates temps réel
 */

import { createSupabaseClient } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";

/**
 * Subscribe aux updates de génération CV via Supabase Realtime
 */
export function subscribeToCVGeneration(
    jobId: string,
    onUpdate: (progress: number, status: string, data?: any) => void
): RealtimeChannel {
    const supabase = createSupabaseClient();

    const channel = supabase
        .channel(`cv-generation:${jobId}`)
        .on(
            "broadcast",
            { event: "progress" },
            (payload) => {
                logger.debug("CV generation progress update", {
                    jobId,
                    progress: payload.progress,
                    status: payload.status,
                });

                onUpdate(
                    payload.progress || 0,
                    payload.status || "processing",
                    payload.data
                );
            }
        )
        .on(
            "broadcast",
            { event: "complete" },
            (payload) => {
                logger.info("CV generation completed", { jobId, payload });
                onUpdate(100, "completed", payload.data);
            }
        )
        .on(
            "broadcast",
            { event: "error" },
            (payload) => {
                logger.error("CV generation error", { jobId, error: payload.error });
                onUpdate(0, "error", { error: payload.error });
            }
        )
        .subscribe((status) => {
            if (status === "SUBSCRIBED") {
                logger.debug("Subscribed to CV generation updates", { jobId });
            }
        });

    return channel;
}

/**
 * Unsubscribe d'un channel
 */
export function unsubscribeFromCVGeneration(channel: RealtimeChannel) {
    const supabase = createSupabaseClient();
    supabase.removeChannel(channel);
    logger.debug("Unsubscribed from CV generation updates");
}

/**
 * Émet un update de progress (à utiliser dans le worker)
 */
export async function emitCVGenerationProgress(
    jobId: string,
    progress: number,
    status: string,
    data?: any
) {
    const supabase = createSupabaseAdminClient();

    await supabase.channel(`cv-generation:${jobId}`).send({
        type: "broadcast",
        event: "progress",
        payload: {
            progress,
            status,
            data,
        },
    });
}
