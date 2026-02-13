import { Suspense } from "react";
import RouteLoading from "@/components/loading/RouteLoading";
import DemoPrintClient from "./PrintClient";

export const dynamic = "force-dynamic";

export default function DemoPrintPage() {
    return (
        <Suspense fallback={<RouteLoading text="Préparation de l’impression..." />}>
            <DemoPrintClient />
        </Suspense>
    );
}
