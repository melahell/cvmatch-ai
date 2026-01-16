interface AnalyticsEvent {
    action: string;
    category: string;
    label?: string;
    value?: number;
}

export function trackEvent({ action, category, label, value }: AnalyticsEvent): void {
    // Placeholder for analytics integration (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', { action, category, label, value });
    }
}

export const AnalyticsEvents = {
    // Analysis
    ANALYZE_JOB_STARTED: (mode: string) => trackEvent({
        action: 'analyze_job_started',
        category: 'Analysis',
        label: mode
    }),

    ANALYZE_JOB_COMPLETED: (score: number) => trackEvent({
        action: 'analyze_job_completed',
        category: 'Analysis',
        value: score
    }),

    // Profile
    PROFILE_UPDATED: (section: string) => trackEvent({
        action: 'profile_updated',
        category: 'Profile',
        label: section
    }),

    PROFILE_EXPORTED: (format: string) => trackEvent({
        action: 'profile_exported',
        category: 'Profile',
        label: format
    }),

    // CV Generation
    CV_GENERATED: (templateId: string) => trackEvent({
        action: 'cv_generated',
        category: 'CV',
        label: templateId
    }),

    CV_DOWNLOADED: (cvId: string) => trackEvent({
        action: 'cv_downloaded',
        category: 'CV',
        label: cvId
    }),

    // Tracking
    JOB_STATUS_CHANGED: (newStatus: string) => trackEvent({
        action: 'job_status_changed',
        category: 'Tracking',
        label: newStatus
    })
};
