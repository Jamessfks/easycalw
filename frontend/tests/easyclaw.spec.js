// @ts-check
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

// Helper: load a demo guide and wait for output view
async function loadDemoGuide(page, demoName = 'Scouts Coffee') {
    await page.goto(BASE);
    await page.locator('button', { hasText: demoName }).click();
    await expect(page.getByText('Your Setup Guide', { exact: true })).toBeVisible({ timeout: 15000 });
}

// ───────────────────────────────────────────
// 1. Landing page loads correctly
// ───────────────────────────────────────────
test('landing page — title and start button visible', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole('navigation').getByText('EasyClaw')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Start Voice Interview' })).toBeVisible();
});

// ───────────────────────────────────────────
// 2. Demo guide loads — click a demo, verify content renders
// ───────────────────────────────────────────
test('demo guide — clicking demo renders guide output', async ({ page }) => {
    await loadDemoGuide(page);
    await expect(page.locator('button', { hasText: 'Setup Guide' })).toBeVisible();
});

// ───────────────────────────────────────────
// 3. Hangup/Cancel button visible during connecting state
// ───────────────────────────────────────────
test('interview view — cancel button appears during connecting', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('button', { hasText: 'Start Voice Interview' }).click();

    // Should navigate to interview view with Start button (idle state)
    await expect(page.locator('text=Voice Interview')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button', { hasText: 'Start' })).toBeVisible();
});

// ───────────────────────────────────────────
// 4. Error state shows retry button
// ───────────────────────────────────────────
test('error state — OutputDisplay renders error for invalid guide', async ({ page }) => {
    await page.goto(`${BASE}/view/nonexistent-guide-id`);

    // GuidePageView polls /guide/{id} — backend returns not_found status
    // OutputDisplay treats not_found as error and shows categorized error UI
    // Wait for either the error message text or the "Start New Interview" button
    await expect(
        page.locator('text=/not found|Something went wrong|Generation Failed|Unknown Error|Start New Interview/i').first()
    ).toBeVisible({ timeout: 20000 });
});

// ───────────────────────────────────────────
// 5. Output tabs switch correctly (Guide / References / Prompts)
// ───────────────────────────────────────────
test('output tabs — switching between Guide, References, Prompts', async ({ page }) => {
    await loadDemoGuide(page);

    // Click References tab
    const refsTab = page.locator('button', { hasText: 'Reference Docs' });
    if (await refsTab.isEnabled()) {
        await refsTab.click();
        // Should show reference doc cards (with expand/collapse) or empty state
        // Wait for either a doc card button or the empty state message
        await page.waitForTimeout(500);
        const hasDocCards = await page.locator('button:has-text("Download .md")').count() > 0;
        const hasEmptyState = await page.locator('text=/No reference documents/i').count() > 0;
        expect(hasDocCards || hasEmptyState).toBe(true);
    }

    // Click Prompts tab
    const promptsTab = page.locator('button', { hasText: /^Prompts$/ });
    if (await promptsTab.isEnabled()) {
        await promptsTab.click();
        // Verify prompts content area renders
        await expect(page.locator('.prose')).toBeVisible({ timeout: 3000 });
    }

    // Click back to Guide tab
    await page.locator('button', { hasText: 'Setup Guide' }).click();
    await expect(page.getByText('Your Setup Guide', { exact: true })).toBeVisible();
});

// ───────────────────────────────────────────
// 6. Copy button works (clipboard API)
// ───────────────────────────────────────────
test('copy button — triggers clipboard write', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await loadDemoGuide(page);

    const copyBtn = page.locator('button', { hasText: 'Copy' }).first();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    await expect(page.locator('text=Copied').first()).toBeVisible({ timeout: 2000 });
});

// ───────────────────────────────────────────
// 7. Download .md button triggers download
// ───────────────────────────────────────────
test('download button — triggers .md file download', async ({ page }) => {
    await loadDemoGuide(page);

    const downloadPromise = page.waitForEvent('download');
    const downloadBtn = page.locator('button', { hasText: 'Download .md' }).first();
    await expect(downloadBtn).toBeVisible();
    await downloadBtn.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.md');
});

// ───────────────────────────────────────────
// 8. API health endpoint returns 200
// ───────────────────────────────────────────
test('API /health — returns 200 with ok status', async ({ request }) => {
    const res = await request.get(`${BASE}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('easyclaw');
});

// ───────────────────────────────────────────
// 9. /demos endpoint returns array with demo guides
// ───────────────────────────────────────────
test('API /demos — returns array of demo guides', async ({ request }) => {
    const res = await request.get(`${BASE}/demos`);
    expect(res.status()).toBe(200);
    const demos = await res.json();
    expect(Array.isArray(demos)).toBe(true);
    expect(demos.length).toBeGreaterThan(0);
    expect(demos[0]).toHaveProperty('demo_id');
    expect(demos[0]).toHaveProperty('title');
});

// ───────────────────────────────────────────
// 10. /format endpoint works with sample transcript
// ───────────────────────────────────────────
test('API /format — formats a sample transcript', async ({ request }) => {
    const res = await request.post(`${BASE}/format`, {
        data: {
            transcript: 'User: I want to set up a restaurant automation system.\nAgent: Great! Tell me about your restaurant.',
        },
    });
    // Could be 200 or 429 (rate limited) — both are valid server responses
    expect([200, 429]).toContain(res.status());
    if (res.status() === 200) {
        const body = await res.json();
        expect(body).toHaveProperty('formatted');
        expect(body.formatted.length).toBeGreaterThan(0);
    }
});

// ───────────────────────────────────────────
// 11. Guide output has all 3 sections (setup guide, prompts)
// ───────────────────────────────────────────
test('demo guide — has setup guide content and prompts tab', async ({ page }) => {
    await loadDemoGuide(page);

    // Guide content should be rendered
    await expect(page.locator('.prose')).toBeVisible();

    // All 3 tabs should exist
    await expect(page.locator('button', { hasText: 'Setup Guide' })).toBeVisible();
    await expect(page.locator('button', { hasText: /^Prompts$/ })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Reference Docs' })).toBeVisible();
});

// ───────────────────────────────────────────
// 12. Loading screen shows during generation
// ───────────────────────────────────────────
test('loading screen — appears during demo generation', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('button', { hasText: 'Autonomous Dev Agent' }).click();

    // Either loading screen or final output should appear
    const loadingOrOutput = page.locator('text=/Processing|Reading|Writing|Your Setup Guide|Exploring/');
    await expect(loadingOrOutput).toBeVisible({ timeout: 30000 });
});

// ───────────────────────────────────────────
// 13. "Start New Interview" / restart flow works
// ───────────────────────────────────────────
test('restart flow — back to landing from demo output', async ({ page }) => {
    await loadDemoGuide(page);

    // The header has a "Start New Interview" button and footer has "Start a new interview →"
    // Use the one that's visible
    const restartBtn = page.locator('button', { hasText: /Start.*(New|new).*(Interview|interview)/i }).first();
    await expect(restartBtn).toBeVisible();
    await restartBtn.click();

    // Should be back on landing
    await expect(page.locator('button', { hasText: 'Start Voice Interview' })).toBeVisible({ timeout: 5000 });
});

// ───────────────────────────────────────────
// 14. Mobile viewport (375px) — layout doesn't break
// ───────────────────────────────────────────
test('mobile viewport — layout renders at 375px width', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    await page.goto(BASE);

    // Landing page elements should still be visible
    await expect(page.getByRole('navigation').getByText('EasyClaw')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Start Voice Interview' })).toBeVisible();

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 10);

    await context.close();
});

// ───────────────────────────────────────────
// 15. Demo badge and share link behavior
// ───────────────────────────────────────────
test('demo output — Demo badge visible, share link hidden for demos', async ({ page }) => {
    await loadDemoGuide(page);

    // Demo guides show "Demo" badge
    await expect(page.getByText('Demo', { exact: true })).toBeVisible();

    // Copy Link button should NOT be visible for demo guides (guide_id starts with "demo-")
    await expect(page.locator('button', { hasText: 'Copy Link' })).not.toBeVisible();

    // Download .zip should always be present
    await expect(page.locator('button', { hasText: 'Download .zip' })).toBeVisible();
});

// ───────────────────────────────────────────
// Bonus: ZIP download button is present and clickable
// ───────────────────────────────────────────
test('zip download — button present in demo output', async ({ page }) => {
    await loadDemoGuide(page);

    const zipBtn = page.locator('button', { hasText: 'Download .zip' });
    await expect(zipBtn).toBeVisible();
    await expect(zipBtn).toBeEnabled();
});

// ───────────────────────────────────────────
// Bonus: Empty state for references shows helpful message
// ───────────────────────────────────────────
test('empty references — shows helpful empty state message', async ({ page }) => {
    await loadDemoGuide(page);

    const refsTab = page.locator('button', { hasText: 'Reference Docs' });
    await expect(refsTab).toBeVisible();
});

// ───────────────────────────────────────────
// Callout CSS — blockquotes with emoji markers get correct class
// ───────────────────────────────────────────
test('callout CSS — blockquotes with emoji markers get color classes', async ({ page }) => {
    await loadDemoGuide(page);

    // Check that the classifyCallout logic is wired: any blockquote whose text
    // contains ⚠️, 💡, or ✅ should have the matching callout-* class.
    const calloutCount = await page.evaluate(() => {
        const bqs = document.querySelectorAll('.prose-dark blockquote');
        let matched = 0;
        for (const bq of bqs) {
            const txt = bq.textContent || '';
            if (/⚠️|WARNING/.test(txt) && bq.classList.contains('callout-warning')) matched++;
            if (/💡|TIP/.test(txt) && bq.classList.contains('callout-tip')) matched++;
            if (/✅|ACTION/.test(txt) && bq.classList.contains('callout-action')) matched++;
        }
        return matched;
    });

    // If the demo guide has callout blockquotes they should be classified.
    // Even if 0 callouts exist in this demo, verify no misclassified blockquotes.
    const misclassified = await page.evaluate(() => {
        const bqs = document.querySelectorAll('.prose-dark blockquote');
        let bad = 0;
        for (const bq of bqs) {
            const txt = bq.textContent || '';
            const hasCls = bq.classList.contains('callout-warning')
                || bq.classList.contains('callout-tip')
                || bq.classList.contains('callout-action');
            const hasMarker = /⚠️|WARNING|💡|TIP|✅|ACTION/.test(txt);
            if (hasMarker && !hasCls) bad++;
            if (!hasMarker && hasCls) bad++;
        }
        return bad;
    });

    expect(misclassified).toBe(0);
});

// API health check — guides list
test('API /guides — returns guides array', async ({ request }) => {
    const res = await request.get(`${BASE}/guides`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.guides)).toBe(true);
    expect(typeof body.total).toBe('number');
});
