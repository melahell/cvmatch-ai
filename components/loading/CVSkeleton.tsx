"use client";

/**
 * CVSkeleton - Skeleton loading pour CV
 * Affiche un placeholder animé pendant le chargement
 */

export function CVSkeleton() {
    return (
        <div className="animate-pulse space-y-6 p-8 bg-white rounded-lg shadow-lg max-w-[900px] mx-auto">
            {/* Header */}
            <div className="space-y-3">
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>

            {/* Contact */}
            <div className="flex gap-4">
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded w-32" />
            </div>

            {/* Section */}
            <div className="space-y-4">
                <div className="h-6 bg-slate-300 rounded w-1/4" />
                <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded" />
                    <div className="h-4 bg-slate-200 rounded w-5/6" />
                    <div className="h-4 bg-slate-200 rounded w-4/6" />
                </div>
            </div>

            {/* Section */}
            <div className="space-y-4">
                <div className="h-6 bg-slate-300 rounded w-1/4" />
                <div className="space-y-3">
                    <div className="space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-2/3" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="space-y-1 ml-4">
                            <div className="h-3 bg-slate-200 rounded w-full" />
                            <div className="h-3 bg-slate-200 rounded w-5/6" />
                            <div className="h-3 bg-slate-200 rounded w-4/6" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-2/3" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="space-y-1 ml-4">
                            <div className="h-3 bg-slate-200 rounded w-full" />
                            <div className="h-3 bg-slate-200 rounded w-5/6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
                <div className="h-6 bg-slate-300 rounded w-1/4" />
                <div className="flex flex-wrap gap-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-6 bg-slate-200 rounded-full w-20" />
                    ))}
                </div>
            </div>
        </div>
    );
}
