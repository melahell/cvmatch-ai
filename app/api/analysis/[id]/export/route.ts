import { NextResponse } from 'next/server';
import { createSupabaseUserClient, requireSupabaseUser } from '@/lib/supabase';
import { jsPDF } from 'jspdf';
import { logger } from '@/lib/utils/logger';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await requireSupabaseUser(request);
        if (auth.error || !auth.user || !auth.token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const supabase = createSupabaseUserClient(auth.token);

        // Get analysis data
        const { data: analysis, error } = await supabase
            .from('job_analyses')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', auth.user.id)
            .single();

        if (error || !analysis) {
            return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
        }

        // Create PDF
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('Analyse de Candidature', 20, 20);

        // Job details
        doc.setFontSize(12);
        doc.text(`Poste: ${analysis.job_title || 'N/A'}`, 20, 35);
        doc.text(`Entreprise: ${analysis.company || 'N/A'}`, 20, 45);

        // Score
        doc.setFontSize(16);
        doc.text(`Score de Match: ${analysis.match_score}%`, 20, 60);

        // Strengths
        doc.setFontSize(14);
        doc.text('Forces:', 20, 75);
        doc.setFontSize(10);
        const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
        if (strengths.length > 0) {
            strengths.forEach((strength: string, index: number) => {
                doc.text(`• ${strength}`, 25, 85 + (index * 7));
            });
        }

        // Weaknesses
        const weaknessY = 85 + (strengths.length * 7) + 10;
        doc.setFontSize(14);
        doc.text('Points à améliorer:', 20, weaknessY);
        doc.setFontSize(10);
        const gaps = Array.isArray(analysis.gaps) ? analysis.gaps : [];
        if (gaps.length > 0) {
            gaps.forEach((weakness: string, index: number) => {
                doc.text(`• ${weakness}`, 25, weaknessY + 10 + (index * 7));
            });
        }

        // Footer
        doc.setFontSize(8);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 280);

        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="analyse-${params.id}.pdf"`
            }
        });
    } catch (error: any) {
        logger.error('PDF generation error', { error: error?.message, analysisId: params.id });
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
