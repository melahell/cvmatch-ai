export default function RouteLoading({ text = "Chargement..." }: { text?: string }) {
    return (
        <div className="min-h-[70vh] w-full flex items-center justify-center bg-surface-secondary">
            <div className="rounded-2xl border border-cvBorder-light bg-surface-primary/80 backdrop-blur px-6 py-8 shadow-level-1">
                <div className="flex flex-col items-center justify-center gap-2" role="status" aria-live="polite" aria-busy="true">
                    <div className="h-8 w-8 rounded-full border-2 border-cvBorder-light border-t-neon-purple animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span className="text-sm text-cvText-secondary">{text}</span>
                </div>
            </div>
        </div>
    );
}
