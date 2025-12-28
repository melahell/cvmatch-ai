
import { Badge } from "@/components/ui/badge";
import packageJson from "@/package.json";

export default function VersionOverlay() {
    return (
        <div className="fixed top-2 right-2 z-50 pointer-events-none">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm shadow-sm text-xs font-mono opacity-50 hover:opacity-100 transition-opacity pointer-events-auto">
                v{packageJson.version}
            </Badge>
        </div>
    );
}
