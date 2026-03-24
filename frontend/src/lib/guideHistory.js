/**
 * Guide History — persists completed guide IDs to localStorage
 * so users can revisit previous guides via /view/:guideId
 */

const STORAGE_KEY = 'easyclaw_guide_history';
const MAX_ENTRIES = 50;

export function getGuideHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function addGuideToHistory(guideId, label) {
    const history = getGuideHistory();

    // Don't add duplicates
    if (history.some(h => h.id === guideId)) return;

    history.unshift({
        id: guideId,
        label: label || `Guide ${guideId}`,
        createdAt: new Date().toISOString(),
    });

    // Cap at MAX_ENTRIES
    if (history.length > MAX_ENTRIES) {
        history.length = MAX_ENTRIES;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
        // localStorage full or disabled — silent fail
    }
}

export function clearGuideHistory() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // silent fail
    }
}
