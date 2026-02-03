import { Suspense } from "react";
import DemoPrintClient from "./PrintClient";

export const dynamic = "force-dynamic";

export default function DemoPrintPage() {
    return (
        <Suspense fallback={<div className="p-12" />}>
            <DemoPrintClient />
        </Suspense>
    );
}
