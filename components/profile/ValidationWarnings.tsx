import { AlertTriangle, Info, Lightbulb, CheckCircle2 } from "lucide-react";

interface ValidationWarning {
    severity: "critical" | "warning" | "info";
    category: string;
    message: string;
}

interface ValidationWarningsProps {
    warnings?: ValidationWarning[];
    suggestions?: string[];
    qualityBreakdown?: {
        overall: number;
        completeness: number;
        quality: number;
        impact: number;
    };
}

export function ValidationWarnings({ warnings, suggestions, qualityBreakdown }: ValidationWarningsProps) {
    // Don't show if no warnings or suggestions
    if ((!warnings || warnings.length === 0) && (!suggestions || suggestions.length === 0)) {
        return null;
    }

    const getSeverityStyle = (severity: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-50 border-red-200 text-red-800";
            case "warning":
                return "bg-yellow-50 border-yellow-200 text-yellow-800";
            case "info":
            default:
                return "bg-blue-50 border-blue-200 text-blue-800";
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "critical":
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case "warning":
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case "info":
            default:
                return <Info className="w-4 h-4 text-blue-600" />;
        }
    };

    return (
        <div className="space-y-4 mb-6">
            {/* Quality Breakdown */}
            {qualityBreakdown && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Qualité de votre profil
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <QualityMetric label="Global" score={qualityBreakdown.overall} />
                        <QualityMetric label="Complétude" score={qualityBreakdown.completeness} />
                        <QualityMetric label="Qualité" score={qualityBreakdown.quality} />
                        <QualityMetric label="Impact" score={qualityBreakdown.impact} />
                    </div>
                </div>
            )}

            {/* Warnings */}
            {warnings && warnings.length > 0 && (
                <div className="space-y-2">
                    {warnings.map((warning, idx) => (
                        <div
                            key={idx}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityStyle(warning.severity)}`}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                {getSeverityIcon(warning.severity)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">{warning.category}</p>
                                <p className="text-sm mt-0.5">{warning.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Suggestions */}
            {suggestions && suggestions.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        Suggestions d'amélioration
                    </h3>
                    <ul className="space-y-1.5 text-sm text-purple-800">
                        {suggestions.slice(0, 5).map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-400 font-medium mt-0.5">→</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function QualityMetric({ label, score }: { label: string; score: number }) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-50";
        if (score >= 60) return "text-yellow-600 bg-yellow-50";
        return "text-red-600 bg-red-50";
    };

    return (
        <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}
            </div>
            <div className="text-xs text-gray-600 mt-1">{label}</div>
        </div>
    );
}
