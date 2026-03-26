// @ts-check
import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

// ───────────────────────────────────────────
// Demo golden-path: landing → demo → loading → output → tabs → reset
// ───────────────────────────────────────────

test.describe('Demo flow — end-to-end golden path', () => {
    test('complete demo flow: select → load → output → tabs → reset', async ({ page }) => {
        // 1. Land on homepage
        await page.goto(BASE);
        await expect(page.getByRole('navigation').getByText('EasyClaw')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Start Voice Interview' })).toBeVisible();

        // 2. Click a demo to start the flow
        const demoButton = page.locator('button', { hasText: 'Restaurant Operations' });
        await expect(demoButton).toBeVisible();
        await demoButton.click();

        // 3. Verify loading screen appears with progress indicators
        //    mock-generate is near-instant, demo-stream takes ~20s
        //    Look for either loading indicators OR the final output
        const loadingOrOutput = page.locator(
            'text=/Processing|Reading|Writing|Exploring|Your Setup Guide/'
        );
        await expect(loadingOrOutput).toBeVisible({ timeout: 30000 });

        // 4. Wait for guide output to fully render
        await expect(page.locator('text=Your Setup Guide')).toBeVisible({ timeout: 30000 });

        // 5. Verify guide output renders with actual content
        await expect(page.locator('.prose')).toBeVisible();
        const guideContent = await page.locator('.prose').textContent();
        expect(guideContent.length).toBeGreaterThan(50);

        // 6. Verify "Copy Link" button is NOT shown for demo guides
        //    (demos have guide_id starting with "demo-")
        await expect(page.locator('button', { hasText: 'Copy Link' })).not.toBeVisible();

        // 7. Verify Download .zip button exists
        await expect(page.locator('button', { hasText: 'Download .zip' })).toBeVisible();

        // 8. Verify Prompts tab has content
        const promptsTab = page.locator('button', { hasText: /^Prompts$/ });
        if (await promptsTab.isEnabled()) {
            await promptsTab.click();
            await expect(page.locator('.prose')).toBeVisible({ timeout: 3000 });
        }

        // Switch back to guide tab
        await page.locator('button', { hasText: 'Setup Guide' }).click();
        await expect(page.locator('text=Your Setup Guide')).toBeVisible();

        // 9. Verify demo reset shortcut (Ctrl+Shift+D → back to landing)
        await page.keyboard.press('Control+Shift+D');
        await expect(page.locator('button', { hasText: 'Start Voice Interview' })).toBeVisible({
            timeout: 5000,
        });
    });

    test('demo flow — Copy button triggers clipboard write', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto(BASE);

        // Load demo guide
        await page.locator('button', { hasText: 'Restaurant Operations' }).click();
        await expect(page.locator('text=Your Setup Guide')).toBeVisible({ timeout: 30000 });

        // Click copy and verify feedback
        const copyBtn = page.locator('button', { hasText: 'Copy' }).first();
        await expect(copyBtn).toBeVisible();
        await copyBtn.click();
        await expect(page.locator('text=Copied').first()).toBeVisible({ timeout: 2000 });
    });

    test('demo flow — mobile viewport (375px) renders without overflow', async ({ browser }) => {
        const context = await browser.newContext({
            viewport: { width: 375, height: 812 },
        });
        const page = await context.newPage();

        // Landing page
        await page.goto(BASE);
        await expect(page.getByRole('navigation').getByText('EasyClaw')).toBeVisible();

        // No horizontal overflow on landing
        let bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(375 + 10);

        // Load demo guide
        await page.locator('button', { hasText: 'Restaurant Operations' }).click();
        await expect(page.locator('text=Your Setup Guide')).toBeVisible({ timeout: 30000 });

        // No horizontal overflow on output view
        bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(375 + 10);

        // Tabs should still be visible
        await expect(page.locator('button', { hasText: 'Setup Guide' })).toBeVisible();

        // Demo badge visible
        await expect(page.getByText('Demo', { exact: true })).toBeVisible();

        await context.close();
    });
});
