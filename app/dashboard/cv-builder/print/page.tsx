import { Suspense } from "react";
import CVBuilderPrintClient from "./PrintClient";

export const dynamic = "force-dynamic";

export default function CVBuilderPrintPage() {
    return (
        <Suspense fallback={<div className="p-12" />}>
            <CVBuilderPrintClient />
        </Suspense>
    );
}
