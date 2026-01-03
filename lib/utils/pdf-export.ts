import jsPDF from 'jspdf';

export async function exportCompareToPDF(
    analysisA: any,
    analysisB: any,
    filename: string = 'comparison.pdf'
): Promise<void> {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Comparaison d\'Analyses', 20, 20);

    // Analysis A
    doc.setFontSize(16);
    doc.text('Analyse A', 20, 40);
    doc.setFontSize(12);
    doc.text(`Poste: ${analysisA.match_report?.poste_cible || 'N/A'}`, 20, 50);
    doc.text(`Entreprise: ${analysisA.match_report?.entreprise || 'N/A'}`, 20, 60);
    doc.text(`Score: ${analysisA.match_score}%`, 20, 70);

    // Analysis B
    doc.setFontSize(16);
    doc.text('Analyse B', 20, 90);
    doc.setFontSize(12);
    doc.text(`Poste: ${analysisB.match_report?.poste_cible || 'N/A'}`, 20, 100);
    doc.text(`Entreprise: ${analysisB.match_report?.entreprise || 'N/A'}`, 20, 110);
    doc.text(`Score: ${analysisB.match_score}%`, 20, 120);

    // Diff
    const diff = Math.abs(analysisA.match_score - analysisB.match_score);
    doc.setFontSize(14);
    doc.text(`Différence de score: ${diff}%`, 20, 140);

    // Save
    doc.save(filename);
}
