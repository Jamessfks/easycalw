/**
 * Transcript Backup — saves interview transcript to localStorage
 * for crash recovery when a call drops mid-interview.
 */

const STORAGE_KEY = 'easyclaw_transcript_backup';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function saveTranscriptBackup(entries, formattedTranscript) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            entries,
            formattedTranscript,
            savedAt: new Date().toISOString(),
        }));
    } catch {
        // localStorage full or disabled
    }
}

export function getTranscriptBackup() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const backup = JSON.parse(raw);

        // Expire after 24 hours
        const age = Date.now() - new Date(backup.savedAt).getTime();
        if (age > MAX_AGE_MS) {
            clearTranscriptBackup();
            return null;
        }

        return backup;
    } catch {
        return null;
    }
}

export function clearTranscriptBackup() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // silent
    }
}
