import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format a date as relative time (e.g. "il y a 2 heures")
 */
export function formatRelativeDate(date: string | Date): string {
    try {
        return formatDistanceToNow(new Date(date), {
            addSuffix: true,
            locale: fr
        });
    } catch {
        return date.toString();
    }
}

/**
 * Format a date as short French date (e.g. "3 janv")
 */
export function formatShortDate(date: string | Date): string {
    try {
        return format(new Date(date), 'd MMM', { locale: fr });
    } catch {
        return date.toString();
    }
}

/**
 * Format a date as full French date (e.g. "3 janvier 2024")
 */
export function formatFullDate(date: string | Date): string {
    try {
        return format(new Date(date), 'd MMMM yyyy', { locale: fr });
    } catch {
        return date.toString();
    }
}
