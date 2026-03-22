/**
 * Formatting utility functions
 */

/**
 * Format timestamp to relative time (e.g., "2m ago")
 */
export function formatTimeAgo(timestamp: string | undefined): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

/**
 * Format timestamp to readable time (e.g., "14:35")
 */
export function formatTime(timestamp: string | undefined): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format callsign (e.g., "FROST-7")
 */
export function formatCallsign(callsign: string): string {
    return callsign.toUpperCase();
}

/**
 * Get initials from name (e.g., "Elena Frost" -> "EF")
 */
export function getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
