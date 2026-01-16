"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function ExportProfileButton() {
    const { userId } = useAuth();
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (!userId) return;

        setExporting(true);
        try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
                .from("rag_metadata")
                .select("completeness_details")
                .eq("user_id", userId)
                .single();

            if (error) throw error;

            // Create JSON blob - export completeness_details
            const json = JSON.stringify(data?.completeness_details || data, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            // Download
            const a = document.createElement("a");
            a.href = url;
            a.download = `profile_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Profil exporté au format JSON");
        } catch (error: any) {
            toast.error("Erreur lors de l'export: " + error.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Export..." : "Export JSON"}
        </Button>
    );
}
