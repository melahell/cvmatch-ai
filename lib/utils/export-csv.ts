export function exportJobsToCSV(jobs: any[]) {
    // Define CSV headers
    const headers = [
        'Poste',
        'Entreprise',
        'Localisation',
        'Statut',
        'Score Match',
        'Date Ajout',
        'URL Offre'
    ];

    // Convert jobs to CSV rows
    const rows = jobs.map(job => [
        job.job_title || '',
        job.company || '',
        job.location || '',
        getStatusLabel(job.application_status),
        `${job.match_score}%`,
        formatDate(job.submitted_at),
        job.job_url || ''
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidatures_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'À faire',
        applied: 'Postulé',
        interviewing: 'Entretien',
        rejected: 'Refusé',
        offer: 'Offre reçue'
    };
    return labels[status] || status;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
