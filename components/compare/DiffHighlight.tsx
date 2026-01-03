"use client";

interface DiffHighlightProps {
    valueA: string | number;
    valueB: string | number;
    label: string;
}

export function DiffHighlight({ valueA, valueB, label }: DiffHighlightProps) {
    const isDifferent = valueA !== valueB;

    return (
        <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`font-medium ${isDifferent ? 'bg-yellow-50 px-2 py-1 rounded' : ''}`}>
                    {valueA || '-'}
                </p>
            </div>
            <div>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`font-medium ${isDifferent ? 'bg-yellow-50 px-2 py-1 rounded' : ''}`}>
                    {valueB || '-'}
                </p>
            </div>
        </div>
    );
}
