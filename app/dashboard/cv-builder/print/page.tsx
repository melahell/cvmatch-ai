import { Suspense } from "react";
import RouteLoading from "@/components/loading/RouteLoading";
import CVBuilderPrintClient from "./PrintClient";

export const dynamic = "force-dynamic";

export default function CVBuilderPrintPage() {
    return (
        <Suspense fallback={<RouteLoading text="Préparation de l’impression..." />}>
            <CVBuilderPrintClient />
        </Suspense>
    );
}
