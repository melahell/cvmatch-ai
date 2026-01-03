import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadCVsAsZip(cvIds: string[], filename: string = 'cvs.zip'): Promise<void> {
    const zip = new JSZip();

    for (const cvId of cvIds) {
        try {
            // Mock: would fetch actual PDF data
            const response = await fetch(`/api/cv/${cvId}/pdf`);
            const blob = await response.blob();
            zip.file(`cv_${cvId}.pdf`, blob);
        } catch (error) {
            console.error(`Failed to add CV ${cvId}:`, error);
        }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, filename);
}

export function batchSelectCVs(cvs: any[], filters?: {
    minScore?: number;
    company?: string;
    dateRange?: { start: Date; end: Date };
}): string[] {
    let filtered = cvs;

    if (filters?.minScore) {
        filtered = filtered.filter(cv =>
            (cv.job_analyses?.[0]?.match_score || 0) >= filters.minScore
        );
    }

    if (filters?.company) {
        filtered = filtered.filter(cv =>
            cv.job_analyses?.[0]?.match_report?.entreprise?.toLowerCase().includes(filters.company.toLowerCase())
        );
    }

    if (filters?.dateRange) {
        filtered = filtered.filter(cv => {
            const date = new Date(cv.created_at);
            return date >= filters.dateRange!.start && date <= filters.dateRange!.end;
        });
    }

    return filtered.map(cv => cv.id);
}
