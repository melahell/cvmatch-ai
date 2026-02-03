export default function RouteLoading({ text = "Chargement..." }: { text?: string }) {
    return (
        <div className="min-h-[70vh] w-full flex items-center justify-center bg-slate-50">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-8 shadow-sm">
                <div className="flex flex-col items-center justify-center gap-2" role="status" aria-live="polite" aria-busy="true">
                    <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span className="text-sm text-slate-600">{text}</span>
                </div>
            </div>
        </div>
    );
}
